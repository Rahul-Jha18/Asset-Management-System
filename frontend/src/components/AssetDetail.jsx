// src/components/AssetDetail.jsx
import React, { useState, useEffect } from "react";
import "../styles/AssetSplit.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AssetDetail({ asset, onClose, user, onDelete }) {
  const [activeSection, setActiveSection] = useState("basic");
  const [showLeft, setShowLeft] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [updateRemark, setUpdateRemark] = useState("");
  const { token } = useAuth();

  if (!asset) return null;

  const isAdmin =
    user?.is_admin === 1 || user?.is_admin === true || user?.role === "admin";
  const isSubAdmin = user?.role === "subadmin";
  const canManage = isAdmin || isSubAdmin;

  const sections = [
    {
      id: "basic",
      label: "Basic Info and Hardware",
      fields: [
        { label: "Id", key: "id" },
        { label: "Asset Code", key: "assetCode" },
        { label: "Asset Name", key: "assetName" },
        { label: "Asset Category Code", key: "group" },
        { label: "Asset Sub-Category Code", key: "subCategory" },
        { label: "Brand", key: "brand" },
        { label: "Branch", key: "branch" },
        { label: "Department", key: "department" },
        { label: "Allocated To", key: "userAllocated", fallback: "Unallocated" },
        { label: "Status", key: "status" },
        { label: "Condition", key: "condition" },
      ],
    },
    {
      id: "technical",
      label: "Softwares / Technical",
      fields: [
        { label: "CPU", key: "cpu" },
        { label: "RAM", key: "ram" },
        { label: "Operating System", key: "os" },
        { label: "Storage", key: "storage" },
        { label: "IP Address", key: "ipAddress" },
        { label: "Domain Name", key: "domainName" },
        { label: "Serial No.", key: "serialNo" },
        { label: "Other Specs", key: "otherSpecs" },
      ],
    },
    {
      id: "commercial",
      label: "Commercial & Warranty",
      fields: [
        { label: "Vendor Name", key: "vendorName" },
        { label: "Purchase Date", key: "purchaseDate" },
        { label: "Warranty Expiry", key: "warrantyExp" },
        { label: "Amount", key: "amount" },
        { label: "AMC Provider", key: "amcProvider" },
      ],
    },
    {
      id: "license",
      label: "License Details",
      fields: [
        { label: "No. of Licenses", key: "noOfLicenses" },
        { label: "License Expiry Date", key: "licenseExpDate" },
        { label: "License Key", key: "licenseKeyMasked", custom: "*************" },
      ],
    },
    {
      id: "remarks",
      label: "Master / Remarks",
      isTableData: true,
      fields: [
        { label: "SN", key: "sn" },
        { label: "Asset Id", key: "assetId" },
        { label: "Date Updated", key: "dateUpdated" },
        { label: "Updated By", key: "updatedBy" },
        { label: "Remarks", key: "remarks" },
      ],
    },
  ];

  const currentSection =
    sections.find((s) => s.id === activeSection) || sections[0];

  // Initialize form with asset values when asset changes or when entering edit mode
  useEffect(() => {
    setForm({ ...asset });
  }, [asset]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token) {
      alert("No auth token. Please login again.");
      return;
    }

    if (!updateRemark.trim()) {
      alert("Please enter update remark (required).");
      return;
    }

    try {
      const payload = {
        asset: {
          assetCode: form.assetCode,
          assetName: form.assetName,
          brand: form.brand,
          branch: form.branch,
          userAllocated:
            form.userAllocated === "Unallocated" ? null : form.userAllocated,
          status: form.status,
          assetCondition: form.condition,
          purchaseDate: form.purchaseDate || null,
          warrantyExp: form.warrantyExp || null,
        },
        technical: {
          cpu: form.cpu,
          ram: form.ram,
          storage: form.storage,
          os: form.os,
          ipAddress: form.ipAddress,
          domainName: form.domainName,
          serialNo: form.serialNo,
          otherSpecs: form.otherSpecs,
        },
        commercial: {
          vendorName: form.vendorName,
          amount: form.amount,
          amcVendor: form.amcProvider,
        },
        license: {
          noOfLicenses: form.noOfLicenses,
          licenseExp: form.licenseExpDate,  
        },
        updateRemark: updateRemark,
      };

      await api.put(`/api/assets/${asset.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Asset updated successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Error updating asset:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update asset."
      );
    }
  };

  return (
    <div className="split-page">
      {showLeft && (
        <div className="split-left">
          <div className="details-header">
            <button className="back-btn" onClick={onClose}>
              ← Back
            </button>
          <h1 style={{color:'white'}}>Asset Details</h1>
          </div>

          <div className="left-inner">
            <h2 className="asset-title">{asset.assetCode}</h2>
            <p className="asset-subtitle">{asset.assetName}</p>

            <h4 className="sidebar-title">Sections</h4>

            <ul className="sidebar-list">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
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

      <div className="split-right" style={!showLeft ? { width: "100%" } : {}}>
        <div
          className="details-header"
          style={{ justifyContent: "space-between" }}
        >
          <h3 className="section-title">
            {editMode ? `Edit: ${currentSection.label}` : currentSection.label}
          </h3>

          <div
            className="btn-control"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div className="control">
              {!showLeft && (
                <button className="back-btn" onClick={onClose}>
                  ← Back
                </button>
              )}

              <button
                className="back-btn"
                onClick={() => setShowLeft((x) => !x)}
              >
                {showLeft ? "☰" : "☰"}
              </button>
            </div>

            <div>
              {canManage && !editMode && (
                <button
                  className="btn-ad-edit"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              )}

              {canManage && editMode && (
                <button className="btn-ad-edit" onClick={handleSave}>
                  Save
                </button>
              )}

              {canManage && (
                <button
                  className="btn-admin"
                  onClick={() => onDelete?.(asset)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          {editMode && !currentSection.isTableData ? (
            // 🔹 EDIT FORM for non-remarks sections
            <div className="asset-edit-form">
              {currentSection.fields
                .filter((f) => !f.custom) // no masked license key
                .map((f) => (
                  <div key={f.key} className="form-group">
                    <label>{f.label}</label>
                    <input
                      name={f.key}
                      value={form[f.key] ?? ""}
                      onChange={handleFieldChange}
                    />
                  </div>
                ))}

              {/* Update remark (required for all edits) */}
              <div className="form-group">
                <label>Update Remark (required)</label>
                <textarea
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="back-btn"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    setEditMode(false);
                    setForm({ ...asset });
                    setUpdateRemark("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : currentSection.isTableData ? (
            // Remarks table (view-only)
            <table className="asset-horizontal-table">
              <thead>
                <tr>
                  {currentSection.fields.map((f) => (
                    <th key={f.label}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(asset.remarks || []).map((r, i) => (
                  <tr key={i}>
                    {currentSection.fields.map((f) => (
                      <td key={f.label}>{r[f.key] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Normal read-only table
            <table className="asset-horizontal-table">
              <thead>
                <tr>
                  {currentSection.fields.map((f) => (
                    <th key={f.label}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {currentSection.fields.map((f) => {
                    const value =
                      f.custom ||
                      asset[f.key] ||
                      (f.key === "userAllocated" ? f.fallback : "-");
                    return <td key={f.label}>{value}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssetDetail;
