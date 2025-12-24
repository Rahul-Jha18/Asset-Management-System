import React, { useState, useEffect } from "react";
import "../styles/AssetSplit.css";
import api from "../services/api";

export default function BranchDetail({ branch, token, onClose, isAdmin, isSubAdmin }) {
  const isStaffCanEdit = isAdmin || isSubAdmin;

  // ✅ Backend routes (MATCHES your branchRoutes.js)
  const UPDATE_API = {
    infra: (branchId) => `/api/branches/${branchId}/infra`,
    scanners: (branchId, rowId) => `/api/branches/${branchId}/scanners/${rowId}`,
    projectors: (branchId, rowId) => `/api/branches/${branchId}/projectors/${rowId}`,
    printers: (branchId, rowId) => `/api/branches/${branchId}/printers/${rowId}`,
    desktops: (branchId, rowId) => `/api/branches/${branchId}/desktops/${rowId}`,
    laptops: (branchId, rowId) => `/api/branches/${branchId}/laptops/${rowId}`,
    cctvs: (branchId, rowId) => `/api/branches/${branchId}/cctvs/${rowId}`,
    panels: (branchId, rowId) => `/api/branches/${branchId}/panels/${rowId}`,
    ipphones: (branchId, rowId) => `/api/branches/${branchId}/ipphones/${rowId}`,
  };

  // ✅ UI key -> API key
  const routeKey = {
    scanner: "scanners",
    projector: "projectors",
    printer: "printers",
    desktop: "desktops",
    laptop: "laptops",
    cctv: "cctvs",
    panel: "panels",
    ipphone: "ipphones",
  };

  const [data, setData] = useState({
    infra: {},
    scanner: [],
    projector: [],
    printer: [],
    desktop: [],
    laptop: [],
    cctv: [],
    panel: [],
    ipphone: [],
  });

  const [activeSection, setActiveSection] = useState("totalStaff");
  const [expanded, setExpanded] = useState({});
  const [showLeft, setShowLeft] = useState(true);

  // ✅ editing
  const [editingRow, setEditingRow] = useState(null); // {sec, id}
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const sections = ["infra", "ups", "scanner", "projector", "printer", "desktop", "laptop", "cctv", "panel", "ipphone"];

  const sectionMeta = [
    { id: "totalStaff", label: "Total Staff" },
    { id: "connectivity", label: "Connectivity" },
    { id: "infra", label: "Infra" },
    { id: "ups", label: "UPS" },
    { id: "scanner", label: "Scanner" },
    { id: "projector", label: "Projector" },
    { id: "printer", label: "Printer" },
    { id: "desktop", label: "Desktop" },
    { id: "laptop", label: "Laptop" },
    { id: "cctv", label: "CCTV" },
    { id: "panel", label: "Panel" },
    { id: "ipphone", label: "IP Phone" },
  ];

  const sectionConfig = {
    infra: {
      summary: ["total_staff", "connectivity_status", "connectivity_lan_ip", "connectivity_wifi"],
      details: [
        "total_staff",
        "connectivity_status",
        "connectivity_wlink",
        "connectivity_lan_ip",
        "connectivity_lan_switch",
        "connectivity_network",
        "connectivity_wifi",
        "biometrics_ip",
      ],
      single: true,
      nameKey: "branchId",
    },
    // ✅ UPS fields are inside infra table
    ups: {
      summary: ["ups_total_no", "ups_model", "ups_backup_time", "ups_installer"],
      details: ["ups_total_no", "ups_model", "ups_backup_time", "ups_installer", "ups_rating", "battery_rating", "ups_purchase_year"],
      single: true,
      nameKey: "ups_model",
    },

    scanner: { nameKey: "scanner_name", summary: ["scanner_name", "scanner_number", "scanner_model"], details: ["scanner_name", "scanner_number", "scanner_model", "remarks"] },
    projector: { nameKey: "projector_name", summary: ["projector_name", "projector_model", "projector_status", "projector_purchase_date"], details: ["projector_name", "projector_model", "projector_status", "projector_purchase_date", "location", "remarks"] },
    printer: { nameKey: "printer_name", summary: ["printer_name", "printer_model", "printer_type", "printer_status"], details: ["printer_name", "printer_model", "printer_type", "printer_status", "remarks"] },
    desktop: {
      nameKey: "desktop_brand",
      summary: ["desktop_brand", "desktop_processor", "desktop_ram", "desktop_domain"],
      details: ["desktop_total_no", "desktop_ids", "desktop_brand", "desktop_ram", "desktop_ssd", "desktop_processor", "desktop_domain", "desktop_purchase_date", "desktop_fiscal_year", "remarks"],
    },
    laptop: {
      nameKey: "laptop_brand",
      summary: ["laptop_brand", "laptop_processor", "laptop_ram", "laptop_user"],
      details: ["laptop_total_no", "laptop_ids", "laptop_brand", "laptop_ram", "laptop_ssd", "laptop_processor", "laptop_domain", "laptop_user", "laptop_purchase_date", "laptop_fiscal_year", "remarks"],
    },
    cctv: { nameKey: "cctv_nvr_ip", summary: ["cctv_total_no", "cctv_nvr_ip", "cctv_installed_year", "cctv_record_days"], details: ["cctv_total_no", "cctv_nvr_ip", "cctv_camera_ip", "cctv_installed_year", "cctv_record_days", "cctv_nvr_details"] },
    panel: { nameKey: "panel_name", summary: ["panel_name", "panel_brand", "panel_ip", "panel_status"], details: ["panel_name", "panel_brand", "panel_ip", "panel_user", "panel_status", "location", "panel_purchase_year", "remarks"] },
    ipphone: { nameKey: "ip_telephone_ip", summary: ["ip_telephone_ip", "ip_telephone_ext_no", "model", "ip_telephone_status"], details: ["ip_telephone_ip", "ip_telephone_ext_no", "model", "ip_telephone_status"] },
  };

  const normalizeList = (val) => (!val ? [] : Array.isArray(val) ? val : [val]);

  useEffect(() => {
    setData({
      infra: branch?.infra || {},
      scanner: normalizeList(branch?.scanners),
      projector: normalizeList(branch?.projectors),
      printer: normalizeList(branch?.printers),
      desktop: normalizeList(branch?.desktops),
      laptop: normalizeList(branch?.laptops),
      cctv: normalizeList(branch?.cctvs),
      panel: normalizeList(branch?.panels),
      ipphone: normalizeList(branch?.ipphones),
    });

    const init = {};
    sections.forEach((sec) => (init[sec] = {}));
    setExpanded(init);

    setEditingRow(null);
    setEditForm({});
  }, [branch]);

  const getVal = (row, key) =>
    row?.[key] === null || row?.[key] === undefined || row?.[key] === "" ? "—" : row[key];

  const parseNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getSectionCount = (sec) => {
    if (sec === "totalStaff") return parseNum(data?.infra?.total_staff);
    if (sec === "connectivity") return null;
    if (sec === "infra" || sec === "ups") return 1;
    return (data?.[sec] || []).length;
  };

  const handleToggle = (sec, rowId) => {
    setExpanded((prev) => ({
      ...prev,
      [sec]: { ...(prev[sec] || {}), [rowId]: !(prev?.[sec]?.[rowId]) },
    }));
  };

  const startEdit = (sec, row) => {
    const isSingle = !!sectionConfig?.[sec]?.single;
    const rowId = isSingle ? "single" : row?.id;

    setEditingRow({ sec, id: rowId });
    setEditForm({ ...(row || {}) });

    if (isSingle) {
      setExpanded((p) => ({ ...p, [sec]: { ...(p[sec] || {}), single: true } }));
    } else if (row?.id) {
      setExpanded((p) => ({ ...p, [sec]: { ...(p[sec] || {}), [row.id]: true } }));
    }
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditForm({});
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  // ✅ SAVE (FIXED: uses routeKey map ALWAYS)
  const saveEdit = async () => {
    if (!editingRow) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      setSaving(true);

      // ✅ INFRA + UPS
      if (editingRow.sec === "infra" || editingRow.sec === "ups") {
        const res = await api.put(UPDATE_API.infra(branch.id), editForm, { headers });
        setData((p) => ({ ...p, infra: res.data }));
        cancelEdit();
        return;
      }

      // ✅ DEVICES
      const sec = editingRow.sec; // "laptop"
      const rowId = editingRow.id;

      const apiKey = routeKey[sec]; // "laptops"
      const urlFn = UPDATE_API[apiKey];

      if (!apiKey || !urlFn) {
        alert(`Route mapping missing for section: ${sec}`);
        return;
      }

      const url = urlFn(branch.id, rowId);
      const res = await api.put(url, editForm, { headers });

      setData((p) => ({
        ...p,
        [sec]: (p[sec] || []).map((r) => (r.id === rowId ? res.data : r)),
      }));

      cancelEdit();
    } catch (err) {
      console.error("Update error:", err?.response?.data || err);
      alert(err?.response?.data?.message || err?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const renderDetailsPanel = (sec, row, keys) => {
    const conf = sectionConfig[sec] || {};
    const isSingle = !!conf.single;
    const rowId = isSingle ? "single" : row?.id;

    const isEditing = editingRow?.sec === sec && editingRow?.id === rowId;

    const nameKey = conf.nameKey;
    const nameValue = nameKey ? getVal(row, nameKey) : "—";

    return (
      <div className="details-panel-card">
        <div className="details-panel-header" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <strong>
            Name: <span>{nameValue}</span>
          </strong>

          {isStaffCanEdit && (
            <div style={{ display: "flex", gap: 8 }}>
              {!isEditing ? (
                <button type="button" className="back-btn" onClick={() => startEdit(sec, row)}>
                  Edit
                </button>
              ) : (
                <>
                  <button type="button" className="back-btn" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" className="back-btn" onClick={saveEdit} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="details-panel-grid">
          {keys.map((k) => (
            <div key={k} className="field-box">
              <div className="field-label">{k}</div>
              {!isEditing ? (
                <div className="field-value">{getVal(row, k)}</div>
              ) : (
                <input className="asset-edit-input" name={k} value={editForm?.[k] ?? ""} onChange={onEditChange} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionTable = (sec) => {
    const conf = sectionConfig[sec];
    if (!conf) return <p>No config available</p>;

    const summaryFields = conf.summary || [];
    const detailsFields = conf.details || summaryFields;

    // ✅ single: infra & ups use data.infra
    if (sec === "infra" || sec === "ups") {
      const source = data.infra || {};
      return (
        <div>
          <table className="asset-horizontal-table">
            <thead>
              <tr>
                {summaryFields.map((f) => <th key={f}>{f}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {summaryFields.map((f) => <td key={f}>{getVal(source, f)}</td>)}
                <td style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="back-btn" onClick={() => handleToggle(sec, "single")}>
                    {expanded?.[sec]?.single ? "Hide Details" : "Show Details"}
                  </button>
                  {isStaffCanEdit && (
                    <button type="button" className="back-btn" onClick={() => startEdit(sec, source)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {expanded?.[sec]?.single && renderDetailsPanel(sec, source, detailsFields)}
        </div>
      );
    }

    // ✅ list sections
    const rows = data?.[sec] || [];
    if (!rows.length) return <p>No data available</p>;

    return (
      <div>
        <table className="asset-horizontal-table">
          <thead>
            <tr>
              {summaryFields.map((f) => <th key={f}>{f}</th>)}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const rowId = row.id;
              const isOpen = !!expanded?.[sec]?.[rowId];

              return (
                <React.Fragment key={rowId}>
                  <tr>
                    {summaryFields.map((f) => <td key={f}>{getVal(row, f)}</td>)}
                    <td style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="back-btn" onClick={() => handleToggle(sec, rowId)}>
                        {isOpen ? "Hide Details" : "Show Details"}
                      </button>
                      {isStaffCanEdit && (
                        <button type="button" className="back-btn" onClick={() => startEdit(sec, row)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={summaryFields.length + 1}>{renderDetailsPanel(sec, row, detailsFields)}</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const currentSection = sectionMeta.find((s) => s.id === activeSection) || sectionMeta[0];
  const currentCount = getSectionCount(activeSection);

  return (
    <div className="split-page">
      {showLeft && (
        <div className="split-left">
          <div className="details-header">
            <button type="button" className="back-btn" onClick={onClose}>
              ← Back
            </button>
            <h1>Branch Details</h1>
          </div>

          <div className="left-inner">
            <h2 className="asset-title">{branch.name}</h2>
            <p className="asset-subtitle">Manager: {branch.manager_name || "—"}</p>

            <h4 className="sidebar-title">Sections</h4>
            <ul className="sidebar-list">
              {sectionMeta.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={s.id === activeSection ? "sidebar-btn active" : "sidebar-btn"}
                    onClick={() => {
                      setActiveSection(s.id);
                      cancelEdit();
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="split-right" style={showLeft ? {} : { width: "100%" }}>
        <div className="details-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 className="section-title">{currentSection.label}</h3>
            {currentCount !== null && <span className="total-badge">Total: {currentCount}</span>}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {!showLeft && (
              <button type="button" className="back-btn" onClick={onClose}>
                ← Back
              </button>
            )}
            <button type="button" className="back-btn" onClick={() => setShowLeft((p) => !p)}>
              ☰
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {activeSection === "totalStaff" && (
            <table className="asset-horizontal-table">
              <thead>
                <tr>
                  <th>Total Staff</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getVal(data.infra, "total_staff")}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeSection === "connectivity" && (
            <table className="asset-horizontal-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Wlink</th>
                  <th>LAN IP</th>
                  <th>LAN Switch</th>
                  <th>Network</th>
                  <th>WiFi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getVal(data.infra, "connectivity_status")}</td>
                  <td>{getVal(data.infra, "connectivity_wlink")}</td>
                  <td>{getVal(data.infra, "connectivity_lan_ip")}</td>
                  <td>{getVal(data.infra, "connectivity_lan_switch")}</td>
                  <td>{getVal(data.infra, "connectivity_network")}</td>
                  <td>{getVal(data.infra, "connectivity_wifi")}</td>
                </tr>
              </tbody>
            </table>
          )}

          {sections.map((sec) => activeSection === sec && renderSectionTable(sec))}
        </div>
      </div>
    </div>
  );
}
