// src/pages/AssetMaintenanceLogs.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Alert from '../components/common/Alert';
import * as XLSX from "xlsx";

/* ─── Google Fonts ─── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const NL_BLUE        = "#0B5CAB";
const NL_BLUE2       = "#1474F3";
const NL_RED         = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

/* ─── Styles (mirrors Branch.jsx) ─── */
const ML_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8; --blue-900:#1e3a8a;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
    --teal-50:#f0fdfa; --teal-200:#99f6e4; --teal-600:#0d9488; --teal-700:#0f766e;
    --purple-50:#faf5ff; --purple-200:#e9d5ff; --purple-600:#9333ea;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#ffffff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px;
    --nl-blue:${NL_BLUE}; --nl-blue-2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
  }

  @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes bounceIn {
    0%{opacity:0;transform:scale(0.94) translateY(10px)}
    60%{transform:scale(1.02) translateY(-3px)}
    100%{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

  /* ─── Layout ─── */
  .ml-root { font-family:'DM Sans',sans-serif; background:var(--gray-50); min-height:100vh; color:var(--gray-900); }

  /* ─── Page Header ─── */
  .ml-page-header {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:14px 20px; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex;
    align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  }
  .ml-page-header-left { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .ml-page-header-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .ml-content { max-width:1400px; margin:0 auto; padding:16px 12px 48px; }

  /* ─── Meta Chips Row ─── */
  .ml-meta-strip {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 20px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:57px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .ml-meta-chip {
    display:inline-flex; align-items:center; gap:5px; padding:4px 11px;
    border-radius:999px; font-size:11px; font-weight:700;
    font-family:'Outfit',sans-serif; border:1.5px solid;
  }

  /* ─── Buttons ─── */
  .ml-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .ml-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ml-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .ml-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .ml-btn-primary { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .ml-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .ml-btn-success { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .ml-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .ml-btn-amber { background:var(--amber-500); color:white; }
  .ml-btn-amber:hover:not(:disabled) { background:var(--amber-600); }
  .ml-btn-white { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .ml-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .ml-btn-teal { background:var(--teal-600); color:white; box-shadow:0 2px 8px rgba(13,148,136,0.25); }
  .ml-btn-teal:hover:not(:disabled) { background:var(--teal-700); }
  .ml-btn-red-outline { background:var(--red-50); border:1.5px solid var(--red-100); color:var(--red-600); }
  .ml-btn-red-outline:hover:not(:disabled) { background:var(--red-100); }
  .ml-btn-blue-outline { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .ml-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .ml-btn-ghost { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .ml-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .ml-btn-sm { padding:6px 12px; font-size:12px; }
  .ml-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }

  /* ─── Inputs ─── */
  .ml-input, .ml-select, .ml-textarea {
    width:100%; background:rgba(55,65,82,0.07); border:1.5px solid var(--gray-300);
    border-radius:var(--radius); padding:9px 13px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
  }
  .ml-input:focus, .ml-select:focus, .ml-textarea:focus {
    border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,0.1);
  }
  .ml-input::placeholder, .ml-textarea::placeholder { color:var(--gray-400); }
  .ml-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px;
  }
  .ml-textarea { resize:vertical; }
  .ml-label { font-size:11.5px; font-weight:600; color:var(--gray-600); margin-bottom:6px; display:block; }

  /* ─── Stat Cards ─── */
  .ml-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(145px,1fr)); gap:12px; margin-bottom:18px; }
  .ml-stat-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); padding:14px 16px; box-shadow:var(--shadow-sm); transition:all 0.18s ease; }
  .ml-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow); transform:translateY(-2px); }
  .ml-stat-value { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; color:var(--gray-900); line-height:1; }
  .ml-stat-label { font-size:11px; color:var(--gray-500); margin-top:4px; font-weight:500; }

  /* ─── Form Panel ─── */
  .ml-form-panel {
    background:white; border-radius:var(--radius-lg); overflow:hidden; margin-bottom:16px;
    border:1.5px solid; box-shadow:var(--shadow); animation:slideDown 0.3s ease both;
  }
  .ml-form-panel-add  { border-color:var(--green-200); }
  .ml-form-panel-edit { border-color:var(--amber-100); }
  .ml-form-panel-header {
    padding:14px 18px; border-bottom:1.5px solid; display:flex;
    align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;
  }
  .ml-form-panel-header-add  { background:var(--green-50);  border-color:var(--green-200); }
  .ml-form-panel-header-edit { background:var(--amber-50);  border-color:var(--amber-100); }
  .ml-form-panel-body { padding:18px; }
  .ml-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px; }
  .ml-col-full { grid-column:1/-1; }

  /* ─── Table ─── */
  .ml-table-card {
    background:white; border-radius:var(--radius); border:1.5px solid var(--gray-200);
    box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px;
  }
  .ml-table { width:100%; border-collapse:collapse; }
  .ml-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE};
    border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .ml-table thead th:nth-child(8)  { background:${NL_RED}; }
  .ml-table thead th:nth-child(9)  { background:${NL_RED}; }
  .ml-table thead th:nth-child(10) { background:${NL_RED}; }
  .ml-table th, .ml-table td { border-right:0.5px solid rgba(0,0,0,0.08); border-bottom:1px solid #e2e8f0; }
  .ml-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; cursor:pointer; }
  .ml-table tbody tr:last-child { border-bottom:none; }
  .ml-table tbody tr:hover { background:var(--blue-50); }
  .ml-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); }

  /* ─── Badges ─── */
  .ml-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .ml-badge-blue   { background:var(--blue-50);   color:var(--blue-700);   border:1px solid var(--blue-200); }
  .ml-badge-green  { background:var(--green-50);  color:var(--green-700);  border:1px solid var(--green-200); }
  .ml-badge-gray   { background:var(--gray-100);  color:var(--gray-600);   border:1px solid var(--gray-200); }
  .ml-badge-amber  { background:var(--amber-50);  color:var(--amber-600);  border:1px solid var(--amber-100); }
  .ml-badge-red    { background:var(--red-50);    color:var(--red-600);    border:1px solid var(--red-100); }
  .ml-badge-teal   { background:var(--teal-50);   color:var(--teal-700);   border:1px solid var(--teal-200); }
  .ml-badge-purple { background:var(--purple-50); color:var(--purple-600); border:1px solid var(--purple-200); }

  /* ─── Status Pill ─── */
  .ml-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; border:1.5px solid; }
  .ml-status::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .ml-status-open     { color:var(--blue-700);   border-color:var(--blue-200);   background:var(--blue-50); }
  .ml-status-progress { color:var(--amber-600);  border-color:var(--amber-100);  background:var(--amber-50); }
  .ml-status-closed   { color:var(--green-700);  border-color:var(--green-200);  background:var(--green-50); }
  .ml-status-cancelled{ color:var(--red-600);    border-color:var(--red-100);    background:var(--red-50); }

  /* ─── Preview Modal ─── */
  .ml-preview-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:16px; animation:fadeIn 0.2s ease;
  }
  .ml-preview-panel {
    width:100%; max-width:900px; max-height:90vh; background:white; border-radius:var(--radius-xl);
    overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .ml-preview-header { background:${NL_GRADIENT_90}; padding:22px 26px; flex-shrink:0; }
  .ml-preview-body { flex:1; overflow-y:auto; background:var(--gray-50); padding:24px 26px; }

  /* ─── Detail Section ─── */
  .ml-detail-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; box-shadow:var(--shadow-sm); }
  .ml-detail-card-header { padding:14px 18px; background:var(--gray-50); border-bottom:1.5px solid var(--gray-200); display:flex; align-items:center; gap:10px; }
  .ml-detail-card-body { padding:6px 18px 18px; }
  .ml-detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--gray-100); gap:12px; }
  .ml-detail-row:last-child { border-bottom:none; }
  .ml-detail-label { font-size:12px; font-weight:600; color:var(--gray-500); white-space:nowrap; }
  .ml-detail-value { font-size:13px; font-weight:600; color:var(--gray-900); text-align:right; max-width:65%; word-break:break-word; }

  /* ─── Section Divider ─── */
  .ml-field-divider {
    grid-column:1/-1; display:flex; align-items:center; gap:10px; margin-top:4px;
  }
  .ml-field-divider-line { height:1px; flex:1; background:linear-gradient(90deg,var(--blue-200),transparent); }
  .ml-field-divider-line.right { background:linear-gradient(270deg,var(--green-200),transparent); }
  .ml-field-divider-label {
    font-size:10px; font-weight:700; color:var(--gray-400);
    text-transform:uppercase; letter-spacing:0.1em; font-family:'Outfit',sans-serif; white-space:nowrap;
  }

  /* ─── Search wrapper ─── */
  .ml-search-wrap { position:relative; }
  .ml-search-wrap input { padding-right:38px; }
  .ml-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  /* ─── Empty State ─── */
  .ml-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }

  /* ─── Spinner ─── */
  .ml-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* ─── Mono ─── */
  .ml-mono { font-family:'Courier New',monospace; font-size:12px; background:var(--gray-50); border:1px solid var(--gray-200); border-radius:6px; padding:2px 8px; color:var(--gray-800); }

  /* Scrollbar */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }

  /* Warn banner */
  .ml-warn-banner {
    background:var(--red-50); border:1.5px solid var(--red-100); border-radius:10px;
    padding:12px 16px; display:flex; align-items:center; gap:10px; margin-bottom:14px;
  }

  @media(max-width:768px) {
    .ml-content { padding:10px 8px 32px; }
    .ml-table thead th, .ml-table tbody td { padding:10px 11px; font-size:12px; }
    .ml-form-grid { grid-template-columns:1fr; }
  }
`;

/* ─── Constants ─── */
const MAINTENANCE_TYPES = ["Repair","Preventive","Service","Replacement","Inspection"];
const STATUSES = ["Open","In Progress","Closed","Cancelled"];
const EMPTY_FORM = {
  maintenance_type:"Repair", issue_title:"", issue_details:"",
  action_taken:"", vendor_name:"", ticket_no:"",
  start_date:"", end_date:"", downtime_hours:"",
  cost:"", status:"Open", remarks:"",
};

/* ─── Helpers ─── */
const show = v => (v === null || v === undefined || v === "" ? "—" : String(v));
const toNumOrNull = v => { if (v === null || v === undefined || v === "") return null; const n = Number(String(v).trim()); return Number.isFinite(n) ? n : null; };

const exportXLSX = (aoa, filename = "maintenance.xlsx", sheetName = "Logs") => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

const getStatusClass = s => {
  const v = String(s||"").toLowerCase().replace(/\s+/g,"");
  if (v === "open")       return "ml-status ml-status-open";
  if (v === "inprogress") return "ml-status ml-status-progress";
  if (v === "closed")     return "ml-status ml-status-closed";
  if (v === "cancelled")  return "ml-status ml-status-cancelled";
  return "ml-status ml-status-open";
};

const getTypeBadge = t => {
  const map = {
    "Repair":      "ml-badge ml-badge-red",
    "Preventive":  "ml-badge ml-badge-blue",
    "Service":     "ml-badge ml-badge-green",
    "Replacement": "ml-badge ml-badge-purple",
    "Inspection":  "ml-badge ml-badge-amber",
  };
  return map[t] || "ml-badge ml-badge-gray";
};

/* ─── Atoms ─── */
const Spinner = ({ size = 28 }) => (
  <div className="ml-spinner" style={{ width:size, height:size }} />
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="ml-detail-card-header">
    <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,var(--blue-500),var(--green-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>{subtitle}</div>}
    </div>
  </div>
);

const FieldDivider = ({ label }) => (
  <div className="ml-field-divider">
    <div className="ml-field-divider-line" />
    <span className="ml-field-divider-label">{label}</span>
    <div className="ml-field-divider-line right" />
  </div>
);

/* ─── Main Component ─── */
export default function AssetMaintenanceLogs() {
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const canEdit   = isAdmin || isSubAdmin;
  const canDelete = isAdmin;
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = searchParams.get("branchId") || "";
  const section  = (searchParams.get("section") || "").toLowerCase();
  const assetId  = searchParams.get("assetId") || "";
  const subCat   = searchParams.get("subCat") || "";
  const currentUserName = user?.name || user?.email || "Unknown User";

  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);
  const [logs, setLogs]         = useState([]);
  const [q, setQ]               = useState("");
  const [saving, setSaving]     = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [editId, setEditId]     = useState(null);
  const [editValues, setEditValues] = useState({});
  const [detailRow, setDetailRow]   = useState(null);

  /* ─── Fetch ─── */
  const fetchLogs = useCallback(async () => {
    if (!token || !branchId || !section || !assetId) return;
    try {
      setLoading(true);
      const res = await api.get("/api/maintenance", {
        params:{ branchId, section, assetId },
        headers:{ Authorization:`Bearer ${token}` },
      });
      const data = res?.data?.data ?? res?.data ?? [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setAlert({ type:"error", title:"Error", message:`${err?.response?.status||"N/A"} - ${err?.response?.data?.message||err?.message||"Failed to fetch logs"}` });
    } finally { setLoading(false); }
  }, [token, branchId, section, assetId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!detailRow) return;
    const onKey = e => { if (e.key === "Escape") setDetailRow(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailRow]);

  /* ─── Filter ─── */
  const filtered = useMemo(() => {
    const s = (q||"").trim().toLowerCase();
    if (!s) return logs;
    return logs.filter(x =>
      [x.maintenance_type,x.issue_title,x.issue_details,x.action_taken,x.vendor_name,
       x.ticket_no,x.status,x.remarks,x.created_by,x.start_date,x.end_date,
       String(x.downtime_hours??""),String(x.cost??"")]
        .map(v => String(v??"").toLowerCase()).join(" ").includes(s)
    );
  }, [logs, q]);

  /* ─── Stats ─── */
  const stats = useMemo(() => ({
    total:     filtered.length,
    open:      filtered.filter(x => x.status === "Open").length,
    inProgress:filtered.filter(x => x.status === "In Progress").length,
    closed:    filtered.filter(x => x.status === "Closed").length,
    totalCost: filtered.reduce((a,x) => a + (Number(x.cost)||0), 0),
    totalDown: filtered.reduce((a,x) => a + (Number(x.downtime_hours)||0), 0),
  }), [filtered]);

  /* ─── CRUD ─── */
  const resetForm = () => setForm({ ...EMPTY_FORM });

  const handleAdd = async () => {
    if (!canEdit || !token) return;
    if (!branchId || !section || !assetId) { setAlert({ type:"error", title:"Missing", message:"branchId / section / assetId missing in URL." }); return; }
    try {
      setSaving(true);
      await api.post("/api/maintenance", {
        branchId:Number(branchId), section:String(section), assetId:Number(assetId),
        sub_category_code:subCat||null, maintenance_type:form.maintenance_type,
        issue_title:form.issue_title?.trim()||null, issue_details:form.issue_details?.trim()||null,
        action_taken:form.action_taken?.trim()||null, vendor_name:form.vendor_name?.trim()||null,
        ticket_no:form.ticket_no?.trim()||null, start_date:form.start_date||null,
        end_date:form.end_date||null, downtime_hours:toNumOrNull(form.downtime_hours),
        cost:toNumOrNull(form.cost), status:form.status, created_by:currentUserName,
        remarks:form.remarks?.trim()||null,
      }, { headers:{ Authorization:`Bearer ${token}` } });
      setAlert({ type:"success", title:"Saved", message:"Maintenance log added." });
      resetForm(); setShowAddForm(false); await fetchLogs();
    } catch (err) {
      setAlert({ type:"error", title:"Add Failed", message:`${err?.response?.status||""} ${err?.response?.data?.message||err?.message||"Add failed"}` });
    } finally { setSaving(false); }
  };

  const startEdit = row => { if (!canEdit) return; setEditId(row.id); setEditValues({ ...row }); setShowAddForm(false); window.scrollTo({ top:0, behavior:"smooth" }); };
  const cancelEdit = () => { setEditId(null); setEditValues({}); };

  const saveEdit = async () => {
    if (!canEdit || !token || !editId) return;
    try {
      setSaving(true);
      const payload = { ...editValues, downtime_hours:toNumOrNull(editValues.downtime_hours), cost:toNumOrNull(editValues.cost) };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      await api.put(`/api/maintenance/${editId}`, payload, { headers:{ Authorization:`Bearer ${token}` } });
      setAlert({ type:"success", title:"Updated", message:"Maintenance log updated." });
      cancelEdit(); await fetchLogs();
    } catch (err) {
      setAlert({ type:"error", title:"Update Failed", message:`${err?.response?.status||""} ${err?.response?.data?.message||err?.message||"Update failed"}` });
    } finally { setSaving(false); }
  };

  const deleteLog = async id => {
    if (!canDelete || !token || !window.confirm("Delete this maintenance record permanently?")) return;
    try {
      setSaving(true);
      await api.delete(`/api/maintenance/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setAlert({ type:"success", title:"Deleted", message:"Maintenance log deleted." });
      await fetchLogs();
    } catch (err) {
      setAlert({ type:"error", title:"Delete Failed", message:`${err?.response?.status||""} ${err?.response?.data?.message||err?.message||"Delete failed"}` });
    } finally { setSaving(false); }
  };

  const exportLogs = () => {
    const header = ["S.N.","BranchId","Section","AssetId","SubCat","Type","Issue","Action Taken","Vendor","Ticket No","Start","End","Downtime Hrs","Cost","Status","Created By","Remarks","Created At","Updated At"];
    const rows = filtered.map((x,i) => [i+1,x.branchId,x.section,x.assetId,x.sub_category_code,x.maintenance_type,x.issue_title,x.action_taken,x.vendor_name,x.ticket_no,x.start_date,x.end_date,x.downtime_hours??"",x.cost??"",x.status,x.created_by,x.remarks,x.created_at,x.updated_at]);
    exportXLSX([header,...rows], `maintenance_${section}_${assetId}.xlsx`, "Maintenance");
  };

  /* ─── Inline Form Fields ─── */
  const renderFormFields = (vals, setVals) => (
    <div className="ml-form-grid">
      <div>
        <label className="ml-label">🔧 Maintenance Type</label>
        <select className="ml-select" value={vals.maintenance_type||"Repair"} onChange={e => setVals(p => ({ ...p, maintenance_type:e.target.value }))}>
          {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="ml-label">🔄 Status</label>
        <select className="ml-select" value={vals.status||"Open"} onChange={e => setVals(p => ({ ...p, status:e.target.value }))}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="ml-label">🎫 Ticket No</label>
        <input className="ml-input" placeholder="e.g. IMS-2026-001" value={vals.ticket_no??""} onChange={e => setVals(p => ({ ...p, ticket_no:e.target.value }))} />
      </div>

      <div className="ml-col-full">
        <label className="ml-label">📝 Issue Title</label>
        <input className="ml-input" placeholder="Short descriptive title of the issue" value={vals.issue_title??""} onChange={e => setVals(p => ({ ...p, issue_title:e.target.value }))} />
      </div>

      <FieldDivider label="Dates & Vendor" />

      <div>
        <label className="ml-label">📅 Start Date</label>
        <input type="date" className="ml-input" value={vals.start_date??""} onChange={e => setVals(p => ({ ...p, start_date:e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">📅 End Date</label>
        <input type="date" className="ml-input" value={vals.end_date??""} onChange={e => setVals(p => ({ ...p, end_date:e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">🏭 Vendor / Technician</label>
        <input className="ml-input" placeholder="Vendor or technician name" value={vals.vendor_name??""} onChange={e => setVals(p => ({ ...p, vendor_name:e.target.value }))} />
      </div>

      <FieldDivider label="Cost & Downtime" />

      <div>
        <label className="ml-label">⏱ Downtime Hours</label>
        <input className="ml-input" placeholder="e.g. 2.5" value={vals.downtime_hours??""} onChange={e => setVals(p => ({ ...p, downtime_hours:e.target.value }))} />
      </div>
      <div>
        <label className="ml-label">💰 Cost (NPR)</label>
        <input className="ml-input" placeholder="e.g. 1500" value={vals.cost??""} onChange={e => setVals(p => ({ ...p, cost:e.target.value }))} />
      </div>

      <FieldDivider label="Description" />

      <div className="ml-col-full">
        <label className="ml-label">📋 Issue Details</label>
        <textarea className="ml-textarea" rows={3} placeholder="Describe the problem in detail…" value={vals.issue_details??""} onChange={e => setVals(p => ({ ...p, issue_details:e.target.value }))} />
      </div>
      <div className="ml-col-full">
        <label className="ml-label">✅ Action Taken</label>
        <textarea className="ml-textarea" rows={3} placeholder="What steps were taken to resolve the issue?" value={vals.action_taken??""} onChange={e => setVals(p => ({ ...p, action_taken:e.target.value }))} />
      </div>
      <div className="ml-col-full">
        <label className="ml-label">💬 Remarks</label>
        <textarea className="ml-textarea" rows={2} placeholder="Any additional notes or follow-up needed…" value={vals.remarks??""} onChange={e => setVals(p => ({ ...p, remarks:e.target.value }))} />
      </div>
    </div>
  );

  /* ─── Render ─── */
  return (
    <>
      <div className="ml-root">
        <style>{FONTS}{ML_STYLES}</style>

        {/* ─── Page Header ─── */}
        <div className="ml-page-header">
          <div className="ml-page-header-left">
            <button className="ml-btn ml-btn-white ml-btn-icon" onClick={() => navigate(-1)} title="Go Back">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <div style={{ width:1, height:20, background:"var(--gray-200)" }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>Maintenance Logs</div>
              <div style={{ fontSize:11, color:"var(--gray-400)" }}>Asset #{assetId} · {section}</div>
            </div>
          </div>
          <div className="ml-page-header-right">
            <button className="ml-btn ml-btn-teal ml-btn-sm" onClick={exportLogs}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              Export Excel
            </button>
            {canEdit && (
              <button className="ml-btn ml-btn-success ml-btn-sm" onClick={() => { setShowAddForm(f => !f); setEditId(null); }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                {showAddForm ? "Cancel" : "Add Log"}
              </button>
            )}
          </div>
        </div>

        {/* ─── Meta Strip ─── */}
        <div className="ml-meta-strip">
          {branchId && <span className="ml-meta-chip" style={{ background:"var(--blue-50)", color:"var(--blue-700)", borderColor:"var(--blue-200)" }}>🏢 Branch #{branchId}</span>}
          {section   && <span className="ml-meta-chip" style={{ background:"var(--green-50)", color:"var(--green-700)", borderColor:"var(--green-200)" }}>📂 {section}</span>}
          {assetId   && <span className="ml-meta-chip" style={{ background:"var(--purple-50)", color:"var(--purple-600)", borderColor:"var(--purple-200)" }}>🔑 Asset #{assetId}</span>}
          {subCat    && <span className="ml-meta-chip" style={{ background:"var(--amber-50)", color:"var(--amber-600)", borderColor:"var(--amber-100)" }}>🏷 {subCat}</span>}
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            <span className="ml-badge ml-badge-blue"  style={{ fontSize:11 }}>{filtered.length} Records</span>
            <span className="ml-badge ml-badge-green" style={{ fontSize:11 }}>₨ {stats.totalCost.toLocaleString()}</span>
            <span className="ml-badge ml-badge-amber" style={{ fontSize:11 }}>⏱ {stats.totalDown} hr</span>
          </div>
        </div>

        <div className="ml-content">

          {/* Alert */}
          {alert && (
            <div style={{ marginBottom:14 }}>
              <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}

          {/* Missing params warning */}
          {(!branchId || !section || !assetId) && (
            <div className="ml-warn-banner">
              <span style={{ fontSize:20 }}>⚠️</span>
              <div>
                <div style={{ fontWeight:700, color:"var(--red-600)", fontSize:13, fontFamily:"Outfit,sans-serif" }}>Missing URL parameters</div>
                <div style={{ fontSize:12, color:"var(--red-500)", marginTop:2 }}>branchId={show(branchId)} · section={show(section)} · assetId={show(assetId)}</div>
              </div>
            </div>
          )}

          {/* ─── Stat Cards ─── */}
          <div className="ml-stats-grid">
            {[
              { label:"Total Logs",    value:stats.total,                        color:"var(--gray-900)" },
              { label:"Open",          value:stats.open,                         color:"var(--blue-700)" },
              { label:"In Progress",   value:stats.inProgress,                   color:"var(--amber-600)" },
              { label:"Closed",        value:stats.closed,                       color:"var(--green-700)" },
              { label:"Total Cost ₨",  value:stats.totalCost.toLocaleString(),   color:"var(--purple-600)" },
              { label:"Downtime (hr)", value:stats.totalDown,                    color:"var(--red-600)" },
            ].map((s,i) => (
              <div className="ml-stat-card" key={i}>
                <div className="ml-stat-value" style={{ color:s.color }}>{s.value}</div>
                <div className="ml-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ─── Add Form ─── */}
          {canEdit && showAddForm && (
            <div className="ml-form-panel ml-form-panel-add">
              <div className="ml-form-panel-header ml-form-panel-header-add">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#16a34a,#22c55e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>➕</div>
                  <div>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--green-700)" }}>Add New Maintenance Log</div>
                    <div style={{ fontSize:11, color:"var(--green-600)", marginTop:1 }}>Fill in the details for this maintenance event</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="ml-btn ml-btn-success ml-btn-sm" onClick={handleAdd} disabled={saving}>
                    {saving ? <><Spinner size={13} /> Saving…</> : <>💾 Save Log</>}
                  </button>
                  <button className="ml-btn ml-btn-ghost ml-btn-sm" onClick={() => { resetForm(); setShowAddForm(false); }} disabled={saving}>Clear</button>
                </div>
              </div>
              <div className="ml-form-panel-body">{renderFormFields(form, setForm)}</div>
            </div>
          )}

          {/* ─── Edit Form ─── */}
          {canEdit && editId && (
            <div className="ml-form-panel ml-form-panel-edit">
              <div className="ml-form-panel-header ml-form-panel-header-edit">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#d97706,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✏️</div>
                  <div>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--amber-600)" }}>Editing Log #{editId}</div>
                    <div style={{ fontSize:11, color:"var(--amber-500)", marginTop:1 }}>Make changes and save</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="ml-btn ml-btn-success ml-btn-sm" onClick={saveEdit} disabled={saving}>
                    {saving ? <><Spinner size={13} /> Saving…</> : <>💾 Save Changes</>}
                  </button>
                  <button className="ml-btn ml-btn-ghost ml-btn-sm" onClick={cancelEdit} disabled={saving}>Cancel</button>
                </div>
              </div>
              <div className="ml-form-panel-body">{renderFormFields(editValues, setEditValues)}</div>
            </div>
          )}

          {/* ─── Table ─── */}
          <div className="ml-table-card">
            {/* Table Header */}
            <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1.5px solid var(--gray-100)", flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,var(--blue-600),var(--blue-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📜</div>
                <div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>Maintenance History</div>
                  <div style={{ fontSize:11, color:"var(--gray-400)" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div className="ml-search-wrap" style={{ minWidth:220, maxWidth:320, flex:1 }}>
                <input type="text" className="ml-input" placeholder="Search issue, vendor, ticket, status…" value={q} onChange={e => setQ(e.target.value)} />
                <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:14 }}>
                <Spinner size={40} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading maintenance logs…</p>
              </div>
            ) : filtered.length ? (
              <div style={{ overflowX:"auto" }}>
                <table className="ml-table">
                  <thead>
                    <tr>
                      {["#","Type","Status","Issue / Ticket","Dates","Vendor","Downtime","Cost","Created By","Actions"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x, idx) => (
                      <tr key={x.id} onClick={() => setDetailRow(x)}>
                        <td style={{ color:"var(--gray-400)", fontWeight:600, fontFamily:"Outfit,sans-serif", fontSize:12 }}>{idx+1}</td>
                        <td><span className={getTypeBadge(x.maintenance_type)}>{x.maintenance_type}</span></td>
                        <td><span className={getStatusClass(x.status)}>{x.status}</span></td>
                        <td style={{ maxWidth:220 }}>
                          <div style={{ fontWeight:700, color:"var(--gray-900)", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{show(x.issue_title)}</div>
                          {x.ticket_no && <span className="ml-badge ml-badge-gray" style={{ marginTop:3, fontSize:10 }}>🎫 {x.ticket_no}</span>}
                        </td>
                        <td style={{ minWidth:110 }}>
                          {x.start_date || x.end_date ? (
                            <div>
                              {x.start_date && <div style={{ fontSize:11, color:"var(--gray-600)", fontWeight:500 }}>▶ {x.start_date}</div>}
                              {x.end_date   && <div style={{ fontSize:11, color:"var(--gray-600)", fontWeight:500 }}>■ {x.end_date}</div>}
                            </div>
                          ) : <span style={{ color:"var(--gray-300)" }}>—</span>}
                        </td>
                        <td>
                          {x.vendor_name
                            ? <span style={{ fontSize:12, color:"var(--gray-700)", fontWeight:600, background:"var(--gray-50)", border:"1px solid var(--gray-200)", borderRadius:7, padding:"2px 8px" }}>{x.vendor_name}</span>
                            : <span style={{ color:"var(--gray-300)" }}>—</span>}
                        </td>
                        <td>
                          {x.downtime_hours !== null && x.downtime_hours !== undefined && x.downtime_hours !== ""
                            ? <span className="ml-badge ml-badge-amber">⏱ {x.downtime_hours} hr</span>
                            : <span style={{ color:"var(--gray-300)" }}>—</span>}
                        </td>
                        <td>
                          {x.cost !== null && x.cost !== undefined && x.cost !== ""
                            ? <span className="ml-badge ml-badge-purple">₨ {Number(x.cost).toLocaleString()}</span>
                            : <span style={{ color:"var(--gray-300)" }}>—</span>}
                        </td>
                        <td style={{ fontSize:11, color:"var(--gray-400)", whiteSpace:"nowrap" }}>{show(x.created_by)}</td>
                        <td>
                          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                            <button className="ml-btn ml-btn-primary ml-btn-sm" onClick={e => { e.stopPropagation(); setDetailRow(x); }}>View →</button>
                            {canEdit && (
                              <button className="ml-btn ml-btn-amber ml-btn-sm" onClick={e => { e.stopPropagation(); setEditId(null); setTimeout(() => startEdit(x), 10); }}>✏ Edit</button>
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
                <svg width="56" height="56" fill="none" stroke="var(--gray-200)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No maintenance logs found</p>
                <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>{q ? "Try clearing your search" : "Add the first maintenance record"}</p>
                {canEdit && !showAddForm && (
                  <button className="ml-btn ml-btn-success" onClick={() => setShowAddForm(true)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Add First Log
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── Detail Preview Modal ─── */}
          {detailRow && (
            <div className="ml-preview-overlay" onClick={e => { if (e.target === e.currentTarget) setDetailRow(null); }}>
              <div className="ml-preview-panel">
                <div className="ml-preview-header">
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.55)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8, fontFamily:"Outfit,sans-serif" }}>Maintenance Record</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"clamp(1rem,3vw,1.4rem)", color:"white", letterSpacing:"-0.02em", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis" }}>
                        {show(detailRow.issue_title)}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                        <span className={getTypeBadge(detailRow.maintenance_type)}>{detailRow.maintenance_type}</span>
                        <span className={getStatusClass(detailRow.status)} style={{ background:"rgba(255,255,255,0.12)", borderColor:"rgba(255,255,255,0.3)", color:"white" }}>{detailRow.status}</span>
                        {detailRow.ticket_no && (
                          <span style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.85)", borderRadius:7, padding:"3px 10px", fontSize:11, fontWeight:700 }}>🎫 {detailRow.ticket_no}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap", flexShrink:0 }}>
                      {canEdit && (
                        <button className="ml-btn ml-btn-sm" style={{ background:"rgba(245,158,11,0.25)", border:"1.5px solid rgba(245,158,11,0.4)", color:"#fcd34d" }}
                          onClick={() => { startEdit(detailRow); setDetailRow(null); }}>
                          ✏ Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="ml-btn ml-btn-sm" style={{ background:"rgba(239,68,68,0.2)", border:"1.5px solid rgba(239,68,68,0.3)", color:"#f87171" }}
                          onClick={() => { const id = detailRow.id; setDetailRow(null); deleteLog(id); }}>
                          🗑 Delete
                        </button>
                      )}
                      <button className="ml-btn ml-btn-sm" style={{ background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)" }} onClick={() => setDetailRow(null)}>
                        ✕ Close
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ml-preview-body">
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18 }}>
                    {/* Overview */}
                    <div className="ml-detail-card">
                      <SectionHeader icon="📌" title="Overview" subtitle="Asset & branch identifiers" />
                      <div className="ml-detail-card-body">
                        {[
                          ["Asset ID", <span className="ml-badge ml-badge-blue">#{show(detailRow.assetId)}</span>],
                          ["Branch",    show(detailRow.branchId)],
                          ["Section",   <span className="ml-badge ml-badge-green">{show(detailRow.section)}</span>],
                          ["Sub-Cat",   detailRow.sub_category_code ? show(detailRow.sub_category_code) : null],
                          ["Created By", show(detailRow.created_by)],
                          ["Created At", show(detailRow.created_at)],
                          ["Updated At", show(detailRow.updated_at)],
                        ].filter(([,v]) => v !== null).map(([label,value],i) => (
                          <div key={i} className="ml-detail-row">
                            <div className="ml-detail-label">{label}</div>
                            <div className="ml-detail-value">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline & Cost */}
                    <div className="ml-detail-card">
                      <SectionHeader icon="📅" title="Timeline & Cost" subtitle="Dates, vendor, downtime" />
                      <div className="ml-detail-card-body">
                        {[
                          ["Start Date", show(detailRow.start_date)],
                          ["End Date",   show(detailRow.end_date)],
                          ["Vendor",     show(detailRow.vendor_name)],
                          ["Downtime",   detailRow.downtime_hours !== null && detailRow.downtime_hours !== "" ? <span className="ml-badge ml-badge-amber">⏱ {detailRow.downtime_hours} hr</span> : "—"],
                          ["Cost",       detailRow.cost !== null && detailRow.cost !== "" ? <span className="ml-badge ml-badge-purple">₨ {Number(detailRow.cost).toLocaleString()}</span> : "—"],
                        ].map(([label,value],i) => (
                          <div key={i} className="ml-detail-row">
                            <div className="ml-detail-label">{label}</div>
                            <div className="ml-detail-value">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issue Details */}
                    <div className="ml-detail-card" style={{ gridColumn:"1/-1" }}>
                      <SectionHeader icon="🔍" title="Issue Details" />
                      <div className="ml-detail-card-body" style={{ padding:"14px 18px" }}>
                        {detailRow.issue_details
                          ? <p style={{ fontSize:13, color:"var(--gray-700)", lineHeight:1.65, margin:0, whiteSpace:"pre-wrap" }}>{detailRow.issue_details}</p>
                          : <p style={{ color:"var(--gray-400)", fontSize:13, fontStyle:"italic", margin:0 }}>No details provided.</p>}
                      </div>
                    </div>

                    {/* Action Taken */}
                    <div className="ml-detail-card" style={{ gridColumn:"1/-1" }}>
                      <SectionHeader icon="✅" title="Action Taken" />
                      <div className="ml-detail-card-body" style={{ padding:"14px 18px" }}>
                        {detailRow.action_taken
                          ? <p style={{ fontSize:13, color:"var(--gray-700)", lineHeight:1.65, margin:0, whiteSpace:"pre-wrap" }}>{detailRow.action_taken}</p>
                          : <p style={{ color:"var(--gray-400)", fontSize:13, fontStyle:"italic", margin:0 }}>No action recorded.</p>}
                      </div>
                    </div>

                    {/* Remarks */}
                    {detailRow.remarks && (
                      <div className="ml-detail-card" style={{ gridColumn:"1/-1" }}>
                        <SectionHeader icon="💬" title="Remarks" />
                        <div className="ml-detail-card-body" style={{ padding:"14px 18px" }}>
                          <p style={{ fontSize:13, color:"var(--gray-600)", lineHeight:1.65, margin:0, whiteSpace:"pre-wrap" }}>{detailRow.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop:14, textAlign:"center", fontSize:11, color:"var(--gray-400)" }}>
                    Press <kbd style={{ background:"var(--gray-100)", border:"1px solid var(--gray-200)", borderRadius:4, padding:"1px 5px", fontSize:10 }}>ESC</kbd> or click outside to close
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