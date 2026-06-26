import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Pagination from "../components/common/Pagination";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import * as XLSX from "xlsx";
import NepalLifeLogo from "../assets/nepallife.png";

/* ── Brand ──────────────────────────────────────────────────── */
const NL_BLUE = "#0B5CAB";
const NL_BLUE2 = "#1474F3";
const NL_RED = "#f31225ef";
const NL_GRADIENT = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const PAGE_STYLES = `
  *, *::before, *::after { box-sizing:border-box; }
  :root {
    --nl-blue:${NL_BLUE}; --nl-blue2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
    --violet-50:#f5f3ff; --violet-100:#ede9fe; --violet-200:#ddd6fe;
    --violet-600:#7c3aed; --violet-700:#6d28d9;
    --rose-50:#fff1f2; --rose-100:#ffe4e6; --rose-200:#fecdd3;
    --rose-600:#e11d48; --rose-700:#be123c;
    --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd;
    --sky-600:#0284c7; --sky-700:#0369a1;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#ffffff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px;
  }

  @keyframes floaty   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.55} }
  @keyframes bounceIn {
    0%{opacity:0;transform:scale(0.94) translateY(10px)}
    60%{transform:scale(1.02) translateY(-3px)}
    100%{opacity:1;transform:scale(1) translateY(0)}
  }

  .em-root   { font-family:'DM Sans',sans-serif; background:var(--gray-50); max-height:90vh; color:var(--gray-900); }
  .em-layout { display:flex; max-height:100vh; }

  .em-main   { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .em-topbar {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .em-topbar-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .em-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .em-content      { flex:1; padding:0 4px; overflow-y:auto; }

  .em-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .em-toggle-pill {
    display:inline-flex; align-items:center; gap:6px; padding:6px 14px;
    border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .em-toggle-pill:hover { border-color:var(--blue-200); color:var(--blue-700); background:var(--blue-50); }
  .em-toggle-pill.active { background:${NL_GRADIENT}; color:white; border-color:transparent; box-shadow:0 2px 10px rgba(11,92,171,0.3); }
  .em-toggle-pill .pill-badge { position:absolute; top:-6px; right:-6px; width:16px; height:16px; border-radius:50%; background:var(--red-500); color:white; font-size:9px; font-weight:900; display:flex; align-items:center; justify-content:center; font-family:'Outfit',sans-serif; border:2px solid white; }

  .em-collapsible-panel { overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease; max-height:0; opacity:0; }
  .em-collapsible-panel.open { max-height:750px; opacity:1; }

  .em-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .em-filter-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2); color:var(--blue-700); font-family:'Outfit',sans-serif; }
  .em-filter-chip button { width:14px; height:14px; border-radius:50%; border:none; background:rgba(11,92,171,0.15); color:var(--blue-700); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; padding:0; transition:background 0.15s; }
  .em-filter-chip button:hover { background:var(--red-500); color:white; }
  .em-clear-all { font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer; background:none; border:none; padding:2px 6px; border-radius:6px; font-family:'Outfit',sans-serif; }
  .em-clear-all:hover { background:var(--red-50); }

  .em-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:var(--radius); font-weight:600; font-size:13px; border:none; cursor:pointer; transition:all 0.18s ease; white-space:nowrap; font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1; }
  .em-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .em-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .em-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .em-btn-primary       { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .em-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .em-btn-success       { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .em-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .em-btn-white         { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .em-btn-white:hover:not(:disabled)   { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .em-btn-blue-outline  { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .em-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .em-btn-sky-outline   { background:var(--sky-50);  border:1.5px solid var(--sky-200);  color:var(--sky-700); }
  .em-btn-sky-outline:hover:not(:disabled)  { background:var(--sky-100); }
  .em-btn-rose-outline  { background:var(--rose-50); border:1.5px solid var(--rose-200); color:var(--rose-600); }
  .em-btn-rose-outline:hover:not(:disabled) { background:var(--rose-100); }
  .em-btn-amber-outline { background:var(--amber-50); border:1.5px solid var(--amber-100); color:var(--amber-600); }
  .em-btn-amber-outline:hover:not(:disabled) { background:var(--amber-100); }
  .em-btn-sm   { padding:6px 12px; font-size:12px; }
  .em-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }

  .em-input, .em-select {
    width:100%; background:#ffffff; border:1.5px solid #cbd5e1;
    border-radius:var(--radius); padding:10px 14px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
    box-shadow:0 1px 3px rgba(0,0,0,0.05);
  }
  .em-input:hover, .em-select:hover { border-color:#94a3b8; }
  .em-input:focus, .em-select:focus { border-color:${NL_BLUE}; box-shadow:0 0 0 3px rgba(11,92,171,0.12); }
  .em-input::placeholder { color:#94a3b8; font-style:italic; }
  .em-select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230B5CAB' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px; }
  .em-label { font-size:11.5px; font-weight:700; color:#374151; margin-bottom:7px; display:flex; align-items:center; gap:5px; text-transform:uppercase; letter-spacing:0.05em; font-family:'Outfit',sans-serif; }

  .em-filter-card  { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .em-filter-card1 { background:white; border-radius:10px; padding:20px 16px; box-shadow:var(--shadow); }

  .em-hero-wrap {
    border:1px solid rgba(11,92,171,0.12); border-radius:18px; padding:0 7px 7px 7px;
    background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);
    box-shadow:0 18px 60px rgba(2,32,53,0.14); overflow:hidden; position:relative;
  }
  .em-hero-wrap::before {
    content:''; position:absolute; inset:-2px;
    background:radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),
               radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),
               radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .em-hero-inner   { position:relative; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
  .em-hero-logo    { width:82px; max-width:28vw; height:auto; display:block; filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22)); animation:floaty 4.5s ease-in-out infinite; }
  .em-hero-title   { font-family:Syne,sans-serif; font-weight:900; font-size:clamp(1.1rem,2vw,1.45rem); letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1; }
  .em-hero-title .blue { color:var(--nl-blue); }
  .em-hero-title .red  { color:var(--nl-red); }
  .em-hero-divider { width:46px; height:3px; border-radius:999px; background:linear-gradient(90deg,var(--nl-blue),var(--nl-red)); margin-top:8px; }
  .em-hero-sub     { margin-top:6px; font-size:11.5px; color:rgba(15,23,42,0.62); line-height:1.6; max-width:680px; }

  .em-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
  .em-stat-card  {
    background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200);
    padding:18px; box-shadow:var(--shadow-sm); transition:all 0.18s ease;
    cursor:pointer; position:relative; overflow:hidden;
  }
  .em-stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--stat-bar,var(--gray-200)); border-radius:0 0 4px 4px; }
  .em-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow-md); transform:translateY(-3px); }
  .em-stat-card.active-filter { border-color:var(--nl-blue); box-shadow:0 0 0 3px rgba(11,92,171,0.12),var(--shadow-md); transform:translateY(-3px); }
  .em-stat-icon  { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:12px; }
  .em-stat-value { font-family:'Outfit',sans-serif; font-size:1.7rem; font-weight:900; color:var(--gray-900); line-height:1; }
  .em-stat-label { font-size:11px; color:var(--gray-500); margin-top:5px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; font-family:'Outfit',sans-serif; }

  .em-table-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px; }
  .em-table      { width:100%; border-collapse:collapse; }
  .em-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE}; border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .em-table thead th:nth-child(8) { background:${NL_RED}; }
  .em-table thead th:nth-child(9) { background:${NL_RED}; }
  .em-table th, .em-table td { border-right:0.5px solid rgba(0,0,0,0.06); border-bottom:1px solid #e2e8f0; }
  .em-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; }
  .em-table tbody tr:last-child { border-bottom:none; }
  .em-table tbody tr:hover { background:var(--blue-50); }
  .em-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); vertical-align:middle; }

  .em-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .em-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; opacity:0.7; }
  .em-badge-blue   { background:var(--blue-50);   color:var(--blue-700);   border:1px solid var(--blue-200); }
  .em-badge-green  { background:var(--green-50);  color:var(--green-700);  border:1px solid var(--green-200); }
  .em-badge-gray   { background:var(--gray-100);  color:var(--gray-600);   border:1px solid var(--gray-200); }
  .em-badge-amber  { background:var(--amber-50);  color:var(--amber-600);  border:1px solid var(--amber-100); }

  .em-status { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:800; font-family:'Outfit',sans-serif; }
  .em-status-active { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
  .em-status-inactive { background:#f3f4f6; color:#4b5563; border:1px solid #e5e7eb; }

  .em-alert { border-radius:var(--radius); padding:12px 16px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:10px; border:1.5px solid; margin:8px 0; }
  .em-alert-error   { background:var(--red-50);   border-color:var(--red-100);   color:var(--red-600); }
  .em-alert-success { background:var(--green-50); border-color:var(--green-200); color:var(--green-700); }

  .em-modal-overlay { position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.65); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease; }
  .em-modal-panel   { width:100%; max-width:760px; background:white; border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-lg); animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; border:1.5px solid var(--gray-200); }
  .em-modal-header  { padding:22px 26px; }
  .em-modal-body    { padding:20px 26px; display:flex; flex-direction:column; gap:16px; max-height:70vh; overflow-y:auto; }
  .em-modal-footer  { padding:16px 26px 24px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--gray-100); }

  .em-form-block { border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; background:white; box-shadow:var(--shadow-sm); }
  .em-form-block-header { padding:11px 16px; display:flex; align-items:center; gap:10px; border-bottom:1.5px solid var(--gray-100); }
  .em-form-block-body   { padding:16px; display:flex; flex-direction:column; gap:14px; }
  .em-form-grid-2       { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }

  .em-search-wrap { position:relative; }
  .em-search-wrap input { padding-right:38px; }
  .em-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  .em-empty   { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }
  .em-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* Export dropdown */
  .em-dropdown-wrap { position:relative; display:inline-flex; }
  .em-dropdown-menu {
    position:absolute; top:calc(100% + 6px); right:0; z-index:200;
    background:white; border:1.5px solid var(--gray-200); border-radius:var(--radius-lg);
    box-shadow:var(--shadow-lg); min-width:190px; overflow:hidden;
    animation:fadeUp 0.15s ease both;
  }
  .em-dropdown-item {
    display:flex; align-items:center; gap:10px; padding:10px 14px;
    font-size:13px; font-weight:600; font-family:'Outfit',sans-serif;
    color:var(--gray-700); cursor:pointer; border:none; background:none; width:100%; text-align:left;
    transition:background 0.12s;
  }
  .em-dropdown-item:hover { background:var(--blue-50); color:var(--blue-700); }
  .em-dropdown-item .dd-icon { font-size:15px; }
  .em-dropdown-divider { height:1px; background:var(--gray-100); margin:4px 0; }

  /* Import preview table */
  .im-preview-table { width:100%; border-collapse:collapse; }
  .im-preview-table thead th { padding:9px 12px; text-align:left; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; background:#eff6ff; color:#1e3a8a; border-bottom:1px solid #bfdbfe; }
  .im-preview-table tbody td { padding:9px 12px; font-size:12.5px; border-bottom:1px solid #f1f5f9; color:var(--gray-700); }
  .im-preview-table tbody tr:last-child td { border-bottom:none; }
  .im-preview-table tbody tr:hover td { background:#f8fafc; }

  /* Import summary cards */
  .im-summary { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:4px; }
  .im-summary-card { flex:1; min-width:90px; padding:12px; border-radius:10px; text-align:center; border:1.5px solid; }
  .im-summary-card .val { font-family:'Outfit',sans-serif; font-weight:900; font-size:1.4rem; }
  .im-summary-card .lbl { font-size:10px; font-weight:700; font-family:'Outfit',sans-serif; margin-top:2px; text-transform:uppercase; letter-spacing:.05em; opacity:.75; }
  .im-summary-card.total  { background:var(--blue-50);   border-color:var(--blue-200);  color:var(--blue-700); }
  .im-summary-card.ok     { background:var(--green-50);  border-color:var(--green-200); color:var(--green-700); }
  .im-summary-card.warn   { background:var(--amber-50);  border-color:var(--amber-100); color:var(--amber-600); }
  .im-summary-card.err    { background:var(--red-50);    border-color:var(--red-100);   color:var(--red-600); }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }

  @media(max-width:640px) {
    .em-topbar { padding:8px 10px; }
    .em-content { padding:1px; }
    .em-table thead th, .em-table tbody td { padding:10px 12px; font-size:12px; }
    .em-hero-inner { flex-direction:column; text-align:center; }
    .em-hero-divider { margin-left:auto; margin-right:auto; }
    .em-modal-body, .em-modal-header, .em-modal-footer { padding-left:16px; padding-right:16px; }
    .em-stats-grid { grid-template-columns:1fr 1fr; }
  }
`;

/* ── Constants ── */
const EXCEL_COLUMNS = [
  { key: "employee_code", header: "Employee Code", width: 16 },
  { key: "full_name",     header: "Full Name",     width: 24 },
  { key: "email",         header: "Email",         width: 28 },
  { key: "department",    header: "Department",    width: 18 },
  { key: "designation",   header: "Designation",   width: 20 },
  { key: "phone",         header: "Phone",         width: 16 },
  { key: "branch",        header: "Branch",        width: 18 },
  { key: "status",        header: "Status",        width: 12 },
];

const defaultForm = {
  employee_code: "", full_name: "", email: "",
  department: "", designation: "", phone: "", branch: "", status: "active",
};

/* ── normalizeRows: fuzzy, case-insensitive Excel column matching ──
   Handles any column name your Excel file might use.
   Rows only require at least one of: employee_code OR full_name.
   employee_code is auto-generated as "AUTO-{index}" when missing.
── */
const FIELD_ALIASES = {
  employee_code: [
    "employee_code","employeecode","emp_code","empcode",
    "employee code","emp code","code","staff code","staffcode",
    "id","emp id","empid","employee id","employeeid","staff id",
  ],
  full_name: [
    "full_name","fullname","full name","name","employee name",
    "employeename","staff name","staffname","employee_name",
    "emp name","empname",
  ],
  email: [
    "email","email address","emailaddress","e-mail","e mail",
    "mail","email id","emailid",
  ],
  department: [
    "department","dept","dept.","department name","departmentname",
  ],
  designation: [
    "designation","position","post","job title","jobtitle",
    "title","role","job role",
  ],
  phone: [
    "phone","phone number","phonenumber","mobile","mobile number",
    "mobilenumber","contact","contact no","contact number",
    "contactno","cell","telephone","tel",
  ],
  branch: [
    "branch","branch name","branchname","office","location",
    "branch office",
  ],
  status: ["status","active status","activestatus","emp status"],
};

const fuzzyMatch = (rowKey, aliasList) => {
  const k = String(rowKey).toLowerCase().trim().replace(/\s+/g, " ");
  return aliasList.some((alias) => alias === k);
};

const getValueFuzzy = (row, aliasList) => {
  for (const rowKey of Object.keys(row)) {
    if (fuzzyMatch(rowKey, aliasList)) {
      const v = row[rowKey];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
  }
  return "";
};

const normalizeRows = (rows) => {
  return rows
    .map((row, idx) => {
      const status = getValueFuzzy(row, FIELD_ALIASES.status).toLowerCase();
      const empCode = getValueFuzzy(row, FIELD_ALIASES.employee_code);
      const fullName = getValueFuzzy(row, FIELD_ALIASES.full_name);

      // Skip completely blank rows
      if (!empCode && !fullName) return null;

      return {
        // Auto-generate code if missing so the row is never rejected
        employee_code: empCode || `AUTO-${String(idx + 1).padStart(4, "0")}`,
        full_name:     fullName || empCode,   // fall back to code as name if truly blank
        email:         getValueFuzzy(row, FIELD_ALIASES.email),
        department:    getValueFuzzy(row, FIELD_ALIASES.department),
        designation:   getValueFuzzy(row, FIELD_ALIASES.designation),
        phone:         getValueFuzzy(row, FIELD_ALIASES.phone),
        branch:        getValueFuzzy(row, FIELD_ALIASES.branch),
        status:        status === "inactive" ? "inactive" : "active",
      };
    })
    .filter(Boolean);
};

/* ── Excel export helper ── */
const buildWorkbook = (data, sheetName = "Employees") => {
  const headerRow = EXCEL_COLUMNS.map((c) => c.header);
  const dataRows  = data.map((r) => EXCEL_COLUMNS.map((c) => r[c.key] ?? ""));

  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  // Column widths
  ws["!cols"] = EXCEL_COLUMNS.map((c) => ({ wch: c.width }));

  // Header row style (row 0)
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "0B5CAB" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "medium", color: { rgb: "FFFFFF" } },
        right:  { style: "thin",   color: { rgb: "FFFFFF" } },
      },
    };
  }

  // Data rows alternating fill + borders
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddr]) ws[cellAddr] = { v: "", t: "s" };
      ws[cellAddr].s = {
        fill: { fgColor: { rgb: R % 2 === 0 ? "EFF6FF" : "FFFFFF" } },
        alignment: { vertical: "center" },
        border: {
          top:    { style: "thin", color: { rgb: "E2E8F0" } },
          bottom: { style: "thin", color: { rgb: "E2E8F0" } },
          left:   { style: "thin", color: { rgb: "E2E8F0" } },
          right:  { style: "thin", color: { rgb: "E2E8F0" } },
        },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
};

/* ── Misc helpers ── */
const AVATAR_COLORS = ["#2563eb","#16a34a","#7c3aed","#e11d48","#d97706","#0284c7","#0f766e","#9333ea","#db2777"];
const avatarColor  = (name) => AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];

const Spinner = ({ size = 28 }) => (
  <div className="em-spinner" style={{ width: size, height: size }} />
);

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  return (
    <span className={`em-status ${s === "active" ? "em-status-active" : "em-status-inactive"}`}>
      {s === "active" ? "✔ Active" : "⏸ Inactive"}
    </span>
  );
};

const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
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

/* ── Hero ── */
function EmployeeHero({ total, activeCount, inactiveCount, branchCount, deptCount }) {
  return (
    <div className="em-hero-wrap">
      <div className="em-hero-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(11,92,171,0.10)", border:"1px solid rgba(11,92,171,0.20)", color:"rgba(11,92,171,0.90)", borderRadius:999, padding:"5px 12px", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:NL_BLUE2, boxShadow:"0 0 8px rgba(20,116,243,0.65)", animation:"pulse 2s ease infinite" }} />
            Nepal Life · Employee Management
          </div>
          <h2 className="em-hero-title">
            <span className="blue">NEPAL</span><span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.65)", fontWeight:800 }}>Employee Master</span>
          </h2>
          <div className="em-hero-divider" />
          <p className="em-hero-sub">Manage employees, import/export Excel records, maintain department and branch information, and support frontend employee filters from one unified dashboard.</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:12 }}>
            {[
              { label:`${total} Total`,       bg:"rgba(11,92,171,0.10)", color:NL_BLUE,                   border:"rgba(11,92,171,0.2)" },
              { label:`${activeCount} Active`, bg:"rgba(22,163,74,0.08)", color:"var(--green-700)",         border:"var(--green-200)" },
              { label:`${inactiveCount} Inactive`, bg:"rgba(107,114,128,0.10)", color:"var(--gray-700)",   border:"var(--gray-200)" },
              { label:`${branchCount} Branches`,   bg:"rgba(245,158,11,0.08)", color:"var(--amber-600)",   border:"var(--amber-100)" },
              { label:`${deptCount} Departments`,  bg:"rgba(124,58,237,0.08)", color:"var(--violet-700)",  border:"var(--violet-200)" },
            ].map((s) => (
              <span key={s.label} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:999, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:11, fontWeight:700, fontFamily:"Outfit,sans-serif" }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="em-hero-logo" />
      </div>
    </div>
  );
}

/* ── Export Dropdown ── */
function ExportDropdown({ onExportAll, onExportFiltered, filteredCount, totalCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="em-dropdown-wrap" ref={ref}>
      <button
        className="em-btn em-btn-amber-outline em-btn-sm"
        onClick={() => setOpen((v) => !v)}
        style={{ position:"relative" }}
      >
        📥 Export ▾
      </button>
      {open && (
        <div className="em-dropdown-menu">
          <button className="em-dropdown-item" onClick={() => { onExportAll(); setOpen(false); }}>
            <span className="dd-icon">📊</span>
            <div>
              <div style={{ fontWeight:700 }}>Export All</div>
              <div style={{ fontSize:11, opacity:.65 }}>{totalCount} employees</div>
            </div>
          </button>
          <button className="em-dropdown-item" onClick={() => { onExportFiltered(); setOpen(false); }}>
            <span className="dd-icon">🔍</span>
            <div>
              <div style={{ fontWeight:700 }}>Export Filtered</div>
              <div style={{ fontSize:11, opacity:.65 }}>{filteredCount} employees</div>
            </div>
          </button>
          <div className="em-dropdown-divider" />
          <button className="em-dropdown-item" onClick={() => { onExportAll(true); setOpen(false); }}>
            <span className="dd-icon">📋</span>
            <div>
              <div style={{ fontWeight:700 }}>Download Sample</div>
              <div style={{ fontSize:11, opacity:.65 }}>Import template</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Employee() {
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState({ type: "", message: "" });

  const [q,                setQ]                = useState("");
  const [branchFilter,     setBranchFilter]     = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter,     setStatusFilter]     = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  const [showPanel, setShowPanel] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(defaultForm);
  const [saving,    setSaving]    = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importRows,      setImportRows]      = useState([]);
  const [importResult,    setImportResult]    = useState(null); // {inserted, updated, failed, errors}
  const [importing,       setImporting]       = useState(false);
  const fileInputRef = useRef(null);

  /* ── fetch ── */
  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setAlert({ type: "", message: "" });
      const res = await api.get("/api/employees", {
        params: { _t: Date.now() },
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      setRows(res?.data?.data || []);
    } catch (e) {
      setAlert({ type: "error", message: e?.response?.data?.message || "Failed to fetch employees" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  /* ── derived ── */
  const branchOptions     = useMemo(() => [...new Set(rows.map((r) => r.branch).filter(Boolean))].sort(), [rows]);
  const departmentOptions = useMemo(() => [...new Set(rows.map((r) => r.department).filter(Boolean))].sort(), [rows]);

  const filteredRows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (branchFilter     && row.branch     !== branchFilter)     return false;
      if (departmentFilter && row.department !== departmentFilter) return false;
      if (statusFilter     && String(row.status).toLowerCase() !== statusFilter) return false;
      if (!s) return true;
      return [row.employee_code, row.full_name, row.email, row.department, row.designation, row.phone, row.branch, row.status]
        .filter(Boolean).join(" ").toLowerCase().includes(s);
    });
  }, [rows, q, branchFilter, departmentFilter, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [q, branchFilter, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows  = useMemo(() => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredRows, currentPage, pageSize]);

  const totalEmployees   = rows.length;
  const activeCount      = rows.filter((r) => String(r.status).toLowerCase() === "active").length;
  const inactiveCount    = rows.filter((r) => String(r.status).toLowerCase() !== "active").length;
  const branchCount      = branchOptions.length;
  const deptCount        = departmentOptions.length;
  const activeFiltersCount = [q, branchFilter, departmentFilter, statusFilter].filter(Boolean).length;

  const clearFilters = () => { setQ(""); setBranchFilter(""); setDepartmentFilter(""); setStatusFilter(""); setCurrentPage(1); };
  const togglePanel  = (p) => setShowPanel((prev) => (prev === p ? "" : p));

  /* ── modal helpers ── */
  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({ employee_code: row.employee_code||"", full_name: row.full_name||"", email: row.email||"",
              department: row.department||"", designation: row.designation||"", phone: row.phone||"",
              branch: row.branch||"", status: row.status||"active" });
    setModalOpen(true);
  };
  const closeModal = () => { setEditing(null); setForm(defaultForm); setModalOpen(false); };

  /* ── CRUD ── */
  const saveEmployee = async () => {
    if (!token) return;
    if (!form.employee_code.trim() || !form.full_name.trim()) {
      setAlert({ type: "error", message: "Employee Code and Full Name are required" });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        employee_code: form.employee_code.trim(), full_name: form.full_name.trim(),
        email: form.email.trim() || null, department: form.department.trim() || null,
        designation: form.designation.trim() || null, phone: form.phone.trim() || null,
        branch: form.branch.trim() || null, status: form.status || "active",
      };
      if (editing) {
        await api.put(`/api/employees/${editing.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setAlert({ type: "success", message: "Employee updated successfully" });
      } else {
        await api.post("/api/employees", payload, { headers: { Authorization: `Bearer ${token}` } });
        setAlert({ type: "success", message: "Employee created successfully" });
      }
      closeModal();
      fetchEmployees();
    } catch (e) {
      setAlert({ type: "error", message: e?.response?.data?.message || "Failed to save employee" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!token || !window.confirm("Delete this employee? This cannot be undone.")) return;
    try {
      await api.delete(`/api/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: "success", message: "Employee deleted successfully" });
      fetchEmployees();
    } catch (e) {
      setAlert({ type: "error", message: e?.response?.data?.message || "Failed to delete employee" });
    }
  };

  /* ── EXCEL IMPORT ── */
  const [detectedCols, setDetectedCols] = useState([]);

  const handleExcelSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb     = XLSX.read(buffer, { type: "array" });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      // raw:false → dates/numbers come as display strings; defval:"" → no undefined cells
      const parsed = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });

      if (parsed.length === 0) {
        setAlert({ type: "error", message: "The Excel file appears to be empty or has no data rows." });
        return;
      }

      const cols = Object.keys(parsed[0]);
      setDetectedCols(cols);

      const normalized = normalizeRows(parsed);

      if (normalized.length === 0) {
        setAlert({
          type: "error",
          message: `No valid rows found. Detected columns in your file: [${cols.join(", ")}]. Please check headers.`,
        });
        return;
      }

      setImportRows(normalized);
      setImportResult(null);
      setImportModalOpen(true);
      setAlert({ type: "success", message: `${normalized.length} row(s) parsed from "${file.name}"` });
    } catch (err) {
      console.error("Excel parse error:", err);
      setAlert({ type: "error", message: "Failed to parse Excel file. Make sure it is a valid .xlsx or .xls file." });
    } finally {
      e.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!token || importRows.length === 0) return;
    try {
      setImporting(true);
      const res        = await api.post("/api/employees/import", { rows: importRows }, {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      const d = res?.data?.data;
      setImportResult(d);
      setAlert({
        type: d?.failed > 0 ? "error" : "success",
        message: res?.data?.message || "Import completed",
      });
      if (d?.failed === 0) {
        setImportRows([]);
        setTimeout(() => setImportModalOpen(false), 1800);
      }
      setCurrentPage(1);
      await fetchEmployees();
    } catch (e) {
      setAlert({ type: "error", message: e?.response?.data?.message || "Failed to import employees" });
    } finally {
      setImporting(false);
    }
  };

  /* ── EXCEL EXPORT ── */
  const exportToExcel = (data, filename) => {
    // Use xlsx-js-style if available for styled export, else plain xlsx
    const wb = buildWorkbook(data);
    XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "binary", cellStyles: true });
  };

  const handleExportAll = (sample = false) => {
    if (sample) {
      const sampleData = [
        { employee_code:"EMP001", full_name:"Ram Sharma",   email:"ram@nepallife.com.np",  department:"IT",      designation:"Officer",   phone:"9800000001", branch:"Kathmandu", status:"active" },
        { employee_code:"EMP002", full_name:"Sita Rai",     email:"sita@nepallife.com.np", department:"Finance", designation:"Assistant", phone:"9800000002", branch:"Pokhara",   status:"active" },
        { employee_code:"EMP003", full_name:"Hari Thapa",   email:"hari@nepallife.com.np", department:"HR",      designation:"Manager",   phone:"9800000003", branch:"Lalitpur",  status:"inactive" },
      ];
      exportToExcel(sampleData, "employee_import_sample.xlsx");
      setAlert({ type: "success", message: "Sample template downloaded (3 example rows)" });
    } else {
      if (rows.length === 0) { setAlert({ type: "error", message: "No employees to export" }); return; }
      exportToExcel(rows, `Nepal_Life_Employees_All_${new Date().toISOString().slice(0,10)}.xlsx`);
      setAlert({ type: "success", message: `Exported ${rows.length} employees to Excel` });
    }
  };

  const handleExportFiltered = () => {
    if (filteredRows.length === 0) { setAlert({ type: "error", message: "No employees match the current filters" }); return; }
    exportToExcel(filteredRows, `Nepal_Life_Employees_Filtered_${new Date().toISOString().slice(0,10)}.xlsx`);
    setAlert({ type: "success", message: `Exported ${filteredRows.length} filtered employees to Excel` });
  };

  /* ── nav ── */
    const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Issue Tracker", path: "/branch-issues",         icon: makeIcon(D.issue) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
  ].filter(i => i.show !== false);

  /* ── Access guard ── */
  if (!(isAdmin || isSubAdmin)) {
    return (
      <>
        <div className="em-root" style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"white", border:"1.5px solid var(--red-100)", borderRadius:"var(--radius-xl)", padding:"48px 40px", textAlign:"center", maxWidth:380, boxShadow:"var(--shadow-lg)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:20, margin:"0 0 8px" }}>Access Denied</h2>
            <p style={{ color:"var(--gray-500)", fontSize:14, margin:"0 0 20px" }}>You don't have permission to view this page.</p>
            <button className="em-btn em-btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ══════════ RENDER ══════════ */
  return (
    <>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="em-root">
          <style>{FONTS}{PAGE_STYLES}</style>

          {/* Hidden file input for import */}
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display:"none" }} onChange={handleExcelSelect} />

          <div className="em-layout">
            <main className="em-main">

              {/* ── Topbar ── */}
              <div className="em-topbar">
                <div className="em-topbar-left">
                  <div style={{ width:1, height:20, background:"var(--gray-200)" }} />
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>
                    Employee Master
                  </div>
                </div>
                <div className="em-topbar-right">
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:800, fontFamily:"Outfit,sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", border:"1.5px solid var(--gray-200)", background:"var(--gray-100)", color:"var(--gray-700)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green-500)", animation:"pulse 2s ease infinite" }} />
                    {roleLabel}
                  </div>
                  <button className="em-btn em-btn-blue-outline em-btn-sm" onClick={fetchEmployees}>🔄 Refresh</button>

                  <ExportDropdown
                    onExportAll={handleExportAll}
                    onExportFiltered={handleExportFiltered}
                    filteredCount={filteredRows.length}
                    totalCount={totalEmployees}
                  />

                  <button className="em-btn em-btn-success em-btn-sm" onClick={() => fileInputRef.current?.click()}>
                    📤 Import Excel
                  </button>
                  <button className="em-btn em-btn-primary em-btn-sm" onClick={openCreate}>
                    + Add Employee
                  </button>
                </div>
              </div>

              {/* ── Toggle bar ── */}
              <div className="em-panel-toggle-bar">
                <button className={`em-toggle-pill${showPanel === "hero" ? " active" : ""}`} onClick={() => togglePanel("hero")}>
                  🏛️ Overview
                </button>
                <button className={`em-toggle-pill${showPanel === "filters" ? " active" : ""}`} onClick={() => togglePanel("filters")}>
                  🔍 Filters
                  {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
                </button>

                <div className="em-active-filters">
                  {q              && <span className="em-filter-chip">🔎 "{q.length > 18 ? q.slice(0,18)+"…" : q}"<button onClick={() => setQ("")}>×</button></span>}
                  {branchFilter     && <span className="em-filter-chip">🏢 {branchFilter}<button onClick={() => setBranchFilter("")}>×</button></span>}
                  {departmentFilter && <span className="em-filter-chip">🗂 {departmentFilter}<button onClick={() => setDepartmentFilter("")}>×</button></span>}
                  {statusFilter     && <span className="em-filter-chip">📌 {statusFilter}<button onClick={() => setStatusFilter("")}>×</button></span>}
                  {activeFiltersCount > 0 && <button className="em-clear-all" onClick={clearFilters}>Clear all</button>}
                </div>

                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                  <span className="em-badge em-badge-blue" style={{ fontSize:11 }}>{filteredRows.length} / {totalEmployees}</span>
                  <span className="em-badge em-badge-gray" style={{ fontSize:11 }}>{roleLabel}</span>
                </div>
              </div>

              {/* ── Hero panel ── */}
              <div className={`em-collapsible-panel${showPanel === "hero" ? " open" : ""}`}>
                <div className="em-filter-card" style={{ margin:"2px 2px 0" }}>
                  <EmployeeHero total={totalEmployees} activeCount={activeCount} inactiveCount={inactiveCount} branchCount={branchCount} deptCount={deptCount} />
                </div>
                <div className="em-filter-card" style={{ margin:"10px 2px 0" }}>
                  <div className="em-stats-grid">
                    {[
                      { icon:"👥", val:totalEmployees, label:"Total Employees", bar:NL_BLUE,    bg:"var(--blue-50)",   color:"var(--blue-700)" },
                      { icon:"✅", val:activeCount,    label:"Active",          bar:"#16a34a",  bg:"var(--green-50)",  color:"var(--green-700)" },
                      { icon:"⏸",  val:inactiveCount,  label:"Inactive",        bar:"#6b7280",  bg:"var(--gray-100)",  color:"var(--gray-700)" },
                      { icon:"🏢", val:branchCount,    label:"Branches",        bar:"#d97706",  bg:"var(--amber-50)",  color:"var(--amber-600)" },
                      { icon:"🗂",  val:deptCount,      label:"Departments",     bar:"#7c3aed",  bg:"var(--violet-50)", color:"var(--violet-700)" },
                    ].map((s) => (
                      <div key={s.label} className="em-stat-card" style={{ "--stat-bar": s.bar }}>
                        <div className="em-stat-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
                        <div className="em-stat-value">{s.val}</div>
                        <div className="em-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Filter panel ── */}
              <div className={`em-collapsible-panel${showPanel === "filters" ? " open" : ""}`}>
                <div className="em-filter-card1" style={{ margin:"2px 2px 0" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14, alignItems:"end" }}>
                    <div style={{ gridColumn:"span 2", minWidth:0 }}>
                      <label className="em-label">🔎 Search Employees</label>
                      <div className="em-search-wrap">
                        <input type="text" placeholder="Code, name, email, branch, department…" className="em-input" value={q} onChange={(e) => setQ(e.target.value)} />
                        <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="em-label">🏢 Branch</label>
                      <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="em-select">
                        <option value="">All Branches</option>
                        {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="em-label">🗂 Department</label>
                      <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="em-select">
                        <option value="">All Departments</option>
                        {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="em-label">📌 Status</label>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="em-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="em-label">📄 Rows per page</label>
                      <select className="em-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                        {[5, 10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} per page</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Content ── */}
              <div className="em-content">
                {alert.message && (
                  <div className={`em-alert ${alert.type === "error" ? "em-alert-error" : "em-alert-success"}`} style={{ margin:"10px 2px 0" }}>
                    {alert.type === "error" ? "⚠" : "✅"} {alert.message}
                    <button onClick={() => setAlert({ type:"", message:"" })} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"inherit", fontWeight:800 }}>✕</button>
                  </div>
                )}

                <div className="em-table-card" style={{ overflowX:"auto", margin:"14px 2px 0" }}>
                  <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--gray-100)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background: loading ? "var(--amber-500)" : "var(--green-500)", boxShadow:`0 0 8px ${loading ? "rgba(245,158,11,0.6)" : "rgba(34,197,94,0.6)"}`, animation: loading ? "pulse 1s ease infinite" : "none" }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>
                        {loading ? "Loading…" : `${filteredRows.length} of ${totalEmployees} employees`}
                      </span>
                    </div>
                    <span style={{ fontSize:11, color:"var(--gray-400)", fontFamily:"Outfit,sans-serif" }}>Page {currentPage} of {totalPages}</span>
                  </div>

                  {loading ? (
                    <div className="em-empty"><Spinner size={36} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading employees…</p></div>
                  ) : filteredRows.length === 0 ? (
                    <div className="em-empty">
                      <div style={{ fontSize:52 }}>👥</div>
                      <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No employees found</p>
                      <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>{activeFiltersCount > 0 ? "Try adjusting your filters" : "Add an employee or import from Excel"}</p>
                      {activeFiltersCount > 0
                        ? <button className="em-btn em-btn-white" onClick={clearFilters}>Clear Filters</button>
                        : <button className="em-btn em-btn-success" onClick={openCreate}>+ Add First Employee</button>}
                    </div>
                  ) : (
                    <table className="em-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Phone</th>
                          <th>Branch</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRows.map((row, idx) => (
                          <tr key={row.id}>
                            <td style={{ color:"var(--gray-400)", fontSize:11, fontWeight:700 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                            <td>
                              <span style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:12, background:"var(--blue-50)", color:"var(--blue-700)", padding:"2px 8px", borderRadius:6, border:"1px solid var(--blue-100)" }}>
                                {row.employee_code || "—"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:14, flexShrink:0, background:avatarColor(row.full_name) }}>
                                  {(row.full_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight:700, color:"var(--gray-900)", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>
                                  {row.full_name || "—"}
                                </span>
                              </div>
                            </td>
                            <td style={{ color:"var(--gray-600)", fontSize:12 }}>{row.email || "—"}</td>
                            <td>{row.department || "—"}</td>
                            <td>{row.designation || "—"}</td>
                            <td>{row.phone || "—"}</td>
                            <td>
                              {row.branch
                                ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:700, fontFamily:"Outfit,sans-serif", background:"var(--amber-50)", color:"var(--amber-600)", border:"1px solid var(--amber-100)" }}>🏢 {row.branch}</span>
                                : "—"}
                            </td>
                            <td><StatusBadge status={row.status} /></td>
                            <td>
                              <div style={{ display:"flex", gap:6 }}>
                                <button className="em-btn em-btn-sky-outline em-btn-sm" onClick={() => openEdit(row)}>✏️ Edit</button>
                                <button className="em-btn em-btn-rose-outline em-btn-sm" onClick={() => deleteEmployee(row.id)}>🗑 Del</button>
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
                    onPageChange={(p) => setCurrentPage(p)}
                    pageSize={pageSize}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    totalItems={filteredRows.length}
                  />
                )}
              </div>
            </main>
          </div>

          {/* ══════════ ADD / EDIT MODAL ══════════ */}
          {modalOpen && (
            <div className="em-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
              <div className="em-modal-panel">
                <div className="em-modal-header" style={{ background: editing ? "linear-gradient(135deg,#f0f9ff,#dbeafe)" : NL_GRADIENT_90 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14 }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color: editing ? "var(--gray-400)" : "rgba(255,255,255,0.6)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>
                        {editing ? "Edit Employee" : "Create Employee"}
                      </div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"clamp(1.1rem,3vw,1.4rem)", color: editing ? "var(--gray-900)" : "white", letterSpacing:"-0.02em" }}>
                        {editing ? `Edit: ${editing.full_name}` : "Add Employee to Master"}
                      </div>
                    </div>
                    <button onClick={closeModal} className="em-btn em-btn-sm" style={{ background: editing ? "var(--gray-100)" : "rgba(255,255,255,0.15)", border: editing ? "1.5px solid var(--gray-200)" : "1.5px solid rgba(255,255,255,0.25)", color: editing ? "var(--gray-600)" : "white", width:36, height:36, padding:0, justifyContent:"center" }}>✕</button>
                  </div>
                </div>

                <div className="em-modal-body">
                  <div className="em-form-block">
                    <div className="em-form-block-header" style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                      <div style={{ width:30, height:30, borderRadius:9, background:"linear-gradient(135deg,#2563eb,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>👤</div>
                      <div>
                        <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#1e3a8a" }}>Employee Details</div>
                        <div style={{ fontSize:11, color:"#60a5fa" }}>Core identity and office information</div>
                      </div>
                    </div>
                    <div className="em-form-block-body">
                      <div className="em-form-grid-2">
                        {[
                          { label:"Employee Code *", key:"employee_code", placeholder:"EMP001" },
                          { label:"Full Name *",     key:"full_name",     placeholder:"Ram Sharma" },
                          { label:"Email",           key:"email",         placeholder:"name@nepallife.com.np" },
                          { label:"Department",      key:"department",    placeholder:"IT" },
                          { label:"Designation",     key:"designation",   placeholder:"Officer" },
                          { label:"Phone",           key:"phone",         placeholder:"9800000001" },
                          { label:"Branch",          key:"branch",        placeholder:"Kathmandu" },
                        ].map(({ label, key, placeholder }) => (
                          <div key={key}>
                            <label className="em-label">{label}</label>
                            <input className="em-input" placeholder={placeholder} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                          </div>
                        ))}
                        <div>
                          <label className="em-label">Status</label>
                          <select className="em-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="em-modal-footer">
                  <button className="em-btn em-btn-white" onClick={closeModal}>Cancel</button>
                  <button className="em-btn" onClick={saveEmployee} disabled={saving}
                    style={{ background: editing ? "linear-gradient(135deg,var(--sky-600),var(--blue-600))" : NL_GRADIENT, color:"white", boxShadow: editing ? "0 2px 12px rgba(2,132,199,0.3)" : "0 2px 12px rgba(11,92,171,0.3)" }}>
                    {saving ? "Saving…" : editing ? "✔ Update Employee" : "✔ Create Employee"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ IMPORT MODAL ══════════ */}
          {importModalOpen && (
            <div className="em-modal-overlay" onClick={(e) => e.target === e.currentTarget && !importing && setImportModalOpen(false)}>
              <div className="em-modal-panel" style={{ maxWidth:960 }}>
                <div className="em-modal-header" style={{ background:NL_GRADIENT_90 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>Excel Import</div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"1.2rem", color:"white" }}>
                        📤 Import Employees — {importRows.length} rows parsed
                      </div>
                    </div>
                    <button onClick={() => !importing && setImportModalOpen(false)} className="em-btn em-btn-sm"
                      style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.25)", color:"white", width:36, height:36, padding:0, justifyContent:"center" }}>✕</button>
                  </div>
                </div>

                <div className="em-modal-body">
                  {/* Summary after import result */}
                  {importResult && (
                    <div className="im-summary">
                      <div className="im-summary-card total"><div className="val">{importResult.total}</div><div className="lbl">Total</div></div>
                      <div className="im-summary-card ok">  <div className="val">{importResult.inserted}</div><div className="lbl">Inserted</div></div>
                      <div className="im-summary-card warn"><div className="val">{importResult.updated}</div><div className="lbl">Updated</div></div>
                      <div className="im-summary-card err"> <div className="val">{importResult.failed}</div><div className="lbl">Failed</div></div>
                    </div>
                  )}

                  {!importResult && (
                    <div style={{ background:"var(--blue-50)", border:"1.5px solid var(--blue-200)", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"var(--blue-700)", fontWeight:600 }}>
                      ℹ️ Existing employees with the same <strong>Employee Code</strong> will be <strong>updated</strong>. New codes will be inserted. Missing codes are auto-generated.
                    </div>
                  )}

                  {!importResult && detectedCols.length > 0 && (
                    <div style={{ background:"var(--gray-50)", border:"1.5px solid var(--gray-200)", borderRadius:10, padding:"10px 14px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"var(--gray-500)", marginBottom:5, fontFamily:"Outfit,sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        Columns detected in your file ({detectedCols.length})
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {detectedCols.map((col) => (
                          <span key={col} style={{ display:"inline-flex", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:600, background:"var(--blue-50)", color:"var(--blue-700)", border:"1px solid var(--blue-200)", fontFamily:"Outfit,sans-serif" }}>
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error list */}
                  {importResult?.errors?.length > 0 && (
                    <div style={{ background:"var(--red-50)", border:"1.5px solid var(--red-100)", borderRadius:10, padding:"10px 14px" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--red-600)", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>⚠ Errors ({importResult.errors.length})</div>
                      <ul style={{ margin:0, paddingLeft:18, fontSize:12, color:"var(--red-600)" }}>
                        {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Preview table */}
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--gray-500)", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>
                      Preview {importRows.length > 10 ? `(first 10 of ${importRows.length})` : `(${importRows.length} rows)`}
                    </div>
                    <div style={{ maxHeight:280, overflow:"auto", border:"1px solid var(--gray-200)", borderRadius:10 }}>
                      <table className="im-preview-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>Branch</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx}>
                              <td style={{ color:"var(--gray-400)", fontWeight:700 }}>{idx + 1}</td>
                              <td><strong>{row.employee_code || "—"}</strong></td>
                              <td>{row.full_name || "—"}</td>
                              <td style={{ color:"var(--gray-500)" }}>{row.email || "—"}</td>
                              <td>{row.department || "—"}</td>
                              <td>{row.designation || "—"}</td>
                              <td>{row.phone || "—"}</td>
                              <td>{row.branch || "—"}</td>
                              <td>
                                <span style={{ fontWeight:700, fontSize:11, color: row.status === "inactive" ? "var(--gray-600)" : "var(--green-700)" }}>
                                  {row.status || "active"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="em-modal-footer">
                  <button className="em-btn em-btn-white" onClick={() => setImportModalOpen(false)} disabled={importing}>Cancel</button>
                  {!importResult && (
                    <button className="em-btn em-btn-success" onClick={handleImport} disabled={importing || importRows.length === 0}>
                      {importing ? <><Spinner size={14} /> Importing…</> : `📤 Import ${importRows.length} Employees`}
                    </button>
                  )}
                  {importResult && importResult.failed > 0 && (
                    <button className="em-btn em-btn-primary" onClick={() => { setImportResult(null); }}>
                      ↩ Try Again
                    </button>
                  )}
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