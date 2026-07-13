import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Pagination from "../components/common/Pagination";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const EXCEL_COLUMNS = [
  { key: "employee_code", header: "Employee Code", width: 16 },
  { key: "full_name", header: "Full Name", width: 24 },
  { key: "email", header: "Email", width: 30 },
  { key: "department", header: "Department", width: 20 },
  { key: "phone", header: "Phone", width: 16 },
  { key: "branch", header: "Branch", width: 24 },
  { key: "status", header: "Status", width: 12 },
];

const EMPTY_FORM = {
  employee_code: "",
  full_name: "",
  email: "",
  department: "",
  phone: "",
  branch: "",
  status: "active",
};

const FIELD_ALIASES = {
  employee_code: [
    "employee code", "employee_code", "employeecode", "emp code", "emp_code",
    "empcode", "employee id", "employeeid", "emp id", "empid", "staff code",
  ],
  full_name: [
    "full name", "full_name", "fullname", "name", "employee name",
    "employee_name", "employeename", "staff name", "staffname",
  ],
  email: ["email", "email address", "emailaddress", "e-mail", "mail"],
  department: ["department", "department name", "departmentname", "dept"],
  phone: [
    "phone", "phone number", "phonenumber", "mobile", "mobile number",
    "mobilenumber", "contact", "contact number", "contactno",
  ],
  branch: ["branch", "branch name", "branchname", "office", "location"],
  status: ["status", "active status", "activestatus", "employee status"],
};

const CSS = `
  *{box-sizing:border-box}
  .emp-page{font-family:Arial,sans-serif;background:#f7f9fc;min-height:100%;color:#172033}
  .emp-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:20}
  .emp-title{font-weight:800;color:#0b5cab}
  .emp-actions,.emp-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .emp-btn{border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer}
  .emp-btn:disabled{opacity:.55;cursor:not-allowed}
  .emp-btn-primary{background:#0b5cab;color:#fff}
  .emp-btn-success{background:#15803d;color:#fff}
  .emp-btn-light{background:#fff;color:#334155;border:1px solid #cbd5e1}
  .emp-btn-danger{background:#fff1f2;color:#be123c;border:1px solid #fecdd3}
  .emp-btn-info{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
  .emp-content{padding:12px}
  .emp-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px}
  .emp-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;box-shadow:0 2px 8px rgba(15,23,42,.05)}
  .emp-card strong{font-size:24px;display:block;color:#0b5cab}
  .emp-filters{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px;margin-bottom:12px}
  .emp-input,.emp-select{border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;min-width:160px;background:#fff}
  .emp-search{min-width:260px;flex:1}
  .emp-alert{padding:10px 12px;border-radius:8px;margin-bottom:10px;font-weight:600}
  .emp-alert-success{background:#ecfdf5;color:#166534;border:1px solid #bbf7d0}
  .emp-alert-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
  .emp-table-wrap{overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px}
  .emp-table{width:100%;border-collapse:collapse;min-width:980px}
  .emp-table th{background:#0b5cab;color:#fff;text-align:left;padding:10px;font-size:12px;white-space:nowrap}
  .emp-table td{padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px}
  .emp-table tr:hover td{background:#f8fbff}
  .emp-code{font-weight:700;color:#1d4ed8}
  .emp-status{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800}
  .emp-active{background:#dcfce7;color:#166534}
  .emp-inactive{background:#e5e7eb;color:#475569}
  .emp-row-actions{display:flex;gap:6px}
  .emp-empty{text-align:center;padding:40px;color:#64748b}
  .emp-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.65);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999}
  .emp-modal{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.3)}
  .emp-modal-header,.emp-modal-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #e5e7eb}
  .emp-modal-footer{border-top:1px solid #e5e7eb;border-bottom:0;justify-content:flex-end}
  .emp-modal-body{padding:18px}
  .emp-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .emp-field label{display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#334155}
  .emp-field .emp-input,.emp-field .emp-select{width:100%}
  .emp-preview{max-height:330px;overflow:auto;border:1px solid #e2e8f0;border-radius:10px}
  .emp-preview table{width:100%;border-collapse:collapse;min-width:850px}
  .emp-preview th,.emp-preview td{padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:left}
  .emp-preview th{background:#eff6ff;color:#1e3a8a}
  @media(max-width:700px){.emp-form-grid{grid-template-columns:1fr}.emp-search{min-width:100%}}
`;

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const getExcelValue = (row, aliases) => {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.includes(normalizeHeader(key)) && String(value ?? "").trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const normalizeExcelRows = (rows) =>
  rows
    .map((row, index) => {
      const employeeCode = getExcelValue(row, FIELD_ALIASES.employee_code);
      const fullName = getExcelValue(row, FIELD_ALIASES.full_name);
      const email = getExcelValue(row, FIELD_ALIASES.email);

      if (!employeeCode && !fullName && !email) return null;

      const status = getExcelValue(row, FIELD_ALIASES.status).toLowerCase();

      return {
        employee_code: employeeCode || `AUTO-${String(index + 1).padStart(4, "0")}`,
        full_name: fullName || employeeCode || email,
        email,
        department: getExcelValue(row, FIELD_ALIASES.department),
        phone: getExcelValue(row, FIELD_ALIASES.phone),
        branch: getExcelValue(row, FIELD_ALIASES.branch),
        status: status === "inactive" ? "inactive" : "active",
      };
    })
    .filter(Boolean);

const createWorkbook = (rows, sheetName = "Employees") => {
  const output = rows.map((row) =>
    Object.fromEntries(EXCEL_COLUMNS.map((column) => [column.header, row[column.key] ?? ""]))
  );

  const worksheet = XLSX.utils.json_to_sheet(output, {
    header: EXCEL_COLUMNS.map((column) => column.header),
  });
  worksheet["!cols"] = EXCEL_COLUMNS.map((column) => ({ wch: column.width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
};

const downloadExcel = (rows, filename) => {
  const workbook = createWorkbook(rows);
  XLSX.writeFile(workbook, filename);
};

const makeIcon = (path) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const D = {
  branch:   "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:   "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  issue: "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  help:     "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  graph:    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  radar:    "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  scan:     "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
};

export default function Employee() {
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef(null);

  const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Issue Tracker", path: "/branch-issues",         icon: makeIcon(D.issue) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
  ].filter(i => i.show !== false);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.get("/api/employees", {
        params: { _t: Date.now() },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to load employees.",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const branchOptions = useMemo(
    () => [...new Set(rows.map((row) => row.branch).filter(Boolean))].sort(),
    [rows]
  );

  const departmentOptions = useMemo(
    () => [...new Set(rows.map((row) => row.department).filter(Boolean))].sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (branchFilter && row.branch !== branchFilter) return false;
      if (departmentFilter && row.department !== departmentFilter) return false;
      if (statusFilter && String(row.status).toLowerCase() !== statusFilter) return false;

      if (!keyword) return true;

      return [
        row.employee_code,
        row.full_name,
        row.email,
        row.department,
        row.phone,
        row.branch,
        row.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [rows, search, branchFilter, departmentFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, branchFilter, departmentFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize]
  );

  const activeCount = rows.filter(
    (row) => String(row.status).toLowerCase() === "active"
  ).length;

  const openCreate = () => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingEmployee(row);
    setForm({
      employee_code: row.employee_code || "",
      full_name: row.full_name || "",
      email: row.email || "",
      department: row.department || "",
      phone: row.phone || "",
      branch: row.branch || "",
      status: row.status || "active",
    });
    setModalOpen(true);
  };

  const closeEmployeeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
  };

  const saveEmployee = async () => {
    if (!form.employee_code.trim() || !form.full_name.trim()) {
      setAlert({ type: "error", message: "Employee Code and Full Name are required." });
      return;
    }

    const payload = {
      employee_code: form.employee_code.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      department: form.department.trim() || null,
      phone: form.phone.trim() || null,
      branch: form.branch.trim() || null,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingEmployee) {
        await api.put(`/api/employees/${editingEmployee.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/employees", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setAlert({
        type: "success",
        message: editingEmployee
          ? "Employee updated successfully."
          : "Employee created successfully.",
      });

      closeEmployeeModal();
      await fetchEmployees();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to save employee.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (employee) => {
    if (!window.confirm(`Delete ${employee.full_name || "this employee"}?`)) return;

    try {
      await api.delete(`/api/employees/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ type: "success", message: "Employee deleted successfully." });
      await fetchEmployees();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete employee.",
      });
    }
  };

  const handleExcelSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
      const normalized = normalizeExcelRows(parsed);

      if (!normalized.length) {
        throw new Error("No valid employee rows were found in the selected Excel file.");
      }

      setImportRows(normalized);
      setImportOpen(true);
      setAlert({
        type: "success",
        message: `${normalized.length} employee row(s) loaded from Excel.`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.message || "Failed to read the Excel file.",
      });
    }
  };

  const importEmployees = async () => {
    if (!importRows.length) return;

    try {
      setImporting(true);

      const response = await api.post(
        "/api/employees/import",
        { rows: importRows },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({
        type: "success",
        message: response?.data?.message || "Employee import completed.",
      });

      setImportOpen(false);
      setImportRows([]);
      await fetchEmployees();
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to import employees.",
      });
    } finally {
      setImporting(false);
    }
  };

  const exportAll = () => {
    if (!rows.length) {
      setAlert({ type: "error", message: "No employee records are available to export." });
      return;
    }

    downloadExcel(
      rows,
      `Nepal_Life_Employees_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportFiltered = () => {
    if (!filteredRows.length) {
      setAlert({ type: "error", message: "No filtered employee records are available." });
      return;
    }

    downloadExcel(
      filteredRows,
      `Nepal_Life_Employees_Filtered_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const downloadTemplate = () => {
    downloadExcel(
      [
        {
          employee_code: "E00126",
          full_name: "Example Employee",
          email: "example@nepallife.com.np",
          department: "IT",
          phone: "9800000000",
          branch: "Corporate Office",
          status: "active",
        },
      ],
      "employee_import_template.xlsx"
    );
  };

  if (!(isAdmin || isSubAdmin)) {
    return (
      <>
        <div className="emp-page emp-empty">
          <h2>Access Denied</h2>
          <p>You do not have permission to manage employees.</p>
          <button className="emp-btn emp-btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="emp-page">
          <style>{CSS}</style>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleExcelSelect}
          />

          <div className="emp-toolbar">
            <div className="emp-title">Employee Master</div>

            <div className="emp-actions">
              <button className="emp-btn emp-btn-light" onClick={fetchEmployees}>
                Refresh
              </button>
              <button className="emp-btn emp-btn-light" onClick={downloadTemplate}>
                Excel Template
              </button>
              <button className="emp-btn emp-btn-light" onClick={exportFiltered}>
                Export Filtered
              </button>
              <button className="emp-btn emp-btn-light" onClick={exportAll}>
                Export All
              </button>
              <button
                className="emp-btn emp-btn-success"
                onClick={() => fileInputRef.current?.click()}
              >
                Import Excel
              </button>
              <button className="emp-btn emp-btn-primary" onClick={openCreate}>
                Add Employee
              </button>
            </div>
          </div>

          <div className="emp-content">
            {alert.message && (
              <div
                className={`emp-alert ${
                  alert.type === "error" ? "emp-alert-error" : "emp-alert-success"
                }`}
              >
                {alert.message}
              </div>
            )}

            <div className="emp-summary">
              <div className="emp-card"><strong>{rows.length}</strong>Total Employees</div>
              <div className="emp-card"><strong>{activeCount}</strong>Active</div>
              <div className="emp-card"><strong>{rows.length - activeCount}</strong>Inactive</div>
              <div className="emp-card"><strong>{branchOptions.length}</strong>Branches</div>
              <div className="emp-card"><strong>{departmentOptions.length}</strong>Departments</div>
            </div>

            <div className="emp-filters">
              <input
                className="emp-input emp-search"
                placeholder="Search code, name, email, phone, department or branch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                className="emp-select"
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <option value="">All Branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>

              <select
                className="emp-select"
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value="">All Departments</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              <select
                className="emp-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                className="emp-select"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} rows</option>
                ))}
              </select>

              <button
                className="emp-btn emp-btn-light"
                onClick={() => {
                  setSearch("");
                  setBranchFilter("");
                  setDepartmentFilter("");
                  setStatusFilter("");
                }}
              >
                Clear
              </button>
            </div>

            <div className="emp-table-wrap">
              {loading ? (
                <div className="emp-empty">Loading employees...</div>
              ) : !filteredRows.length ? (
                <div className="emp-empty">No employees found.</div>
              ) : (
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Phone</th>
                      <th>Branch</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="emp-code">{row.employee_code || "—"}</td>
                        <td>{row.full_name || "—"}</td>
                        <td>{row.email || "—"}</td>
                        <td>{row.department || "—"}</td>
                        <td>{row.phone || "—"}</td>
                        <td>{row.branch || "—"}</td>
                        <td>
                          <span
                            className={`emp-status ${
                              String(row.status).toLowerCase() === "active"
                                ? "emp-active"
                                : "emp-inactive"
                            }`}
                          >
                            {String(row.status).toLowerCase() === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="emp-row-actions">
                            <button
                              className="emp-btn emp-btn-info"
                              onClick={() => openEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              className="emp-btn emp-btn-danger"
                              onClick={() => deleteEmployee(row)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {filteredRows.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => setPageSize(Number(size))}
                totalItems={filteredRows.length}
              />
            )}
          </div>

          {modalOpen && (
            <div
              className="emp-modal-backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget) closeEmployeeModal();
              }}
            >
              <div className="emp-modal">
                <div className="emp-modal-header">
                  <strong>{editingEmployee ? "Edit Employee" : "Add Employee"}</strong>
                  <button className="emp-btn emp-btn-light" onClick={closeEmployeeModal}>Close</button>
                </div>

                <div className="emp-modal-body">
                  <div className="emp-form-grid">
                    {[
                      ["Employee Code *", "employee_code", "E00126"],
                      ["Full Name *", "full_name", "Employee name"],
                      ["Email", "email", "name@nepallife.com.np"],
                      ["Department", "department", "IT"],
                      ["Phone", "phone", "9800000000"],
                      ["Branch", "branch", "Corporate Office"],
                    ].map(([label, key, placeholder]) => (
                      <div className="emp-field" key={key}>
                        <label>{label}</label>
                        <input
                          className="emp-input"
                          placeholder={placeholder}
                          value={form[key]}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}

                    <div className="emp-field">
                      <label>Status</label>
                      <select
                        className="emp-select"
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="emp-modal-footer">
                  <button className="emp-btn emp-btn-light" onClick={closeEmployeeModal}>
                    Cancel
                  </button>
                  <button
                    className="emp-btn emp-btn-primary"
                    disabled={saving}
                    onClick={saveEmployee}
                  >
                    {saving
                      ? "Saving..."
                      : editingEmployee
                        ? "Update Employee"
                        : "Create Employee"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {importOpen && (
            <div
              className="emp-modal-backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget && !importing) {
                  setImportOpen(false);
                }
              }}
            >
              <div className="emp-modal">
                <div className="emp-modal-header">
                  <strong>Import Employees ({importRows.length})</strong>
                  <button
                    className="emp-btn emp-btn-light"
                    disabled={importing}
                    onClick={() => setImportOpen(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="emp-modal-body">
                  <p>
                    Existing records are updated by the backend import rules.
                    The frontend sends only Employee Code, Full Name, Email,
                    Department, Phone, Branch and Status.
                  </p>

                  <div className="emp-preview">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          {EXCEL_COLUMNS.map((column) => (
                            <th key={column.key}>{column.header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 10).map((row, index) => (
                          <tr key={`${row.employee_code}-${index}`}>
                            <td>{index + 1}</td>
                            {EXCEL_COLUMNS.map((column) => (
                              <td key={column.key}>{row[column.key] || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="emp-modal-footer">
                  <button
                    className="emp-btn emp-btn-light"
                    disabled={importing}
                    onClick={() => setImportOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="emp-btn emp-btn-success"
                    disabled={importing || !importRows.length}
                    onClick={importEmployees}
                  >
                    {importing ? "Importing..." : `Import ${importRows.length} Employees`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SplitSidebarLayout>
      <Footer />
    </>
  );
}
