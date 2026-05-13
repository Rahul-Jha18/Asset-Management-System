// ✅ FULLY UPDATED: src/pages/BranchDetail.jsx
// - Sidebar UI matches your Master sidebar (gradient, logo, nav, user card)
// - Includes: menuOpen + windowWidth + sidebarWidth() + mobile overlay
// - Fixes missing: navigate, navItems, roleLabel, menu toggle
// - Keeps your existing filters + dynamic table headers (EXCEL_HEADERS)

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Menu,
  Database,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Alert from "./Alert";
import Pagination from "./Pagination";
import AddAssetModal from "../AddModel/AddAssetModal";
import { useAuth } from "../../context/AuthContext";
import EXCEL_HEADERS from "../../utils/excelHeaders";

const safeArray = (v) => (!v ? [] : Array.isArray(v) ? v : [v]);
const show = (v) => (v === null || v === undefined || v === "" || v === "—" ? "N/A" : String(v));

const normalizeStatus = (raw) => {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return "Active";
  if (["active", "up", "running", "yes", "ok"].includes(v)) return "Active";
  if (["down", "inactive", "no", "disabled", "dead"].includes(v)) return "Inactive";
  if (["repair", "in repair", "maintenance", "service", "broken", "faulty"].includes(v)) return "Repair";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const guessBrand = (model) => {
  if (!model) return "N/A";
  const s = String(model).trim();
  if (!s) return "N/A";
  return s.split(/\s+/)[0] || "N/A";
};

function yearFromDate(d) {
  if (!d) return "";
  try {
    const y = new Date(d).getFullYear();
    return Number.isFinite(y) ? String(y) : "";
  } catch {
    return "";
  }
}

const sortByDeviceId = (rows) => {
  return [...rows].sort((a, b) => {
    const aId = Number(a.assetId);
    const bId = Number(b.assetId);
    const aNum = Number.isFinite(aId);
    const bNum = Number.isFinite(bId);

    if (aNum && bNum) {
      if (aId !== bId) return aId - bId;
      return String(a.section).localeCompare(String(b.section));
    }
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    return String(a.assetId).localeCompare(String(b.assetId));
  });
};

const niceLabel = (k) => {
  const map = {
    assetId: "Asset ID",
    ipAddress: "IP Address",
    purchaseYear: "Purchased Year",
    subCategoryCode: "Sub-Category",
    branch: "Branch",
    brand: "Brand",
    model: "Model",
    name: "Name",
    status: "Status",
    lastUpdated: "Last Updated",
    categoryId: "Category",
    section: "Section",
  };
  if (map[k]) return map[k];
  return String(k).replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
};

function StatusBadge({ status }) {
  const statusLower = String(status || "").toLowerCase().trim();
  let colorClasses = "bg-gray-100 text-gray-800 border-gray-300";
  if (statusLower === "active") colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (statusLower === "inactive") colorClasses = "bg-red-50 text-red-700 border-red-200";
  else if (statusLower === "repair" || statusLower === "maintenance") colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {show(status)}
    </span>
  );
}

const pickBranchArray = (branchObj, keys = []) => {
  for (const k of keys) {
    const v = branchObj?.[k];
    if (Array.isArray(v) && v.length) return v;
    if (v && !Array.isArray(v)) return safeArray(v);
  }
  return [];
};

// Maps your row.section label -> EXCEL_HEADERS key
const sectionToExcelKey = (section) => {
  const s = String(section || "").toLowerCase().replace(/\s+/g, "_");
  const compact = s.replace(/_/g, "");

  if (compact === "ipphone") return "ipphone";
  if (compact === "windowsos" || s === "windows_os") return "windows_os";
  if (compact === "windowsserver" || compact === "windowsservers" || s === "windows_servers") return "windows_servers";
  if (compact === "applicationsoftware") return "application_software";
  if (compact === "officesoftware") return "office_software";
  if (compact === "utilitysoftware") return "utility_software";
  if (compact === "securitysoftware") return "security_software";
  if (compact === "license" || compact === "licenses") return "licenses";
  if (compact === "services") return "services";
  if (compact === "cctv") return "cctv";
  if (compact === "connectivity") return "connectivity";
  if (compact === "ups") return "ups";

  if (compact === "desktop") return "desktop";
  if (compact === "laptop") return "laptop";
  if (compact === "printer") return "printer";
  if (compact === "scanner") return "scanner";
  if (compact === "projector") return "projector";
  if (compact === "panel") return "panel";

  return s;
};

const rowToHeaderValueMap = (row) => {
  const d = row?.details || {};
  const map = {
    Section: row?.section,
    Branch: row?.branch,
    "Asset Code": row?.assetId,
    "Sub-Cat Code": row?.subCategoryCode,
    Category: row?.categoryId,
    "Sub Category": row?.subCategoryName,
    Name: row?.name,
    Brand: row?.brand,
    Model: row?.model,
    Status: row?.status,
    "Purchased Year": row?.purchaseYear,
    "Last Updated": row?.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : row?.lastUpdated,
    Remarks: d?.remarks,
  };
  return { ...d, ...map };
};

function toMasterRowsOneBranch(activeBranch, subCatMap, groupMap) {
  const b = activeBranch;
  if (!b) return [];

  const rows = [];
  const branchName = b?.name || "N/A";
  const branchId = b?.id ?? null;

  const pushRow = (section, rawObj, defaults) => {
    const subCode = defaults.subCategoryCode || rawObj?.sub_category_code || "N/A";
    const subRow = subCatMap.get(String(subCode));
    const subName = subRow?.name || "N/A";
    const groupId = subRow?.group_id ?? subRow?.groupId ?? "";
    const groupNameOrId = groupId ? (groupMap.get(groupId)?.name || groupMap.get(groupId)?.id || groupId) : "N/A";

    rows.push({
      branchId,
      section,
      assetId: rawObj?.assetId ?? rawObj?.asset_id ?? rawObj?.id ?? "N/A",
      recordId: rawObj?.id ?? "N/A",
      subCategoryCode: subCode,
      categoryId: groupNameOrId,
      subCategoryName: subName,
      branch: branchName,
      brand: defaults.brand ?? "N/A",
      name: defaults.name ?? "N/A",
      model: defaults.model ?? "N/A",
      purchaseYear: defaults.purchaseYear ?? "N/A",
      lastUpdated: rawObj?.updatedAt || rawObj?.updated_at || rawObj?.createdAt || rawObj?.created_at || null,
      status: normalizeStatus(defaults.status),
      details: { ...rawObj },
    });
  };

  safeArray(b?.connectivity).forEach((c) => {
    pushRow("Connectivity", c, {
      subCategoryCode: c?.sub_category_code || "IN",
      name: "Network Infrastructure",
      brand: c?.connectivity_network || "N/A",
      model: c?.connectivity_lan_switch || c?.connectivity_wlink || "N/A",
      purchaseYear: c?.installed_year || "N/A",
      status: c?.connectivity_status || "Active",
    });
  });

  safeArray(b?.ups).forEach((u) => {
    const upsModel = u?.ups_model || "";
    pushRow("UPS", u, {
      subCategoryCode: u?.sub_category_code || "UP",
      name: "UPS System",
      brand: guessBrand(upsModel),
      model: upsModel || "N/A",
      purchaseYear: u?.ups_purchase_year || "N/A",
      status: u?.ups_status || "Active",
    });
  });

  if (b?.infra) {
    pushRow("Biometrics", b.infra, {
      subCategoryCode: b?.infra?.sub_category_code || "BD",
      name: "Biometric Device",
      brand: "N/A",
      model: "N/A",
      purchaseYear: "N/A",
      status: b?.infra?.biometrics_status || "Active",
    });
  }

  const pushDevice = (section, row) => {
    const purchaseYear =
      row?.panel_purchase_year ||
      row?.cctv_installed_year ||
      yearFromDate(row?.desktop_purchase_date) ||
      yearFromDate(row?.laptop_purchase_date) ||
      yearFromDate(row?.projector_purchase_date) ||
      row?.desktop_fiscal_year ||
      row?.purchased_year ||
      row?.laptop_fiscal_year ||
      "N/A";

    const deviceName =
      row?.name ||
      row?.scanner_name ||
      row?.projector_name ||
      row?.printer_name ||
      row?.panel_name ||
      row?.desktop_ids ||
      row?.laptop_ids ||
      row?.ip_telephone_ext_no ||
      row?.cctv_nvr_ip ||
      "Device";

    const derivedBrand =
      row?.desktop_brand ||
      row?.laptop_brand ||
      row?.panel_brand ||
      guessBrand(row?.printer_model || row?.projector_model || row?.scanner_model || row?.model) ||
      "N/A";

    const model =
      row?.scanner_model ||
      row?.projector_model ||
      row?.printer_model ||
      row?.cctv_nvr_details ||
      row?.model ||
      row?.desktop_processor ||
      row?.laptop_processor ||
      "N/A";

    const status =
      row?.printer_status || row?.projector_status || row?.panel_status || row?.ip_telephone_status || row?.status || "Active";

    pushRow(section, row, {
      subCategoryCode: row?.sub_category_code || "N/A",
      name: deviceName,
      brand: derivedBrand,
      model,
      purchaseYear,
      status,
    });
  };

  safeArray(b?.scanners).forEach((r) => pushDevice("Scanner", r));
  safeArray(b?.projectors).forEach((r) => pushDevice("Projector", r));
  safeArray(b?.printers).forEach((r) => pushDevice("Printer", r));
  safeArray(b?.desktops).forEach((r) => pushDevice("Desktop", r));
  safeArray(b?.laptops).forEach((r) => pushDevice("Laptop", r));
  safeArray(b?.cctvs).forEach((r) => pushDevice("CCTV", r));
  safeArray(b?.panels).forEach((r) => pushDevice("Panel", r));
  safeArray(b?.ipphones).forEach((r) => pushDevice("IP Phone", r));
  // ✅ Server + Firewall Router
safeArray(b?.servers).forEach((r) => {
  pushRow("Server", r, {
    subCategoryCode: r?.sub_category_code || "SR",
    name: r?.brand ? `${r.brand} Server` : "Server",
    brand: r?.brand || "N/A",
    model: r?.model_no || "N/A",
    purchaseYear: yearFromDate(r?.purchase_date) || "N/A",
    status: r?.virtualization ? `Virtualization: ${r.virtualization}` : "Active",
  });
});

safeArray(b?.firewallRouters).forEach((r) => {
  pushRow("Firewall Router", r, {
    subCategoryCode: r?.sub_category_code || "FR",
    name: r?.brand ? `${r.brand} Firewall` : "Firewall Router",
    brand: r?.brand || "N/A",
    model: r?.model || "N/A",
    purchaseYear: yearFromDate(r?.purchase_date) || "N/A",
    status: "Active",
  });
});

  const getVendor = (row) => row?.vendor ?? row?.vendor_name ?? row?.provider ?? row?.provider_name ?? "N/A";
  const getInstalledYear = (row) =>
    yearFromDate(row?.installed_on || row?.install_date || row?.purchase_date || row?.installed_date || row?.start_date) || "N/A";

  const pushSoftware = (section, row, fallbackSub) => {
    const vendor = getVendor(row);
    const name =
      row?.name ||
      row?.software_name ||
      row?.product_name ||
      row?.license_name ||
      row?.service_name ||
      row?.server_name ||
      row?.device_asset_id ||
      "Software";
    const version = row?.version || row?.os_version || "N/A";
    pushRow(section, row, {
      subCategoryCode: row?.sub_category_code || fallbackSub,
      name,
      brand: vendor,
      model: version,
      purchaseYear: getInstalledYear(row),
      status: row?.status || row?.activation_status || "Active",
    });
  };

  pickBranchArray(b, ["applicationSoftware", "applicationSoftwares", "branchApplicationSoftware", "branchApplicationSoftwares"]).forEach((r) =>
    pushSoftware("Application Software", r, "AL")
  );
  pickBranchArray(b, ["officeSoftware", "officeSoftwares", "branchOfficeSoftware", "branchOfficeSoftwares"]).forEach((r) =>
    pushSoftware("Office Software", r, "OF")
  );
  pickBranchArray(b, ["utilitySoftware", "utilitySoftwares", "branchUtilitySoftware", "branchUtilitySoftwares"]).forEach((r) =>
    pushSoftware("Utility Software", r, "BR")
  );
  pickBranchArray(b, ["securitySoftware", "securitySoftwares", "branchSecuritySoftware", "branchSecuritySoftwares"]).forEach((r) =>
    pushSoftware("Security Software", r, "SE")
  );

  const services = pickBranchArray(b, ["services", "branchServices"]);
  services.forEach((r) => {
    const provider = getVendor(r);
    pushRow("Services", r, {
      subCategoryCode: r?.sub_category_code || "MS",
      name: r?.name || r?.service_name || "Service",
      brand: provider,
      model: r?.contract_no || "N/A",
      purchaseYear: getInstalledYear(r),
      status: r?.status || "Active",
    });
  });

  pickBranchArray(b, ["licenses", "branchLicenses"]).forEach((r) => pushSoftware("License", r, "AL"));
  pickBranchArray(b, ["windowsOS", "windowsOs", "branchWindowsOS", "branchWindowsOs"]).forEach((r) => pushSoftware("Windows OS", r, "WL"));

  pickBranchArray(b, ["windowsServers", "branchWindowsServers"]).forEach((r) => {
    pushRow("Windows Server", r, {
      subCategoryCode: r?.sub_category_code || "WS",
      name: r?.server_name || r?.name || "Windows Server",
      brand: r?.vendor_name || r?.vendor || "Microsoft",
      model: r?.os_version || r?.version || "N/A",
      purchaseYear: yearFromDate(r?.created_at || r?.createdAt) || getInstalledYear(r) || "N/A",
      status: r?.status || "Active",
    });
  });

  return sortByDeviceId(rows);
}

export default function BranchDetail({ branch, token, onClose, isAdmin, isSubAdmin, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Sidebar controls like master
  const [menuOpen, setMenuOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [ showTop, setShowTop] = useState(false);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const sidebarWidth = () => {
    if (windowWidth < 640) return menuOpen ? "85vw" : "0";
    if (windowWidth < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  // ✅ nav items (same style; adjust paths if you want)
  const navItems = useMemo(() => {
    const base = [
      { label: "Dashboard", path: "/assetdashboard", icon: "📊" },
      { label: "Branches", path: "/branches", icon: "🏢" },
      { label: "Asset Master", path: "/branch-assets-report", icon: "📦" },
      ...(isAdmin || isSubAdmin ? [{ label: "Requests", path: "/requests", icon: "📋" }] : []),
      { label: "Help & Support", path: "/support", icon: "💬" },
    ];
    return base;
  }, [isAdmin, isSubAdmin]);

  // Filters / data
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [subCatFilter, setSubCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [groups, setGroups] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);

  const [activeBranch, setActiveBranch] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [expandedRow, setExpandedRow] = useState(null);

  // Add Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addGroupId, setAddGroupId] = useState("");
  const [addSubCode, setAddSubCode] = useState("");
  const [addForm, setAddForm] = useState({});
  const [addSaving, setAddSaving] = useState(false);

  const tableTopRef = useRef(null);

  const scrollToTop = useCallback(() => {
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const fetchBranchData = useCallback(async () => {
    if (!branch?.id || !token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`/api/branches/with-assets/all`, { headers });
      const all = res?.data?.data ?? res?.data ?? [];
      const one = (Array.isArray(all) ? all : []).find((b) => String(b.id) === String(branch.id)) || null;
      setActiveBranch(one || branch);
    } catch (err) {
      console.error("Failed to fetch branch data:", err);
      setAlertState({ type: "error", title: "Error", message: "Failed to load branch data. Please try again." });
      setActiveBranch(branch || null);
    } finally {
      setLoading(false);
    }
  }, [branch?.id, token, branch]);

  useEffect(() => {
    setActiveBranch(branch || null);
    fetchBranchData();
  }, [branch, fetchBranchData]);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [gRes, sRes] = await Promise.all([
          api.get("/api/asset-groups", { headers }),
          api.get("/api/asset-sub-categories", { headers }),
        ]);
        const g = Array.isArray(gRes?.data?.data) ? gRes.data.data : [];
        const s = Array.isArray(sRes?.data?.data) ? sRes.data.data : [];
        setGroups(g);
        setSubCats(s);
        setFilteredSubCats(s);
      } catch (err) {
        console.error("Failed to fetch groups/subcategories:", err);
      }
    })();
  }, [token]);

  const fetchSubCats = useCallback(
    (gid) => {
      if (!gid) {
        setFilteredSubCats(subCats);
        return;
      }
      const arr = (subCats || []).filter((s) => String(s.group_id ?? s.groupId ?? "") === String(gid));
      setFilteredSubCats(arr);
    },
    [subCats]
  );

  const fetchAddSubCats = useCallback((gid) => fetchSubCats(gid), [fetchSubCats]);

  const subCatMap = useMemo(() => {
    const m = new Map();
    (subCats || []).forEach((s) => s?.code && m.set(String(s.code), s));
    return m;
  }, [subCats]);

  const groupMap = useMemo(() => {
    const m = new Map();
    (groups || []).forEach((g) => g?.id !== undefined && m.set(g.id, g));
    return m;
  }, [groups]);

  const masterRows = useMemo(() => {
    if (!activeBranch) return [];
    return toMasterRowsOneBranch(activeBranch, subCatMap, groupMap);
  }, [activeBranch, subCatMap, groupMap]);

  const filteredRows = useMemo(() => {
    let data = [...masterRows];

    if (sectionFilter) data = data.filter((r) => String(r.section).toLowerCase() === String(sectionFilter).toLowerCase());

    if (groupFilter) {
      const gid = String(groupFilter);
      const gObj = groups.find((g) => String(g.id) === gid);
      const gName = gObj?.name ? String(gObj.name).toLowerCase() : "";
      data = data.filter((r) => {
        const cat = String(r.categoryId || "").toLowerCase();
        return cat === gid.toLowerCase() || (gName && cat.includes(gName));
      });
    }

    if (subCatFilter) data = data.filter((r) => String(r.subCategoryCode || "") === String(subCatFilter));
    if (statusFilter) data = data.filter((r) => String(r.status).toLowerCase() === String(statusFilter).toLowerCase());

    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((r) => {
        const searchStr = [
          r.assetId,
          r.section,
          r.categoryId,
          r.subCategoryCode,
          r.subCategoryName,
          r.brand,
          r.name,
          r.model,
          r.purchaseYear,
          r.status,
        ]
          .map((x) => String(x ?? "").toLowerCase())
          .join(" ");
        return searchStr.includes(q);
      });
    }

    return data;
  }, [masterRows, sectionFilter, groupFilter, subCatFilter, statusFilter, search, groups]);

  const uniqueSections = useMemo(() => Array.from(new Set(masterRows.map((r) => r.section))).sort(), [masterRows]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(masterRows.map((r) => r.status))).sort(), [masterRows]);

  useEffect(() => setCurrentPage(1), [search, sectionFilter, groupFilter, subCatFilter, statusFilter]);

  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  useEffect(() => {
    scrollToTop();
  }, [currentPage, sectionFilter, groupFilter, subCatFilter, statusFilter, scrollToTop]);

  const clearFilters = () => {
    setSearch("");
    setSectionFilter("");
    setGroupFilter("");
    setSubCatFilter("");
    setStatusFilter("");
    setFilteredSubCats(subCats);
    setCurrentPage(1);
    setExpandedRow(null);
  };

  const toggleRowExpand = (assetId) => setExpandedRow((p) => (p === assetId ? null : assetId));

  const getRowDetails = (row) => {
    const details = row?.details || {};
    return Object.entries(details).filter(
      ([key]) => !["id", "branchId", "branch_id", "createdAt", "updatedAt", "created_at", "updated_at"].includes(key)
    );
  };

  const tableHeaders = useMemo(() => {
    if (!sectionFilter) {
      return ["Asset Code", "Section", "Name", "Brand", "Model", "Category", "Sub-Cat Code", "Purchased Year", "Status"];
    }
    const key = sectionToExcelKey(sectionFilter);
    const headers = EXCEL_HEADERS?.[key] || [];
    return headers.length ? headers : ["Asset Code", "Section", "Name", "Brand", "Model", "Status"];
  }, [sectionFilter]);

  const headerValue = useCallback((row, header) => {
    const map = rowToHeaderValueMap(row);
    if (map[header] !== undefined) return map[header];
    if (header === "Asset Code") return row.assetId;
    if (header === "Sub-Cat Code") return row.subCategoryCode;
    if (header === "Section") return row.section;
    if (header === "Branch") return row.branch;
    if (header === "Status") return row.status;
    if (header === "Purchased Year") return row.purchaseYear;
    if (header === "Category") return row.categoryId;
    return map?.[header] ?? "N/A";
  }, []);

  const normalizeYearInput = (name, value) => {
    const yearFields = [
      "desktop_fiscal_year",
      "laptop_fiscal_year",
      "purchased_year",
      "ups_purchase_year",
      "panel_purchase_year",
      "cctv_installed_year",
      "installed_year",
    ];
    if (yearFields.includes(name) && value) {
      const num = String(value).replace(/\D/g, "");
      return num.slice(0, 4);
    }
    return value;
  };

const getEndpointForSubCode = (code) => {
  const map = {
    DT: "desktops",
    LT: "laptops",
    PR: "printers",
    SC: "scanners",
    PJ: "projectors",
    CC: "cctvs",
    PN: "panels",
    IP: "ipphones",
    AL: "application-software",
    OF: "office-software",
    BR: "utility-software",
    SE: "security-software",
    WL: "windows-os",
    WS: "windows-servers",
    MS: "services",
    LC: "licenses",

    // ✅ ADD THESE
    SR: "servers",
    FR: "firewall-routers",
  };
  return map[code] || "desktops";
};

  const getFieldsForSubCode = (code) => {
  const common = ["remarks"];

  const fieldMap = {
    DT: ["desktop_ids", "desktop_brand", "desktop_processor", "desktop_ram", "desktop_storage", "desktop_purchase_date", "desktop_fiscal_year", "desktop_ip_address", "desktop_location", "status", ...common],
    LT: ["laptop_ids", "laptop_brand", "laptop_processor", "laptop_ram", "laptop_storage", "laptop_purchase_date", "laptop_fiscal_year", "laptop_serial_number", "laptop_assigned_to", "status", ...common],
    PR: ["printer_name", "printer_model", "printer_type", "printer_ip_address", "printer_location", "purchased_year", "printer_status", ...common],
    SC: ["scanner_name", "scanner_model", "scanner_type", "scanner_location", "purchased_year", ...common],
    PJ: ["projector_name", "projector_model", "projector_resolution", "projector_purchase_date", "projector_location", "projector_status", "warranty_years", ...common],
    CC: ["cctv_nvr_ip", "cctv_nvr_details", "cctv_camera_count", "cctv_installed_year", "cctv_location", ...common],
    PN: ["panel_name", "panel_brand", "panel_size", "panel_purchase_year", "panel_location", "panel_status", "warranty_years", ...common],
    IP: ["ip_telephone_ext_no", "ip_telephone_ip", "ip_telephone_status", "assigned_user", "brand", "model", "location", ...common],

    AL: ["software_name", "vendor_name", "version", "license_key", "installed_on", "expiry_date", "status", ...common],
    OF: ["software_name", "vendor_name", "version", "license_type", "license_key", "installed_on", "expiry_date", "status", ...common],
    BR: ["software_name", "vendor_name", "version", "installed_on", "status", ...common],
    SE: ["product_name", "vendor_name", "license_type", "total_nodes", "expiry_date", ...common],
    WL: ["device_asset_id", "os_version", "license_type", "license_key", "activation_status", "installed_date", ...common],
    WS: ["server_name", "server_role", "os_version", "license_type", "license_key", "cores_licensed", "expiry_date", ...common],
    MS: ["service_name", "provider_name", "contract_no", "start_date", "expiry_date", ...common],
    LC: ["license_name", "vendor_name", "license_type", "license_key", "quantity", "purchase_date", "expiry_date", ...common],

    // ✅ ADD THESE TWO (match your MYSQL columns)
    SR: [
      "brand",
      "ip_address",
      "location",
      "model_no",
      "purchase_date",
      "vendor",
      "specification",
      "storage",
      "memory",
      "windows_server_version",
      "virtualization",
      "how_many_server",
      ...common,
    ],
    FR: [
      "brand",
      "model",
      "purchase_date",
      "vendor",
      "license_expiry",
      "specification_remarks",
      ...common,
    ],
  };

  return fieldMap[code] || ["remarks"];
};

  const addFields = useMemo(() => getFieldsForSubCode(addSubCode), [addSubCode]);

  const handleAddAssetSubmit = async () => {
    if (!addSubCode || !activeBranch?.id) return;
    setAddSaving(true);
    try {
      const endpoint = getEndpointForSubCode(addSubCode);
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { ...addForm, sub_category_code: addSubCode };
      await api.post(`/api/branches/${activeBranch.id}/${endpoint}`, payload, { headers });

      setAlertState({ type: "success", title: "Success", message: "Asset added successfully!" });

      setShowAddModal(false);
      setAddStep(1);
      setAddGroupId("");
      setAddSubCode("");
      setAddForm({});

      await fetchBranchData();
      onRefresh?.();
    } catch (err) {
      console.error("Failed to add asset:", err);
      setAlertState({
        type: "error",
        title: "Error",
        message: err.response?.data?.message || "Failed to add asset. Please try again.",
      });
    } finally {
      setAddSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchBranchData();
    onRefresh?.();
    setAlertState(null);
  };

  if (loading && !activeBranch) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading branch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* MOBILE OVERLAY */}
      {menuOpen && windowWidth < 1024 && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ✅ LEFT SIDEBAR (MASTER STYLE) */}
      <aside
        style={{
          width: sidebarWidth(),
          minHeight: "100vh",
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
          position: windowWidth < 1024 ? "fixed" : "relative",
          top: 0,
          left: 0,
          zIndex: 30,
          height: windowWidth < 1024 ? "100vh" : "auto",
        }}
        className="flex-shrink-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto overflow-x-hidden shadow-2xl"
      >
        {menuOpen && (
          <div className="h-full flex flex-col p-5 min-w-[220px]">
            <div className="flex items-center justify-between mb-8">
              <div onClick={() => navigate("/")} className="flex gap-4 justify-center items-center cursor-pointer group">
                <img
                  src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN"
                  alt="NLI Logo"
                  style={{ width: 40, height: 45, borderRadius: 8, objectFit: "cover", display: "block", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
                />
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#1474f3ea" }}>
                  Asset{" "}
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#ffffff" }}>
                    IMS
                  </span>
                </span>
              </div>
              <button
                  onClick={onClose}
                  className="ml-auto px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 hover:bg-rose-500/30 active:scale-95 transition"
                  title="Close Branch"
                >
                  ✕
                </button>
            </div>

            <span style={{ marginBottom: 12, fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "#1474f3ea" }}>
              Branch<span style={{ color: "#ffffff" }}> Assets</span>
            </span>

            {/* Branch card */}
            <div className="mb-4 rounded-xl bg-slate-800/60 border border-slate-700/40 p-3">
              <div className="text-[11px] text-slate-400 font-black tracking-widest uppercase">Selected Branch</div>
              <div className="mt-1 text-sm font-bold text-white truncate">{activeBranch?.name || branch?.name || "Branch"}</div>
              <div className="text-[11px] text-emerald-400 font-black tracking-widest">ID: {activeBranch?.id || branch?.id || "N/A"}</div>
              <div className="mt-2 text-[11px] text-slate-400 font-black tracking-widest uppercase">
                Total: <span className="text-white">{masterRows.length}</span> · Filtered:{" "}
                <span className="text-emerald-300">{filteredRows.length}</span>
              </div>
            </div>
            {/* Navigation */}
            <div className="text-[11px] text-slate-400 font-black tracking-widest uppercase mb-2">Navigation</div>
            <nav className="flex flex-col gap-2 text-sm font-semibold flex-1">
              {navItems.map((item, i) => {
                const active = window.location.pathname === item.path;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className={[
                      "text-left px-4 py-2.5 rounded-xl border transition-all duration-200 active:scale-95",
                      active
                        ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 hover:translate-x-0.5",
                    ].join(" ")}
                  >
                    <span className="mr-2.5 text-base">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Card */}
            <div className="mt-auto pt-5 border-t border-slate-700/50">
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/40 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-emerald-400 font-black tracking-widest">{roleLabel}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: windowWidth < 1024 ? 0 : 0 }}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setShowTop((p) => !p)}
               className="px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition"
                >
                  Filters
                </button>
            
            <div>
              <h2 className="text-lg font-bold text-gray-900">Asset Master (Branch)</h2>
              <p className="text-sm text-gray-500">
                Showing {paginatedRows.length} of {filteredRows.length} assets
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sections:</span>
            <span className="font-semibold text-gray-900">{uniqueSections.length}</span>
          </div>
        </div>

        {/* Alert */}
        {alertState && (
          <div className="px-6 py-4 bg-gray-50">
            <Alert type={alertState.type} title={alertState.title} message={alertState.message} onClose={() => setAlertState(null)} />
          </div>
        )}
        {/* ✅ TOP FILTER BAR (GRID ROW) — small container like master */}
        {showTop && (
          <div className="mx-6 mt-4 mb-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* header */}
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-black tracking-widest uppercase">
                  Filters
                </div>

                {(search || sectionFilter || groupFilter || subCatFilter || statusFilter) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 active:scale-95 transition"
                  >
                    🧹 Clear
                  </button>
                )}
              </div>

              {/* grid row */}
              <div className="px-2 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                  {/* Search (wide) */}
                  <div className="lg:col-span-4">
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-2">
                      <Search size={14} /> Search
                    </div>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search assets..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* Section */}
                  <div className="lg:col-span-2">
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5">Section</div>
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All</option>
                      {uniqueSections.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="lg:col-span-2">
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5">Category</div>
                    <select
                      value={groupFilter}
                      onChange={(e) => {
                        const gid = e.target.value;
                        setGroupFilter(gid);
                        setSubCatFilter("");
                        fetchSubCats(gid);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div className="lg:col-span-2">
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5">Sub Category</div>
                    <select
                      value={subCatFilter}
                      onChange={(e) => setSubCatFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">All</option>
                      {filteredSubCats.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="">
                  <button
                      onClick={() => setShowAddModal(true)}
                      disabled={!isAdmin && !isSubAdmin}
                      className="px-2 py-2 text-sm font-semibold bg-green-600/80 border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition"
                        >
                        + Asset
                        </button>
                  </div>
                  </div>
              </div>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={tableTopRef} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading assets...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Database className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {search || sectionFilter || groupFilter || subCatFilter || statusFilter
                    ? "Try adjusting your filters or search terms"
                    : "Start by adding your first asset"}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-500/10">
                      <tr>
                        {tableHeaders.map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-sky-100/20 divide-y divide-gray-200">
                      {paginatedRows.map((row, idx) => {
                        const isExpanded = expandedRow === row.assetId;
                        const details = getRowDetails(row);

                        return (
                          <React.Fragment key={`${row.assetId}-${idx}`}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              {tableHeaders.map((h) => {
                                const val = headerValue(row, h);

                                if (String(h).toLowerCase().includes("status")) {
                                  return (
                                    <td key={h} className="px-4 py-3 whitespace-nowrap text-sm">
                                      <StatusBadge status={normalizeStatus(val)} />
                                    </td>
                                  );
                                }

                                if (h === "Asset Code" || h === "Asset ID") {
                                  return (
                                    <td key={h} className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                      {show(val)}
                                    </td>
                                  );
                                }

                                return (
                                  <td key={h} className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={show(val)}>
                                    {show(val)}
                                  </td>
                                );
                              })}

                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => toggleRowExpand(row.assetId)}
                                  className="text-blue-600 px-2 py-1 rounded-xl bg-blue-500/20 border border-gray-400 hover:text-blue-900 font-medium transition-colors inline-flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={14} /> Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={14} /> Details
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td colSpan={tableHeaders.length + 1} className="px-4 py-4 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {details.map(([key, value]) => (
                                      <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                          {niceLabel(key)}
                                        </div>
                                        <div className="text-sm text-gray-900 break-words">{show(value)}</div>
                                      </div>
                                    ))}
                                    {details.length === 0 && (
                                      <div className="col-span-full text-sm text-gray-500 text-center py-4">
                                        No additional details available
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredRows.length > itemsPerPage && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        scrollToTop();
                      }}
                      pageSize={itemsPerPage}
                      onPageSizeChange={(size) => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                        scrollToTop();
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddStep(1);
          setAddGroupId("");
          setAddSubCode("");
          setAddForm({});
        }}
        groups={groups}
        subCats={filteredSubCats}
        addStep={addStep}
        setAddStep={setAddStep}
        addGroupId={addGroupId}
        setAddGroupId={setAddGroupId}
        addSubCode={addSubCode}
        setAddSubCode={setAddSubCode}
        addForm={addForm}
        setAddForm={setAddForm}
        addFields={addFields}
        addSaving={addSaving}
        onSubmit={handleAddAssetSubmit}
        fetchAddSubCats={fetchAddSubCats}
        normalizeYearInput={normalizeYearInput}
      />
    </div>
  );
}