    // src/components/BranchDetail.jsx
    import React, { useState, useEffect } from "react";
    import "../styles/AssetSplit.css";
    import api from "../services/api";

    export default function BranchDetail({ branch, token, onClose, isAdmin, isSubAdmin }) {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [activeSection, setActiveSection] = useState("totalStaff");
    const [expanded, setExpanded] = useState({});
    const [showLeft, setShowLeft] = useState(true); // 🔹 same behavior as AssetDetail

    const sections = [
        "infra",
        "scanner",
        "projector",
        "printer",
        "desktop",
        "laptop",
        "cctv",
        "panel",
        "ups",
        "ipphone",
    ];

    useEffect(() => {
        // normalize includes: Sequelize sometimes returns objects or arrays depending on association
        const normalize = (val) => {
        if (!val) return {};
        if (Array.isArray(val)) return val[0] || {};
        return val;
        };

        const infra = normalize(branch?.infra);
        const scanner = normalize(branch?.scanner);
        const projector = normalize(branch?.projector);
        const printer = normalize(branch?.printer);
        const desktop = normalize(branch?.desktop);
        const laptop = normalize(branch?.laptop);
        const cctv = normalize(branch?.cctv);
        const panel = normalize(branch?.panel);
        const ipphone = normalize(branch?.ipphone);

        // merge known infra-related objects into a flat form
        setForm({
        ...infra,
        ...scanner,
        ...projector,
        ...printer,
        ...desktop,
        ...laptop,
        ...cctv,
        ...panel,
        ...ipphone,
        });

        const initExpanded = {};
        sections.forEach((sec) => (initExpanded[sec] = false));
        setExpanded(initExpanded);
    }, [branch]);

    const get = (key) => (form[key] === null || form[key] === undefined || form[key] === "" ? "—" : form[key]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (section) => {
        setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleUpdate = async () => {
        try {
        const payloads = sections.map((sec) => ({
            url: `/api/branches/${branch.id}/${sec}`,
            data: branch[sec] || {},
        }));

        await Promise.all(
            payloads.map((p) =>
            api.put(p.url, p.data, {
                headers: { Authorization: `Bearer ${token}` },
            })
            )
        );

        alert("Updated successfully!");
        window.location.reload();
        } catch (err) {
        console.error(err);
        alert("Update failed");
        }
    };

    const renderSectionTable = (sec) => {
       let fields = [];

        if (sec === 'infra') {
        const infraKeys = [
            'total_staff',
            'connectivity_status',
            'connectivity_wlink',
            'connectivity_lan_ip',
            'connectivity_lan_switch',
            'connectivity_network',
            'connectivity_wifi',
            'biometrics_ip',
            'ups_total_no',
            'ups_model',
            'ups_backup_time',
            'ups_installer',
        ];
        fields = infraKeys.filter((k) => Object.prototype.hasOwnProperty.call(form, k));
        } else {
        fields = Object.keys(form).filter((k) => k.includes(sec));
        }

        if (!fields.length) return <p>No data available</p>;

        return (
        <div>
            <table className="asset-horizontal-table">
            <thead>
                <tr>
                {fields.map((f) => (
                    <th key={f}>{f}</th>
                ))}
                <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                {fields.map((f) => (
                    <td key={f}>{get(f)}</td>
                ))}
                <td>
                    <button
                    type="button"
                    className="back-btn"
                    onClick={() => handleToggle(sec)}
                    >
                    {expanded[sec] ? "Hide Details" : "Show Details"}
                    </button>
                </td>
                </tr>
            </tbody>
            </table>

            {expanded[sec] && (
            <table
                className="asset-horizontal-table"
                style={{ marginTop: "1rem" }}
            >
                <thead>
                <tr>
                    {fields.map((f) => (
                    <th key={f}>{f}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                    {fields.map((f) => (
                    <td key={f}>{get(f)}</td>
                    ))}
                </tr>
                </tbody>
            </table>
            )}
        </div>
        );
    };

    const sectionMeta = [
        { id: "totalStaff", label: "Total Staff" },
        { id: "connectivity", label: "Connectivity" },
        // the infra-related sections use your existing ids
        { id: "infra", label: "Infra" },
        { id: "scanner", label: "Scanner" },
        { id: "projector", label: "Projector" },
        { id: "printer", label: "Printer" },
        { id: "desktop", label: "Desktop" },
        { id: "laptop", label: "Laptop" },
        { id: "cctv", label: "CCTV" },
        { id: "panel", label: "Panel" },
        { id: "ups", label: "UPS" },
        { id: "ipphone", label: "IP Phone" },
    ];

    const currentSection =
        sectionMeta.find((s) => s.id === activeSection) || sectionMeta[0];

    return (
        <div className="split-page">
        {/* LEFT PANEL (like AssetDetail) */}
        {showLeft && (
            <div className="split-left">
            <div className="details-header">
                <button
                type="button"
                className="back-btn"
                onClick={onClose}
                >
                ← Back
                </button>
                <h1>Branch Details</h1>
            </div>

            <div className="left-inner">
                <h2 className="asset-title">{branch.name}</h2>
                <p className="asset-subtitle">
                Manager: {branch.manager_name || "—"}
                </p>

                {(isAdmin || isSubAdmin) && (
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => setEditMode((prev) => !prev)}
                >
                    {editMode ? "Close Edit" : "Edit Details"}
                </button>
                )}

                <h4 className="sidebar-title">Sections</h4>
                <ul className="sidebar-list">
                {sectionMeta.map((section) => (
                    <li key={section.id}>
                    <button
                        type="button"
                        className={
                        section.id === activeSection
                            ? "sidebar-btn active"
                            : "sidebar-btn"
                        }
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

        {/* RIGHT PANEL (like AssetDetail) */}
        <div
            className="split-right"
            style={showLeft ? {} : { width: "100%" }}
        >
            <div
            className="details-header"
            style={{ justifyContent: "space-between" }}
            >
            <h3 className="section-title">{currentSection.label}</h3>

            <div style={{ display: "flex", gap: "8px" }}>
                {!showLeft && (
                <button
                    type="button"
                    className="back-btn"
                    onClick={onClose}
                >
                    ← Back
                </button>
                )}

                <button
                type="button"
                className="back-btn"
                onClick={() => setShowLeft((prev) => !prev)}
                >
                {showLeft ? "Hide Panel" : "Show Panel"}
                </button>
            </div>
            </div>

            <div className="table-wrapper">
            {editMode ? (
                <section>
                <h2>Edit Branch Infra</h2>
                {Object.keys(form).map((f) => (
                    <div key={f} className="form-group">
                    <label>{f}</label>
                    <input
                        name={f}
                        value={form[f] ?? ""}
                        onChange={handleChange}
                    />
                    </div>
                ))}
                <button
                    type="button"
                    className="back-btn"
                    onClick={handleUpdate}
                >
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
                        <td>{get("total_staff")}</td>
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
                        <td>{get("connectivity_status")}</td>
                        <td>{get("connectivity_wlink")}</td>
                        <td>{get("connectivity_lan_ip")}</td>
                        <td>{get("connectivity_lan_switch")}</td>
                        <td>{get("connectivity_network")}</td>
                        <td>{get("connectivity_wifi")}</td>
                        </tr>
                    </tbody>
                    </table>
                )}

                {/* reuse your original section table logic */}
                {sections.map(
                    (sec) => activeSection === sec && renderSectionTable(sec)
                )}
                </>
            )}
            </div>
        </div>
        </div>
    );
    }
