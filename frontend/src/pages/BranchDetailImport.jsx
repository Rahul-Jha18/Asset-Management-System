// frontend/src/pages/BranchDetailImport.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Alert from "../components/common/Alert";
import Footer from "../components/Layout/Footer";
import * as XLSX from "xlsx";
import EXCEL_HEADERS from "../utils/excelHeaders";
import "../styles/Pages.css";

export default function BranchDetailImport() {
  const { id: branchId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [file, setFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [selectedSection, setSelectedSection] = useState("desktop");

  // Fetch branch details
  const fetchBranch = useCallback(async () => {
    if (!branchId || !token) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranch(res?.data?.data || res?.data);
    } catch (err) {
      setAlert({
        type: "error",
        message: `Failed to load branch: ${err?.response?.data?.message || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, token]);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(selectedFile.type)) {
        setAlert({ type: "error", message: "Please select a valid Excel file (.xls or .xlsx)" });
        return;
      }
      setFile(selectedFile);
      setAlert(null);
    }
  };

  // Handle download template
  const downloadTemplate = () => {
    const headers = EXCEL_HEADERS[selectedSection] || EXCEL_HEADERS.desktop;

    const exampleData = [[selectedSection, ...new Array(headers.length - 1).fill("")]];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");

    // Set column widths
    // set reasonable column widths based on number of headers
    ws["!cols"] = headers.map(() => ({ wch: 18 }));

    XLSX.writeFile(wb, `branch_${branchId}_import_template_${selectedSection}.xlsx`);
  };

  // Handle import
  const handleImport = async () => {
    if (!file) {
      setAlert({ type: "error", message: "Please select a file to import" });
      return;
    }

    if (!branchId) {
      setAlert({ type: "error", message: "Branch ID is not available" });
      return;
    }

    try {
      setImporting(true);
      setAlert(null);

      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });

      const allRows = [];
      let rowCounter = 1;

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

        json.forEach((excelRow) => {
          const section = String(excelRow.Section || excelRow.section || sheetName || "").trim().toLowerCase();

          // Force import into the current branch page
          const targetBranchId = Number(branchId);

          if (section && targetBranchId) {
            allRows.push({ rowNo: rowCounter++, section, branchId: targetBranchId, excelRow });
          }
        });
      });

      if (allRows.length === 0) {
        setAlert({ type: "error", title: "Import Failed", message: "No valid data found in Excel file for this branch." });
        setImporting(false);
        return;
      }

      const invalidRows = allRows.filter((row) => !sectionRouteMap[row.section]);
      if (invalidRows.length > 0) {
        const invalidSections = [...new Set(invalidRows.map((r) => r.section))].join(", ");
        setAlert({ type: "error", title: "Import Failed", message: `Invalid sections found: ${invalidSections}.` });
        setImporting(false);
        return;
      }

      const res = await api.post("/api/assets/import", { rows: allRows }, { headers: { Authorization: `Bearer ${token}` } });

      const result = res?.data?.data || res?.data || {};
      setImportResult({
        inserted: result.inserted || 0,
        updated: result.updated || 0,
        failed: result.failed || 0,
        total: (result.inserted || 0) + (result.updated || 0),
        errors: result.errors || [],
      });

      setAlert({
        type: result.failed > 0 ? "warning" : "success",
        message: `✓ Inserted: ${result.inserted || 0} | ✓ Updated: ${result.updated || 0} | ✗ Failed: ${result.failed || 0}`,
      });

      setFile(null);
      setTimeout(() => fetchBranch(), 1000);
    } catch (err) {
      console.error("ImportError:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to import assets";
      setAlert({ type: "error", message: msg });
    } finally {
      setImporting(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-rose-600">Unauthorized</h2>
        <p className="text-slate-600">Please sign in to import assets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <main className="assets-page">
          <div className="details-wrapper">
            <p className="p-6 text-slate-600">Loading branch details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!branch) {
    return (
      <>
        <main className="assets-page">
          <div className="details-wrapper">
            {alert && <Alert type={alert.type} message={alert.message} />}
            <p className="p-6 text-slate-600">Branch not found</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="assets-page">
        <div className="details-wrapper">
          {/* Back button */}
          <button
            onClick={() => navigate(`/branches/${branchId}`)}
            className="mb-6 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
          >
            ← Back to Branch
          </button>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Import Branch Assets</h1>
            <p className="text-slate-600 mt-2">
              Branch: <strong>{branch.name}</strong>
            </p>
          </div>

          {/* Alerts */}
          {alert && <Alert type={alert.type} message={alert.message} />}

          {/* Import Result */}
          {importResult && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-emerald-900 mb-4">Import Complete!</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <div className="text-emerald-600 text-2xl font-bold">{importResult.inserted}</div>
                  <div className="text-sm text-slate-600">Inserted</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-2xl font-bold">{importResult.updated}</div>
                  <div className="text-sm text-slate-600">Updated</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-red-600 text-2xl font-bold">{importResult.failed}</div>
                  <div className="text-sm text-slate-600">Failed</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Import Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Upload File</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  disabled={importing}
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer block"
                >
                  <div className="text-4xl text-slate-400 mb-2">📁</div>
                  <p className="text-slate-700 font-semibold">
                    {file ? file.name : "Click to select or drag Excel file here"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Supported formats: .xlsx, .xls</p>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  {Object.keys(EXCEL_HEADERS).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={downloadTemplate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                📥 Download Template
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? "Importing..." : "✓ Import File"}
              </button>
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setImportResult(null);
                  }}
                  disabled={importing}
                  className="px-6 py-3 bg-slate-400 text-white rounded-lg font-semibold hover:bg-slate-500 transition disabled:opacity-50"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-2">📋 Import Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Download the template and fill in your asset data</li>
                <li>✓ Ensure data is in the correct columns</li>
                <li>✓ Dates should be in YYYY-MM-DD format (e.g., 2023-07-10)</li>
                <li>✓ Required fields: Section, Asset ID, Sub-Cat Code</li>
                <li>✓ Asset IDs with matching records will be updated, new IDs will be inserted</li>
                <li>✓ Any changes will be tracked in the asset history</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
