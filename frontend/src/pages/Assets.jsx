// src/pages/Assets.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Assets.css";
import "../styles/AssetSplit.css";
import Footer from '../components/Layout/Footer.jsx';  

// Static master data
const BRANDED_OPTIONS = [
  { code: "", label: "All" },
  { code: "A", label: "Assembled" },
  { code: "B", label: "Branded" },
  { code: "O", label: "Others" },
];

const ASSET_GROUPS = [
  { id: "", name: "All" },
  { id: "H", name: "Hardware" },
  { id: "S", name: "Software" },
  { id: "L", name: "Software Licenses" },
  { id: "I", name: "Internet & VPN" },
  { id: "C", name: "Services" },
];

const ASSET_SUB_CATEGORIES = [
  { code: "DC", group: "H", name: "Desktop Computer" },
  { code: "LC", group: "H", name: "Laptop" },
  { code: "MO", group: "H", name: "Monitor" },
  { code: "FR", group: "H", name: "Firewall Router Device" },
  { code: "NS", group: "H", name: "Network Switches" },
  { code: "CC", group: "H", name: "CCTV Camera" },
  { code: "CR", group: "H", name: "NVR of CCTV" },
  { code: "PR", group: "H", name: "Printers" },
  { code: "SC", group: "H", name: "Scanners" },
  { code: "BD", group: "H", name: "Biometric Devices" },
  { code: "IP", group: "H", name: "IP Phone" },
  { code: "PJ", group: "H", name: "Projectors" },
  { code: "IB", group: "H", name: "Interactive Board" },
  { code: "UP", group: "H", name: "UPS" },
  { code: "BT", group: "H", name: "Battery of UPS" },
  { code: "WL", group: "L", name: "Windows OS Licenses" },
  { code: "WS", group: "L", name: "Windows Server Licenses" },
  { code: "AL", group: "L", name: "Application Software Licenses" },
  { code: "IN", group: "I", name: "Internet" },
  { code: "VP", group: "I", name: "VPN" },
  { code: "MS", group: "S", name: "Maintenance Service" },
];

const DEPARTMENTS = [
  { id: "", name: "All" },
  { id: "IT", name: "IT" },
  { id: "FIN", name: "Finance" },
  { id: "HR", name: "HR" },
];

const STATUS_OPTIONS = [
  { id: "", name: "All" },
  { id: "Active", name: "Active" },
  { id: "Repair", name: "In Repair" },
  { id: "Disposed", name: "Disposed" },
];

const CONDITION_OPTIONS = [
  { id: "", name: "All" },
  { id: "New", name: "New" },
  { id: "Good", name: "Good" },
  { id: "Moderate", name: "Moderate" },
  { id: "Repair", name: "Repair" },
  { id: "Scrap", name: "Scrap" },
];

export default function Assets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAdmin, isSubAdmin } = useAuth();
  const canManage = isAdmin || isSubAdmin;

  // Read branch from URL: /assets?branch=Kathmandu Branch
  const urlParams = new URLSearchParams(location.search);
  const branchFromUrl = urlParams.get("branch") || location.state?.branch || "";

  const [filters, setFilters] = useState({
    brandedOption: "",
    department: "",
    group: "",
    subCategory: "",
    status: "",
    condition: "",
    search: "",
    branch: branchFromUrl, // initial filter from URL
  });

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Form state
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Basic / main asset
    assetCode: "",
    assetName: "",
    brandedOptionCode: "",
    groupId: "",
    subCategoryCode: "",
    brand: "",
    branch: branchFromUrl || "",
    departmentId: "",
    userAllocated: "",
    purchaseDate: "",
    warrantyExp: "",
    status: "Active",
    assetCondition: "Good",

    // Technical
    cpu: "",
    ram: "",
    os: "",
    storage: "",
    ipAddress: "",
    domainName: "",
    serialNo: "",
    otherSpecs: "",

    // Commercial
    vendorName: "",
    poNo: "",
    invoiceNo: "",
    amount: "",
    amcVendor: "",
    amcExp: "",
    remarks: "",

    // License
    noOfLicenses: "",
    licenseKey: "",
    licenseExp: "",
    notes: "",
  });

  // Full branch info (name, address, contact, service_station, region)
  const [branchInfo, setBranchInfo] = useState(null);

  // 🔹 Start with LEFT PANEL HIDDEN
  const [showLeft, setShowLeft] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "group" ? { subCategory: "" } : {}),
    }));
  };

  const resetFilters = () =>
    setFilters((prev) => ({
      ...prev,
      brandedOption: "",
      department: "",
      group: "",
      subCategory: "",
      status: "",
      condition: "",
      search: "",
      branch: prev.branch, // keep branch filter from URL
    }));

  const availableSubCategories = useMemo(() => {
    if (!filters.group) return ASSET_SUB_CATEGORIES;
    return ASSET_SUB_CATEGORIES.filter((sc) => sc.group === filters.group);
  }, [filters.group]);

  // Fetch assets
  useEffect(() => {
    if (!token) return;

    const fetchAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          brandedOption: filters.brandedOption || undefined,
          department: filters.department || undefined,
          group: filters.group || undefined,
          subCategory: filters.subCategory || undefined,
          status: filters.status || undefined,
          condition: filters.condition || undefined,
          search: filters.search || undefined,
          branch: filters.branch || undefined,
        };

        const res = await api.get("/api/assets", {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Debugging: log response so we can inspect shape in DevTools
        console.debug('GET /api/assets response:', res && res.data);

        // API may return paginated response: { data: [...], pagination: {...} }
        setAssets((res.data && res.data.data) || res.data || []);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Failed to load assets from server.");
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [token, filters, reload]);

  // Fetch full branch info by name for header details
  useEffect(() => {
    if (!token || !branchFromUrl) {
      setBranchInfo(null);
      return;
    }

    const fetchBranchInfo = async () => {
      try {
        const res = await api.get("/api/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Branch list endpoint may be paginated now; normalize to an array
        const list = (res.data && res.data.data) || res.data || [];
        const match = list.find((b) => b.name === branchFromUrl);
        setBranchInfo(match || null);
      } catch (err) {
        console.error("Error fetching branch info:", err);
        setBranchInfo(null);
      }
    };

    fetchBranchInfo();
  }, [token, branchFromUrl]);

  const handleRowClick = (asset) => {
    navigate(`/assets/${asset.id}`);
  };

  // Submit Add Asset form
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!canManage || !token) return;

    setSaving(true);
    try {
      const payload = {
        asset: {
          assetCode: form.assetCode,
          assetName: form.assetName,
          brandedOptionCode: form.brandedOptionCode || null,
          groupId: form.groupId || null,
          subCategoryCode: form.subCategoryCode || null,
          brand: form.brand || null,
          branch: form.branch || null,
          departmentId: form.departmentId || null,
          userAllocated: form.userAllocated || null,
          purchaseDate: form.purchaseDate || null,
          warrantyExp: form.warrantyExp || null,
          status: form.status || "Active",
          assetCondition: form.assetCondition || "Good",
        },
        technical: {
          cpu: form.cpu || null,
          ram: form.ram || null,
          storage: form.storage || null,
          os: form.os || null,
          ipAddress: form.ipAddress || null,
          domainName: form.domainName || null,
          serialNo: form.serialNo || null,
          otherSpecs: form.otherSpecs || null,
        },
        commercial: {
          vendorName: form.vendorName || null,
          poNo: form.poNo || null,
          invoiceNo: form.invoiceNo || null,
          amount: form.amount || null,
          amcVendor: form.amcVendor || null,
          amcExp: form.amcExp || null,
          remarks: form.remarks || null,
        },
        license: {
          noOfLicenses: form.noOfLicenses || null,
          licenseKey: form.licenseKey || null,
          licenseExp: form.licenseExp || null,
          notes: form.notes || null,
        },
      };

      await api.post("/api/assets", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Asset added successfully!");

      setForm((prev) => ({
        ...prev,
        assetCode: "",
        assetName: "",
        brandedOptionCode: "",
        groupId: "",
        subCategoryCode: "",
        brand: "",
        // keep branch as is
        departmentId: "",
        userAllocated: "",
        purchaseDate: "",
        warrantyExp: "",
        status: "Active",
        assetCondition: "Good",
        cpu: "",
        ram: "",
        os: "",
        storage: "",
        ipAddress: "",
        domainName: "",
        serialNo: "",
        otherSpecs: "",
        vendorName: "",
        poNo: "",
        invoiceNo: "",
        amount: "",
        amcVendor: "",
        amcExp: "",
        remarks: "",
        noOfLicenses: "",
        licenseKey: "",
        licenseExp: "",
        notes: "",
      }));

      setFormVisible(false);
      setReload((r) => r + 1);
    } catch (err) {
      console.error("Error adding asset:", err);
      alert("Failed to add asset");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <>
      <main className="assets-page">
        <div className="split-page">
          {/* LEFT 40% — Branch header + Filters + Add form button */}
          {showLeft && (
            <div className="split-left">
              <button className="back-btn" onClick={() => navigate("/branches")}>
                ← Back
              </button>
              <div className="left-inner">
                <h1 className="asset-title">Assets of Branch</h1>

                {branchInfo && (
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: "0.8rem",
                      color: "grey",
                      marginBottom: "1rem",
                    }}
                  >
                    <b>{branchInfo.name}</b> <br />
                    <b>{branchInfo.address || "—"}</b> <br />
                    <b>{branchInfo.contact || "—"}</b>
                  </p>
                )}

                {/* Add Asset form toggle (Admin/SubAdmin only) */}
                {canManage && (
                  <div
                    style={{
                      marginTop: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="btn primary"
                      type="button"
                      onClick={() => setFormVisible((v) => !v)}
                    >
                      {formVisible ? "Close Form" : "+ Add Asset"}
                    </button>
                  </div>
                )}

                {/* Filters section */}
                <h4 className="sidebar-title" style={{ marginTop: "10px" }}>
                  Filters
                </h4>

                <div
                  className="sidebar-list"
                  style={{ listStyle: "none", padding: 0 }}
                >
                  {/* Branded Option */}
                  <div className="field-left">
                    <label>Branded Option</label>
                    <select
                      value={filters.brandedOption}
                      onChange={(e) =>
                        updateFilter("brandedOption", e.target.value)
                      }
                    >
                      {BRANDED_OPTIONS.map((bo) => (
                        <option key={bo.code} value={bo.code}>
                          {bo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="field-left">
                    <label>Department</label>
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        updateFilter("department", e.target.value)
                      }
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Group */}
                  <div className="field-left">
                    <label>Asset Category</label>
                    <select
                      value={filters.group}
                      onChange={(e) => updateFilter("group", e.target.value)}
                    >
                      {ASSET_GROUPS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Category */}
                  <div className="field-left">
                    <label>Sub-Category</label>
                    <select
                      value={filters.subCategory}
                      onChange={(e) =>
                        updateFilter("subCategory", e.target.value)
                      }
                    >
                      <option value="">All</option>
                      {availableSubCategories.map((sc) => (
                        <option key={sc.code} value={sc.code}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="field-left">
                    <label>Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => updateFilter("status", e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div className="field-left">
                    <label>Condition</label>
                    <select
                      value={filters.condition}
                      onChange={(e) =>
                        updateFilter("condition", e.target.value)
                      }
                    >
                      {CONDITION_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear filters */}
                <div
                  className="filters-actions"
                  style={{ marginTop: "16px", justifyContent: "space-between" }}
                >
                  <button className="btn ghost" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT 60% — Form + Table */}
          <div
            className="split-right"
            style={showLeft ? {} : { width: "100%" }}
          >
            {/* Top header: search + toggle left panel */}
            <div className="details-header">
              <div>
                <h3 className="section-title">
                  Assets List Table
                  <p>
                    {assets.length} asset{assets.length !== 1 ? "s" : ""} found.
                  </p>
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                }}
              >
                <div className="top-field">
                  <input
                    style={{ border: "1px solid grey", borderRadius:"10px" }}
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    placeholder="Search asset code, name, branch, user..."
                  />
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setShowLeft((s) => !s)}
                  >
                    {showLeft ? "Hide Panel" : "Show Panel"}
                  </button>
                </div>
              </div>
            </div>

            {/* Add / Update Asset form on right side */}
            {canManage && formVisible && (
              <section className="asset-form">
                <h4 style={{ marginTop: 0, marginBottom: "8px" }}>
                  Add / Update Asset
                </h4>

                <form onSubmit={handleAddAsset}>
                  {/* BASIC INFO */}
                  <div className="field">
                    <label>Asset Code *</label>
                    <input
                      type="text"
                      name="assetCode"
                      value={form.assetCode}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Asset Name *</label>
                    <input
                      type="text"
                      name="assetName"
                      value={form.assetName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Branded Option</label>
                    <select
                      name="brandedOptionCode"
                      value={form.brandedOptionCode}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {BRANDED_OPTIONS.filter((b) => b.code !== "").map(
                        (b) => (
                          <option key={b.code} value={b.code}>
                            {b.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>Asset Group</label>
                    <select
                      name="groupId"
                      value={form.groupId}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {ASSET_GROUPS.filter((g) => g.id !== "").map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Sub-Category</label>
                    <select
                      name="subCategoryCode"
                      value={form.subCategoryCode}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {ASSET_SUB_CATEGORIES.map((sc) => (
                        <option key={sc.code} value={sc.code}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={form.brand}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={form.branch}
                      onChange={handleFormChange}
                      placeholder="e.g., Kathmandu Main Branch"
                    />
                  </div>

                  <div className="field">
                    <label>Department ID</label>
                    <input
                      type="text"
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleFormChange}
                      placeholder="e.g., IT / FIN / HR"
                    />
                  </div>

                  <div className="field">
                    <label>Allocated To (User Name)</label>
                    <input
                      type="text"
                      name="userAllocated"
                      value={form.userAllocated}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={form.purchaseDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Warranty Expiry</label>
                    <input
                      type="date"
                      name="warrantyExp"
                      value={form.warrantyExp}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Repair">Repair</option>
                      <option value="Disposed">Disposed</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Condition</label>
                    <select
                      name="assetCondition"
                      value={form.assetCondition}
                      onChange={handleFormChange}
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Repair">Repair</option>
                      <option value="Scrap">Scrap</option>
                    </select>
                  </div>

                  {/* TECHNICAL */}
                  <hr />
                  <h5>Technical Details</h5>

                  <div className="field">
                    <label>CPU</label>
                    <input
                      type="text"
                      name="cpu"
                      value={form.cpu}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>RAM</label>
                    <input
                      type="text"
                      name="ram"
                      value={form.ram}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Operating System</label>
                    <input
                      type="text"
                      name="os"
                      value={form.os}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Storage</label>
                    <input
                      type="text"
                      name="storage"
                      value={form.storage}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>IP Address</label>
                    <input
                      type="text"
                      name="ipAddress"
                      value={form.ipAddress}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Domain Name</label>
                    <input
                      type="text"
                      name="domainName"
                      value={form.domainName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Serial No.</label>
                    <input
                      type="text"
                      name="serialNo"
                      value={form.serialNo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Other Specs</label>
                    <input
                      type="text"
                      name="otherSpecs"
                      value={form.otherSpecs}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* COMMERCIAL */}
                  <hr />
                  <h5>Commercial Details</h5>

                  <div className="field">
                    <label>Vendor Name</label>
                    <input
                      type="text"
                      name="vendorName"
                      value={form.vendorName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>PO No.</label>
                    <input
                      type="text"
                      name="poNo"
                      value={form.poNo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Invoice No.</label>
                    <input
                      type="text"
                      name="invoiceNo"
                      value={form.invoiceNo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>AMC Vendor</label>
                    <input
                      type="text"
                      name="amcVendor"
                      value={form.amcVendor}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>AMC Expiry</label>
                    <input
                      type="date"
                      name="amcExp"
                      value={form.amcExp}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      value={form.remarks}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* LICENSE */}
                  <hr />
                  <h5>License Details</h5>

                  <div className="field">
                    <label>No. of Licenses</label>
                    <input
                      type="number"
                      name="noOfLicenses"
                      value={form.noOfLicenses}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>License Key</label>
                    <input
                      type="text"
                      name="licenseKey"
                      value={form.licenseKey}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>License Expiry</label>
                    <input
                      type="date"
                      name="licenseExp"
                      value={form.licenseExp}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="field">
                    <label>Notes</label>
                    <input
                      type="text"
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "8px",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => setFormVisible(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Asset"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Assets table */}
            <section className="assets-table-section">
              {loading ? (
                <div className="table-empty">Loading assets...</div>
              ) : error ? (
                <div className="table-empty error">{error}</div>
              ) : assets.length === 0 ? (
                <div className="table-empty">
                  No assets match current filters.
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="assets-table">
                    <thead>
                      <tr>
                        <th>Asset ID</th>
                        <th>Asset Code</th>
                        <th>Name</th>
                        <th>Branded Option</th>
                        <th>Category Code</th>
                        <th>Sub-Category Code</th>
                        <th>Brand</th>
                        <th>Branch</th>
                        <th>Department</th>
                        <th>Allocated To</th>
                        <th>Status</th>
                        <th>Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((a) => {
                        const brandedName =
                          BRANDED_OPTIONS.find(
                            (bo) => bo.code === a.brandedOptionCode
                          )?.label ||
                          a.brandedOptionCode ||
                          "-";

                        const categoryCode = a.groupId || a.group?.id || "-";
                        const subCategoryCode =
                          a.subCategoryCode || a.subCategory?.code || "-";
                        const deptName =
                          a.department?.name || a.departmentId || "-";

                        return (
                          <tr key={a.id} onClick={() => handleRowClick(a)}>
                            <td>{a.id}</td>
                            <td className="link">{a.assetCode}</td>
                            <td>{a.assetName}</td>
                            <td>{brandedName}</td>
                            <td>{categoryCode}</td>
                            <td>{subCategoryCode}</td>
                            <td>{a.brand}</td>
                            <td>{a.branch}</td>
                            <td>{deptName}</td>
                            <td>{a.userAllocated || "Unallocated"}</td>
                            <td>
                              <span
                                className={`status-pill status-${String(
                                  a.status || ""
                                ).toLowerCase()}`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td>{a.assetCondition || a.condition || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
