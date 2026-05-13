// src/pages/AdminUsers.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Pagination from "../components/common/Pagination";
import NepalLifeLogo from "../assets/nepallife.png";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";

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
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.55} }
  @keyframes bounceIn {
    0%{opacity:0;transform:scale(0.94) translateY(10px)}
    60%{transform:scale(1.02) translateY(-3px)}
    100%{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes statIn   { from{opacity:0;transform:scale(0.88) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .au-root   { font-family:'DM Sans',sans-serif; background:var(--gray-50); max-height:95vh; color:var(--gray-900);}
  .au-layout { display:flex; max-height:100vh; }

  .au-sidebar {
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative; overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1); flex-shrink:0;
  }
  .au-sidebar::before { content:''; position:absolute; top:-70px; right:-50px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%); pointer-events:none; }
  .au-sidebar::after  { content:''; position:absolute; bottom:-50px; left:-30px; width:140px; height:140px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%); pointer-events:none; }
  .au-sidebar-inner   { height:100%; display:flex; flex-direction:column; padding:26px 20px; min-width:220px; position:relative; z-index:1; }
  .au-nav-item {
    display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:13px;
    background:transparent; border:1.5px solid transparent;
    color:rgba(255,255,255,0.52); font-size:13.5px; font-weight:500;
    cursor:pointer; text-align:left; width:100%;
    transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; letter-spacing:0.01em;
  }
  .au-nav-item:hover { background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08)); border-color:rgba(59,130,246,0.28); color:#93c5fd; transform:translateX(5px); }
  .au-nav-icon { width:30px; height:30px; border-radius:9px; background:rgba(255,255,255,0.07); display:inline-flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; transition:background 0.2s; }
  .au-nav-item:hover .au-nav-icon { background:rgba(59,130,246,0.2); }

  .au-main   { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .au-topbar {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .au-topbar-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .au-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .au-content      { flex:1; padding:0 4px; overflow-y:auto; }

  .au-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .au-toggle-pill {
    display:inline-flex; align-items:center; gap:6px; padding:6px 14px;
    border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .au-toggle-pill:hover { border-color:var(--blue-200); color:var(--blue-700); background:var(--blue-50); }
  .au-toggle-pill.active { background:${NL_GRADIENT}; color:white; border-color:transparent; box-shadow:0 2px 10px rgba(11,92,171,0.3); }
  .au-toggle-pill .pill-badge { position:absolute; top:-6px; right:-6px; width:16px; height:16px; border-radius:50%; background:var(--red-500); color:white; font-size:9px; font-weight:900; display:flex; align-items:center; justify-content:center; font-family:'Outfit',sans-serif; border:2px solid white; }

  .au-collapsible-panel { overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease; max-height:0; opacity:0; }
  .au-collapsible-panel.open { max-height:700px; opacity:1; }

  .au-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .au-filter-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2); color:var(--blue-700); font-family:'Outfit',sans-serif; }
  .au-filter-chip button { width:14px; height:14px; border-radius:50%; border:none; background:rgba(11,92,171,0.15); color:var(--blue-700); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; padding:0; transition:background 0.15s; }
  .au-filter-chip button:hover { background:var(--red-500); color:white; }
  .au-clear-all { font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer; background:none; border:none; padding:2px 6px; border-radius:6px; font-family:'Outfit',sans-serif; }
  .au-clear-all:hover { background:var(--red-50); }

  .au-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:var(--radius); font-weight:600; font-size:13px; border:none; cursor:pointer; transition:all 0.18s ease; white-space:nowrap; font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1; }
  .au-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .au-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .au-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .au-btn-primary       { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .au-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .au-btn-success       { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .au-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .au-btn-white         { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .au-btn-white:hover:not(:disabled)   { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .au-btn-blue-outline  { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .au-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .au-btn-sky-outline   { background:var(--sky-50);  border:1.5px solid var(--sky-200);  color:var(--sky-700); }
  .au-btn-sky-outline:hover:not(:disabled)  { background:var(--sky-100); }
  .au-btn-rose-outline  { background:var(--rose-50); border:1.5px solid var(--rose-200); color:var(--rose-600); }
  .au-btn-rose-outline:hover:not(:disabled) { background:var(--rose-100); }
  .au-btn-sm   { padding:6px 12px; font-size:12px; }
  .au-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }

  .au-role-pills { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
  .au-role-pill {
    display:inline-flex; align-items:center; gap:5px;
    padding:5px 13px; border-radius:999px; font-size:11.5px; font-weight:700;
    border:1.5px solid; cursor:pointer; transition:all 0.16s ease;
    font-family:'Outfit',sans-serif; letter-spacing:0.03em;
  }
  .au-role-pill-all     { background:var(--gray-100); border-color:var(--gray-200);   color:var(--gray-600);   }
  .au-role-pill-all.sel     { background:var(--gray-800);  border-color:var(--gray-800);  color:white; box-shadow:0 2px 8px rgba(31,41,55,0.25); }
  .au-role-pill-admin   { background:var(--rose-50);   border-color:var(--rose-200);   color:var(--rose-600);   }
  .au-role-pill-admin.sel   { background:var(--rose-600);  border-color:var(--rose-600);  color:white; box-shadow:0 2px 8px rgba(225,29,72,0.3); }
  .au-role-pill-sub     { background:var(--violet-50); border-color:var(--violet-200); color:var(--violet-700); }
  .au-role-pill-sub.sel     { background:var(--violet-700);border-color:var(--violet-700);color:white; box-shadow:0 2px 8px rgba(109,40,217,0.3); }
  .au-role-pill-user    { background:var(--green-50);  border-color:var(--green-200);  color:var(--green-700);  }
  .au-role-pill-user.sel    { background:var(--green-600); border-color:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.3); }

  .au-input, .au-select {
    width:100%; background:#ffffff; border:1.5px solid #cbd5e1;
    border-radius:var(--radius); padding:10px 14px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
    box-shadow:0 1px 3px rgba(0,0,0,0.05);
  }
  .au-input:hover, .au-select:hover { border-color:#94a3b8; }
  .au-input:focus, .au-select:focus { border-color:${NL_BLUE}; box-shadow:0 0 0 3px rgba(11,92,171,0.12); }
  .au-input::placeholder { color:#94a3b8; font-style:italic; }
  .au-select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230B5CAB' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px; }
  .au-label { font-size:11.5px; font-weight:700; color:#374151; margin-bottom:7px; display:flex; align-items:center; gap:5px; text-transform:uppercase; letter-spacing:0.05em; font-family:'Outfit',sans-serif; }

  .au-filter-card  { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .au-filter-card1 { background:white; border-radius:10px; padding:20px 16px; box-shadow:var(--shadow); }

  .au-hero-wrap {
    border:1px solid rgba(11,92,171,0.12); border-radius:18px; padding:0 7px 7px 7px;
    background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);
    box-shadow:0 18px 60px rgba(2,32,53,0.14); overflow:hidden; position:relative;
  }
  .au-hero-wrap::before {
    content:''; position:absolute; inset:-2px;
    background:radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),
               radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),
               radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .au-hero-inner   { position:relative; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
  .au-hero-logo    { width:82px; max-width:28vw; height:auto; display:block; filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22)); animation:floaty 4.5s ease-in-out infinite; }
  .au-hero-title   { font-family:Syne,sans-serif; font-weight:900; font-size:clamp(1.1rem,2vw,1.45rem); letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1; }
  .au-hero-title .blue { color:var(--nl-blue); }
  .au-hero-title .red  { color:var(--nl-red); }
  .au-hero-divider { width:46px; height:3px; border-radius:999px; background:linear-gradient(90deg,var(--nl-blue),var(--nl-red)); margin-top:8px; }
  .au-hero-sub     { margin-top:6px; font-size:11.5px; color:rgba(15,23,42,0.62); line-height:1.6; max-width:680px; }

  .au-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
  .au-stat-card  {
    background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200);
    padding:18px; box-shadow:var(--shadow-sm); transition:all 0.18s ease;
    cursor:pointer; position:relative; overflow:hidden;
  }
  .au-stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--stat-bar,var(--gray-200)); border-radius:0 0 4px 4px; }
  .au-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow-md); transform:translateY(-3px); }
  .au-stat-card.active-filter { border-color:var(--nl-blue); box-shadow:0 0 0 3px rgba(11,92,171,0.12),var(--shadow-md); transform:translateY(-3px); }
  .au-stat-icon  { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:12px; }
  .au-stat-value { font-family:'Outfit',sans-serif; font-size:1.7rem; font-weight:900; color:var(--gray-900); line-height:1; }
  .au-stat-label { font-size:11px; color:var(--gray-500); margin-top:5px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; font-family:'Outfit',sans-serif; }
  .au-stat-pct   { font-size:10px; color:var(--gray-400); margin-top:3px; font-family:'Outfit',sans-serif; }

  .au-table-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px; }
  .au-table      { width:100%; border-collapse:collapse; }
  .au-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE}; border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .au-table thead th:nth-child(5) { background:${NL_RED}; }
  .au-table thead th:nth-child(6) { background:${NL_RED}; }
  .au-table th, .au-table td { border-right:0.5px solid rgba(0,0,0,0.06); border-bottom:1px solid #e2e8f0; }
  .au-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; }
  .au-table tbody tr:last-child { border-bottom:none; }
  .au-table tbody tr:hover { background:var(--blue-50); }
  .au-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); vertical-align:middle; }

  .au-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .au-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; opacity:0.7; }
  .au-badge-blue   { background:var(--blue-50);   color:var(--blue-700);   border:1px solid var(--blue-200);   }
  .au-badge-green  { background:var(--green-50);  color:var(--green-700);  border:1px solid var(--green-200);  }
  .au-badge-gray   { background:var(--gray-100);  color:var(--gray-600);   border:1px solid var(--gray-200);   }
  .au-badge-rose   { background:var(--rose-50);   color:var(--rose-600);   border:1px solid var(--rose-200);   }
  .au-badge-violet { background:var(--violet-50); color:var(--violet-700); border:1px solid var(--violet-200); }
  .au-badge-amber  { background:var(--amber-50);  color:var(--amber-600);  border:1px solid var(--amber-100); }

  .au-user-avatar {
    width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    color:white; font-weight:800; font-size:15px; flex-shrink:0;
    box-shadow:0 2px 8px rgba(0,0,0,0.18); font-family:'Outfit',sans-serif;
    position:relative;
  }
  .au-user-avatar::after {
    content:''; position:absolute; bottom:0; right:0;
    width:10px; height:10px; border-radius:50%;
    background:var(--green-500); border:2px solid white;
  }

  .au-alert { border-radius:var(--radius); padding:12px 16px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:10px; border:1.5px solid; margin:8px 0; }
  .au-alert-error   { background:var(--red-50);   border-color:var(--red-100);   color:var(--red-600);   }
  .au-alert-success { background:var(--green-50); border-color:var(--green-200); color:var(--green-700); }

  .au-modal-overlay { position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.65); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease; }
  .au-modal-panel   { width:100%; max-width:580px; background:white; border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-lg); animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; border:1.5px solid var(--gray-200); }
  .au-modal-header  { padding:22px 26px; }
  .au-modal-body    { padding:20px 26px; display:flex; flex-direction:column; gap:16px; }
  .au-modal-footer  { padding:16px 26px 24px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--gray-100); }

  .au-form-block { border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; background:white; box-shadow:var(--shadow-sm); }
  .au-form-block-header { padding:11px 16px; display:flex; align-items:center; gap:10px; border-bottom:1.5px solid var(--gray-100); }
  .au-form-block-body   { padding:16px; display:flex; flex-direction:column; gap:14px; }
  .au-form-grid-2       { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }

  .au-search-wrap { position:relative; }
  .au-search-wrap input { padding-right:38px; }
  .au-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  .au-empty   { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }
  .au-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  .au-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }

  @media(max-width:1024px) {
    .au-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .au-content { padding:3px; }
  }
  @media(max-width:640px) {
    .au-topbar { padding:8px 10px; }
    .au-content { padding:1px; }
    .au-table thead th, .au-table tbody td { padding:10px 12px; font-size:12px; }
    .au-hero-inner { flex-direction:column; text-align:center; }
    .au-hero-divider { margin-left:auto; margin-right:auto; }
    .au-modal-body, .au-modal-header, .au-modal-footer { padding-left:16px; padding-right:16px; }
    .au-stats-grid { grid-template-columns:1fr 1fr; }
  }
`;

/* ── Helpers ──────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#e11d48",
  "#d97706",
  "#0284c7",
  "#0f766e",
  "#9333ea",
  "#db2777",
];

const avatarColor = (name) =>
  AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];

const normalizeRole = (r) => {
  const v = String(r || "").trim().toLowerCase();
  if (v === "admin") return "admin";
  if (v === "subadmin" || v === "sub_admin" || v === "sub-admin") return "subadmin";
  return "user";
};

const buildPayload = (form, editing = false) => {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    role: normalizeRole(form.role),
  };

  if (!editing || form.password.trim()) {
    payload.password = form.password;
  }

  if (normalizeRole(form.role) === "subadmin") {
    payload.service_station_id = form.service_station_id ? Number(form.service_station_id) : null;
  } else {
    payload.service_station_id = null;
  }

  return payload;
};

const RoleBadge = ({ role }) => {
  const r = normalizeRole(role);
  if (r === "admin") {
    return (
      <span
        className="au-badge au-badge-rose"
        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        🔑 Admin
      </span>
    );
  }
  if (r === "subadmin") {
    return (
      <span
        className="au-badge au-badge-violet"
        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        🛡 Sub Admin
      </span>
    );
  }
  return (
    <span
      className="au-badge au-badge-green"
      style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      👤 User
    </span>
  );
};

const Spinner = ({ size = 28 }) => (
  <div className="au-spinner" style={{ width: size, height: size }} />
);

/* ── Icon helper ── */
const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const D = {
  branch:   "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:   "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  help:     "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  graph:    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  radar:    "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  scan:     "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
};

function Ic({ d, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/* ── Hero ──────────────────────────────────────────────────────── */
function NepalLifeHero({ totalUsers, adminCount, subAdminCount, userCount }) {
  return (
    <div className="au-hero-wrap">
      <div className="au-hero-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(11,92,171,0.10)",
              border: "1px solid rgba(11,92,171,0.20)",
              color: "rgba(11,92,171,0.90)",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: NL_BLUE2,
                boxShadow: "0 0 8px rgba(20,116,243,0.65)",
                animation: "pulse 2s ease infinite",
              }}
            />
            Nepal Life · User Management
          </div>
          <h2 className="au-hero-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
              User Administration
            </span>
          </h2>
          <div className="au-hero-divider" />
          <p className="au-hero-sub">
            Manage system users, assign roles, and control access permissions across the AssetIMS platform.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {[
              {
                label: `${totalUsers} Total`,
                bg: "rgba(11,92,171,0.10)",
                color: NL_BLUE,
                border: "rgba(11,92,171,0.2)",
              },
              {
                label: `${adminCount} Admins`,
                bg: "rgba(225,29,72,0.08)",
                color: "var(--rose-600)",
                border: "var(--rose-200)",
              },
              {
                label: `${subAdminCount} Sub Admins`,
                bg: "rgba(109,40,217,0.08)",
                color: "var(--violet-700)",
                border: "var(--violet-200)",
              },
              {
                label: `${userCount} Users`,
                bg: "rgba(22,163,74,0.08)",
                color: "var(--green-700)",
                border: "var(--green-200)",
              },
            ].map((s) => (
              <span
                key={s.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  color: s.color,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "Outfit,sans-serif",
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="au-hero-logo" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function AdminUsers() {
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // "admin" | "subadmin" | "user" | ""
  const [menuOpen, setMenuOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPanel, setShowPanel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    service_station_id: "",
  });
  const [serviceStations, setServiceStations] = useState([]);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const swWidth = () => {
    if (windowWidth < 640) return menuOpen ? "85vw" : "0";
    if (windowWidth < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const togglePanel = (p) => setShowPanel((prev) => (prev === p ? "" : p));

  const fetchUsers = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(res?.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceStations = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await api.get("/api/service-stations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setServiceStations(Array.isArray(payload) ? payload : []);
    } catch {
      setServiceStations([]);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUsers();
    fetchServiceStations();
  }, [token, isAdmin, fetchServiceStations]);

  const totalUsers = rows.length;
  const adminCount = rows.filter((u) => normalizeRole(u.role) === "admin").length;
  const subAdminCount = rows.filter((u) => normalizeRole(u.role) === "subadmin").length;
  const userCount = rows.filter((u) => normalizeRole(u.role) === "user").length;

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return rows.filter((u) => {
      if (roleFilter && normalizeRole(u.role) !== roleFilter) return false;
      if (!s) return true;
      return [u?.name, u?.email, u?.role, String(u?.id)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [rows, q, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const activeFiltersCount = [q, roleFilter].filter(Boolean).length;
  const clearFilters = () => {
    setQ("");
    setRoleFilter("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "user", password: "", service_station_id: "" });
    setModalOpen(true);
    setErr("");
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u?.name || "",
      email: u?.email || "",
      role: normalizeRole(u?.role || "user"),
      password: "",
      service_station_id: u?.service_station_id ? String(u.service_station_id) : "",
    });
    setModalOpen(true);
    setErr("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSaving(false);
    setErr("");
  };

  const save = async () => {
    if (!token) return;

    const payload = buildPayload(form, !!editing);

    if (!payload.name || !payload.email || (!editing && !payload.password)) {
      setErr("Name, email, and password are required");
      return;
    }

    setErr("");
    setSaving(true);

    try {
      if (editing) {
        await api.put(`/api/admin/users/${editing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/admin/users", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      closeModal();
      fetchUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!token || !window.confirm("Permanently delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete");
    }
  };

  const handleDatabaseBackup = async () => {
  try {
    setBackupLoading(true);
    setErr("");

    const response = await api.get("/api/backup/download", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    let fileName = "database-backup.sql";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    const blob = new Blob([response.data], { type: "application/sql" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (e) {
    let message = "Failed to download backup";

    try {
      const data = e?.response?.data;

      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const parsed = JSON.parse(text);
          message =
            parsed?.stderr ||
            parsed?.error ||
            parsed?.message ||
            text ||
            message;
        } catch {
          message = text || message;
        }
      } else {
        message =
          data?.stderr ||
          data?.error ||
          data?.message ||
          message;
      }
    } catch {
      message = e?.message || message;
    }

    console.error("Backup download failed:", message, e);
    setErr(message);
  } finally {
    setBackupLoading(false);
  }
};
  /* ── Icon helper ── */
    const makeIcon = (d) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    );
 const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
    { label: "Asset Tracking", path: "/asset-tracking",       icon: makeIcon(D.radar) },
    { label: "Help & Support", path: "/support",              icon: makeIcon(D.help) },
  ].filter(i => i.show !== false);

  if (!isAdmin) {
    return (
      <>
        <div
          className="au-root"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            style={{
              background: "white",
              border: "1.5px solid var(--red-100)",
              borderRadius: "var(--radius-xl)",
              padding: "48px 40px",
              textAlign: "center",
              maxWidth: 380,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
            <h2
              style={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 800,
                fontSize: 20,
                margin: "0 0 8px",
              }}
            >
              Access Denied
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: 14, margin: "0 0 20px" }}>
              You don't have permission to view this page.
            </p>
            <button className="au-btn au-btn-primary" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  const rolePillDef = (key, label, cls, count) => ({
    key,
    label,
    cls,
    count,
    sel: roleFilter === key || (key === "" && roleFilter === ""),
  });
  const rolePills = [
    rolePillDef("", `All (${totalUsers})`, "au-role-pill-all", totalUsers),
    rolePillDef("admin", `Admin (${adminCount})`, "au-role-pill-admin", adminCount),
    rolePillDef("subadmin", `Sub Admin (${subAdminCount})`, "au-role-pill-sub", subAdminCount),
    rolePillDef("user", `User (${userCount})`, "au-role-pill-user", userCount),
  ];
  return (
    <>
    <SplitSidebarLayout
        navItems={navItems}
        user={user}
      >
    <div className="au-root">
      <style>{FONTS}{PAGE_STYLES}</style>
      <div className="au-layout">
       
        <main className="au-main">
          <div className="au-topbar">
            <div className="au-topbar-left">
              <div style={{ width: 1, height: 20, background: "var(--gray-200)" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", fontFamily: "Outfit,sans-serif" }}>
                User Management
              </div>
            </div>

            <div className="au-topbar-right">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "Outfit,sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1.5px solid var(--gray-200)",
                  background: "var(--gray-100)",
                  color: "var(--gray-700)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--green-500)",
                    animation: "pulse 2s ease infinite",
                  }}
                />
                {roleLabel}
              </div>

              <button className="au-btn au-btn-blue-outline au-btn-sm" onClick={fetchUsers}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              <button
                className="au-btn au-btn-blue-outline au-btn-sm"
                onClick={handleDatabaseBackup}
                disabled={backupLoading}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
                </svg>
                {backupLoading ? "Preparing Backup..." : "Download Backup"}
              </button>

              <button className="au-btn au-btn-success au-btn-sm" onClick={openCreate}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
              <button
                className="au-btn au-btn-primary au-btn-sm"
                onClick={() => navigate("/employees-master")}
              >
                Employee Master
              </button>
            </div>
          </div>

          <div className="au-panel-toggle-bar">
            <button className={`au-toggle-pill${showPanel === "hero" ? " active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ Overview
            </button>

            <button className={`au-toggle-pill${showPanel === "filters" ? " active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 Filters
              {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
            </button>

            <div className="au-role-pills">
              {rolePills.map((p) => (
                <button
                  key={p.key}
                  className={`au-role-pill ${p.cls}${p.sel ? " sel" : ""}`}
                  onClick={() => {
                    setRoleFilter(p.key);
                    setCurrentPage(1);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="au-active-filters">
              {q && (
                <span className="au-filter-chip">
                  🔎 "{q.length > 18 ? q.slice(0, 18) + "…" : q}"
                  <button onClick={() => setQ("")}>×</button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button className="au-clear-all" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="au-badge au-badge-blue" style={{ fontSize: 11 }}>
                {filtered.length} / {totalUsers}
              </span>
              <span className="au-badge au-badge-gray" style={{ fontSize: 11 }}>
                {roleLabel}
              </span>
            </div>
          </div>

          <div className={`au-collapsible-panel${showPanel === "hero" ? " open" : ""}`}>
            <div className="au-filter-card" style={{ margin: "2px 2px 0" }}>
              <NepalLifeHero
                totalUsers={totalUsers}
                adminCount={adminCount}
                subAdminCount={subAdminCount}
                userCount={userCount}
              />
            </div>
          </div>

          <div className={`au-collapsible-panel${showPanel === "filters" ? " open" : ""}`}>
            <div className="au-filter-card1" style={{ margin: "2px 2px 0" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                  gap: 14,
                  alignItems: "end",
                }}
              >
                <div style={{ gridColumn: "span 2", minWidth: 0 }}>
                  <label className="au-label">🔎 Search Users</label>
                  <div className="au-search-wrap">
                    <input
                      type="text"
                      placeholder="Name, email, role, ID…"
                      className="au-input"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="au-label">👥 Filter by Role</label>
                  <select
                    className="au-select"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin ({adminCount})</option>
                    <option value="subadmin">Sub Admin ({subAdminCount})</option>
                    <option value="user">User ({userCount})</option>
                  </select>
                </div>

                <div>
                  <label className="au-label">📄 Rows per page</label>
                  <select
                    className="au-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="au-content">
            {err && (
              <div className="au-alert au-alert-error" style={{ margin: "10px 2px 0" }}>
                ⚠ {err}
                <button
                  onClick={() => setErr("")}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                    fontWeight: 800,
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="au-table-card" style={{ overflowX: "auto", margin: "14px 2px 0" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--gray-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: loading ? "var(--amber-500)" : "var(--green-500)",
                      boxShadow: `0 0 8px ${
                        loading ? "rgba(245,158,11,0.6)" : "rgba(34,197,94,0.6)"
                      }`,
                      animation: loading ? "pulse 1s ease infinite" : "none",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", fontFamily: "Outfit,sans-serif" }}>
                    {loading ? "Loading…" : `${filtered.length} of ${totalUsers} users`}
                    {roleFilter && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--gray-400)" }}>
                        · filtered by role
                      </span>
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--gray-400)", fontFamily: "Outfit,sans-serif" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="au-empty">
                  <Spinner size={36} />
                  <p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>Loading users…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="au-empty">
                  <div style={{ fontSize: 52 }}>👥</div>
                  <p style={{ color: "var(--gray-700)", fontWeight: 700, fontSize: 15, margin: 0, fontFamily: "Outfit,sans-serif" }}>
                    No users found
                  </p>
                  <p style={{ color: "var(--gray-400)", fontSize: 12, margin: 0 }}>
                    {activeFiltersCount > 0 ? "Try adjusting your filters" : "Add a user to get started"}
                  </p>
                  {activeFiltersCount > 0 ? (
                    <button className="au-btn au-btn-white" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  ) : (
                    <button className="au-btn au-btn-success" onClick={openCreate}>
                      + Add First User
                    </button>
                  )}
                </div>
              ) : (
                <table className="au-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Station</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((u, idx) => {
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                      const color = avatarColor(u.name);

                      return (
                        <tr key={u.id}>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: "var(--gray-100)",
                                color: "var(--gray-600)",
                                fontWeight: 800,
                                fontSize: 12,
                                border: "1.5px solid var(--gray-200)",
                                fontFamily: "Outfit,sans-serif",
                              }}
                            >
                              {globalIdx}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="au-user-avatar" style={{ background: color }}>
                                {(u.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--gray-900)",
                                    fontSize: 13.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 180,
                                  }}
                                >
                                  {u.name || "—"}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                                  ID: {u.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: "var(--gray-600)", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {u.email || "—"}
                            </span>
                          </td>
                          <td>
                            <RoleBadge role={u.role} />
                          </td>
                          <td>
                            <span style={{ color: "var(--gray-600)", fontSize: 13, display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {serviceStations.find((s) => s.id === u.service_station_id)?.name || (u.service_station_id ? `Station #${u.service_station_id}` : "—")}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                              <button className="au-btn au-btn-sky-outline au-btn-sm" onClick={() => openEdit(u)}>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button className="au-btn au-btn-rose-outline au-btn-sm" onClick={() => del(u.id)}>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {filtered.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                totalItems={filtered.length}
              />
            )}
            <br />
          </div>
        </main>
      </div>
      {modalOpen && (
        <div className="au-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="au-modal-panel">
            <div className="au-modal-header" style={{ background: editing ? "linear-gradient(135deg,#f0f9ff,#dbeafe)" : NL_GRADIENT_90 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: editing ? "var(--gray-400)" : "rgba(255,255,255,0.6)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    {editing ? "Edit Existing User" : "Create New User"}
                  </div>
                  <div
                    style={{
                      fontFamily: "Outfit,sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(1.1rem,3vw,1.4rem)",
                      color: editing ? "var(--gray-900)" : "white",
                      letterSpacing: "-0.02em",
                      marginBottom: editing ? 4 : 0,
                    }}
                  >
                    {editing ? `Edit: ${editing.name}` : "Add User to System"}
                  </div>
                  {editing && <RoleBadge role={editing.role} />}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {editing && (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: avatarColor(editing.name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: 18,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      {(editing.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={closeModal}
                    className="au-btn au-btn-sm"
                    style={{
                      background: editing ? "var(--gray-100)" : "rgba(255,255,255,0.15)",
                      border: editing ? "1.5px solid var(--gray-200)" : "1.5px solid rgba(255,255,255,0.25)",
                      color: editing ? "var(--gray-600)" : "white",
                      width: 36,
                      height: 36,
                      padding: 0,
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="au-modal-body">
              {err && <div className="au-alert au-alert-error">⚠ {err}</div>}

              <div className="au-form-block">
                <div className="au-form-block-header" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: "linear-gradient(135deg,#2563eb,#6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#1e3a8a" }}>
                      Identity
                    </div>
                    <div style={{ fontSize: 11, color: "#60a5fa" }}>Name and email address</div>
                  </div>
                </div>
                <div className="au-form-block-body">
                  <div className="au-form-grid-2">
                    <div>
                      <label className="au-label">Full Name</label>
                      <input
                        className="au-input"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="au-label">Email Address</label>
                      <input
                        className="au-input"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="au-form-block">
                <div className="au-form-block-header" style={{ background: "linear-gradient(135deg,#fef2f2,#fee2e2)" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: "linear-gradient(135deg,#e11d48,#7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    🔑
                  </div>
                  <div>
                    <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#7f1d1d" }}>
                      Access & Role
                    </div>
                    <div style={{ fontSize: 11, color: "#fca5a5" }}>Role assignment and password</div>
                  </div>
                </div>

                <div className="au-form-block-body">
                  <div className="au-form-grid-2">
                    <div>
                      <label className="au-label">Role</label>
                      <select
                        className="au-select"
                        value={form.role}
                        onChange={(e) => {
                          const roleValue = normalizeRole(e.target.value);
                          setForm((f) => ({
                            ...f,
                            role: roleValue,
                            service_station_id: roleValue === "subadmin" ? f.service_station_id : "",
                          }));
                        }}
                      >
                        <option value="user">User</option>
                        <option value="subadmin">Sub Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {normalizeRole(form.role) === "subadmin" && (
                      <div>
                        <label className="au-label">Assigned Station</label>
                        <select
                          className="au-select"
                          value={form.service_station_id}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, service_station_id: e.target.value }))
                          }
                        >
                          <option value="">-- Select Service Station --</option>
                          {serviceStations.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}{s.station_ext_no ? ` (Ext. ${s.station_ext_no})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="au-label">{editing ? "New Password" : "Password"}</label>
                      <input
                        className="au-input"
                        type="password"
                        placeholder={editing ? "Leave blank to keep current" : "Min. 8 characters"}
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: "var(--radius)",
                      border: "1.5px solid var(--gray-200)",
                      background: "var(--gray-50)",
                      padding: "12px 16px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--gray-800)", fontSize: 14 }}>
                        Effective Access
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
                        {normalizeRole(form.role) === "admin"
                          ? "Full system access"
                          : normalizeRole(form.role) === "subadmin"
                          ? "Sub admin access"
                          : "Standard user access"}
                      </div>
                    </div>
                    <RoleBadge role={form.role} />
                  </div>
                </div>
              </div>
            </div>

            <div className="au-modal-footer">
              <button className="au-btn au-btn-white" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="au-btn"
                onClick={save}
                disabled={saving}
                style={{
                  background: editing ? "linear-gradient(135deg,var(--sky-600),var(--blue-600))" : NL_GRADIENT,
                  color: "white",
                  boxShadow: editing
                    ? "0 2px 12px rgba(2,132,199,0.3)"
                    : "0 2px 12px rgba(11,92,171,0.3)",
                }}
              >
                {saving ? (
                  <>
                    <div
                      className="au-spinner"
                      style={{
                        width: 14,
                        height: 14,
                        borderColor: "rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                      }}
                    />
                    Saving…
                  </>
                ) : editing ? (
                  <>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Update User
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Create User
                  </>
                )}
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