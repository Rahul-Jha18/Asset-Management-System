// src/pages/AssetMaintenanceLogs.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Alert from "../components/common/Alert";
import * as XLSX from "xlsx";

/* ────────────────────────────────────────────────────────────
   Design tokens — plain corporate palette: white surfaces,
   blue for primary actions, green for save/success, slate text.
   No decorative gradients, no emoji, minimal line icons only.
──────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;

const ML_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --c-primary:#1D4ED8;      /* blue - primary actions          */
    --c-primary-dark:#1E3A8A;
    --c-primary-light:#EFF4FE;
    --c-success:#15803D;      /* green - save / positive actions */
    --c-success-dark:#14532D;
    --c-success-light:#F0FBF4;
    --c-danger:#B91C1C;
    --c-danger-light:#FDF0EF;
    --c-warn:#B45309;
    --c-warn-light:#FEF8EC;

    --ink-900:#101828; --ink-700:#344054; --ink-600:#475467;
    --ink-500:#667085; --ink-400:#98A2B3; --ink-200:#E4E7EC; --ink-100:#F2F4F7;
    --line:#D0D5DD; --line-light:#E4E7EC;
    --surface:#FFFFFF; --surface-muted:#F9FAFB;

    --radius-sm:6px; --radius:8px; --radius-lg:10px;
    --shadow-xs:0 1px 2px rgba(16,24,40,0.05);
    --shadow-sm:0 1px 3px rgba(16,24,40,0.08);
    --shadow-md:0 4px 10px rgba(16,24,40,0.08);
  }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }

  .ml-root { font-family:'Inter',system-ui,sans-serif; background:var(--surface-muted); min-height:100vh; color:var(--ink-900); }

  /* ── Page Header ── */
  .ml-page-header {
    background:var(--surface); border-bottom:1px solid var(--line-light);
    padding:14px 24px; position:sticky; top:0; z-index:30;
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  }
  .ml-page-header-left { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .ml-page-header-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .ml-content { max-width:1360px; margin:0 auto; padding:20px 20px 48px; }
  .ml-eyebrow { font-size:11px; font-weight:600; color:var(--ink-500); text-transform:uppercase; letter-spacing:0.06em; }
  .ml-title { font-size:16px; font-weight:700; color:var(--ink-900); }

  /* ── Meta strip ── */
  .ml-meta-strip {
    background:var(--surface); border-bottom:1px solid var(--line-light);
    padding:10px 24px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  }
  .ml-meta-chip {
    display:inline-flex; align-items:center; gap:6px; padding:4px 10px;
    border-radius:var(--radius-sm); font-size:12px; font-weight:600;
    background:var(--surface-muted); border:1px solid var(--line-light); color:var(--ink-700);
  }
  .ml-meta-chip .k { color:var(--ink-400); font-weight:500; }

  /* ── Buttons ── */
  .ml-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 14px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:1px solid transparent;
    cursor:pointer; transition:background 0.15s ease, border-color 0.15s ease; white-space:nowrap;
    line-height:1;
  }
  .ml-btn:disabled { opacity:0.55; cursor:not-allowed; }
  .ml-btn-primary { background:var(--c-primary); color:white; }
  .ml-btn-primary:hover:not(:disabled) { background:var(--c-primary-dark); }
  .ml-btn-success { background:var(--c-success); color:white; }
  .ml-btn-success:hover:not(:disabled) { background:var(--c-success-dark); }
  .ml-btn-white { background:var(--surface); border-color:var(--line); color:var(--ink-700); }
  .ml-btn-white:hover:not(:disabled) { border-color:var(--c-primary); color:var(--c-primary); background:var(--c-primary-light); }
  .ml-btn-outline-danger { background:var(--c-danger-light); border-color:#F3D2CF; color:var(--c-danger); }
  .ml-btn-outline-danger:hover:not(:disabled) { background:#FBDEDC; }
  .ml-btn-ghost { background:transparent; border-color:var(--line); color:var(--ink-600); }
  .ml-btn-ghost:hover:not(:disabled) { background:var(--ink-100); }
  .ml-btn-sm { padding:6px 11px; font-size:12.5px; }
  .ml-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }

  /* ── Inputs ── */
  .ml-input, .ml-select, .ml-textarea {
    width:100%; background:var(--surface); border:1px solid var(--line);
    border-radius:var(--radius); padding:9px 12px; color:var(--ink-900); font-size:13.5px;
    font-family:'Inter',sans-serif; outline:none; transition:border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .ml-input:focus, .ml-select:focus, .ml-textarea:focus {
    border-color:var(--c-primary); box-shadow:0 0 0 3px rgba(29,78,216,0.10);
  }
  .ml-input::placeholder, .ml-textarea::placeholder { color:var(--ink-400); }
  .ml-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23667085' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:32px;
  }
  .ml-textarea { resize:vertical; }
  .ml-label { font-size:12px; font-weight:600; color:var(--ink-600); margin-bottom:6px; display:block; }

  /* ── Stat cards ── */
  .ml-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; margin-bottom:18px; }
  .ml-stat-card { background:var(--surface); border-radius:var(--radius-lg); border:1px solid var(--line-light); padding:14px 16px; }
  .ml-stat-value { font-size:1.45rem; font-weight:700; color:var(--ink-900); line-height:1; }
  .ml-stat-label { font-size:11.5px; color:var(--ink-500); margin-top:5px; font-weight:600; text-transform:uppercase; letter-spacing:0.03em; }

  /* ── Form panel ── */
  .ml-form-panel { background:var(--surface); border-radius:var(--radius-lg); overflow:hidden; margin-bottom:16px; border:1px solid var(--line-light); box-shadow:var(--shadow-xs); animation:slideDown 0.2s ease both; }
  .ml-form-panel-header { padding:13px 18px; border-bottom:1px solid var(--line-light); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:var(--surface-muted); }
  .ml-form-panel-body { padding:18px; }
  .ml-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px; }
  .ml-col-full { grid-column:1/-1; }

  .ml-field-divider { grid-column:1/-1; display:flex; align-items:center; gap:10px; margin-top:2px; }
  .ml-field-divider-line { height:1px; flex:1; background:var(--line-light); }
  .ml-field-divider-label { font-size:10.5px; font-weight:700; color:var(--ink-400); text-transform:uppercase; letter-spacing:0.08em; white-space:nowrap; }

  /* ── Table ── */
  .ml-table-card { background:var(--surface); border-radius:var(--radius); border:1px solid var(--line-light); box-shadow:var(--shadow-xs); overflow:hidden; margin-bottom:20px; }
  .ml-table { width:100%; border-collapse:collapse; }
  .ml-table thead th {
    padding:11px 16px; text-align:left; font-size:11px; font-weight:700;
    color:#FFFFFF; text-transform:uppercase; letter-spacing:0.05em;
    white-space:nowrap; background:var(--c-primary-dark);
    border-right:1px solid rgba(255,255,255,0.12);
  }
  .ml-table th, .ml-table td { border-right:1px solid var(--line-light); border-bottom:1px solid var(--line-light); }
  .ml-table th:last-child, .ml-table td:last-child { border-right:none; }
  .ml-table tbody tr { transition:background 0.1s; cursor:pointer; }
  .ml-table tbody tr:last-child td { border-bottom:none; }
  .ml-table tbody tr:hover { background:var(--c-primary-light); }
  .ml-table tbody td { padding:12px 16px; font-size:13px; color:var(--ink-700); }

  /* ── Badges ── */
  .ml-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:5px; font-size:11px; font-weight:700; border:1px solid; }
  .ml-badge-blue   { background:var(--c-primary-light); color:var(--c-primary-dark); border-color:#C7D9F9; }
  .ml-badge-green  { background:var(--c-success-light); color:var(--c-success-dark); border-color:#C3E7CF; }
  .ml-badge-gray   { background:var(--ink-100); color:var(--ink-600); border-color:var(--line-light); }
  .ml-badge-amber  { background:var(--c-warn-light); color:var(--c-warn); border-color:#F5DFB3; }
  .ml-badge-red    { background:var(--c-danger-light); color:var(--c-danger); border-color:#F3D2CF; }
  .ml-badge-purple { background:#F5F3FF; color:#6D28D9; border-color:#DDD6FE; }

  /* ── Status pill ── */
  .ml-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid; }
  .ml-status::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .ml-status-open     { color:var(--c-primary-dark); border-color:#C7D9F9; background:var(--c-primary-light); }
  .ml-status-progress { color:var(--c-warn);  border-color:#F5DFB3; background:var(--c-warn-light); }
  .ml-status-closed   { color:var(--c-success-dark); border-color:#C3E7CF; background:var(--c-success-light); }
  .ml-status-cancelled{ color:var(--c-danger); border-color:#F3D2CF; background:var(--c-danger-light); }

  /* ── Preview modal ── */
  .ml-preview-overlay { position:fixed; inset:0; z-index:9999; background:rgba(16,24,40,0.55); display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.15s ease; }
  .ml-preview-panel { width:100%; max-width:900px; max-height:90vh; background:var(--surface); border-radius:var(--radius-lg); overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-md); border:1px solid var(--line-light); }
  .ml-preview-header { background:var(--c-primary-dark); padding:20px 24px; flex-shrink:0; }
  .ml-preview-body { flex:1; overflow-y:auto; background:var(--surface-muted); padding:22px 24px; }

  /* ── Detail card ── */
  .ml-detail-card { background:var(--surface); border-radius:var(--radius-lg); border:1px solid var(--line-light); overflow:hidden; }
  .ml-detail-card-header { padding:12px 16px; background:var(--surface-muted); border-bottom:1px solid var(--line-light); }
  .ml-detail-card-title { font-weight:700; font-size:13px; color:var(--ink-800,var(--ink-900)); }
  .ml-detail-card-sub { font-size:11px; color:var(--ink-400); margin-top:1px; }
  .ml-detail-card-body { padding:4px 16px 16px; }
  .ml-detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:9px 0; border-bottom:1px solid var(--line-light); gap:12px; }
  .ml-detail-row:last-child { border-bottom:none; }
  .ml-detail-label { font-size:12px; font-weight:600; color:var(--ink-500); white-space:nowrap; }
  .ml-detail-value { font-size:13px; font-weight:600; color:var(--ink-900); text-align:right; max-width:65%; word-break:break-word; }

  /* ── Search ── */
  .ml-search-wrap { position:relative; }
  .ml-search-wrap input { padding-right:36px; }
  .ml-search-wrap .icon { position:absolute; right:11px; top:50%; transform:translateY(-50%); color:var(--ink-400); pointer-events:none; }

  /* ── Empty state ── */
  .ml-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:56px 20px; gap:10px; text-align:center; }

  /* ── Spinner ── */
  .ml-spinner { border-radius:50%; border:2.5px solid var(--ink-200); border-top-color:var(--c-primary); animation:spin 0.7s linear infinite; }

  /* ── Warn banner ── */
  .ml-warn-banner { background:var(--c-warn-light); border:1px solid #F5DFB3; border-radius:var(--radius); padding:14px 16px; display:flex; align-items:flex-start; gap:12px; margin-bottom:16px; }

  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--line); border-radius:999px; }

  @media(max-width:768px) {
    .ml-content { padding:12px 10px 32px; }
    .ml-table thead th, .ml-table tbody td { padding:10px 11px; font-size:12px; }
    .ml-form-grid { grid-template-columns:1fr; }
  }
`;

/* ─── Constants ─── */
const MAINTENANCE_TYPES = ["Repair", "Preventive", "Service", "Replacement", "Inspection"];
const STATUSES = ["Open", "In Progress", "Closed", "Cancelled"];
const EMPTY_FORM = {
  maintenance_type: "Repair", issue_title: "", issue_details: "",
  action_taken: "", vendor_name: "", ticket_no: "",
  start_date: "", end_date: "", downtime_hours: "",
  cost: "", status: "Open", remarks: "",
};

/* ─── Helpers ─── */
const show = v => (v === null || v === undefined || v === "" ? "—" : String(v));
const toNumOrNull = v => { if (v === null || v === undefined || v === "") return null; const n = Number(String(v).trim()); return Number.isFinite(n) ? n : null; };

// Treats "", "undefined", "null", and whitespace-only values as absent —
// this is what previously caused false "missing parameter" states when a
// value slipped through as the literal string "undefined".
const cleanParam = v => {
  const s = (v ?? "").toString().trim();
  if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "";
  return s;
};

const exportXLSX = (aoa, filename = "maintenance.xlsx", sheetName = "Logs") => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

const getStatusClass = s => {
  const v = String(s || "").toLowerCase().replace(/\s+/g, "");
  if (v === "open") return "ml-status ml-status-open";
  if (v === "inprogress") return "ml-status ml-status-progress";
  if (v === "closed") return "ml-status ml-status-closed";
  if (v === "cancelled") return "ml-status ml-status-cancelled";
  return "ml-status ml-status-open";
};

const getTypeBadge = t => {
  const map = {
    "Repair": "ml-badge ml-badge-red",
    "Preventive": "ml-badge ml-badge-blue",
    "Service": "ml-badge ml-badge-green",
    "Replacement": "ml-badge ml-badge-purple",
    "Inspection": "ml-badge ml-badge-amber",
  };
  return map[t] || "ml-badge ml-badge-gray";
};

/* ─── Minimal line icons (no emoji) ─── */
const Icon = ({ d, size = 15, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  back: "M10 19l-7-7m0 0l7-7m-7 7h18",
  download: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  plus: "M12 4v16m8-8H4",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z",
  trash: "M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79a48.11 48.11 0 00-3.478-.397m-12.5 0a48.11 48.11 0 013.478-.397m0 0V4.31c0-1.136.847-2.1 1.98-2.193a48.417 48.417 0 013.08 0c1.132.093 1.98 1.057 1.98 2.193v.397m-7.04 0h7.04",
  close: "M6 18L18 6M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  view: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  alert: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  document: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M6.75 3H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h9a2.25 2.25 0 002.25-2.25V15M6.75 3v3.75c0 .414.336.75.75.75h6a.75.75 0 00.75-.75V3",
  wrench: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L1.5 3l1.5-1.5L7.5 4.5v1.409l4.29 4.29m1.745 1.437l1.745-1.437",
};

/* ─── Atoms ─── */
const Spinner = ({ size = 26 }) => <div className="ml-spinner" style={{ width: size, height: size }} />;

const SectionHeader = ({ title, subtitle }) => (
  <div className="ml-detail-card-header">
    <div className="ml-detail-card-title">{title}</div>
    {subtitle && <div className="ml-detail-card-sub">{subtitle}</div>}
  </div>
);

const FieldDivider = ({ label }) => (
  <div className="ml-field-divider">
    <span className="ml-field-divider-label">{label}</span>
    <div className="ml-field-divider-line" />
  </div>
);

/* ─── Main Component ─── */
export default function AssetMaintenanceLogs() {
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const canEdit = isAdmin || isSubAdmin;
  const canDelete = isAdmin;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Robust param parsing: strips stray "undefined"/"null" strings and whitespace
  // so a bad upstream link produces a clear message instead of a silent failure.
  const branchId = cleanParam(searchParams.get("branchId"));
  const section = cleanParam(searchParams.get("section")).toLowerCase();
  const assetId = cleanParam(searchParams.get("assetId"));
  const subCat = cleanParam(searchParams.get("subCat"));
  const currentUserName = user?.name || user?.email || "Unknown User";

  const missingParams = !branchId || !section || !assetId;

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [detailRow, setDetailRow] = useState(null);

  /* ─── Fetch ─── */
  const fetchLogs = useCallback(async () => {
    if (!token || missingParams) return;
    try {
      setLoading(true);
      const res = await api.get("/api/maintenance", {
        params: { branchId, section, assetId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data?.data ?? res?.data ?? [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setAlert({ type: "error", title: "Error", message: `${err?.response?.status || "N/A"} - ${err?.response?.data?.message || err?.message || "Failed to fetch logs"}` });
    } finally { setLoading(false); }
  }, [token, branchId, section, assetId, missingParams]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!detailRow) return;
    const onKey = e => { if (e.key === "Escape") setDetailRow(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailRow]);

  /* ─── Filter ─── */
  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return logs;
    return logs.filter(x =>
      [x.maintenance_type, x.issue_title, x.issue_details, x.action_taken, x.vendor_name,
        x.ticket_no, x.status, x.remarks, x.created_by, x.start_date, x.end_date,
        String(x.downtime_hours ?? ""), String(x.cost ?? "")]
        .map(v => String(v ?? "").toLowerCase()).join(" ").includes(s)
    );
  }, [logs, q]);

  /* ─── Stats ─── */
  const stats = useMemo(() => ({
    total: filtered.length,
    open: filtered.filter(x => x.status === "Open").length,
    inProgress: filtered.filter(x => x.status === "In Progress").length,
    closed: filtered.filter(x => x.status === "Closed").length,
    totalCost: filtered.reduce((a, x) => a + (Number(x.cost) || 0), 0),
    totalDown: filtered.reduce((a, x) => a + (Number(x.downtime_hours) || 0), 0),
  }), [filtered]);

  /* ─── CRUD ─── */
  const resetForm = () => setForm({ ...EMPTY_FORM });

  const handleAdd = async () => {
    if (!canEdit || !token) return;
    if (missingParams) { setAlert({ type: "error", title: "Missing information", message: "Branch, section, and asset must be specified before a log can be saved." }); return; }
    try {
      setSaving(true);
      await api.post("/api/maintenance", {
        branchId: Number(branchId), section: String(section), assetId: Number(assetId),
        sub_category_code: subCat || null, maintenance_type: form.maintenance_type,
        issue_title: form.issue_title?.trim() || null, issue_details: form.issue_details?.trim() || null,
        action_taken: form.action_taken?.trim() || null, vendor_name: form.vendor_name?.trim() || null,
        ticket_no: form.ticket_no?.trim() || null, start_date: form.start_date || null,
        end_date: form.end_date || null, downtime_hours: toNumOrNull(form.downtime_hours),
        cost: toNumOrNull(form.cost), status: form.status, created_by: currentUserName,
        remarks: form.remarks?.trim() || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: "success", title: "Saved", message: "Maintenance log added." });
      resetForm(); setShowAddForm(false); await fetchLogs();
    } catch (err) {
      setAlert({ type: "error", title: "Add failed", message: `${err?.response?.status || ""} ${err?.response?.data?.message || err?.message || "Add failed"}` });
    } finally { setSaving(false); }
  };

  const startEdit = row => { if (!canEdit) return; setEditId(row.id); setEditValues({ ...row }); setShowAddForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const cancelEdit = () => { setEditId(null); setEditValues({}); };

  const saveEdit = async () => {
    if (!canEdit || !token || !editId) return;
    try {
      setSaving(true);
      const payload = { ...editValues, downtime_hours: toNumOrNull(editValues.downtime_hours), cost: toNumOrNull(editValues.cost) };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      await api.put(`/api/maintenance/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: "success", title: "Updated", message: "Maintenance log updated." });
      cancelEdit(); await fetchLogs();
    } catch (err) {
      setAlert({ type: "error", title: "Update failed", message: `${err?.response?.status || ""} ${err?.response?.data?.message || err?.message || "Update failed"}` });
    } finally { setSaving(false); }
  };

  const deleteLog = async id => {
    if (!canDelete || !token || !window.confirm("Delete this maintenance record permanently?")) return;
    try {
      setSaving(true);
      await api.delete(`/api/maintenance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: "success", title: "Deleted", message: "Maintenance log deleted." });
      await fetchLogs();
    } catch (err) {
      setAlert({ type: "error", title: "Delete failed", message: `${err?.response?.status || ""} ${err?.response?.data?.message || err?.message || "Delete failed"}` });
    } finally { setSaving(false); }
  };

  const exportLogs = () => {
    const header = ["S.N.", "BranchId", "Section", "AssetId", "SubCat", "Type", "Issue", "Action Taken", "Vendor", "Ticket No", "Start", "End", "Downtime Hrs", "Cost", "Status", "Created By", "Remarks", "Created At", "Updated At"];
    const rows = filtered.map((x, i) => [i + 1, x.branchId, x.section, x.assetId, x.sub_category_code, x.maintenance_type, x.issue_title, x.action_taken, x.vendor_name, x.ticket_no, x.start_date, x.end_date, x.downtime_hours ?? "", x.cost ?? "", x.status, x.created_by, x.remarks, x.created_at, x.updated_at]);
    exportXLSX([header, ...rows], `maintenance_${section}_${assetId}.xlsx`, "Maintenance");
  };

  /* ─── Inline Form Fields ─── */
  const renderFormFields = (vals, setVals) => (
    <div className="ml-form-grid">
      <div>
        <label className="ml-label">Maintenance Type</label>
        <select className="ml-select" value={vals.maintenance_type || "Repair"} onChange={e => setVals(p => ({ ...p, maintenance_type: e.target.value }))}>
          {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="ml-label">Status</label>
        <select className="ml-select" value={vals.status || "Open"} onChange={e => setVals(p => ({ ...p, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="ml-label">Ticket No.</label>
        <input className="ml-input" placeholder="e.g. IMS-2026-001" value={vals.ticket_no ?? ""} onChange={e => setVals(p => ({ ...p, ticket_no: e.target.value }))} />
      </div>

      <div className="ml-col-full">
        <label className="ml-label">Issue Title</label>
        <input className="ml-input" placeholder="Short descriptive title of the issue" value={vals.issue_title ?? ""} onChange={e => setVals(p => ({ ...p, issue_title: e.target.value }))} />
      </div>

      <FieldDivider label="Dates & Vendor" />

      <div>
        <label className="ml-label">Start Date</label>
        <input type="date" className="ml-input" value={vals.start_date ?? ""} onChange={e => setVals(p => ({ ...p, start_date: e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">End Date</label>
        <input type="date" className="ml-input" value={vals.end_date ?? ""} onChange={e => setVals(p => ({ ...p, end_date: e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">Vendor / Technician</label>
        <input className="ml-input" placeholder="Vendor or technician name" value={vals.vendor_name ?? ""} onChange={e => setVals(p => ({ ...p, vendor_name: e.target.value }))} />
      </div>

      <FieldDivider label="Cost & Downtime" />

      <div>
        <label className="ml-label">Downtime (hours)</label>
        <input className="ml-input" placeholder="e.g. 2.5" value={vals.downtime_hours ?? ""} onChange={e => setVals(p => ({ ...p, downtime_hours: e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">Cost (NPR)</label>
        <input className="ml-input" placeholder="e.g. 1500" value={vals.cost ?? ""} onChange={e => setVals(p => ({ ...p, cost: e.target.value }))} />
      </div>

      <FieldDivider label="Description" />

      <div className="ml-col-full">
        <label className="ml-label">Issue Details</label>
        <textarea className="ml-textarea" rows={3} placeholder="Describe the problem in detail…" value={vals.issue_details ?? ""} onChange={e => setVals(p => ({ ...p, issue_details: e.target.value }))} />
      </div>
      <div className="ml-col-full">
        <label className="ml-label">Action Taken</label>
        <textarea className="ml-textarea" rows={3} placeholder="What steps were taken to resolve the issue?" value={vals.action_taken ?? ""} onChange={e => setVals(p => ({ ...p, action_taken: e.target.value }))} />
      </div>
      <div className="ml-col-full">
        <label className="ml-label">Remarks</label>
        <textarea className="ml-textarea" rows={2} placeholder="Any additional notes or follow-up needed…" value={vals.remarks ?? ""} onChange={e => setVals(p => ({ ...p, remarks: e.target.value }))} />
      </div>
    </div>
  );

  /* ─── Render ─── */
  return (
    <>
      <div className="ml-root">
        <style>{FONTS}{ML_STYLES}</style>

        {/* Page Header */}
        <div className="ml-page-header">
          <div className="ml-page-header-left">
            <button className="ml-btn ml-btn-white ml-btn-icon" onClick={() => navigate(-1)} title="Go back">
              <Icon d={ICONS.back} />
            </button>
            <div style={{ width: 1, height: 22, background: "var(--line-light)" }} />
            <div>
              <div className="ml-title">Maintenance Logs</div>
              <div className="ml-eyebrow">Asset #{assetId || "—"} · {section || "—"}</div>
            </div>
          </div>
          <div className="ml-page-header-right">
            <button className="ml-btn ml-btn-white ml-btn-sm" onClick={exportLogs} disabled={missingParams}>
              <Icon d={ICONS.download} size={13} /> Export Excel
            </button>
            {canEdit && (
              <button className="ml-btn ml-btn-success ml-btn-sm" onClick={() => { setShowAddForm(f => !f); setEditId(null); }} disabled={missingParams}>
                <Icon d={showAddForm ? ICONS.close : ICONS.plus} size={13} /> {showAddForm ? "Cancel" : "Add Log"}
              </button>
            )}
          </div>
        </div>

        {/* Meta Strip */}
        <div className="ml-meta-strip">
          {branchId && <span className="ml-meta-chip"><span className="k">Branch</span> #{branchId}</span>}
          {section && <span className="ml-meta-chip"><span className="k">Section</span> {section}</span>}
          {assetId && <span className="ml-meta-chip"><span className="k">Asset</span> #{assetId}</span>}
          {subCat && <span className="ml-meta-chip"><span className="k">Sub-Category</span> {subCat}</span>}
          {!missingParams && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <span className="ml-badge ml-badge-blue">{filtered.length} Records</span>
              <span className="ml-badge ml-badge-green">₨ {stats.totalCost.toLocaleString()}</span>
              <span className="ml-badge ml-badge-amber">{stats.totalDown} hr downtime</span>
            </div>
          )}
        </div>

        <div className="ml-content">

          {/* Alert */}
          {alert && (
            <div style={{ marginBottom: 14 }}>
              <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}

          {/* Missing params warning */}
          {missingParams && (
            <div className="ml-warn-banner">
              <span style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 2 }}><Icon d={ICONS.alert} size={18} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--c-warn)", fontSize: 13.5 }}>This link is missing required information</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-600)", marginTop: 4, lineHeight: 1.6 }}>
                  Branch, section, and asset must all be present to load maintenance history.
                  <br />
                  Branch: <strong>{branchId || "not provided"}</strong> · Section: <strong>{section || "not provided"}</strong> · Asset: <strong>{assetId || "not provided"}</strong>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="ml-btn ml-btn-white ml-btn-sm" onClick={() => navigate(-1)}>
                    <Icon d={ICONS.back} size={13} /> Go back
                  </button>
                  <Link to="/branch-assets-report" className="ml-btn ml-btn-primary ml-btn-sm" style={{ textDecoration: "none" }}>
                    Open Asset Master Report
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!missingParams && (
            <>
              {/* Stat Cards */}
              <div className="ml-stats-grid">
                {[
                  { label: "Total Logs", value: stats.total },
                  { label: "Open", value: stats.open },
                  { label: "In Progress", value: stats.inProgress },
                  { label: "Closed", value: stats.closed },
                  { label: "Total Cost (₨)", value: stats.totalCost.toLocaleString() },
                  { label: "Downtime (hr)", value: stats.totalDown },
                ].map((s, i) => (
                  <div className="ml-stat-card" key={i}>
                    <div className="ml-stat-value">{s.value}</div>
                    <div className="ml-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Add Form */}
              {canEdit && showAddForm && (
                <div className="ml-form-panel">
                  <div className="ml-form-panel-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink-900)" }}>Add New Maintenance Log</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 1 }}>Fill in the details for this maintenance event</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="ml-btn ml-btn-success ml-btn-sm" onClick={handleAdd} disabled={saving}>
                        {saving ? <><Spinner size={13} /> Saving…</> : <><Icon d={ICONS.save} size={13} /> Save Log</>}
                      </button>
                      <button className="ml-btn ml-btn-ghost ml-btn-sm" onClick={() => { resetForm(); setShowAddForm(false); }} disabled={saving}>Clear</button>
                    </div>
                  </div>
                  <div className="ml-form-panel-body">{renderFormFields(form, setForm)}</div>
                </div>
              )}

              {/* Edit Form */}
              {canEdit && editId && (
                <div className="ml-form-panel">
                  <div className="ml-form-panel-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink-900)" }}>Editing Log #{editId}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 1 }}>Make changes and save</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="ml-btn ml-btn-success ml-btn-sm" onClick={saveEdit} disabled={saving}>
                        {saving ? <><Spinner size={13} /> Saving…</> : <><Icon d={ICONS.save} size={13} /> Save Changes</>}
                      </button>
                      <button className="ml-btn ml-btn-ghost ml-btn-sm" onClick={cancelEdit} disabled={saving}>Cancel</button>
                    </div>
                  </div>
                  <div className="ml-form-panel-body">{renderFormFields(editValues, setEditValues)}</div>
                </div>
              )}

              {/* Table */}
              <div className="ml-table-card">
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line-light)", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink-900)" }}>Maintenance History</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="ml-search-wrap" style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
                    <input type="text" className="ml-input" placeholder="Search issue, vendor, ticket, status…" value={q} onChange={e => setQ(e.target.value)} />
                    <span className="icon"><Icon d={ICONS.search} size={15} /></span>
                  </div>
                </div>

                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 0", gap: 14 }}>
                    <Spinner size={36} /><p style={{ color: "var(--ink-500)", fontSize: 13.5, margin: 0 }}>Loading maintenance logs…</p>
                  </div>
                ) : filtered.length ? (
                  <div style={{ overflowX: "auto" }}>
                    <table className="ml-table">
                      <thead>
                        <tr>
                          {["#", "Type", "Status", "Issue / Ticket", "Dates", "Vendor", "Downtime", "Cost", "Created By", "Actions"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((x, idx) => (
                          <tr key={x.id} onClick={() => setDetailRow(x)}>
                            <td style={{ color: "var(--ink-400)", fontWeight: 600, fontSize: 12 }}>{idx + 1}</td>
                            <td><span className={getTypeBadge(x.maintenance_type)}>{x.maintenance_type}</span></td>
                            <td><span className={getStatusClass(x.status)}>{x.status}</span></td>
                            <td style={{ maxWidth: 220 }}>
                              <div style={{ fontWeight: 700, color: "var(--ink-900)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{show(x.issue_title)}</div>
                              {x.ticket_no && <span className="ml-badge ml-badge-gray" style={{ marginTop: 3, fontSize: 10 }}>{x.ticket_no}</span>}
                            </td>
                            <td style={{ minWidth: 110 }}>
                              {x.start_date || x.end_date ? (
                                <div>
                                  {x.start_date && <div style={{ fontSize: 11, color: "var(--ink-600)", fontWeight: 500 }}>Start {x.start_date}</div>}
                                  {x.end_date && <div style={{ fontSize: 11, color: "var(--ink-600)", fontWeight: 500 }}>End {x.end_date}</div>}
                                </div>
                              ) : <span style={{ color: "var(--ink-300,var(--ink-400))" }}>—</span>}
                            </td>
                            <td>
                              {x.vendor_name
                                ? <span style={{ fontSize: 12, color: "var(--ink-700)", fontWeight: 600, background: "var(--surface-muted)", border: "1px solid var(--line-light)", borderRadius: 6, padding: "2px 8px" }}>{x.vendor_name}</span>
                                : <span style={{ color: "var(--ink-400)" }}>—</span>}
                            </td>
                            <td>
                              {x.downtime_hours !== null && x.downtime_hours !== undefined && x.downtime_hours !== ""
                                ? <span className="ml-badge ml-badge-amber">{x.downtime_hours} hr</span>
                                : <span style={{ color: "var(--ink-400)" }}>—</span>}
                            </td>
                            <td>
                              {x.cost !== null && x.cost !== undefined && x.cost !== ""
                                ? <span className="ml-badge ml-badge-purple">₨ {Number(x.cost).toLocaleString()}</span>
                                : <span style={{ color: "var(--ink-400)" }}>—</span>}
                            </td>
                            <td style={{ fontSize: 11, color: "var(--ink-400)", whiteSpace: "nowrap" }}>{show(x.created_by)}</td>
                            <td>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                <button className="ml-btn ml-btn-primary ml-btn-sm" onClick={e => { e.stopPropagation(); setDetailRow(x); }}><Icon d={ICONS.view} size={13} /> View</button>
                                {canEdit && (
                                  <button className="ml-btn ml-btn-white ml-btn-sm" onClick={e => { e.stopPropagation(); setEditId(null); setTimeout(() => startEdit(x), 10); }}><Icon d={ICONS.edit} size={13} /> Edit</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="ml-empty">
                    <span style={{ color: "var(--ink-300,var(--ink-400))" }}><Icon d={ICONS.document} size={44} strokeWidth={1.3} /></span>
                    <p style={{ color: "var(--ink-700)", fontWeight: 700, fontSize: 15, margin: 0 }}>No maintenance logs found</p>
                    <p style={{ color: "var(--ink-400)", fontSize: 12, margin: 0 }}>{q ? "Try clearing your search" : "Add the first maintenance record"}</p>
                    {canEdit && !showAddForm && (
                      <button className="ml-btn ml-btn-success" onClick={() => setShowAddForm(true)}>
                        <Icon d={ICONS.plus} size={14} /> Add First Log
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Detail Preview Modal */}
          {detailRow && (
            <div className="ml-preview-overlay" onClick={e => { if (e.target === e.currentTarget) setDetailRow(null); }}>
              <div className="ml-preview-panel">
                <div className="ml-preview-header">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Maintenance Record</div>
                      <div style={{ fontWeight: 800, fontSize: "clamp(1rem,3vw,1.35rem)", color: "white", letterSpacing: "-0.01em", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {show(detailRow.issue_title)}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        <span className={getTypeBadge(detailRow.maintenance_type)}>{detailRow.maintenance_type}</span>
                        <span className={getStatusClass(detailRow.status)} style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.3)", color: "white" }}>{detailRow.status}</span>
                        {detailRow.ticket_no && (
                          <span style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{detailRow.ticket_no}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", flexShrink: 0 }}>
                      {canEdit && (
                        <button className="ml-btn ml-btn-sm" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
                          onClick={() => { startEdit(detailRow); setDetailRow(null); }}>
                          <Icon d={ICONS.edit} size={13} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="ml-btn ml-btn-sm" style={{ background: "rgba(239,68,68,0.22)", border: "1px solid rgba(239,68,68,0.35)", color: "#FEE2E2" }}
                          onClick={() => { const id = detailRow.id; setDetailRow(null); deleteLog(id); }}>
                          <Icon d={ICONS.trash} size={13} /> Delete
                        </button>
                      )}
                      <button className="ml-btn ml-btn-sm" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.9)" }} onClick={() => setDetailRow(null)}>
                        <Icon d={ICONS.close} size={13} /> Close
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ml-preview-body">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
                    {/* Overview */}
                    <div className="ml-detail-card">
                      <SectionHeader title="Overview" subtitle="Asset & branch identifiers" />
                      <div className="ml-detail-card-body">
                        {[
                          ["Asset ID", <span className="ml-badge ml-badge-blue">#{show(detailRow.assetId)}</span>],
                          ["Branch", show(detailRow.branchId)],
                          ["Section", <span className="ml-badge ml-badge-green">{show(detailRow.section)}</span>],
                          ["Sub-Category", detailRow.sub_category_code ? show(detailRow.sub_category_code) : null],
                          ["Created By", show(detailRow.created_by)],
                          ["Created At", show(detailRow.created_at)],
                          ["Updated At", show(detailRow.updated_at)],
                        ].filter(([, v]) => v !== null).map(([label, value], i) => (
                          <div key={i} className="ml-detail-row">
                            <div className="ml-detail-label">{label}</div>
                            <div className="ml-detail-value">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline & Cost */}
                    <div className="ml-detail-card">
                      <SectionHeader title="Timeline & Cost" subtitle="Dates, vendor, downtime" />
                      <div className="ml-detail-card-body">
                        {[
                          ["Start Date", show(detailRow.start_date)],
                          ["End Date", show(detailRow.end_date)],
                          ["Vendor", show(detailRow.vendor_name)],
                          ["Downtime", detailRow.downtime_hours !== null && detailRow.downtime_hours !== "" ? <span className="ml-badge ml-badge-amber">{detailRow.downtime_hours} hr</span> : "—"],
                          ["Cost", detailRow.cost !== null && detailRow.cost !== "" ? <span className="ml-badge ml-badge-purple">₨ {Number(detailRow.cost).toLocaleString()}</span> : "—"],
                        ].map(([label, value], i) => (
                          <div key={i} className="ml-detail-row">
                            <div className="ml-detail-label">{label}</div>
                            <div className="ml-detail-value">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issue Details */}
                    <div className="ml-detail-card" style={{ gridColumn: "1/-1" }}>
                      <SectionHeader title="Issue Details" />
                      <div className="ml-detail-card-body" style={{ padding: "14px 16px" }}>
                        {detailRow.issue_details
                          ? <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{detailRow.issue_details}</p>
                          : <p style={{ color: "var(--ink-400)", fontSize: 13, fontStyle: "italic", margin: 0 }}>No details provided.</p>}
                      </div>
                    </div>

                    {/* Action Taken */}
                    <div className="ml-detail-card" style={{ gridColumn: "1/-1" }}>
                      <SectionHeader title="Action Taken" />
                      <div className="ml-detail-card-body" style={{ padding: "14px 16px" }}>
                        {detailRow.action_taken
                          ? <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{detailRow.action_taken}</p>
                          : <p style={{ color: "var(--ink-400)", fontSize: 13, fontStyle: "italic", margin: 0 }}>No action recorded.</p>}
                      </div>
                    </div>

                    {/* Remarks */}
                    {detailRow.remarks && (
                      <div className="ml-detail-card" style={{ gridColumn: "1/-1" }}>
                        <SectionHeader title="Remarks" />
                        <div className="ml-detail-card-body" style={{ padding: "14px 16px" }}>
                          <p style={{ fontSize: 13, color: "var(--ink-600)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{detailRow.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--ink-400)" }}>
                    Press <kbd style={{ background: "var(--ink-100)", border: "1px solid var(--line-light)", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>ESC</kbd> or click outside to close
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}