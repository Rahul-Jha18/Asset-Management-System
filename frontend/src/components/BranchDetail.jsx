// src/components/BranchDetail.jsx
import React, { useState, useEffect } from "react";
import "../styles/AssetSplit.css";
import api from "../services/api";

export default function BranchDetail({ branch, token, onClose, isAdmin, isSubAdmin }) {
  const [editMode, setEditMode] = useState(false);

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

  const isStaffCanEdit = isAdmin || isSubAdmin;

  const sections = ["infra", "scanner", "projector", "printer", "desktop", "laptop", "cctv", "panel", "ipphone", "ups"];

  const sectionConfig = {
    infra: {
      title: "Infra",
      nameKey: "branch_name",
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
    },

    // UPS is inside infra table
    ups: {
      title: "UPS",
      nameKey: "ups_model",
      summary: ["ups_total_no", "ups_model", "ups_backup_time", "ups_installer"],
      details: ["ups_total_no", "ups_model", "ups_backup_time", "ups_installer", "ups_rating", "battery_rating", "ups_purchase_year"],
    },

    scanner: {
      title: "Scanner",
      nameKey: "scanner_name",
      summary: ["scanner_name", "scanner_number", "scanner_model"],
      details: ["scanner_name", "scanner_number", "scanner_model", "remarks"],
    },

    projector: {
      title: "Projector",
      nameKey: "projector_name",
      summary: ["projector_name", "projector_model", "projector_status", "projector_purchase_date"],
      details: ["projector_name", "projector_model", "projector_status", "projector_purchase_date", "location", "remarks"],
    },

    printer: {
      title: "Printer",
      nameKey: "printer_name",
      summary: ["printer_name", "printer_model", "printer_type", "printer_status"],
      details: ["printer_name", "printer_model", "printer_type", "printer_status", "remarks"],
    },

    desktop: {
      title: "Desktop",
      nameKey: "desktop_brand",
      summary: ["desktop_brand", "desktop_processor", "desktop_ram", "desktop_domain"],
      details: [
        "desktop_total_no",
        "desktop_ids",
        "desktop_brand",
        "desktop_ram",
        "desktop_ssd",
        "desktop_processor",
        "desktop_domain",
        "desktop_purchase_date",
        "desktop_fiscal_year",
        "remarks",
      ],
    },

    laptop: {
      title: "Laptop",
      nameKey: "laptop_brand",
      summary: ["laptop_brand", "laptop_processor", "laptop_ram", "laptop_user"],
      details: [
        "laptop_total_no",
        "laptop_ids",
        "laptop_brand",
        "laptop_ram",
        "laptop_ssd",
        "laptop_processor",
        "laptop_domain",
        "laptop_user",
        "laptop_purchase_date",
        "laptop_fiscal_year",
        "remarks",
      ],
    },

    cctv: {
      title: "CCTV",
      nameKey: "cctv_nvr_ip",
      summary: ["cctv_total_no", "cctv_nvr_ip", "cctv_installed_year", "cctv_record_days"],
      details: ["cctv_total_no", "cctv_nvr_ip", "cctv_camera_ip", "cctv_installed_year", "cctv_record_days", "cctv_nvr_details"],
    },

    panel: {
      title: "Panel",
      nameKey: "panel_name",
      summary: ["panel_name", "panel_brand", "panel_ip", "panel_status"],
      details: ["panel_name", "panel_brand", "panel_ip", "panel_user", "panel_status", "location", "panel_purchase_year", "remarks"],
    },

    ipphone: {
      title: "IP Phone",
      nameKey: "ip_telephone_ip",
      summary: ["ip_telephone_ip", "ip_telephone_ext_no", "model", "ip_telephone_status"],
      details: ["ip_telephone_ip", "ip_telephone_ext_no", "model", "ip_telephone_status"],
    },
  };

  const normalizeList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  };

  useEffect(() => {
    // ✅ after backend update, branch.* will be plural arrays
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
  }, [branch]);

  const getVal = (row, key) =>
    row?.[key] === null || row?.[key] === undefined || row?.[key] === "" ? "—" : row[key];

  const handleToggle = (sec, rowId) => {
    setExpanded((prev) => ({
      ...prev,
      [sec]: { ...(prev[sec] || {}), [rowId]: !(prev?.[sec]?.[rowId]) },
    }));
  };

  // Infra edit (single)
  const [infraForm, setInfraForm] = useState({});
  useEffect(() => setInfraForm(data.infra || {}), [data.infra]);

  const handleInfraChange = (e) => {
    const { name, value } = e.target;
    setInfraForm((p) => ({ ...p, [name]: value }));
  };

  const handleUpdateInfra = async () => {
    try {
      await api.put(`/api/branches/${branch.id}/infra`, infraForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Infra updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Infra update failed");
    }
  };

  const renderDetailsPanel = (sec, row, keys) => {
    const conf = sectionConfig[sec] || {};
    const nameKey = conf.nameKey;
    const nameValue = nameKey ? getVal(row, nameKey) : "—";

    return (
      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
        <div style={{ marginBottom: 10 }}>
          <strong>
            Name: <span style={{ fontWeight: 600 }}>{nameValue}</span>
          </strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {keys.map((k) => (
            <div key={k} style={{ padding: 10, border: "1px solid #eee", borderRadius: 8, background: "#fafafa" }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{k}</div>
              <div style={{ fontWeight: 600 }}>{getVal(row, k)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionTable = (sec) => {
    const conf = sectionConfig[sec];
    if (!conf) return <p>No config available</p>;

    // single sections: infra + ups (ups fields inside infra)
    if (sec === "infra" || sec === "ups") {
      const summaryFields = conf.summary || [];
      const detailsFields = conf.details || [];
      const source = data.infra || {};

      return (
        <div>
          <table className="asset-horizontal-table">
            <thead>
              <tr>
                {summaryFields.map((f) => (
                  <th key={f}>{f}</th>
                ))}
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {summaryFields.map((f) => (
                  <td key={f}>{getVal(source, f)}</td>
                ))}
                <td>
                  <button type="button" className="back-btn" onClick={() => handleToggle(sec, "single")}>
                    {expanded?.[sec]?.single ? "Hide Details" : "Show Details"}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {expanded?.[sec]?.single && renderDetailsPanel(sec, source, detailsFields)}
        </div>
      );
    }

    // multi-device tables
    const rows = data?.[sec] || [];
    if (!rows.length) return <p>No data available</p>;

    const summaryFields = conf.summary || [];
    const detailsFields = conf.details || summaryFields;

    return (
      <div>
        <table className="asset-horizontal-table">
          <thead>
            <tr>
              {summaryFields.map((f) => (
                <th key={f}>{f}</th>
              ))}
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const rowId = row.id;
              const isOpen = !!expanded?.[sec]?.[rowId];

              return (
                <React.Fragment key={rowId}>
                  <tr>
                    {summaryFields.map((f) => (
                      <td key={f}>{getVal(row, f)}</td>
                    ))}
                    <td>
                      <button type="button" className="back-btn" onClick={() => handleToggle(sec, rowId)}>
                        {isOpen ? "Hide Details" : "Show Details"}
                      </button>
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

  const currentSection = sectionMeta.find((s) => s.id === activeSection) || sectionMeta[0];

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

            {isStaffCanEdit && (
              <button type="button" className="back-btn" onClick={() => setEditMode((p) => !p)}>
                {editMode ? "Close Edit" : "Edit Infra"}
              </button>
            )}

            <h4 className="sidebar-title">Sections</h4>
            <ul className="sidebar-list">
              {sectionMeta.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className={section.id === activeSection ? "sidebar-btn active" : "sidebar-btn"}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="split-right" style={showLeft ? {} : { width: "100%" }}>
        <div className="details-header" style={{ justifyContent: "space-between" }}>
          <h3 className="section-title">{currentSection.label}</h3>

          <div style={{ display: "flex", gap: "8px" }}>
            {!showLeft && (
              <button type="button" className="back-btn" onClick={onClose}>
                ← Back
              </button>
            )}

            <button type="button" className="back-btn" onClick={() => setShowLeft((p) => !p)}>
              {showLeft ? "Hide Panel" : "Show Panel"}
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {editMode ? (
            <section>
              <h2>Edit Infra</h2>
              {Object.keys(infraForm || {}).map((f) => (
                <div key={f} className="form-group">
                  <label>{f}</label>
                  <input name={f} value={infraForm[f] ?? ""} onChange={handleInfraChange} />
                </div>
              ))}
              <button type="button" className="back-btn" onClick={handleUpdateInfra}>
                Save
              </button>
            </section>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
