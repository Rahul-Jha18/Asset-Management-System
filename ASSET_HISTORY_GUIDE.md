// src/pages/BranchAssetsMasterReport.jsx
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Alert from "../components/Alert";
import Pagination from "../components/Pagination";
import AssetHistoryModal from "../components/AssetHistoryModal";
import "../styles/Pages.css";
import * as XLSX from "xlsx";
import EXCEL_HEADERS from "../utils/excelHeaders";
import { Truck, Filter } from "lucide-react";

const safeArray = (v) => (!v ? [] : Array.isArray(v) ? v : [v]);
const show = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const guessBrand = (model) => {
  if (!model) return "—";
  const s = String(model).trim();
  if (!s) return "—";
  return s.split(/\s+/)[0] || "—";
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

const normalizeStatus = (raw) => {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return "Active";
  if (["active", "up", "running", "yes", "ok", "on"].includes(v)) return "Active";
  if (["down", "inactive", "no", "disabled", "dead", "off"].includes(v)) return "Inactive";
  if (["repair", "in repair", "maintenance", "maintain", "service", "servicing"].includes(v)) return "Repair";
  if (["broken", "faulty", "problem"].includes(v)) return "Repair";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const statusPill = (status) => {
  const s = normalizeStatus(status);
  if (s === "Active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "Inactive") return "bg-rose-50 text-rose-700 border-rose-200";
  if (s === "Repair") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const formatUpdated = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
  } catch {
    return "—";
  }
};

const toNumOrNull = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
};

const toStrOrNull = (v) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};

// Format date to YYYY-MM-DD for Excel import
const formatDateForExcel = (dateValue) => {
  if (!dateValue || dateValue === "" || dateValue === "—") return "";
  
  try {
    const dateStr = String(dateValue).trim();
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Parse the date
    const date = new Date(dateStr);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

//XLSX Export helper
const exportXLSX = (aoa, filename = "export.xlsx", sheetName = "Sheet1") => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

// ---------- helper to pick branch arrays safely ----------
const pickBranchArray = (branchObj, keys = []) => {
  for (const k of keys) {
    const v = branchObj?.[k];
    if (Array.isArray(v) && v.length) return v;
    if (v && !Array.isArray(v)) return safeArray(v);
  }
  return [];
};

// Map database fields to Excel columns for EXPORT
const mapToExcelRow = (section, assetData, branchName) => {
  const baseFields = {
    Section: section,
    Branch: branchName,
    "Asset Code": assetData.assetId || "",
    "Sub-Cat Code": assetData.sub_category_code || "",
  };

  switch (section) {
    case "desktop":
      return {
        ...baseFields,
        Brand: assetData.desktop_brand || "",
        "Assigned User": assetData.name || "",
        RAM: assetData.desktop_ram || "",
        SSD: assetData.desktop_ssd || "",
        Processor: assetData.desktop_processor || "",
        "System Model": assetData.desktop_domain || "",
        "Purchase Date": formatDateForExcel(assetData.desktop_purchase_date) || "",
        "Desktop IDs": assetData.desktop_ids || "",
        Location: assetData.location || "",
        "IP Address": assetData.ip_address || "",
        "Monitor Brand": assetData.monitor_brand || "",
        "Monitor Size": assetData.monitor_size || "",
        "Monitor Location": assetData.monitor_location || "",
        "Monitor Purchase Year": assetData.monitor_purchase_year || "",
        "Monitor Status": assetData.monitor_status || "",
        "Warranty Years": assetData.warranty_years || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        Status: assetData.status || "Active",
        Remarks: assetData.remarks || "",
      };

    case "laptop":
      return {
        ...baseFields,
        Brand: assetData.laptop_brand || "",
        Name: assetData.name || "",
        RAM: assetData.laptop_ram || "",
        SSD: assetData.laptop_ssd || "",
        Processor: assetData.laptop_processor || "",
        "Assigned User": assetData.name || "",
        "Purchase Date": formatDateForExcel(assetData.laptop_purchase_date) || "",
        Location: assetData.location || "",
        "IP Address": assetData.ip_address || "",
        "Warranty Years": assetData.warranty_years || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        Status: assetData.status || "Active",
        Remarks: assetData.remarks || "",
      };

    case "printer":
      return {
        ...baseFields,
        Name: assetData.printer_name || assetData.name || "",
        Model: assetData.printer_model || "",
        "Printer Type": assetData.printer_type || "",
        Status: assetData.printer_status || assetData.status || "Active",
        "Purchased Year": assetData.purchased_year || "",
        Location: assetData.location || "",
        "IP Address": assetData.ip_address || "",
        "Warranty Years": assetData.warranty_years || "",
        Remarks: assetData.remarks || "",
      };

    case "scanner":
      return {
        ...baseFields,
        Name: assetData.scanner_name || "",
        Model: assetData.scanner_model || "",
        "Scanner Number": assetData.scanner_number || "",
        Location: assetData.location || "",
        Remarks: assetData.remarks || "",
      };

    case "projector":
      return {
        ...baseFields,
        Name: assetData.projector_name || "",
        Model: assetData.projector_model || "",
        Status: assetData.projector_status || assetData.status || "Active",
        "Purchase Date": formatDateForExcel(assetData.projector_purchase_date) || "",
        Location: assetData.location || "",
        "Warranty Years": assetData.warranty_years || "",
        Remarks: assetData.remarks || "",
      };

    case "panel":
      return {
        ...baseFields,
        Name: assetData.panel_name || "",
        Brand: assetData.panel_brand || "",
        "Assigned User": assetData.panel_user || "",
        "IP Address": assetData.panel_ip || "",
        Status: assetData.panel_status || assetData.status || "Active",
        "Purchased Year": assetData.panel_purchase_year || "",
        Location: assetData.location || "",
        "Warranty Years": assetData.warranty_years || "",
        Remarks: assetData.remarks || "",
      };

    case "ipphone":
      return {
        ...baseFields,
        "Extension No": assetData.ip_telephone_ext_no || "",
        "IP Address": assetData.ip_telephone_ip || "",
        Status: assetData.ip_telephone_status || assetData.status || "Active",
        "Assigned User": assetData.assigned_user || "",
        Model: assetData.model || "",
        "Purchased Year": assetData.purchased_year || "",
        Location: assetData.location || "",
        "Warranty Years": assetData.warranty_years || "",
        Remarks: assetData.remarks || "",
      };

    case "cctv":
      return {
        ...baseFields,
        Name: assetData.cctv_name || "",
        Brand: assetData.cctv_brand || "",
        "NVR IP": assetData.cctv_nvr_ip || "",
        "Camera IP": assetData.cctv_camera_ip || "",
        "Installed Year": assetData.cctv_installed_year || "",
        "Record Days": assetData.cctv_record_days || "",
        Model: assetData.cctv_nvr_details || "",
        "Total CCTV": assetData.total_cctv || "",
        Location: assetData.cctv_location || assetData.location || "",
        Remarks: assetData.remarks || "",
      };

    case "connectivity":
      return {
        ...baseFields,
        Status: assetData.connectivity_status || assetData.status || "Active",
        Network: assetData.connectivity_network || "",
        "LAN IP": assetData.connectivity_lan_ip || "",
        "WAN Link": assetData.connectivity_wlink || "",
        "LAN Switch": assetData.connectivity_lan_switch || "",
        WiFi: assetData.connectivity_wifi || "",
        "Installed Year": assetData.installed_year || "",
        Location: assetData.location || "",
        Remarks: assetData.remarks || "",
      };

    case "ups":
      return {
        ...baseFields,
        Model: assetData.ups_model || "",
        "Backup Time": assetData.ups_backup_time || "",
        "Assigned User": assetData.ups_installer || "",
        Rating: assetData.ups_rating || "",
        "Battery Rating": assetData.battery_rating || "",
        "Purchased Year": assetData.ups_purchase_year || "",
        Status: assetData.ups_status || assetData.status || "Active",
        Location: assetData.location || "",
        Remarks: assetData.remarks || "",
      };

    case "application_software":
      return {
        ...baseFields,
        Name: assetData.software_name || assetData.name || "",
        Category: assetData.software_category || "",
        Version: assetData.version || "",
        Vendor: assetData.vendor_name || "",
        "License Type": assetData.license_type || "",
        "License Key": assetData.license_key || "",
        Quantity: assetData.quantity || "",
        "Purchase Date": formatDateForExcel(assetData.purchase_date) || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        "Assigned To": assetData.assigned_to || "",
        Remarks: assetData.remarks || "",
      };

    case "office_software":
      return {
        ...baseFields,
        Name: assetData.software_name || assetData.name || "",
        Category: assetData.software_category || "",
        Version: assetData.version || "",
        Vendor: assetData.vendor_name || "",
        "Installed On": formatDateForExcel(assetData.installed_on) || "",
        "PC Name": assetData.pc_name || "",
        "Installed By": assetData.installed_by || "",
        "Install Date": formatDateForExcel(assetData.install_date) || "",
        "License Type": assetData.license_type || "",
        "License Key": assetData.license_key || "",
        Quantity: assetData.quantity || "",
        "Purchase Date": formatDateForExcel(assetData.purchase_date) || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        "Assigned To": assetData.assigned_to || "",
        Remarks: assetData.remarks || "",
      };

    case "utility_software":
      return {
        ...baseFields,
        Name: assetData.software_name || assetData.name || "",
        Version: assetData.version || "",
        Category: assetData.category || assetData.software_category || "",
        "PC Name": assetData.pc_name || "",
        "Installed By": assetData.installed_by || "",
        "Install Date": formatDateForExcel(assetData.install_date) || "",
        Remarks: assetData.remarks || "",
      };

    case "security_software":
      return {
        ...baseFields,
        Name: assetData.product_name || assetData.name || "",
        Vendor: assetData.vendor_name || "",
        "License Type": assetData.license_type || "",
        "Total Nodes": assetData.total_nodes || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        Remarks: assetData.remarks || "",
      };

    case "security_software_installed":
      return {
        ...baseFields,
        Name: assetData.product_name || assetData.name || "",
        Version: assetData.version || "",
        "PC Name": assetData.pc_name || "",
        "Real Time Protection": assetData.real_time_protection || "",
        "Last Update Date": formatDateForExcel(assetData.last_update_date) || "",
        "Installed By": assetData.installed_by || "",
        Remarks: assetData.remarks || "",
      };

    case "services":
      return {
        ...baseFields,
        Name: assetData.service_name || assetData.name || "",
        Category: assetData.service_category || "",
        Provider: assetData.provider_name || "",
        "Contract No": assetData.contract_no || "",
        "Provider Contact": assetData.provider_contact || "",
        "Start Date": formatDateForExcel(assetData.start_date) || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        Remarks: assetData.remarks || "",
      };

    case "licenses":
      return {
        ...baseFields,
        Name: assetData.license_name || assetData.name || "",
        "License Type": assetData.license_type || "",
        "License Key": assetData.license_key || "",
        Quantity: assetData.quantity || "",
        Vendor: assetData.vendor_name || "",
        "Purchase Date": formatDateForExcel(assetData.purchase_date) || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        "Assigned To": assetData.assigned_to || "",
        Remarks: assetData.remarks || "",
      };

    case "windows_os":
      return {
        ...baseFields,
        "Device Type": assetData.device_type || "",
        "Device Asset Code": assetData.device_asset_id || "",
        "OS Version": assetData.os_version || "",
        "License Type": assetData.license_type || "",
        "License Key": assetData.license_key || "",
        "Activation Status": assetData.activation_status || "",
        "Installed Date": formatDateForExcel(assetData.installed_date) || "",
        Remarks: assetData.remarks || "",
      };

    case "windows_servers":
      return {
        ...baseFields,
        "Server Name": assetData.server_name || "",
        "Server Role": assetData.server_role || "",
        "OS Version": assetData.os_version || "",
        "License Type": assetData.license_type || "",
        "License Key": assetData.license_key || "",
        "Cores Licensed": assetData.cores_licensed || "",
        "Expiry Date": formatDateForExcel(assetData.expiry_date) || "",
        Remarks: assetData.remarks || "",
      };

    default:
      return {
        ...baseFields,
        Remarks: assetData.remarks || "",
      };
  }
};

const sortByDeviceId = (rows) => {
  return [...rows].sort((a, b) => {
    const aId = Number(a.assetId);
    const bId = Number(b.assetId);

    const aNum = Number.isFinite(aId);
    const bNum = Number.isFinite(bId);

    if (aNum && bNum) {
      if (aId !== bId) return aId - bId;
      const sec = String(a.section).localeCompare(String(b.section));
      if (sec !== 0) return sec;
      return String(a.branch).localeCompare(String(b.branch));
    }

    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;

    const s = String(a.assetId).localeCompare(String(b.assetId));
    if (s !== 0) return s;
    return String(a.section).localeCompare(String(b.section));
  });
};

const niceLabel = (k) => {
  const map = {
    ipAddress: "IP Address",
    purchaseYear: "Purchased Year",
    subCategoryCode: "Sub-Category Code",
    branch: "Branch",
    brand: "Brand",
    model: "Model",
    name: "Name",
    status: "Status",
    lastUpdated: "Last Updated",
    categoryId: "Category",
    section: "Section",

    // existing infra
    desktop_ram: "RAM",
    desktop_ssd: "SSD",
    desktop_processor: "Processor",
    desktop_brand: "Brand",
    desktop_domain: "System Model",
    desktop_fiscal_year: "Fiscal Year",
    desktop_purchase_date: "Purchase Date",
    desktop_ids: "Desktop IDs",

    laptop_ram: "RAM",
    laptop_ssd: "SSD",
    laptop_processor: "Processor",
    laptop_brand: "Brand",
    laptop_domain: "Domain",
    laptop_user: "User",
    laptop_fiscal_year: "Fiscal Year",
    laptop_purchase_date: "Purchase Date",
    laptop_ids: "Laptop IDs",

    printer_name: "Printer Name",
    printer_model: "Printer Model",
    printer_type: "Printer Type",
    printer_status: "Printer Status",

    scanner_name: "Scanner Name",
    scanner_model: "Scanner Model",
    scanner_number: "Scanner Number",

    projector_name: "Projector Name",
    projector_model: "Projector Model",
    projector_status: "Projector Status",
    projector_purchase_date: "Purchase Date",

    panel_name: "Panel Name",
    panel_brand: "Panel Brand",
    panel_user: "Panel User",
    panel_ip: "Panel IP",
    panel_status: "Panel Status",
    panel_purchase_year: "Purchased Year",

    ip_telephone_ip: "IP Phone IP",
    ip_telephone_ext_no: "Extension No",
    ip_telephone_status: "IP Phone Status",
    purchased_year: "Purchased Year",
    assigned_user: "Assigned User",

    cctv_id: "CCTV Code",
    cctv_name: "CCTV Name",
    cctv_brand: "CCTV Brand",
    cctv_nvr_ip: "NVR IP",
    cctv_camera_ip: "Camera IP",
    cctv_record_days: "Record Days",

    connectivity_status: "Status",
    connectivity_wlink: "WAN Link",
    connectivity_lan_ip: "LAN IP",
    connectivity_lan_switch: "LAN Switch",
    connectivity_network: "Network",
    connectivity_wifi: "WiFi",
    installed_year: "Installed Year",

    ups_model: "UPS Model",
    ups_backup_time: "Backup Time",
    ups_installer: "Installer",
    ups_rating: "UPS Rating",
    battery_rating: "Battery Rating",
    ups_purchase_year: "Purchased Year",
    ups_status: "Status",
    location: "Location",

    // software/service/windows (common-ish)
    software_name: "Software Name",
    software_category: "Category",
    version: "Version",
    vendor_name: "Vendor",
    license_key: "License Key",
    license_type: "License Type",
    quantity: "Quantity",
    installed_on: "Installed On",
    expiry_date: "Expiry Date",
    purchase_date: "Purchase Date",
    assigned_to: "Assigned To",

    product_name: "Product Name",
    pc_name: "PC Name",
    installed_by: "Installed By",
    install_date: "Install Date",
    real_time_protection: "Real Time Protection",
    last_update_date: "Last Update Date",

    service_name: "Service Name",
    service_category: "Service Category",
    provider_name: "Provider",
    contract_no: "Contract No",
    provider_contact: "Provider Contact",
    start_date: "Start Date",

    license_name: "License Name",

    // windows os
    device_type: "Device Type",
    device_asset_id: "Device Asset ID",
    os_version: "OS Version",
    activation_status: "Activation Status",
    installed_date: "Installed Date",

    // windows servers
    server_name: "Server Name",
    server_role: "Server Role",
    cores_licensed: "Cores Licensed",

    warranty_years: "Warranty Years",
    expiry_date: "Expiry Date",
    total_nodes: "Total Nodes",
  };

  if (map[k]) return map[k];

  return String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const isStatusField = (k) => {
  const key = String(k || "").toLowerCase();
  if (key === "status") return true;
  if (key.endsWith("_status")) return true;
  if (key === "activation_status") return true;
  if (key === "real_time_protection") return true;
  return false;
};
const statusOptions = ["Active", "Inactive", "Repair"];

function toReportRows(branches, subCatMap, groupMap) {
  const rows = [];

  for (const b of branches || []) {
    const branchName = b?.name || "—";
    const branchId = b?.id ?? null;

    const pushRow = (section, rawObj, defaults) => {
      const subCode = defaults.subCategoryCode || rawObj?.sub_category_code || "—";
      const subRow = subCatMap.get(String(subCode));
      const subName = subRow?.name || "—";
      const groupId = subRow?.group_id ?? subRow?.groupId ?? "";
      const groupNameOrId = groupId ? (groupMap.get(groupId)?.id || groupId) : "—";

      // Extract asset ID - try multiple sources as different types use different field names
      const assetIdValue =
        rawObj?.assetId ||
        rawObj?.asset_id ||
        rawObj?.desktop_id ||
        rawObj?.laptop_id ||
        rawObj?.scanner_id ||
        rawObj?.printer_id ||
        rawObj?.projector_id ||
        rawObj?.panel_id ||
        rawObj?.cctv_id ||
        rawObj?.ipphone_id ||
        "";

      rows.push({
        branchId,
        section,

        assetId: assetIdValue,
        subCategoryCode: subCode,
        categoryId: groupNameOrId,
        subCategoryName: subName,

        branch: branchName,
        brand: defaults.brand ?? "—",
        name: defaults.name ?? "—",
        model: defaults.model ?? "—",
        purchaseYear: defaults.purchaseYear ?? "—",
        lastUpdated: rawObj?.updatedAt || rawObj?.updated_at || rawObj?.createdAt || rawObj?.created_at || null,
        status: normalizeStatus(defaults.status),

        details: { ...rawObj },
      });
    };

    // ---------------- Existing infra ----------------
    safeArray(b?.connectivity).forEach((c) => {
      pushRow("connectivity", c, {
        subCategoryCode: c?.sub_category_code || "IN",
        name: "Connectivity",
        brand: "—",
        model: c?.connectivity_network || "LAN",
        purchaseYear: c?.installed_year || "—",
        status: c?.connectivity_status || "—",
      });
    });

    safeArray(b?.ups).forEach((u) => {
      const upsModel = u?.ups_model || "";
      pushRow("ups", u, {
        subCategoryCode: u?.sub_category_code || "UP",
        name: "UPS",
        brand: guessBrand(upsModel),
        model: upsModel || "—",
        purchaseYear: u?.ups_purchase_year || "—",
        status: u?.ups_status || "—",
      });
    });

    const pushDevice = (section, row) => {
      const purchaseYear =
        row?.panel_purchase_year ||
        yearFromDate(row?.desktop_purchase_date) ||
        yearFromDate(row?.laptop_purchase_date) ||
        yearFromDate(row?.projector_purchase_date) ||
        row?.desktop_fiscal_year ||
        row?.purchased_year ||
        row?.laptop_fiscal_year ||
        "—";

      const deviceName =
        row?.name ||
        row?.scanner_name ||
        row?.projector_name ||
        row?.printer_name ||
        row?.panel_name ||
        row?.desktop_ids ||
        row?.laptop_name ||
        row?.ip_telephone_ext_no ||
        row?.cctv_name ||
        "—";

      const getBrand = (r) => {
        if (r?.desktop_brand) return r.desktop_brand;
        if (r?.laptop_brand) return r.laptop_brand;
        if (r?.panel_brand) return r.panel_brand;
        if (r?.cctv_brand) return r.cctv_brand;
        const model = r?.printer_model || r?.projector_model || r?.scanner_model || r?.model;
        const guessed = guessBrand(model);
        return guessed !== "—" ? guessed : "—";
      };

      const getModel = (r) => {
        return (
          r?.scanner_model ||
          r?.projector_model ||
          r?.printer_model ||
          r?.cctv_nvr_details ||
          r?.model ||
          r?.desktop_processor ||
          r?.laptop_processor ||
          "—"
        );
      };

      const derivedBrand = getBrand(row);
      const model = getModel(row);

      const status = row?.printer_status || row?.projector_status || row?.panel_status || row?.ip_telephone_status || row?.status || "Active";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || "—",
        name: deviceName,
        brand: derivedBrand,
        model,
        purchaseYear,
        status,
      });
    };

    safeArray(b?.scanners).forEach((r) => pushDevice("scanner", r));
    safeArray(b?.projectors).forEach((r) => pushDevice("projector", r));
    safeArray(b?.printers).forEach((r) => pushDevice("printer", r));
    safeArray(b?.desktops).forEach((r) => pushDevice("desktop", r));
    safeArray(b?.laptops).forEach((r) => pushDevice("laptop", r));
    safeArray(b?.cctvs).forEach((r) => pushDevice("cctv", r));
    safeArray(b?.panels).forEach((r) => pushDevice("panel", r));
    safeArray(b?.ipphones).forEach((r) => pushDevice("ipphone", r));

    // ---------------- SOFTWARE / SERVICES / WINDOWS ----------------
    const getVendor = (row) =>
      row?.vendor ?? row?.vendor_name ?? row?.provider ?? row?.provider_name ?? row?.provider_contact ?? "—";

    const getInstalledYear = (row) =>
      yearFromDate(row?.installed_on || row?.install_date || row?.purchase_date || row?.installed_date || row?.start_date) || "—";

    const getExpiry = (row) => row?.expiry_on || row?.expiry_date || row?.expiryDate || null;

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
        "—";

      const version = row?.version || row?.os_version || "—";
      const licType = row?.license_type ? ` | ${row.license_type}` : "";
      const qty = row?.quantity ? ` | Qty: ${row.quantity}` : "";
      const exp = getExpiry(row) ? ` | Exp: ${getExpiry(row)}` : "";
      const model = `${version}${licType}${qty}${exp}`.trim() || "—";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || fallbackSub,
        name,
        brand: vendor,
        model,
        purchaseYear: getInstalledYear(row),
        status: row?.status || row?.activation_status || row?.printer_status || row?.panel_status || row?.projector_status || "Active",
      });
    };

    const applicationSw = pickBranchArray(b, [
      "applicationSoftware",
      "applicationSoftwares",
      "branchApplicationSoftware",
      "branchApplicationSoftwares",
      "branch_application_software",
      "branch_application_softwares",
      "BranchApplicationSoftware",
      "BranchApplicationSoftwares",
    ]);
    applicationSw.forEach((r) => pushSoftware("application_software", r, "AL"));

    const officeSw = pickBranchArray(b, [
      "officeSoftware",
      "officeSoftwares",
      "branchOfficeSoftware",
      "branchOfficeSoftwares",
      "branch_office_software",
      "branch_office_softwares",
      "BranchOfficeSoftware",
      "BranchOfficeSoftwares",
    ]);
    officeSw.forEach((r) => pushSoftware("office_software", r, "OF"));

    const utilitySw = pickBranchArray(b, [
      "utilitySoftware",
      "utilitySoftwares",
      "branchUtilitySoftware",
      "branchUtilitySoftwares",
      "branch_utility_software",
      "branch_utility_softwares",
      "BranchUtilitySoftware",
      "BranchUtilitySoftwares",
    ]);
    utilitySw.forEach((r) => pushSoftware("utility_software", r, "BR"));

    const securitySw = pickBranchArray(b, [
      "securitySoftware",
      "securitySoftwares",
      "branchSecuritySoftware",
      "branchSecuritySoftwares",
      "branch_security_software",
      "branch_security_softwares",
      "BranchSecuritySoftware",
      "BranchSecuritySoftwares",
    ]);
    securitySw.forEach((r) => pushSoftware("security_software", r, "SE"));

    const securityInstalled = pickBranchArray(b, [
      "securitySoftwareInstalled",
      "securitySoftwaresInstalled",
      "branchSecuritySoftwareInstalled",
      "branchSecuritySoftwareInstalleds",
      "branch_security_software_installed",
      "branch_security_software_installeds",
      "BranchSecuritySoftwareInstalled",
      "BranchSecuritySoftwareInstalleds",
    ]);
    securityInstalled.forEach((r) => {
      const device = r?.pc_name ? ` (${r.pc_name})` : r?.installed_on_device ? ` (${r.installed_on_device})` : "";
      const baseName = r?.product_name || r?.name || "Security Agent";
      pushSoftware("security_software_installed", { ...r, name: `${baseName}${device}` }, "SE");
    });

    const services = pickBranchArray(b, ["services", "branchServices", "branchServicess", "branch_services", "BranchServices"]);
    services.forEach((r) => {
      const provider = getVendor(r);
      const contract = r?.contract_no ? `Contract: ${r.contract_no}` : "—";
      const contact = r?.provider_contact ? ` | Contact: ${r.provider_contact}` : "";
      const model = `${contract}${contact}`.trim();

      pushRow("services", r, {
        subCategoryCode: r?.sub_category_code || "MS",
        name: r?.name || r?.service_name || "Service",
        brand: provider,
        model,
        purchaseYear: getInstalledYear(r),
        status: r?.status || "Active",
      });
    });

    const licenses = pickBranchArray(b, ["licenses", "branchLicenses", "branchLicensess", "branch_licenses", "BranchLicenses"]);
    licenses.forEach((r) => pushSoftware("licenses", r, "AL"));

    const windowsOs = pickBranchArray(b, ["windowsOS", "windowsOs", "branchWindowsOS", "branchWindowsOs", "branch_windows_os", "BranchWindowsOS"]);
    windowsOs.forEach((r) => pushSoftware("windows_os", r, "WL"));

    const windowsServers = pickBranchArray(b, ["windowsServers", "branchWindowsServers", "branch_windows_servers", "BranchWindowsServers"]);
    windowsServers.forEach((r) => {
      const role = r?.server_role ? `Role: ${r.server_role}` : "Windows Server";
      const ver = r?.os_version || r?.version || "—";
      const cores = r?.cores_licensed ? ` | Cores: ${r.cores_licensed}` : "";
      const exp = r?.expiry_date ? ` | Exp: ${r.expiry_date}` : "";
      const model = `${ver} | ${role}${cores}${exp}`.trim();

      pushRow("windows_servers", r, {
        subCategoryCode: r?.sub_category_code || "WS",
        name: r?.server_name || r?.name || "Windows Server",
        brand: r?.vendor_name || r?.vendor || "Microsoft",
        model,
        purchaseYear: yearFromDate(r?.created_at || r?.createdAt) || getInstalledYear(r) || "—",
        status: r?.status || "Active",
      });
    });
  }

  return rows;
}

//UPDATED routes map to include new sections (for edit/delete/transfer logic)
const sectionRouteMap = {
  // infra
  desktop: { type: "multi", plural: "desktops" },
  laptop: { type: "multi", plural: "laptops" },
  printer: { type: "multi", plural: "printers" },
  scanner: { type: "multi", plural: "scanners" },
  projector: { type: "multi", plural: "projectors" },
  panel: { type: "multi", plural: "panels" },
  ipphone: { type: "multi", plural: "ipphones" },
  cctv: { type: "multi", plural: "cctvs" },
  connectivity: { type: "single", plural: "connectivity" },
  ups: { type: "single", plural: "ups" },

  // software/services/windows
  application_software: { type: "multi", plural: "application-software" },
  office_software: { type: "multi", plural: "office-software" },
  utility_software: { type: "multi", plural: "utility-software" },
  security_software: { type: "multi", plural: "security-software" },
  security_software_installed: { type: "multi", plural: "security-software-installed" },
  services: { type: "multi", plural: "services" },
  licenses: { type: "multi", plural: "licenses" },
  windows_os: { type: "multi", plural: "windows-os" },
  windows_servers: { type: "multi", plural: "windows-servers" },
};

export default function BranchAssetsMasterReport() {
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const canEdit = isAdmin || isSubAdmin;
  const canDelete = isAdmin;

  const currentUserName = user?.name || user?.email || "Unknown User";

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showTopSection, setShowTopSection] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";


  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [groups, setGroups] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [subCatFilter, setSubCatFilter] = useState("");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(() => {
    const v = Number(localStorage.getItem("bamr_currentPage"));
    return Number.isFinite(v) && v > 0 ? v : 1;
  });
  const [pageSize, setPageSize] = useState(10);
  

  const [totalInfo, setTotalInfo] = useState({
    count: 0,
    branch: "All Branches",
    group: "All Categories",
    subCategory: "All Sub Categories",
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // CCTV Camera Modal
  const [cctvCamerasOpen, setCctvCamerasOpen] = useState(false);
  const [cctvCameras, setCctvCameras] = useState([]);
  const [loadingCameras, setLoadingCameras] = useState(false);

  // remark like Branch.jsx
  const [newRemark, setNewRemark] = useState("");

  // edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // TRANSFER state
  const [transferOpen, setTransferOpen] = useState(false);
  const [toBranchId, setToBranchId] = useState("");
  const [transferring, setTransferring] = useState(false);

  //IMPORT state
  const [importing, setImporting] = useState(false);

  const totalRef = useRef(null);

  useEffect(() => localStorage.setItem("bamr_currentPage", String(currentPage)), [currentPage]);
  useEffect(() => localStorage.setItem("bamr_pageSize", String(pageSize)), [pageSize]);

      useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

      const sidebarWidth = () => {
        if (windowWidth < 768) return menuOpen ? "40%" : "0"; // small screens
        return menuOpen ? "20%" : "0"; // large screens
      };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/api/branches/with-assets/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setBranches(Array.isArray(payload) ? payload : []);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;
      setAlert({
        type: "error",
        title: "Error",
        message: `Status: ${status || "N/A"} - ${msg || "Failed to fetch branch assets"}`,
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/asset-groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res?.data?.data || []);
    } catch {
      // ignore
    }
  }, [token]);

  const fetchSubCats = useCallback(
    async (gid) => {
      if (!token) return;
      try {
        const res = await api.get(`/api/asset-sub-categories${gid ? `?groupId=${gid}` : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubCats(res?.data?.data || []);
      } catch {
        setSubCats([]);
      }
    },
    [token]
  );

  const fetchCctvCameras = async (cctvId) => {
  if (!cctvId) return;

  setLoadingCameras(true);
  try {
    const response = await fetch(`/api/branches/cctvs/${cctvId}/cameras`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await response.text();
    console.log("Raw camera response:", text);

    let data = [];
    try { data = JSON.parse(text); } catch (err) { console.error("Failed JSON parse:", err); }
    setCctvCameras(data || []);
  } catch (err) {
    console.error(err);
    setCctvCameras([]);
  } finally {
    setLoadingCameras(false);
  }
}; 


  useEffect(() => {
    fetchAll();
    fetchGroups();
    fetchSubCats("");
  }, [fetchAll, fetchGroups, fetchSubCats]);

  const subCatMap = useMemo(() => {
    const m = new Map();
    for (const s of subCats || []) {
      if (s?.code) m.set(String(s.code), s);
    }
    return m;
  }, [subCats]);

  const groupMap = useMemo(() => {
    const m = new Map();
    for (const g of groups || []) {
      if (g?.id !== undefined) m.set(g.id, g);
    }
    return m;
  }, [groups]);

  const branchOptions = useMemo(() => {
    return (branches || [])
      .map((b) => ({ id: b.id, name: b.name }))
      .sort((a, c) => (a.name || "").localeCompare(c.name || ""));
  }, [branches]);

  const getBranchNameById = useCallback(
    (bid) => {
      const id = Number(bid);
      return branches.find((b) => b.id === id)?.name || "All Branches";
    },
    [branches]
  );

  const groupLabel = useCallback(
    (id) => {
      const g = groups.find((x) => String(x.id) === String(id));
      return g?.name || id;
    },
    [groups]
  );

  const subCatLabel = useCallback(
    (code) => {
      const s = subCats.find((x) => String(x.code) === String(code));
      return s?.name || code;
    },
    [subCats]
  );

  const reportRows = useMemo(() => {
    const rows = toReportRows(branches, subCatMap, groupMap);
    return sortByDeviceId(rows);
  }, [branches, subCatMap, groupMap]);

  const filteredRows = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    let data = reportRows;

    if (branchFilter) {
      const bName = getBranchNameById(branchFilter);
      data = data.filter((r) => r.branch === bName);
    }

    if (groupFilter) {
      const selected = String(groupFilter);
      data = data.filter((r) => String(r.categoryId || "") === selected);
    }

    if (subCatFilter) {
      data = data.filter((r) => String(r.subCategoryCode || "") === String(subCatFilter));
    }

    if (!q) return data;

    return data.filter((r) => {
      const haystack = [
        r.assetId,
        r.subCategoryCode,
        r.categoryId,
        r.subCategoryName,
        r.branch,
        r.brand,
        r.name,
        r.model,
        r.purchaseYear,
        r.status,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");
      return haystack.includes(q);
    });
  }, [reportRows, branchFilter, groupFilter, subCatFilter, search, getBranchNameById]);

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const computeTotal = useCallback(() => {
    let data = reportRows;

    if (branchFilter) {
      const bName = getBranchNameById(branchFilter);
      data = data.filter((r) => r.branch === bName);
    }

    if (groupFilter) data = data.filter((r) => String(r.categoryId || "") === String(groupFilter));
    if (subCatFilter) data = data.filter((r) => String(r.subCategoryCode || "") === String(subCatFilter));

    const q = (search || "").trim().toLowerCase();
    if (q) {
      data = data.filter((r) => {
        const haystack = [
          r.assetId,
          r.subCategoryCode,
          r.categoryId,
          r.subCategoryName,
          r.branch,
          r.brand,
          r.name,
          r.model,
          r.purchaseYear,
          r.status,
        ]
          .map((x) => String(x ?? "").toLowerCase())
          .join(" ");
        return haystack.includes(q);
      });
    }

    setTotalInfo({
      count: data.length,
      branch: branchFilter ? getBranchNameById(branchFilter) : "All Branches",
      group: groupFilter ? groupLabel(groupFilter) : "All Categories",
      subCategory: subCatFilter ? subCatLabel(subCatFilter) : "All Sub Categories",
    });

    totalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reportRows, branchFilter, groupFilter, subCatFilter, search, getBranchNameById, groupLabel, subCatLabel]);

  const openDetail = (row) => {
    setDetailRow(row);
    setDetailOpen(true);

    setEditOpen(false);
    setEditValues({});
    setTransferOpen(false);
    setToBranchId("");
    setNewRemark("");
    setCctvCamerasOpen(false);
    setCctvCameras([]);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRow(null);

    setEditOpen(false);
    setEditValues({});
    setSaving(false);
    setDeleting(false);

    setTransferOpen(false);
    setToBranchId("");
    setTransferring(false);

    setNewRemark("");
    setCctvCamerasOpen(false);
    setCctvCameras([]);
  };

  const buildFinalRemarks = () => {
    const typed = String(newRemark ?? "").trim();
    return `Last updated by ${currentUserName}: ${typed}`;
  };

  const getRouteCfg = (section) => {
    const key = String(section ?? "").toLowerCase();
    return sectionRouteMap[key] || null;
  };

  const canTransfer = useMemo(() => {
    const cfg = getRouteCfg(detailRow?.section);
    return cfg?.type === "multi";
  }, [detailRow]);

  const getBranchIdFromRow = () => {
    const bid = detailRow?.branchId ?? detailRow?.details?.branchId;
    if (bid === null || bid === undefined) return null;
    return bid;
  };

  const getRowIdFromRow = () => {
    const rid = detailRow?.details?.id ?? detailRow?.assetId;
    if (rid === null || rid === undefined || rid === "—") return null;
    return rid;
  };

  const handleOpenEdit = () => {
    if (!canEdit || !detailRow?.details) return;
    setEditOpen(true);
    setTransferOpen(false);
    setToBranchId("");
    setEditValues({ ...detailRow.details });
    setNewRemark("");
  };

  const handleCancelEdit = () => {
    setEditOpen(false);
    setEditValues({});
    setNewRemark("");
  };

  const handleSaveEdit = async () => {
    if (!canEdit || !token || !detailRow) return;

    const cfg = getRouteCfg(detailRow.section);
    const branchId = getBranchIdFromRow();
    const rowId = getRowIdFromRow();

    if (!cfg || branchId == null) {
      setAlert({ type: "error", title: "Edit", message: "Missing route config or branchId." });
      return;
    }

    if (!String(newRemark ?? "").trim()) {
      setAlert({ type: "error", title: "Remarks Required", message: "Please write remarks before saving." });
      return;
    }

    try {
      setSaving(true);

      const payload = { ...editValues, remarks: buildFinalRemarks() };
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.created_at;
      delete payload.updated_at;

      if (cfg.type === "single") {
        await api.put(`/api/branches/${branchId}/${cfg.plural}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        if (rowId == null) {
          setAlert({ type: "error", title: "Edit", message: "Invalid asset id (rowId)." });
          return;
        }
        await api.put(`/api/branches/${branchId}/${cfg.plural}/${rowId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setAlert({ type: "success", title: "Updated", message: "Asset updated successfully." });
      setEditOpen(false);
      setEditValues({});
      setNewRemark("");

      await fetchAll();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Update failed";
      setAlert({ type: "error", title: "Update Failed", message: `Status: ${status || "N/A"} - ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || !token || !detailRow) return;

    const cfg = getRouteCfg(detailRow.section);
    const branchId = getBranchIdFromRow();
    const rowId = getRowIdFromRow();

    if (!cfg || branchId == null) {
      setAlert({ type: "error", title: "Delete", message: "Missing route config or branchId." });
      return;
    }

    if (cfg.type === "single") {
      setAlert({
        type: "error",
        title: "Delete not available",
        message: "Connectivity/UPS are single tables and no DELETE route exists in backend.",
      });
      return;
    }

    if (rowId == null) {
      setAlert({ type: "error", title: "Delete", message: "Invalid asset id (rowId)." });
      return;
    }

    const ok = window.confirm("Are you sure you want to DELETE this asset?");
    if (!ok) return;

    try {
      setDeleting(true);

      await api.delete(`/api/branches/${branchId}/${cfg.plural}/${rowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({ type: "success", title: "Deleted", message: "Asset deleted successfully." });
      closeDetail();
      await fetchAll();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      setAlert({ type: "error", title: "Delete Failed", message: `Status: ${status || "N/A"} - ${msg}` });
    } finally {
      setDeleting(false);
    }
  };

  const handleTransfer = async () => {
    if (!token || !detailRow) return;

    const cfg = getRouteCfg(detailRow.section);
    if (!cfg || cfg.type !== "multi") {
      setAlert({ type: "error", title: "Transfer", message: "Only multi assets can be transferred." });
      return;
    }

    const fromBranchId = detailRow.branchId ?? detailRow.details?.branchId;
    const assetId = detailRow.details?.id ?? detailRow.assetId;

    if (!fromBranchId || !assetId) {
      setAlert({ type: "error", title: "Transfer", message: "Missing source branchId or assetId." });
      return;
    }

    if (!toBranchId) {
      setAlert({ type: "error", title: "Transfer", message: "Please select target branch." });
      return;
    }

    if (Number(toBranchId) === Number(fromBranchId)) {
      setAlert({ type: "error", title: "Transfer", message: "Target branch must be different." });
      return;
    }

    if (!String(newRemark ?? "").trim()) {
      setAlert({ type: "error", title: "Remarks Required", message: "Please write remarks before transfer." });
      return;
    }

    try {
      setTransferring(true);

      await api.post(
        "/api/transfer",
        {
          section: detailRow.section,
          assetId: Number(assetId),
          fromBranchId: Number(fromBranchId),
          toBranchId: Number(toBranchId),
          remarks: `Transferred by ${currentUserName}: ${String(newRemark).trim()}`,
          transferredBy: currentUserName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({ type: "success", title: "Transferred", message: "Asset transferred successfully." });

      setTransferOpen(false);
      setToBranchId("");
      setNewRemark("");

      await fetchAll();
      closeDetail();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Transfer failed";
      setAlert({ type: "error", title: "Transfer Failed", message: `Status: ${status || "N/A"} - ${msg}` });
    } finally {
      setTransferring(false);
    }
  };

  // ==================== IMPROVED EXPORT FUNCTION ====================
  const onExportCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      setAlert({ type: "error", title: "Export Error", message: "No data to export" });
      return;
    }

    // Group assets by section
    const assetsBySection = {};
    filteredRows.forEach((row) => {
      const section = row.section;
      if (!assetsBySection[section]) {
        assetsBySection[section] = [];
      }
      assetsBySection[section].push(row);
    });

    const wb = XLSX.utils.book_new();

    // Create a sheet for each section
    Object.keys(assetsBySection).forEach((section) => {
      const sectionAssets = assetsBySection[section];
      const headers = EXCEL_HEADERS[section] || EXCEL_HEADERS.desktop; // fallback to desktop headers

      // Map each asset to Excel row
      const rows = sectionAssets.map((asset) => {
        const branchName = asset.branch;
        const excelRow = mapToExcelRow(section, asset.details, branchName);

        // Ensure all headers are present in the row
        const completeRow = {};
        headers.forEach((header) => {
          completeRow[header] = excelRow[header] || "";
        });

        return completeRow;
      });
      const aoa = [headers, ...rows.map((row) => headers.map((h) => row[h] || ""))];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Add sheet to workbook with section name
      const sheetName = section.replace(/_/g, " ").substring(0, 31); // Excel sheet name limit
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Ensure every defined section has a sheet (even if empty) so export/import headers match exactly
    Object.keys(EXCEL_HEADERS).forEach((section) => {
      if (assetsBySection[section]) return; // already created
      const headers = EXCEL_HEADERS[section] || EXCEL_HEADERS.desktop;
      const aoa = [headers];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const sheetName = section.replace(/_/g, " ").substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `branch_assets_export_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    setAlert({ type: "success", title: "Export Success", message: `Exported ${filteredRows.length} assets to ${filename}` });
  };

  const exportSingleAssetDetail = () => {
    if (!detailRow) return;

    const section = detailRow.section;
    const headers = EXCEL_HEADERS[section] || EXCEL_HEADERS.desktop;
    const branchName = detailRow.branch;
    const excelRow = mapToExcelRow(section, detailRow.details, branchName);

    // Create array of arrays with only headers that have values
    const aoa = [["Field", "Value"]];
    headers.forEach((header) => {
      const value = excelRow[header] || "—";
      if (value !== "" && value !== "—") {
        aoa.push([header, value]);
      }
    });

    const safeName = String(detailRow?.branch || "Branch")
      .replace(/[\\/:*?"<>|]/g, "-")
      .slice(0, 60);

    const filename = `asset_detail_${detailRow.section}_${detailRow.assetId}_${safeName}.xlsx`;
    exportXLSX(aoa, filename, "Asset Detail");
  };

  // ==================== IMPROVED IMPORT FUNCTION ====================
  const handleImportExcel = async (file) => {
    if (!file || !token) return;

    try {
      setImporting(true);

      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });

      // Process all sheets
      const allRows = [];
      let rowCounter = 1;

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

        json.forEach((excelRow) => {
          const section = String(excelRow.Section || excelRow.section || sheetName || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
          const branchName = String(excelRow.Branch || excelRow.branch || "").trim();

          // Normalize branch name for matching
          const normalizeBranch = (s) =>
            String(s || "")
              .toLowerCase()
              .replace(/\bbranch\b/g, "")
              .replace(/\s+/g, " ")
              .trim();

          const branchNameToId = new Map(branches.map((b) => [normalizeBranch(b.name).replace(/-/g, "").trim(), b.id]));

          const branchId = branchNameToId.get(normalizeBranch(branchName)) || null;

          if (section && branchId) {
            allRows.push({
              rowNo: rowCounter++,
              section,
              branchId,
              excelRow,
            });
          }
        });
      });

      if (allRows.length === 0) {
        setAlert({
          type: "error",
          title: "Import Failed",
          message: "No valid data found in Excel file. Please ensure Section and Branch columns are filled correctly.",
        });
        return;
      }

      // Validate sections
      const invalidRows = allRows.filter((row) => !sectionRouteMap[row.section]);
      if (invalidRows.length > 0) {
        const invalidSections = [...new Set(invalidRows.map((r) => r.section))].join(", ");
        setAlert({
          type: "error",
          title: "Import Failed",
          message: `Invalid sections found: ${invalidSections}. Please use valid section names.`,
        });
        return;
      }

      // Send to backend
      const res = await api.post("/api/assets/import", { rows: allRows }, { headers: { Authorization: `Bearer ${token}` } });

      const result = res?.data?.data || res?.data || {};
      const totalProcessed = (result.inserted || 0) + (result.updated || 0);

      setAlert({
        type: result.failed > 0 ? "warning" : "success",
        title: "Import Complete",
        message: `✓ Inserted: ${result.inserted || 0} | ✓ Updated: ${result.updated || 0} | ✗ Failed: ${result.failed || 0}`,
      });

      if (Array.isArray(result.errors) && result.errors.length > 0) {
        console.warn("Import errors:", result.errors);
      }

      await fetchAll();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Import failed";
      setAlert({ type: "error", title: "Import Failed", message: msg });
    } finally {
      setImporting(false);
    }
  };

  // Get detail pairs based on Excel headers for the section
  const detailPairs = useMemo(() => {
    if (!detailRow?.details) return [];

    const section = detailRow.section;
    const headers = EXCEL_HEADERS[section] || EXCEL_HEADERS.desktop;
    const branchName = detailRow.branch;
    const excelRow = mapToExcelRow(section, detailRow.details, branchName);

    // Create pairs from the Excel row
    const pairs = [];
    headers.forEach((header) => {
      const value = excelRow[header];
      if (value !== undefined && value !== null && value !== "") {
        pairs.push([header, show(value)]);
      }
    });

    return pairs;
  }, [detailRow]);

  const editableEntries = useMemo(() => {
    if (!editOpen) return [];
    const deny = new Set(["id", "branchId", "createdAt", "updatedAt", "created_at", "updated_at"]);
    return Object.entries(editValues || {}).filter(([k]) => !deny.has(k));
  }, [editOpen, editValues]);

  return (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
    {/* Main Content + Sidebar */}
    <div className="flex flex-1 w-full h-full">
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: sidebarWidth(),
          minHeight: "100vh",
          transition: "width 0.3s ease-in-out",
        }}
        className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto shadow-2xl"
      >
        {menuOpen && (
          <div className="h-full flex flex-col p-6">
            {/* Logo + Close */}
            <div className="flex items-center justify-between mb-8">
              <div onClick={() => navigate("/")} className="cursor-pointer group">
                <img
                  src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN"
                  alt="Logo"
                  className="h-14 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]"
                />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-all duration-300 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
              Asset Management
            </h2>

            {/* Navigation */}
            <nav className="flex flex-col gap-3 text-sm font-semibold mb-6">
              {[
                { label: "Dashboard", path: "/assetdashboard", icon: "📊" },
                { label: "Branches", path: "/branches", icon: "🏢" },
                { label: "Asset Master", path: "/branch-assets-report", icon: "📦" },
                ...(isAdmin || isSubAdmin
                  ? [
                      { label: "Requests", path: "/requests", icon: "📋" },
                      { label: "Users", path: "/admin/users", icon: "👥" },
                    ]
                  : []),
                { label: "Help & Support", path: "/support", icon: "💬" },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="relative text-left px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-400/50 hover:text-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:translate-x-1 active:scale-95 group"
                >
                  <span className="mr-3 text-lg group-hover:scale-110 inline-block transition-transform duration-300">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-slate-700/50">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/50 ring-2 ring-white/10">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                    <div className="text-xs text-emerald-400 font-semibold">{roleLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT CONTENT */}
      <section className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-full" style={{ width: menuOpen ? "80%" : "100%" }}>
        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-auto h-full">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Left Section: Menu & Stats Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="group px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    {menuOpen ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Close</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="hidden sm:inline">Menu</span>
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTopSection(!showTopSection)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    {showTopSection ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Filters
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Filters
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Center: Title */}
              <div className="flex-1 text-center">
                <h1 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-emerald-600 to-cyan-600 tracking-tight">
                  ASSET MASTER REPORT
                </h1>
              </div>

              {/* Right Section: Export/Import/History */}
              {canEdit && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="group px-4 py-2.5 bg-white border-2 border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                    onClick={onExportCSV}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Export
                    </span>
                  </button>

                  <label className="group px-4 py-2.5 bg-white border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-50 hover:border-green-300 shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 active:scale-95">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                      {importing ? "Importing..." : "Import"}
                    </span>
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleImportExcel(e.target.files?.[0])} disabled={importing} />
                  </label>

                  <button
                    type="button"
                    className="group px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 active:scale-95"
                    onClick={() => setShowHistoryModal(true)}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      History
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {alert && <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />}

          {showTopSection && (
            <div className="mb-6 space-y-6">
              {/* FILTER BAR */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Search */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Branch</label>
                    <select
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300 cursor-pointer"
                      value={branchFilter}
                      onChange={(e) => {
                        setBranchFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Branches</option>
                      {branchOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Category</label>
                    <select
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300 cursor-pointer"
                      value={groupFilter}
                      onChange={(e) => {
                        const gid = e.target.value;
                        setGroupFilter(gid);
                        setSubCatFilter("");
                        setCurrentPage(1);
                        fetchSubCats(gid);
                      }}
                    >
                      <option value="">All Categories</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Sub Category</label>
                    <select
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-300 cursor-pointer"
                      value={subCatFilter}
                      onChange={(e) => {
                        setSubCatFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Sub Categories</option>
                      {subCats.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex md:flex-col gap-2 md:justify-end">
                    <button
                      type="button"
                      className="flex-1 md:w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 active:scale-95"
                      onClick={computeTotal}
                    >
                      Total
                    </button>

                    <button
                      type="button"
                      className="flex-1 md:w-full rounded-xl bg-white border-2 border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                      onClick={() => {
                        setSearch("");
                        setBranchFilter("");
                        setGroupFilter("");
                        setSubCatFilter("");
                        setCurrentPage(1);
                        fetchSubCats("");
                        setTotalInfo({
                          count: 0,
                          branch: "All Branches",
                          group: "All Categories",
                          subCategory: "All Sub Categories",
                        });
                        closeDetail();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* TOTAL BAR */}
              <div ref={totalRef} className="rounded-2xl border-2 border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white shadow-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-black tracking-widest text-slate-500 uppercase">Summary</span>

                    <span className="inline-flex items-center rounded-full border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Total: <span className="ml-1 text-emerald-900">{totalInfo.count}</span>
                    </span>

                    <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-bold text-blue-800 shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {totalInfo.branch}
                    </span>

                    <span className="inline-flex items-center rounded-full border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 text-sm font-bold text-purple-800 shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {totalInfo.group}
                    </span>

                    <span className="inline-flex items-center rounded-full border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-cyan-100 px-4 py-2 text-sm font-bold text-cyan-800 shadow-md">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {totalInfo.subCategory}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                    onClick={computeTotal}
                  >
                    Recalculate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-500 mb-4"></div>
                  <p className="text-slate-600 font-semibold">Loading assets...</p>
                </div>
              </div>
            ) : pagedRows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <tr>
                      {["S.N.", "Asset Code", "Category", "Sub-Cat", "Branch", "Brand", "Name", "Model", "Year", "Updated", "Status", "Action"].map((header) => (
                        <th key={header} className="px-4 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {pagedRows.map((r, idx) => {
                      const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                      const rowKey = `${r.section}-${r.assetId}-${globalIndex}`;

                      return (
                        <tr key={rowKey} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600">{globalIndex}</td>
                          <td className="px-4 py-4 text-sm font-bold text-slate-900">{show(r.assetId)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{show(r.categoryId)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium text-xs">
                              {show(r.subCategoryCode)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">{show(r.branch)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{show(r.brand)}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-900">{show(r.name)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{show(r.model)}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{show(r.purchaseYear)}</td>
                          <td className="px-4 py-4 text-xs text-slate-600">{formatUpdated(r.lastUpdated)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ${statusPill(r.status)}`}>
                              {normalizeStatus(r.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              className="group px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 active:scale-95"
                              onClick={() => openDetail(r)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-20 h-20 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-slate-500 font-semibold text-lg">No assets found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
                    {/* DETAIL OVERLAY */}
                    {detailOpen && (
                      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md overflow-auto">
                        <div className="mx-auto max-w-7xl px-4 py-8">
                          <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="sticky top-0 z-10 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white backdrop-blur-sm">
                              <div className="p-6">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="text-xs font-black tracking-widest text-slate-500 uppercase">Asset Details</div>
                                      <div className="h-1 flex-1 bg-gradient-to-r from-slate-200 to-transparent rounded"></div>
                                    </div>

                                    <div className="text-2xl font-black text-slate-900 mb-3">
                                      Code: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">{show(detailRow?.assetId)}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <span className="inline-flex items-center rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-700">
                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                          />
                                        </svg>
                                        {show(detailRow?.section)}
                                      </span>

                                      <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                                        {show(detailRow?.subCategoryCode)}
                                      </span>

                                      <span className={`inline-flex items-center rounded-full border-2 px-4 py-1.5 text-xs font-bold ${statusPill(detailRow?.status)}`}>
                                        {normalizeStatus(detailRow?.status)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    {canEdit && (
                                      <button
                                        type="button"
                                        className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-bold rounded-xl hover:from-sky-600 hover:to-sky-700 shadow-md hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                          const bid = detailRow?.branchId;
                                          const rawSection = String(detailRow?.section || "").toLowerCase();
                                          const cfg = sectionRouteMap[rawSection];
                                          const sec = cfg?.plural || rawSection;
                                          const aid = detailRow?.details?.id ?? detailRow?.assetId;
                                          const sc = detailRow?.subCategoryCode || "";
                                          navigate(`/maintenance?branchId=${bid}&section=${encodeURIComponent(sec)}&assetId=${aid}&subCat=${encodeURIComponent(sc)}`);
                                        }}
                                        disabled={!detailRow}
                                      >
                                        🔧 Maintenance
                                      </button>
                                    )}

                                    {canEdit && (
                                      <button
                                        type="button"
                                        className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                                        onClick={exportSingleAssetDetail}
                                      >
                                        ⬇ Export
                                      </button>
                                    )}

                                    {canEdit && canTransfer && (
                                      <button
                                        type="button"
                                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                          setTransferOpen(true);
                                          setEditOpen(false);
                                          setToBranchId("");
                                          setNewRemark("");
                                        }}
                                        disabled={!detailRow || saving || deleting || transferring}
                                      >
                                        🔄 Transfer
                                      </button>
                                    )}

                                    {canEdit && (
                                      <button
                                        type="button"
                                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleOpenEdit}
                                        disabled={!detailRow || saving || deleting || transferring}
                                      >
                                        ✏️ Edit
                                      </button>
                                    )}

                                    {canDelete && (
                                      <button
                                        type="button"
                                        className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-bold rounded-xl hover:from-rose-600 hover:to-rose-700 shadow-md hover:shadow-lg hover:shadow-rose-500/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleDelete}
                                        disabled={!detailRow || saving || deleting || transferring}
                                      >
                                        {deleting ? "Deleting..." : "🗑️ Delete"}
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                                      onClick={closeDetail}
                                    >
                                      ✕ Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
                              {/* Quick Info Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                      />
                                    </svg>
                                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Branch</div>
                                  </div>
                                  <div className="text-lg font-black text-slate-900 mb-2">{show(detailRow?.branch)}</div>
                                  <div className="text-xs text-slate-600">
                                    <span className="font-bold">Updated:</span> {formatUpdated(detailRow?.lastUpdated)}
                                  </div>
                                </div>

                                <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                    <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Category</div>
                                  </div>
                                  <div className="text-lg font-black text-slate-900 mb-2">{show(detailRow?.categoryId)}</div>
                                  <div className="text-xs text-slate-600">
                                    <span className="font-bold">Sub:</span> {show(detailRow?.subCategoryName)} ({show(detailRow?.subCategoryCode)})
                                  </div>
                                </div>

                                <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Model</div>
                                  </div>
                                  <div className="text-lg font-black text-slate-900 mb-2">{show(detailRow?.model)}</div>
                                  <div className="text-xs text-slate-600">
                                    <span className="font-bold">Year:</span> {show(detailRow?.purchaseYear)}
                                  </div>
                                </div>
                              </div>

                              {/* CCTV Camera Button */}
                              {detailRow?.section === "cctv" && canEdit && (
                                <div className="mb-6">
                                  <button
                                    type="button"
                                    className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 active:scale-95"
                                    onClick={() => {
                                      const cctvId = detailRow?.details?.cctv_id || detailRow?.details?.id;
                                      if (cctvId) {
                                        setCctvCamerasOpen(true);
                                        fetchCctvCameras(cctvId);
                                      } else {
                                        setAlert({
                                          type: "error",
                                          title: "Error",
                                          message: "CCTV ID not found",
                                        });
                                      }
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                      View Camera Details
                                    </span>
                                  </button>
                                </div>
                              )}                        
                              {/* CCTV CAMERA MODAL */}
                              {cctvCamerasOpen && detailRow?.section === "cctv" && (
                                <div className="mb-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg">
                                  <div className="flex items-center justify-between mb-6">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                          />
                                        </svg>
                                        <div className="text-sm font-black tracking-wider text-purple-800 uppercase">Camera Details</div>
                                      </div>
                                      <div className="text-sm text-slate-600">
                                        NVR ID: <span className="font-bold">{detailRow?.details?.cctv_id || detailRow?.details?.id || "—"}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                                      onClick={() => {
                                        setCctvCamerasOpen(false);
                                        setCctvCameras([]);
                                      }}
                                    >
                                      ✕ Close
                                    </button>
                                  </div>

                                  {loadingCameras ? (
                                    <div className="flex items-center justify-center py-12">
                                      <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-purple-500 mb-3"></div>
                                        <p className="text-slate-600 text-sm">Loading cameras...</p>
                                      </div>
                                    </div>
                                  ) : cctvCameras.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead className="bg-gradient-to-r from-purple-100 to-purple-50 border-b-2 border-purple-200">
                                          <tr>
                                            {["#", "Camera Model", "Location", "Status", "Remarks"].map((header) => (
                                              <th key={header} className="px-4 py-3 text-left text-xs font-black text-purple-900 uppercase tracking-wider">
                                                {header}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100">
                                          {cctvCameras.map((camera, idx) => (
                                            <tr key={camera.id || idx} className="hover:bg-purple-50 transition-colors duration-150">
                                              <td className="px-4 py-3 text-sm font-semibold text-slate-700">{idx + 1}</td>
                                              <td className="px-4 py-3 text-sm text-slate-900 font-medium">{show(camera.camera_model)}</td>
                                              <td className="px-4 py-3 text-sm text-slate-700">{show(camera.location)}</td>
                                              <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ${statusPill(camera.cctv_status)}`}>
                                                  {normalizeStatus(camera.cctv_status)}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-600">{show(camera.remarks)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-12">
                                      <svg className="w-16 h-16 text-purple-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <p className="text-slate-500 font-semibold">No cameras found</p>
                                      <p className="text-slate-400 text-sm mt-1">This CCTV system has no registered cameras</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            {/* DETAIL GRID */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <div className="text-xs font-black tracking-widest text-slate-500 uppercase">Complete Information</div>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {detailPairs.map(([k, v], i) => (
                                  <div
                                    key={`${k}-${i}`}
                                    className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                                  >
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{k}</div>
                                    <div className="text-sm font-semibold text-slate-900 break-words">{v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>  
                          </div>
                        </div>
                      </div>
                      </div>
                    )}
          </main>
         </section>
        </div>
       {/* Asset Transfer History Modal */}
        <AssetHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} token={token} useTransfersTable={true} />
          <Footer />
        </div>
      );
  }
# 4️⃣ Windows Server specs recommended

For 500 users internal system

Minimum recommended:

CPU: 4 cores
RAM: 16 GB
Disk: SSD

Better:

CPU: 8 cores
RAM: 32 GB

Database likes RAM.
# Asset History Tracking System - Implementation Guide

## ✅ What Has Been Created

### Backend

1. **AssetHistory Model** (`backend/models/AssetHistory.js`)
   - Stores all asset changes with timestamps
   - Fields: branchId, assetId, assetType, changeType, fieldName, oldValue, newValue, changedBy, description
   - Indexed for fast queries

2. **Asset History Utility** (`backend/utils/assetHistoryTracker.js`)
   - `trackAssetChange()` - Main function to log changes
   - `getAssetHistory()` - Retrieve asset history
   - `getBranchHistory()` - Retrieve branch-wide history
   - `trackAssetImport()` - Log imported assets

3. **Asset History Controller** (`backend/controllers/assetHistoryController.js`)
   - `getAssetHistory()` - GET /api/asset-history/asset/:assetId
   - `getBranchHistory()` - GET /api/asset-history/branch/:branchId
   - `getAssetChangeSummary()` - GET /api/asset-history/summary/:assetId
   - `getRecentChanges()` - GET /api/asset-history/recent-changes/:branchId
   - `getBranchStats()` - GET /api/asset-history/stats/:branchId

4. **Asset History Routes** (`backend/routes/assetHistoryRoutes.js`)
   - All endpoints require authentication
   - Integrated into server.js

### Frontend

1. **AssetHistoryTimeline Component** (`frontend/src/components/AssetHistoryTimeline.jsx`)
   - Timeline view of all changes to an asset
   - Color-coded by change type
   - Shows old → new values

2. **BranchHistoryPage** (`frontend/src/pages/BranchHistoryPage.jsx`)
   - Full history of all changes in a branch
   - Filterable by asset type
   - Pagination support
   - Statistics about changes

## 📋 How to Integrate

### Step 1: Run Database Migration
```bash
# Create the asset_history table
npx sequelize-cli migration:create --name create-asset-history
```

Or manually run:
```sql
CREATE TABLE asset_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branchId INT NOT NULL,
  assetId INT NOT NULL,
  assetType VARCHAR(50) NOT NULL,
  changeType ENUM('CREATE', 'UPDATE', 'DELETE', 'TRANSFER', 'MAINTENANCE') DEFAULT 'UPDATE',
  fieldName VARCHAR(100),
  oldValue LONGTEXT,
  newValue LONGTEXT,
  changedBy INT,
  changedByName VARCHAR(100),
  description LONGTEXT,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_branch_asset (branchId, assetId),
  INDEX idx_asset_type (assetType, changeType),
  INDEX idx_created (createdAt)
);
```

### Step 2: Track Changes in Update Endpoints

In any asset update endpoint, add:

```javascript
const { trackAssetChange } = require("../utils/assetHistoryTracker");

// Before update
const oldData = asset.toJSON();

// Update logic
await asset.update(updateData);

// Track the change
await trackAssetChange({
  branchId: asset.branchId,
  assetId: asset.id,
  assetType: "laptop", // or whatever asset type
  oldData,
  newData: updateData,
  changeType: "UPDATE",
  userId: req.user.id,
  userName: req.user.name,
  description: `Updated laptop asset ${asset.id}`,
});
```

### Step 3: Add History Timeline to Asset Detail Page

```jsx
// In your Asset Detail page component:
import AssetHistoryTimeline from "../components/AssetHistoryTimeline";

// In JSX:
<AssetHistoryTimeline assetId={assetData.id} token={token} />
```

### Step 4: Add Branch History Link

Add to Branch Detail page:
```jsx
<Link to={`/branch-history/${branchId}`} className="btn btn-primary">
  View History
</Link>
```

### Step 5: Update Routes in App.jsx/Router

```jsx
import BranchHistoryPage from "./pages/BranchHistoryPage";

// Add route:
<Route path="/branch-history/:branchId" element={<BranchHistoryPage />} />
```

## 🎯 Usage Examples

### Tracking Asset Creation
```javascript
const { trackAssetImport } = require("../utils/assetHistoryTracker");

await trackAssetImport({
  branchId: 1,
  assetId: newAsset.id,
  assetType: "laptop",
  assetData: newAsset.toJSON(),
  userId: req.user.id,
  userName: req.user.name,
});
```

### Tracking Asset Deletion
```javascript
const { trackAssetChange } = require("../utils/assetHistoryTracker");

await trackAssetChange({
  branchId: asset.branchId,
  assetId: asset.id,
  assetType: "laptop",
  oldData: asset.toJSON(),
  newData: {},
  changeType: "DELETE",
  userId: req.user.id,
  userName: req.user.name,
  description: "Asset deleted",
});

await asset.destroy();
```

### Tracking Asset Transfer
```javascript
await trackAssetChange({
  branchId: asset.branchId,
  assetId: asset.id,
  assetType: "laptop",
  oldData: { branchId: asset.branchId },
  newData: { branchId: tobranchId },
  changeType: "TRANSFER",
  userId: req.user.id,
  userName: req.user.name,
  description: `Transferred from branch ${asset.branchId} to ${toBranchId}`,
  metadata: { fromBranch: asset.branchId, toBranch: toBranchId },
});
```

## 🔍 API Endpoints

### Get Asset History
```
GET /api/asset-history/asset/:assetId
Query: ?branchId=1&limit=100
Response: Array of history records
```

### Get Branch History
```
GET /api/asset-history/branch/:branchId
Query: ?assetType=laptop&limit=500
Response: Array of history records
```

### Get Change Summary
```
GET /api/asset-history/summary/:assetId
Response: {
  assetId: number,
  createdAt: date,
  lastModified: date,
  totalChanges: number,
  changesByField: {
    fieldName: [{ oldValue, newValue, changedAt, changedBy }]
  }
}
```

### Get Recent Changes
```
GET /api/asset-history/recent-changes/:branchId
Query: ?days=30&limit=100
Response: Array of recent history records
```

### Get Statistics
```
GET /api/asset-history/stats/:branchId
Query: ?days=30
Response: Stats of changes by type and asset type
```

## 📊 Example History Record

```json
{
  "id": 1,
  "branchId": 1,
  "assetId": 10,
  "assetType": "laptop",
  "changeType": "UPDATE",
  "fieldName": "laptop_user",
  "oldValue": "John Doe",
  "newValue": "Jane Smith",
  "changedBy": 5,
  "changedByName": "Admin User",
  "description": "laptop_user changed from "John Doe" to "Jane Smith"",
  "createdAt": "2026-02-09T10:30:00Z"
}
```

## 🎨 Component Features

### AssetHistoryTimeline
- Displays changes in chronological order
- Color-coded by change type
- Shows field-level changes
- Displays who made the change and when
- Shows before/after values

### BranchHistoryPage
- Comprehensive history for entire branch
- Filter by asset type
- Adjustable records per page
- Search and analysis capabilities
- Statistics about changes

## 🚀 Performance Notes

- History records are indexed by (branchId, assetId) for fast lookups
- Indexed by createdAt for time-based queries
- Queries are optimized for large datasets
- Consider archiving old history after 1-2 years

## ⚠️ Important Reminders

1. **Always call trackAssetChange() AFTER the database update succeeds**
2. **History tracking is non-blocking** - if it fails, the main operation continues
3. **Sensitive data** - Be careful what you store in history (passwords, keys, etc.)
4. **User attribution** - Always pass userId and userName for accountability
5. **Description field** - Should be human-readable and clear

---

## 📝 Next Steps

1. ✅ Create database table (run migration or SQL)
2. ✅ Test API endpoints with Postman
3. ✅ Add history tracking to asset update endpoints
4. ✅ Integrate AssetHistoryTimeline into Asset Detail page
5. ✅ Add route for BranchHistoryPage
6. ✅ Add navigation links to access history
7. ✅ Test with sample data
8. ✅ Monitor and optimize if needed

---

**Version: 1.0** | **Date: 2026-02-09**
