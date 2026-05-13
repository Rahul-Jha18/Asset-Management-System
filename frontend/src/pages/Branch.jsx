// src/pages/Branch.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm, useDebounce } from "../hooks";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";
import Alert from "../components/common/Alert";
import { SkeletonTable } from "../components/common/Loading";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import NepalLifeLogo from "../assets/nepallife.png";
import "../styles/Pages.css";
import * as XLSX from "xlsx";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─── Google Fonts ─── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const NL_BLUE    = "#0B5CAB";
const NL_BLUE2   = "#1474F3";
const NL_RED     = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

/* ─── Styles ─── */
const BRANCH_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8; --blue-900:#1e3a8a;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
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

  /* ─── Layout ─── */
  .bp-root { font-family:'DM Sans',sans-serif; background:var(--gray-50); max-height:90vh; color:var(--gray-900); }
  .bp-layout { display:flex; max-height:90vh; }

 
  /* ─── Main ─── */
  .bp-main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .bp-topbar {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .bp-topbar-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .bp-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .bp-content { flex:1; padding:7px 4px; overflow-y:auto; }

  /* ─── Panel Toggle Bar ─── */
  .bp-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .bp-toggle-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .bp-toggle-pill:hover { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .bp-toggle-pill.active {
    background:${NL_GRADIENT}; color:white; border-color:transparent;
    box-shadow:0 2px 10px rgba(11,92,171,0.3);
  }
  .bp-toggle-pill .pill-badge {
    position:absolute; top:-6px; right:-6px;
    width:16px; height:16px; border-radius:50%; background:var(--red-500);
    color:white; font-size:9px; font-weight:900; display:flex; align-items:center; justify-content:center;
    font-family:'Outfit',sans-serif; border:2px solid white;
  }

  /* ─── Collapsible Panel ─── */
  .bp-collapsible-panel {
    overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
    max-height:0; opacity:0;
  }
  .bp-collapsible-panel.open { max-height:600px; opacity:1; }

  /* ─── Active Filter Chips ─── */
  .bp-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .bp-filter-chip {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700;
    background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2);
    color:var(--blue-700); font-family:'Outfit',sans-serif;
    transition:all 0.15s ease;
  }
  .bp-filter-chip button {
    width:14px; height:14px; border-radius:50%; border:none;
    background:rgba(11,92,171,0.15); color:var(--blue-700);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:900; padding:0; line-height:1;
    transition:background 0.15s;
  }
  .bp-filter-chip button:hover { background:var(--red-500); color:white; }
  .bp-clear-all {
    font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer;
    background:none; border:none; padding:2px 6px; border-radius:6px;
    font-family:'Outfit',sans-serif; transition:background 0.15s;
  }
  .bp-clear-all:hover { background:var(--red-50); }

  /* ─── Buttons ─── */
  .bp-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .bp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .bp-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .bp-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .bp-btn-primary { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .bp-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .bp-btn-success { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .bp-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .bp-btn-amber { background:var(--amber-500); color:white; }
  .bp-btn-amber:hover:not(:disabled) { background:var(--amber-600); }
  .bp-btn-white { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .bp-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .bp-btn-ghost { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .bp-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .bp-btn-blue-outline { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .bp-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .bp-btn-green-outline { background:var(--green-50); border:1.5px solid var(--green-200); color:var(--green-700); }
  .bp-btn-green-outline:hover:not(:disabled) { background:var(--green-100); }
  .bp-btn-sm { padding:6px 12px; font-size:12px; }
  .bp-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }
  .bp-btn-label { display:inline; }
  @media(max-width:480px) { .bp-btn-label { display:none; } }

  /* ─── Inputs ─── */
  .bp-input, .bp-select, .bp-textarea {
    width:100%; background:rgba(55,65,82,0.07); border:1.5px solid var(--gray-300);
    border-radius:var(--radius); padding:9px 13px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
  }
  .bp-input:focus, .bp-select:focus, .bp-textarea:focus {
    border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,0.1);
  }
  .bp-input::placeholder, .bp-textarea::placeholder { color:var(--gray-400); }
  .bp-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px;
  }
  .bp-label { font-size:11.5px; font-weight:600; color:var(--gray-600); margin-bottom:6px; display:block; }
  .bp-textarea { resize:vertical; }

  /* ─── Filter / Hero Cards ─── */
  .bp-filter-card { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .bp-filter-card1 { background:white; border-radius:10px; padding:20px 12px; box-shadow:var(--shadow); }

  /* ─── Table ─── */
  .bp-table-card {
    background:white; margin-top:1px; border-radius:var(--radius);
    border:1.5px solid var(--gray-200); box-shadow:var(--shadow);
    overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px;
  }
  .bp-table { width:100%; border-collapse:collapse; }
  .bp-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700 ; margin-top:10px;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE};
    border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .bp-table thead th:nth-child(8) { background:${NL_RED}; }
  .bp-table thead th:nth-child(9) { background:${NL_RED}; }
  .bp-table thead th:nth-child(10) { background:${NL_RED}; }
  .bp-table th, .bp-table td { border-right:0.5px solid rgba(0,0,0,0.08); border-bottom:1px solid #e2e8f0; }
  .bp-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; cursor:pointer; }
  .bp-table tbody tr:last-child { border-bottom:none; }
  .bp-table tbody tr:hover { background:var(--blue-50); }
  .bp-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); }

  /* ─── Badges ─── */
  .bp-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .bp-badge-blue { background:var(--blue-50); color:var(--blue-700); border:1px solid var(--blue-200); }
  .bp-badge-green { background:var(--green-50); color:var(--green-700); border:1px solid var(--green-200); }
  .bp-badge-gray { background:var(--gray-100); color:var(--gray-600); border:1px solid var(--gray-200); }
  .bp-badge-amber { background:var(--amber-50); color:var(--amber-600); border:1px solid var(--amber-100); }
  .bp-badge-red { background:var(--red-50); color:var(--red-600); border:1px solid var(--red-100); }

  /* ─── Status Pill ─── */
  .bp-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; border:1.5px solid; }
  .bp-status::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .bp-status-open { color:var(--green-700); border-color:var(--green-200); background:var(--green-50); }
  .bp-status-closed { color:var(--red-600); border-color:var(--red-100); background:var(--red-50); }

  /* ─── Stat Cards ─── */
  .bp-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; margin-bottom:20px; }
  .bp-stat-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); padding:16px 18px; box-shadow:var(--shadow-sm); transition:all 0.18s ease; }
  .bp-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow); transform:translateY(-2px); }
  .bp-stat-value { font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:800; color:var(--gray-900); line-height:1; }
  .bp-stat-label { font-size:11.5px; color:var(--gray-500); margin-top:4px; font-weight:500; }

  /* ─── Preview Modal ─── */
  .bp-preview-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:16px; animation:fadeIn 0.2s ease;
  }
  .bp-preview-panel {
    width:100%; max-width:980px; max-height:90vh; background:white; border-radius:var(--radius-xl);
    overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .bp-preview-header { background:${NL_GRADIENT_90}; padding:22px 26px; flex-shrink:0; }
  .bp-preview-body { flex:1; overflow-y:auto; background:var(--gray-50); padding:24px 26px; }

  /* ─── Detail Section ─── */
  .bp-detail-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; box-shadow:var(--shadow-sm); }
  .bp-detail-card-header { padding:14px 18px; background:var(--gray-50); border-bottom:1.5px solid var(--gray-200); display:flex; align-items:center; gap:10px; }
  .bp-detail-card-body { padding:6px 18px 18px; }
  .bp-detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--gray-100); gap:12px; }
  .bp-detail-row:last-child { border-bottom:none; }
  .bp-detail-label { font-size:12px; font-weight:600; color:var(--gray-500); white-space:nowrap; }
  .bp-detail-value { font-size:13px; font-weight:600; color:var(--gray-900); text-align:right; max-width:65%; word-break:break-word; }

  /* ─── Chart Legend ─── */
  .bp-legend-item { display:flex; align-items:center; justify-content:space-between; padding:9px 12px; border-radius:var(--radius); border:1.5px solid var(--gray-100); background:white; transition:all 0.15s; }
  .bp-legend-item:hover { border-color:var(--blue-200); background:var(--blue-50); }

  /* ─── Empty State ─── */
  .bp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }

  /* ─── Spinner ─── */
  .bp-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* ─── Search wrapper ─── */
  .bp-search-wrap { position:relative; }
  .bp-search-wrap input { padding-right:38px; }
  .bp-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--gray-400); }

  /* Mobile overlay */
  .bp-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  /* Mono */
  .bp-mono { font-family:'Courier New',monospace; font-size:12px; background:var(--gray-50); border:1px solid var(--gray-200); border-radius:6px; padding:2px 8px; color:var(--gray-800); }

  /* ─── Nepal Life Hero ─── */
  .nl-hero-wrap {
    background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);
    box-shadow:0 18px 60px rgba(2,32,53,0.14);
    overflow:hidden; position:relative;
  }
  .nl-hero-wrap::before {
    content:''; position:absolute; inset:-2px;
    background:
      radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),
      radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),
      radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .nl-hero-inner {
    position:relative; padding:16px 20px;
    display:flex; align-items:center; justify-content:space-between; gap:18px;
  }
  .nl-logo {
    width:90px; max-width:28vw; height:auto; display:block;
    filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22));
    animation:floaty 4.5s ease-in-out infinite;
  }
  .nl-title {
    font-family:Syne,sans-serif; font-weight:900;
    font-size:clamp(1.1rem,2vw,1.55rem);
    letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1;
  }
  .nl-title .blue { color:var(--nl-blue); }
  .nl-title .red { color:var(--nl-red); }
  .nl-divider {
    width:46px; height:3px; border-radius:999px;
    background:linear-gradient(90deg,var(--nl-blue),var(--nl-red));
    margin-top:8px;
  }
  .nl-sub { margin-top:6px; font-size:12px; color:rgba(15,23,42,0.62); line-height:1.5; max-width:600px; }
  @media(max-width:920px) {
    .nl-hero-inner { flex-direction:column; text-align:center; }
    .nl-divider { margin-left:auto; margin-right:auto; }
  }

  @media(max-width:1024px) {
    .b-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .bp-content { padding:5px; }
  }
  @media(max-width:640px) {
    .bp-topbar { padding:8px 10px; }
    .bp-content { padding:3px; }
    .bp-table thead th, .bp-table tbody td { padding:10px 12px; font-size:12px; }
  }
`;
/* ─── Hero Component ─── */
function NepalLifeHero() {
  return (
    <div className="nl-hero-wrap">
      <div className="nl-hero-inner">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(11,92,171,0.10)", border:"1px solid rgba(11,92,171,0.20)", color:"rgba(11,92,171,0.90)", borderRadius:999, padding:"5px 12px", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:NL_BLUE2, boxShadow:"0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · Branch Management
          </div>
          <h1 className="nl-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.70)", fontWeight:800 }}>Insurance Co. Ltd.</span>
            <br />
            <span style={{ fontSize:14, color:"rgba(15,23,42,0.52)", fontWeight:800 }}>"किनकी जीवन अमूल्य छ"</span>
          </h1>
          <div className="nl-divider" />
          <p className="nl-sub">Manage branches, connectivity, service stations, and asset distribution across all regions.</p>
        </div>
        <div style={{ flexShrink:0, display:"grid", placeItems:"center" }}>
          <img src={NepalLifeLogo} alt="Nepal Life Insurance Co. Ltd." className="nl-logo" />
        </div>
      </div>
    </div>
  );
}

/* ─── Constants ─── */
const PIE_COLORS = ["#2563eb","#16a34a","#f59e0b","#0d9488","#ef4444","#7c3aed","#ea580c"];
const initialBranchValues = { name:"", manager_name:"", gateway:"", contact:"", branch_code:"", service_station_id:"", region:"", remarks:"" };

/* ─── Helpers ─── */
const safeArray = v => (!v ? [] : Array.isArray(v) ? v : [v]);
const norm = v => String(v ?? "").trim();
const pick = (row, keys) => { for (const k of keys) { if (row?.[k] !== undefined && row?.[k] !== null && String(row[k]).trim() !== "") return row[k]; } return ""; };
const toIntOrNull = v => { const s = norm(v); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const onlyDigits = v => String(v ?? "").replace(/\D/g, "");
const excelToPlainNumberString = v => { if (v === undefined || v === null) return ""; if (typeof v === "number") return String(Math.trunc(v)); const s = String(v).trim(); if (!s) return ""; if (/[eE]/.test(s)) { const n = Number(s); if (Number.isFinite(n)) return String(Math.trunc(n)); } return s; };
const getStationExt = station => station?.station_ext_no ?? station?.ext_no ?? station?.extNo ?? station?.extension ?? station?.extension_no ?? "";
const normalizeStationText = s => String(s ?? "").toLowerCase().replace(/\(.*?\)/g, "").replace(/ext\.?\s*\d+/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
const extractExtFromStationCell = s => { const t = String(s ?? ""); const m = t.match(/ext\.?\s*(\d+)/i); return m?.[1] ? String(m[1]).trim() : ""; };

const formatStationWithExt = (branch, stations) => {
  if (!branch) return "—";
  let station = null;
  if (branch?.serviceStation) station = branch.serviceStation;
  else if (branch?.service_station_id && Array.isArray(stations)) station = stations.find(s => Number(s.id) === Number(branch.service_station_id)) || null;
  const sn = station?.name ? String(station.name).trim() : "";
  const ext = String(getStationExt(station) || "").trim();
  if (!sn && !ext) return "—";
  if (!sn && ext) return `Ext. ${ext}`;
  if (sn && !ext) return sn;
  return `${sn} (Ext. ${ext})`;
};

const normalizeStatusToOpenClosed = branchLike => {
  const c = branchLike?.connectivity;
  const statusRaw = c?.connectivity_status || branchLike?.connectivity_status || "";
  const v = String(statusRaw || "").trim().toLowerCase();
  if (!v) return "OPEN";
  if (["active","up","running","yes","ok","online"].includes(v)) return "OPEN";
  if (["down","inactive","no","disabled","dead","offline"].includes(v)) return "CLOSED";
  return "OPEN";
};

const normalizeRegion = raw => {
  if (!raw) return "";
  const s = String(raw).toLowerCase().replace(/[\u00A0\u200B]/g, " ").replace(/[\.\-_]/g, " ").replace(/\s+/g, " ").trim();
  if (/\bsub\s*bagmati\b/.test(s)) return "Sub Bagmati Pradesh";
  if (s.includes("koshi") || /\bprovince\s*1\b/.test(s)) return "Koshi Pradesh";
  if (s.includes("madhesh") || /\bprovince\s*2\b/.test(s)) return "Madhesh Pradesh";
  if (s.includes("bagmati") && !s.includes("sub")) return "Bagmati Pradesh";
  if (s.includes("gandaki") || /\bprovince\s*4\b/.test(s)) return "Gandaki Pradesh";
  if (s.includes("lumbini") || /\bprovince\s*5\b/.test(s)) return "Lumbini Pradesh";
  if (s.includes("karnali") || /\bprovince\s*6\b/.test(s)) return "Karnali Pradesh";
  if (s.includes("sudur paschim") || s.includes("sudurpashchim") || /\bprovince\s*7\b/.test(s)) return "Sudurpaschim Pradesh";
  const exact = String(raw).replace(/[\u00A0\u200B]/g, " ").trim();
  const allowed = new Set(["Koshi Pradesh","Madhesh Pradesh","Bagmati Pradesh","Sub Bagmati Pradesh","Gandaki Pradesh","Lumbini Pradesh","Karnali Pradesh","Sudurpaschim Pradesh"]);
  return allowed.has(exact) ? exact : "";
};

const getApiErrorMessage = err => {
  const status = err?.response?.status;
  const backend = err?.response?.data;
  if (!backend) return status ? `Request failed (${status})` : err?.message || "Unknown error";
  if (typeof backend === "string") return backend;
  const msg = backend?.message || "";
  const errors = backend?.errors;
  if (errors && typeof errors === "object") {
    const details = Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" | ");
    return [status ? `(${status})` : "", msg, details].filter(Boolean).join(" ");
  }
  return [status ? `(${status})` : "", msg || err?.message || "Request failed"].filter(Boolean).join(" ");
};

const buildBranchPayloadFromExcel = (row, importedByName, stations = []) => {
  const name = norm(pick(row, ["Branch Name","branch_name","name"]));
  const manager_name = norm(pick(row, ["Manager","Manager Name","manager_name","manager"]));
  const gateway = norm(pick(row, ["Gateway (IP)","Gateway","gateway","IP","ip","Default Gateway"]));
  const branch_code = norm(excelToPlainNumberString(pick(row, ["Branch Code","branch_code","BranchCode","Code"])));
  const contactRaw = pick(row, ["Contact","contact"]);
  const contact = onlyDigits(excelToPlainNumberString(contactRaw));
  const regionRaw = pick(row, ["Region","region"]);
  const region = normalizeRegion(regionRaw);
  const serviceStationIdRaw = pick(row, ["Service Station ID","service_station_id","station_id"]);
  let service_station_id = toIntOrNull(serviceStationIdRaw);
  if (!service_station_id) {
    const stationCell = pick(row, ["Service Station","ServiceStation","service_station","station"]);
    const stationCellText = norm(stationCell);
    if (stationCellText && Array.isArray(stations) && stations.length) {
      const wantedName = normalizeStationText(stationCellText);
      const wantedExt = extractExtFromStationCell(stationCellText);
      let found = stations.find(s => normalizeStationText(s?.name) === wantedName) || stations.find(s => normalizeStationText(s?.name).includes(wantedName));
      if (!found && wantedExt) found = stations.find(s => String(getStationExt(s) || "").trim() === wantedExt) || null;
      if (found?.id) service_station_id = Number(found.id);
    }
  }
  const remarks = norm(pick(row, ["Remarks","remarks"])) || `Last updated by ${importedByName}: Imported via Excel`;
  return { name, manager_name, gateway, contact, branch_code, region, service_station_id, remarks };
};

const buildGroupCountsFromBranchWithAssets = (branchWithAssets, subCatMap) => {
  const counts = {};
  const bump = (subCode) => {
    const code = String(subCode || "").trim();
    if (!code) return;
    const sub = subCatMap.get(code);
    const gid = sub?.group_id || sub?.groupId;
    if (!gid) return;
    const key = String(gid).trim().toUpperCase();
    counts[key] = (counts[key] || 0) + 1;
  };
  if (!branchWithAssets) return counts;
  safeArray(branchWithAssets?.connectivity).forEach(c => bump(c?.sub_category_code || "IN"));
  safeArray(branchWithAssets?.ups).forEach(u => bump(u?.sub_category_code || "UP"));
  ["scanners","projectors","printers","desktops","laptops","cctvs","panels","ipphones","applicationSoftware","officeSoftware","securitySoftware","securitySoftwareInstalled","utilitySoftware","services","licenses","windowsOS","windowsServers","servers","firewallRouters"]
    .forEach(k => safeArray(branchWithAssets?.[k]).forEach(r => bump(r?.sub_category_code)));
  return counts;
};

const countAssets = branchWithAssets => {
  if (!branchWithAssets) return 0;
  let n = 0;
  ["connectivity","ups","scanners","projectors","printers","desktops","laptops","cctvs","panels","ipphones","applicationSoftware","officeSoftware","securitySoftware","securitySoftwareInstalled","utilitySoftware","services","licenses","windowsOS","windowsServers","servers","firewallRouters"]
    .forEach(k => (n += safeArray(branchWithAssets?.[k]).length));
  return n;
};

const downloadCSV = (rows, filename = "branches.csv") => {
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map(r => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};
const asExcelText = v => { const s = String(v ?? "").trim(); if (!s) return ""; return `="${s}"`; };

/* ─── UI Atoms ─── */
const Spinner = ({ size = 28, color }) => (
  <div className="bp-spinner" style={{ width:size, height:size, borderTopColor:color || "var(--blue-500)" }} />
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="bp-detail-card-header">
    <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,var(--blue-500),var(--green-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>{subtitle}</div>}
    </div>
  </div>
);

/* ─── Region colors ─── */
const regionColor = r => {
  const map = {
    "Bagmati Pradesh": { bg:"var(--blue-50)", color:"var(--blue-700)", border:"var(--blue-200)" },
    "Sub Bagmati Pradesh": { bg:"#f0f9ff", color:"#0369a1", border:"#bae6fd" },
    "Koshi Pradesh": { bg:"var(--green-50)", color:"var(--green-700)", border:"var(--green-200)" },
    "Madhesh Pradesh": { bg:"var(--amber-50)", color:"var(--amber-600)", border:"var(--amber-100)" },
    "Gandaki Pradesh": { bg:"#f5f3ff", color:"#6d28d9", border:"#ddd6fe" },
    "Lumbini Pradesh": { bg:"#fdf4ff", color:"#86198f", border:"#f5d0fe" },
    "Karnali Pradesh": { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
    "Sudurpaschim Pradesh": { bg:"#f0fdfa", color:"#0f766e", border:"#99f6e4" },
  };
  return map[r] || { bg:"var(--gray-100)", color:"var(--gray-600)", border:"var(--gray-200)" };
};

function Ic({ d, size = 15 }) {
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

const D = {
  branch:
    "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:
    "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  help:
    "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  graph:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
};

const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
/* ─── Main Component ─── */
export default function Branch({ embedded = false, onPickBranch = null, hideFooter = false }) {
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  // "hero" | "filters" | ""
  const [showPanel, setShowPanel] = useState("");
  const navigate = useNavigate();
  const canManage = isAdmin ;
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";
  const currentUserName = user?.name || user?.email || "Unknown User";

  const [allBranches, setAllBranches] = useState([]);
  const [serviceStations, setServiceStations] = useState([]);
  const [allRegions, setAllRegions] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const branchNameInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewBranch, setPreviewBranch] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [previewBranchId, setPreviewBranchId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [previewGroupCounts, setPreviewGroupCounts] = useState({});
  const branchesAssetsCacheRef = useRef(null);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterStationId, setFilterStationId] = useState("");
  const [branchAssetTotals, setBranchAssetTotals] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const fileInputRef = useRef(null);

  const activeFiltersCount = [search, filterRegion, filterStationId].filter(Boolean).length;

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const sidebarWidth = () => {
    if (windowWidth < 640) return menuOpen ? "85vw" : "0";
    if (windowWidth < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const togglePanel = (panel) => setShowPanel(prev => prev === panel ? "" : panel);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm, setValues } = useForm(initialBranchValues, onSubmitForm);

  useEffect(() => {
    if (!showModal) return;
    requestAnimationFrame(() => {
      const body = document.querySelector(".modal-body");
      if (body) body.scrollTo({ top:0, behavior:"smooth" });
      if (branchNameInputRef.current) { branchNameInputRef.current.focus(); branchNameInputRef.current.scrollIntoView({ behavior:"smooth", block:"center" }); }
    });
  }, [showModal]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = e => { if (e.key === "Escape") closePreview(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  const fetchServiceStations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/service-stations", { headers:{ Authorization:`Bearer ${token}` } });
      const payload = res?.data?.data ?? res?.data ?? [];
      setServiceStations(Array.isArray(payload) ? payload : []);
    } catch {}
  }, [token]);

  const fetchAllBranches = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await api.get("/api/branches/all", { headers:{ Authorization:`Bearer ${token}` } });
      const list = res?.data?.data ?? res?.data ?? [];
      return Array.isArray(list) ? list : [];
    } catch {}
    const out = []; let page = 1; const limit = 200;
    for (let guard = 0; guard < 200; guard++) {
      const res = await api.get("/api/branches", { params:{ page, limit }, headers:{ Authorization:`Bearer ${token}` } });
      const data = res?.data?.data ?? [];
      const pagination = res?.data?.pagination ?? {};
      const arr = Array.isArray(data) ? data : [];
      out.push(...arr);
      const pages = Number(pagination.pages || 1);
      if (page >= pages) break;
      page += 1;
    }
    return out;
  }, [token]);

  const hydrateAllBranches = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await fetchAllBranches();
      setAllBranches(Array.isArray(list) ? list : []);
    } catch (err) {
      setAlert({ type:"error", title:"Error", message:err?.response?.data?.message || "Failed to fetch branches" });
      setAllBranches([]);
    } finally { setLoading(false); }
  }, [token, fetchAllBranches]);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    try { const res = await api.get("/api/asset-groups", { headers:{ Authorization:`Bearer ${token}` } }); setGroups(res?.data?.data || []); } catch { setGroups([]); }
  }, [token]);

  const fetchSubCats = useCallback(async () => {
    if (!token) return;
    try { const res = await api.get("/api/asset-sub-categories", { headers:{ Authorization:`Bearer ${token}` } }); setSubCats(res?.data?.data || []); } catch { setSubCats([]); }
  }, [token]);

  const fetchBranchesWithAssetsAllOnce = useCallback(async () => {
    if (!token) return [];
    if (branchesAssetsCacheRef.current) return branchesAssetsCacheRef.current;
    const res = await api.get("/api/branches/with-assets/all", { headers:{ Authorization:`Bearer ${token}` } });
    const payload = res?.data?.data ?? res?.data ?? [];
    const list = Array.isArray(payload) ? payload : [];
    branchesAssetsCacheRef.current = list;
    return list;
  }, [token]);

  const hydrateAllRegions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/branches/all", { headers:{ Authorization:`Bearer ${token}` } });
      const list = res?.data?.data ?? res?.data ?? [];
      const set = new Set();
      for (const b of list || []) { const r = String(b?.region || "").trim(); if (r) set.add(r); }
      setAllRegions(Array.from(set).sort((a, b) => a.localeCompare(b)));
    } catch { setAllRegions([]); }
  }, [token]);

  const hydrateAssetTotals = useCallback(async () => {
    if (!token) return;
    try {
      const all = await fetchBranchesWithAssetsAllOnce();
      const m = {};
      for (const b of all) { const id = Number(b?.id); if (!id) continue; m[id] = countAssets(b); }
      setBranchAssetTotals(m);
    } catch { setBranchAssetTotals({}); }
  }, [token, fetchBranchesWithAssetsAllOnce]);

  useEffect(() => {
    if (!token) return;
    hydrateAllBranches(); fetchServiceStations(); fetchGroups(); fetchSubCats(); hydrateAssetTotals(); hydrateAllRegions();
  }, [token, hydrateAllBranches, fetchServiceStations, fetchGroups, fetchSubCats, hydrateAssetTotals, hydrateAllRegions]);

  const regionOptions = useMemo(() => {
    const defaults = ["Koshi Pradesh","Madhesh Pradesh","Bagmati Pradesh","Sub Bagmati Pradesh","Gandaki Pradesh","Lumbini Pradesh","Karnali Pradesh","Sudurpaschim Pradesh"];
    const merged = new Set([...(allRegions || []), ...defaults]);
    return [...merged].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [allRegions]);

  const filteredBranches = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase();
    const stationNameFor = b => {
      let station = b?.serviceStation;
      if (!station && b?.service_station_id) station = serviceStations.find(s => Number(s.id) === Number(b.service_station_id));
      return String(station?.name || "").toLowerCase();
    };
    return (allBranches || []).filter(b => {
      if (q) {
        const name = String(b.name || "").toLowerCase();
        const gw = String(b.gateway || "").toLowerCase();
        const mgr = String(b.manager_name || "").toLowerCase();
        const stn = stationNameFor(b);
        const bc = String(b.branch_code || "").toLowerCase();
        if (!name.includes(q) && !gw.includes(q) && !mgr.includes(q) && !stn.includes(q) && !bc.includes(q)) return false;
      }
      if (filterRegion && String(b.region || "").trim() !== filterRegion) return false;
      if (filterStationId && String(b.service_station_id || "") !== String(filterStationId)) return false;
      return true;
    });
  }, [allBranches, debouncedSearch, filterRegion, filterStationId, serviceStations]);

  const totalItems = filteredBranches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterRegion, filterStationId, pageSize]);

  const buildFinalRemarks = () => `Last updated by ${currentUserName}: ${String(newRemark ?? "").trim()}`;

  async function onSubmitForm(formValues) {
    if (!canManage) { setAlert({ type:"error", title:"Error", message:"You do not have permission" }); return; }
    if (!String(newRemark ?? "").trim()) { setAlert({ type:"error", title:"Remarks Required", message:"Please write remarks before saving." }); return; }
    const payload = { ...formValues, service_station_id:formValues.service_station_id ? Number(formValues.service_station_id) : null, remarks:buildFinalRemarks() };
    try {
      if (editingId) { await api.put(`/api/branches/${editingId}`, payload, { headers:{ Authorization:`Bearer ${token}` } }); setAlert({ type:"success", title:"Success", message:"Branch updated!" }); }
      else { await api.post("/api/branches", payload, { headers:{ Authorization:`Bearer ${token}` } }); setAlert({ type:"success", title:"Success", message:"Branch added!" }); }
      resetForm(); setNewRemark(""); setEditingId(null); setShowModal(false); setCurrentPage(1);
      hydrateAllBranches(); hydrateAssetTotals(); hydrateAllRegions();
    } catch (err) { setAlert({ type:"error", title:"Error", message:getApiErrorMessage(err) }); }
  }

  const handleOpenForm = useCallback(() => { if (!canManage) return; setEditingId(null); resetForm(); setNewRemark(""); setShowModal(true); }, [canManage, resetForm]);
  const handleEdit = useCallback(branch => {
    if (!canManage) return;
    setEditingId(branch.id);
    if (typeof setValues === "function") {
      setValues({ name:branch.name||"", manager_name:branch.manager_name||"", branch_code:branch.branch_code||"", gateway:branch.gateway||"", contact:branch.contact||"", service_station_id:branch.service_station_id?String(branch.service_station_id):"", region:branch.region||"", remarks:branch.remarks||"" });
    } else resetForm();
    setNewRemark(""); setShowModal(true);
  }, [canManage, setValues, resetForm]);
  const closeModal = useCallback(() => { setShowModal(false); resetForm(); setEditingId(null); setNewRemark(""); }, [resetForm]);

  const subCatMap = useMemo(() => { const m = new Map(); for (const s of subCats || []) if (s?.code) m.set(String(s.code), s); return m; }, [subCats]);

  const openPreview = async id => {
    if (!token) return;
    setPreviewBranchId(id); setPreviewOpen(true); setPreviewLoading(true); setPreviewBranch(null); setPreviewGroupCounts({}); setPreviewError(null);
    try {
      const res = await api.get(`/api/branches/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      const payload = res?.data?.data ?? res?.data ?? null;
      if (!payload) throw new Error("Branch detail not found");
      setPreviewBranch(payload);
      const all = await fetchBranchesWithAssetsAllOnce();
      const found = all.find(b => Number(b?.id) === Number(id));
      if (!found) { setPreviewGroupCounts({}); return; }
      setPreviewGroupCounts(buildGroupCountsFromBranchWithAssets(found, subCatMap));
    } catch (e) { setPreviewError(getApiErrorMessage(e)); }
    finally { setPreviewLoading(false); }
  };

  const closePreview = () => { setPreviewOpen(false); setPreviewBranch(null); setPreviewGroupCounts({}); setPreviewError(null); setPreviewLoading(false); setPreviewBranchId(null); };

  const onOpenFullDetails = id => {
    if (!id) return;
    if (embedded && typeof onPickBranch === "function") { onPickBranch(id); closePreview(); return; }
    closePreview();
    navigate(`/branch-assets-report?branchId=${id}`);
  };

  const derivedStatus = useMemo(() => { if (!previewBranch) return "—"; return normalizeStatusToOpenClosed(previewBranch); }, [previewBranch]);
  const remarksText = String(previewBranch?.remarks || previewBranch?.remark || previewBranch?.Remarks || "—").trim() || "—";

  const { chartData, totalAssets } = useMemo(() => {
    const gs = Array.isArray(groups) ? groups : [];
    if (!gs.length) return { chartData:[], totalAssets:0 };
    const data = gs.map(g => ({ name:`${g.name} (${g.id})`, value:Number(previewGroupCounts?.[String(g.id).toUpperCase()] || 0) })).filter(x => x.value > 0);
    return { chartData:data, totalAssets:data.reduce((s, x) => s + x.value, 0) };
  }, [groups, previewGroupCounts]);

  const onExportCSV = () => {
    const rows = filteredBranches.map(b => {
      const station = formatStationWithExt(b, serviceStations);
      const assets = branchAssetTotals?.[Number(b.id)] ?? "";
      return [b.id, b.name, b.manager_name||"", b.gateway||"", asExcelText(b.branch_code), asExcelText(onlyDigits(b.contact)), station, b.region||"", assets];
    });
    downloadCSV([["ID","Branch Name","Manager","Gateway (IP)","Branch Code","Contact","Service Station","Region","Assets"], ...rows], "branch_list.csv");
  };

  const onClickImport = () => { if (!canManage) { setAlert({ type:"error", title:"Error", message:"You do not have permission" }); return; } fileInputRef.current?.click(); };

  const onImportFile = async e => {
    try {
      const file = e.target.files?.[0]; e.target.value = "";
      if (!file || !token) return;
      setLoading(true); setAlert({ type:"success", title:"Import Started", message:"Reading Excel…" });
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type:"array" });
      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("No sheet found");
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:"" });
      if (!Array.isArray(rows) || rows.length === 0) throw new Error("Excel has no rows");
      const stations = Array.isArray(serviceStations) && serviceStations.length ? serviceStations : [];
      const allExisting = await fetchAllBranches();
      const byId = new Map(); const byCode = new Map(); const byName = new Map();
      for (const b of allExisting) {
        const id = Number(b?.id); if (id) byId.set(id, b);
        const code = String(b?.branch_code||"").trim().toLowerCase(); if (code) byCode.set(code, b);
        const name = String(b?.name||"").trim().toLowerCase(); if (name) byName.set(name, b);
      }
      let created = 0, updated = 0, skipped = 0; const failedRows = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]; const excelRowNo = i + 2;
        const idRaw = pick(row, ["ID","id"]); const idFromExcel = toIntOrNull(idRaw);
        const payload = buildBranchPayloadFromExcel(row, currentUserName, stations);
        if (!payload.name) { skipped++; failedRows.push({ row:excelRowNo, branch:"(empty)", reason:"Missing Branch Name" }); continue; }
        if (!payload.region) { skipped++; failedRows.push({ row:excelRowNo, branch:payload.name, reason:`Invalid Region: "${String(pick(row,["Region","region"])||"")}"` }); continue; }
        payload.service_station_id = payload.service_station_id ? Number(payload.service_station_id) : null;
        const codeKey = String(payload.branch_code||"").trim().toLowerCase();
        const nameKey = String(payload.name||"").trim().toLowerCase();
        const matched = (idFromExcel && byId.get(Number(idFromExcel))) || (codeKey && byCode.get(codeKey)) || (nameKey && byName.get(nameKey)) || null;
        const targetId = matched?.id ? Number(matched.id) : null;
        try {
          if (targetId) { await api.put(`/api/branches/${targetId}`, payload, { headers:{ Authorization:`Bearer ${token}` } }); updated++; }
          else { await api.post("/api/branches", payload, { headers:{ Authorization:`Bearer ${token}` } }); created++; }
        } catch (err) { skipped++; failedRows.push({ row:excelRowNo, branch:payload.name, reason:getApiErrorMessage(err) }); }
      }
      const failText = failedRows.slice(0,10).map(f => `Row ${f.row} (${f.branch}): ${f.reason}`).join("\n");
      setAlert({ type:failedRows.length?"error":"success", title:"Import Finished", message:`Created: ${created}, Updated: ${updated}, Failed: ${skipped}${failText?`\n\n${failText}`:""}` });
      branchesAssetsCacheRef.current = null; setCurrentPage(1); hydrateAllBranches(); hydrateAssetTotals(); hydrateAllRegions();
    } catch (err) { setAlert({ type:"error", title:"Import Failed", message:getApiErrorMessage(err) }); }
    finally { setLoading(false); }
  };

    const navItems = [
  { label: "Analytics", path: "/assetdashboard", icon: makeIcon(D.graph) },
  { label: "Branches", path: "/branches", icon: makeIcon(D.branch) },
  { label: "Asset Master", path: "/branch-assets-report", icon: makeIcon(D.assets) },
  { label: "Requests", path: "/requests", icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
  { label: "Users", path: "/admin/users", icon: makeIcon(D.users), show: isAdmin },
  { label: "Asset Tracking", path: "/asset-tracking", icon: makeIcon(D.graph) },
  { label: "Help & Support", path: "/support", icon: makeIcon(D.help) },
].filter((item) => item.show !== false);

  if (loading && allBranches.length === 0) {
    return embedded ? (
      <div style={{ background:"white", padding:12 }}><SkeletonTable rows={5} cols={10} /></div>
    ) : (
      <>
        <main style={{ background:"var(--gray-50)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
          <Spinner size={40} /><p style={{ color:"var(--gray-500)", fontSize:14, fontWeight:500, fontFamily:"DM Sans,sans-serif" }}>Loading branches…</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SplitSidebarLayout
        navItems={navItems}
        user={user}
        brand={{ initials: "NL", name: "Nepal Life", subtext: "Asset IMS" }}
      >
    <div className="bp-root">
      <style>{FONTS}{BRANCH_STYLES}</style>
      <div className="bp-layout">

        {/* ─── MAIN ─── */}
        <main className="bp-main">
          {/* ─── Topbar ─── */}
          <div className="bp-topbar">
            <div className="bp-topbar-left">
              <div style={{ width:1, height:20, background:"var(--gray-200)" }} />
              <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>Branch Management</div>
            </div>
              {canManage &&(
            <div className="bp-topbar-right">
              <button className="bp-btn bp-btn-blue-outline bp-btn-sm" onClick={onExportCSV}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="bp-btn-label">Export</span>
              </button>
                  <button className="bp-btn bp-btn-green-outline bp-btn-sm" onClick={onClickImport}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                    <span className="bp-btn-label">Import</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} style={{ display:"none" }} />
                  <button className="bp-btn bp-btn-success bp-btn-sm" onClick={handleOpenForm}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Branch
                  </button>
            </div>
              )}
          </div>

          {/* ─── Panel Toggle Bar ─── */}
          <div className="bp-panel-toggle-bar">
            <button className={`bp-toggle-pill ${showPanel === "hero" ? "active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ <span>Overview</span>
            </button>
            <button className={`bp-toggle-pill ${showPanel === "filters" ? "active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 <span>Filters</span>
              {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
            </button>

            {/* Active filter chips */}
            <div className="bp-active-filters">
              {search && (
                <span className="bp-filter-chip">
                  🔎 "{search.length > 14 ? search.slice(0,14)+"…" : search}"
                  <button onClick={() => setSearch("")} title="Clear search">×</button>
                </span>
              )}
              {filterRegion && (
                <span className="bp-filter-chip">
                  🗺 {filterRegion.length > 16 ? filterRegion.slice(0,16)+"…" : filterRegion}
                  <button onClick={() => setFilterRegion("")} title="Clear region">×</button>
                </span>
              )}
              {filterStationId && (
                <span className="bp-filter-chip">
                  📡 Station #{filterStationId}
                  <button onClick={() => setFilterStationId("")} title="Clear station">×</button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button className="bp-clear-all" onClick={() => { setSearch(""); setFilterRegion(""); setFilterStationId(""); }}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <span className="bp-badge bp-badge-blue" style={{ fontSize:11 }}>{pagedBranches.length} / {totalItems}</span>
              <span className="bp-badge bp-badge-gray" style={{ fontSize:11 }}>{roleLabel}</span>
            </div>
          </div>

          {/* ─── Collapsible: Hero ─── */}
          <div className={`bp-collapsible-panel ${showPanel === "hero" ? "open" : ""}`}>
            <div className="bp-filter-card" style={{ margin:"2px 2px 0" }}>
              <NepalLifeHero />
            </div>
          </div>

          {/* ─── Collapsible: Filters ─── */}
          <div className={`bp-collapsible-panel ${showPanel === "filters" ? "open" : ""}`}>
            <div className="bp-filter-card1" style={{ margin:"2px 2px 0" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, alignItems:"end" }}>
                <div style={{ gridColumn:"span 2", minWidth:0 }}>
                  <label className="bp-label">Search</label>
                  <div className="bp-search-wrap">
                    <input type="text" placeholder="Name, code, manager, gateway…" className="bp-input" value={search} onChange={e => setSearch(e.target.value)} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="bp-label">Region</label>
                  <select className="bp-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
                    <option value="">All Regions</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bp-label">Service Station</label>
                  <select className="bp-select" value={filterStationId} onChange={e => setFilterStationId(e.target.value)}>
                    <option value="">All Stations</option>
                    {serviceStations.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}{getStationExt(s) ? ` (Ext. ${getStationExt(s)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="bp-content">
            {alert && <div style={{ margin:"8px 0" }}><Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} /></div>}

            {/* Branch Form Modal */}
            <Modal
              isOpen={showModal}
              title={
                <div style={{ textAlign:"center" }}>
                  <span style={{ fontSize:17, fontWeight:700, color:"var(--gray-900)", fontFamily:"Outfit,sans-serif" }}>
                    {editingId ? "Edit Branch" : "Add New Branch"}
                  </span>
                  <p style={{ fontSize:12, color:"var(--gray-500)", margin:"4px 0 0", fontWeight:400 }}>Manage branch details and configuration</p>
                </div>
              }
              onClose={closeModal}
              actions={
                <div style={{ display:"flex", justifyContent:"flex-end", gap:10, width:"100%", borderTop:"1px solid var(--gray-200)", paddingTop:16 }}>
                  <Button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all duration-200 mb-2">✖ Cancel</Button>
                  <Button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl transition-all duration-200 mb-2">
                    {editingId ? "💾 Update Branch" : "💾 Add Branch"}
                  </Button>
                </div>
              }
            >
              <form onSubmit={handleSubmit} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, padding:"20px 24px" }}>
                <FormInput label="Branch Name" name="name" placeholder="Enter branch name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} touched={touched.name} required inputRef={branchNameInputRef} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm" />
                <FormInput label="Manager Name" name="manager_name" placeholder="Enter manager name" value={values.manager_name} onChange={handleChange} onBlur={handleBlur} error={errors.manager_name} touched={touched.manager_name} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm" />
                <FormInput label="Branch Code" name="branch_code" placeholder="e.g. 423" value={values.branch_code} onChange={handleChange} onBlur={handleBlur} error={errors.branch_code} touched={touched.branch_code} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm" />
                <FormInput label="Gateway (IP)" name="gateway" placeholder="e.g. 192.168.221.253" value={values.gateway} onChange={handleChange} onBlur={handleBlur} error={errors.gateway} touched={touched.gateway} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm" />
                <FormInput label="Contact Number" name="contact" placeholder="98XXXXXXXX" value={values.contact} onChange={(e) => { const value = e.target.value.replace(/\D/g,"").slice(0,10); handleChange({ target:{ name:"contact", value } }); }} onBlur={handleBlur} error={errors.contact} touched={touched.contact} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm" />
                <div>
                  <label style={{ fontSize:14, fontWeight:500, marginBottom:6, display:"block" }}>Service Station</label>
                  <select name="service_station_id" value={values.service_station_id} onChange={handleChange} onBlur={handleBlur} style={{ width:"100%", padding:"9px 13px", borderRadius:10, border:"1.5px solid #e2e8f0", outline:"none", fontSize:13.5 }}>
                    <option value="">-- Select Service Station --</option>
                    {serviceStations.map(s => <option key={s.id} value={s.id}>{s.name}{getStationExt(s) ? ` (Ext. ${getStationExt(s)})` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:14, fontWeight:500, marginBottom:6, display:"block" }}>Region</label>
                  <select name="region" value={values.region} onChange={handleChange} onBlur={handleBlur} style={{ width:"100%", padding:"9px 13px", borderRadius:10, border:"1.5px solid #e2e8f0", outline:"none", fontSize:13.5, background:"white" }}>
                    <option value="">-- Select Region --</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {canManage && (
                  <div style={{ gridColumn:"1 / -1" }}>
                    <label style={{ fontSize:14, fontWeight:500, marginBottom:6, display:"block" }}>Remarks <span style={{ color:"var(--red-500)" }}>*</span></label>
                    <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ padding:"9px 12px", background:"var(--gray-100)", border:"1.5px solid var(--gray-200)", borderRadius:9, fontSize:11, fontWeight:700, color:"var(--gray-600)", whiteSpace:"nowrap", flexShrink:0 }}>By {currentUserName}:</span>
                      <textarea value={newRemark} onChange={e => setNewRemark(e.target.value)} placeholder="Write remarks…" rows={3} style={{ width:"100%", padding:"9px 13px", borderRadius:10, border:"1.5px solid #e2e8f0", outline:"none", fontSize:13.5, resize:"vertical", fontFamily:"DM Sans,sans-serif" }} />
                    </div>
                  </div>
                )}
              </form>
            </Modal>

            {/* ─── Table ─── */}
            <div className="bp-table-card" style={{ overflowX:"auto" }}>
              {loading && allBranches.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:14 }}>
                  <Spinner size={40} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading branches…</p>
                </div>
              ) : pagedBranches.length ? (
                <table className="bp-table">
                  <thead>
                    <tr>
                      {["#","Branch Code","Branch Name","Gateway (IP)","Contact","Service Station","Region","Assets",...(canManage?["Edit"]:[]),"View"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBranches.map((b, idx) => {
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                      const rc = regionColor(b.region);
                      const assets = branchAssetTotals?.[Number(b.id)];
                      return (
                        <tr key={b.id} onClick={() => openPreview(b.id)}>
                          <td style={{ color:"var(--gray-400)", fontWeight:600, fontFamily:"Outfit,sans-serif", fontSize:12 }}>{globalIdx}</td>
                          <td><span className="bp-badge bp-badge-blue">{b.branch_code || "—"}</span></td>
                          <td>
                            <div style={{ fontWeight:700, color:"var(--gray-900)", fontSize:13.5 }}>{b.name}</div>
                            {b.manager_name && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:2 }}>Mgr: {b.manager_name}</div>}
                          </td>
                          <td><span className="bp-mono">{b.gateway || "—"}</span></td>
                          <td style={{ color:"var(--gray-600)", fontSize:13 }}>{b.contact || "—"}</td>
                          <td style={{ color:"var(--gray-600)", fontSize:12 }}>{formatStationWithExt(b, serviceStations)}</td>
                          <td>
                            {b.region ? (
                              <span className="bp-badge" style={{ background:rc.bg, color:rc.color, border:`1px solid ${rc.border}`, fontSize:10 }}>{b.region}</span>
                            ) : "—"}
                          </td>
                          <td>
                            {assets !== undefined ? (
                              <span className="bp-badge bp-badge-green">{assets}</span>
                            ) : <span style={{ color:"var(--gray-300)", fontSize:12 }}>—</span>}
                          </td>
                          {canManage && (
                            <td>
                              <button className="bp-btn bp-btn-amber bp-btn-sm" onClick={e => { e.stopPropagation(); handleEdit(b); }}>✏ Edit</button>
                            </td>
                          )}
                          <td>
                            <button className="bp-btn bp-btn-primary bp-btn-sm" onClick={e => { e.stopPropagation(); openPreview(b.id); }}>View →</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="bp-empty">
                  <svg width="56" height="56" fill="none" stroke="var(--gray-200)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No branches found</p>
                  <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>Try adjusting your filters or add a new branch</p>
                  {canManage && <button className="bp-btn bp-btn-success" onClick={handleOpenForm}>+ Add First Branch</button>}
                </div>
              )}
            </div>

            {totalItems > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => setCurrentPage(p)} pageSize={pageSize} onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }} totalItems={totalItems} />
            )}

            {/* ─── Branch Preview Modal ─── */}
            {previewOpen && (
              <div className="bp-preview-overlay" onClick={e => { if (e.target === e.currentTarget) closePreview(); }}>
                <div className="bp-preview-panel">
                  <div className="bp-preview-header">
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.55)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8, fontFamily:"Outfit,sans-serif" }}>Branch Preview</div>
                        {previewLoading ? (
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div className="bp-spinner" style={{ width:20, height:20, borderColor:"rgba(255,255,255,0.2)", borderTopColor:"white" }} />
                            <span style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>Loading…</span>
                          </div>
                        ) : (
                          <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"clamp(1.1rem,3vw,1.5rem)", color:"white", letterSpacing:"-0.02em", marginBottom:10 }}>
                            {previewBranch?.name || "Branch Preview"}
                          </div>
                        )}
                        {!previewLoading && previewBranch && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:7, alignItems:"center" }}>
                            {previewBranch.branch_code && (
                              <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:7, background:"rgba(255,255,255,0.15)", fontSize:11, fontWeight:700, color:"white", fontFamily:"Outfit,sans-serif" }}>#{previewBranch.branch_code}</span>
                            )}
                            {previewBranch.region && (
                              <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:7, background:"rgba(255,255,255,0.12)", fontSize:11, color:"rgba(255,255,255,0.8)" }}>🗺 {previewBranch.region}</span>
                            )}
                            <span className={`bp-status ${derivedStatus === "OPEN" ? "bp-status-open" : "bp-status-closed"}`} style={{ background:derivedStatus === "OPEN" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)", borderColor:derivedStatus === "OPEN" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)", color:derivedStatus === "OPEN" ? "#4ade80" : "#f87171" }}>
                              {derivedStatus}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        {previewBranchId && (
                          <button className="bp-btn bp-btn-sm" style={{ background:"rgba(19,16,202,0.9)", border:"1.5px solid rgba(25,224,58,0.3)", color:"white", fontWeight:600 }} onClick={() => onOpenFullDetails(previewBranchId)}>
                            Asset Detail
                          </button>
                        )}
                        {canManage && previewBranch && (
                          <button className="bp-btn bp-btn-sm" style={{ background:"rgba(245,158,11,0.25)", border:"1.5px solid rgba(245,158,11,0.4)", color:"#fcd34d" }} onClick={() => { closePreview(); handleEdit(previewBranch); }}>
                            ✏ Edit
                          </button>
                        )}
                        <button className="bp-btn bp-btn-sm" style={{ background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)" }} onClick={closePreview}>
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bp-preview-body">
                    {previewError ? (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 0", gap:12, textAlign:"center" }}>
                        <div style={{ fontSize:36 }}>⚠️</div>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--red-600)" }}>{previewError}</div>
                      </div>
                    ) : (
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:18 }}>
                        <div className="bp-detail-card">
                          <SectionHeader icon="🏢" title="Branch Information" subtitle="Core details & contact" />
                          <div className="bp-detail-card-body">
                            {previewLoading ? (
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 0", gap:10 }}>
                                <Spinner size={28} /><span style={{ color:"var(--gray-400)", fontSize:13 }}>Loading…</span>
                              </div>
                            ) : previewBranch && (() => {
                              const rc = regionColor(previewBranch.region);
                              return [
                                ["Branch Name", previewBranch?.name],
                                ["Branch Code", previewBranch?.branch_code || "—"],
                                ["Manager", previewBranch?.manager_name || "—"],
                                ["Gateway IP", previewBranch?.gateway || "—"],
                                ["Contact", previewBranch?.contact || "—"],
                                ["Service Station", formatStationWithExt(previewBranch, serviceStations)],
                                ["Region", previewBranch?.region || "—"],
                                ["Total Assets", totalAssets || "—"],
                                ["Remarks", remarksText],
                              ].map(([label, value], i) => (
                                <div key={i} className="bp-detail-row">
                                  <div className="bp-detail-label">{label}</div>
                                  <div className="bp-detail-value">
                                    {label === "Gateway IP" && value !== "—" ? (
                                      <span className="bp-mono">{value}</span>
                                    ) : label === "Region" && value !== "—" ? (
                                      <span className="bp-badge" style={{ background:rc.bg, color:rc.color, border:`1px solid ${rc.border}`, fontSize:11 }}>{value}</span>
                                    ) : (
                                      <span>{value || "—"}</span>
                                    )}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        <div className="bp-detail-card">
                          <div style={{ padding:"14px 18px", background:"var(--gray-50)", borderBottom:"1.5px solid var(--gray-200)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,var(--green-500),var(--blue-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📊</div>
                              <div>
                                <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>Asset Distribution</div>
                                <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>By category group</div>
                              </div>
                            </div>
                            {!previewLoading && totalAssets > 0 && (
                              <span className="bp-badge bp-badge-green">{totalAssets} Total</span>
                            )}
                          </div>
                          <div style={{ padding:"16px 18px" }}>
                            {previewLoading ? (
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:10 }}>
                                <Spinner size={28} color="var(--green-500)" /><span style={{ color:"var(--gray-400)", fontSize:13 }}>Loading chart…</span>
                              </div>
                            ) : chartData.length ? (
                              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                                <div style={{ position:"relative", height:220, borderRadius:12, border:"1.5px solid var(--gray-100)", background:"var(--gray-50)", overflow:"hidden" }}>
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3}>
                                        {chartData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                      </Pie>
                                      <Tooltip contentStyle={{ borderRadius:10, border:"1.5px solid var(--gray-200)", fontSize:12 }} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                                    <div style={{ background:"white", borderRadius:10, padding:"8px 14px", textAlign:"center", border:"1.5px solid var(--gray-200)", boxShadow:"var(--shadow)" }}>
                                      <div style={{ fontSize:10, fontWeight:700, color:"var(--gray-400)", fontFamily:"Outfit,sans-serif", letterSpacing:"0.1em" }}>TOTAL</div>
                                      <div style={{ fontSize:20, fontWeight:900, color:"var(--gray-900)", fontFamily:"Outfit,sans-serif" }}>{totalAssets}</div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                                  {groups.map((g, idx) => {
                                    const key = String(g.id).toUpperCase();
                                    const count = Number(previewGroupCounts?.[key] || 0);
                                    if (!count) return null;
                                    const pct = totalAssets ? Math.round((count / totalAssets) * 100) : 0;
                                    const clr = PIE_COLORS[idx % PIE_COLORS.length];
                                    return (
                                      <div key={g.id} className="bp-legend-item">
                                        <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                                          <div style={{ width:9, height:9, borderRadius:"50%", background:clr, flexShrink:0 }} />
                                          <div style={{ fontWeight:600, color:"var(--gray-800)", fontSize:12.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                            {g.name} <span style={{ color:"var(--gray-400)", fontSize:11 }}>({key})</span>
                                          </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                                          <div style={{ width:56, height:4, borderRadius:999, background:"var(--gray-100)", overflow:"hidden" }}>
                                            <div style={{ height:"100%", width:`${pct}%`, background:clr, borderRadius:999, transition:"width 0.4s ease" }} />
                                          </div>
                                          <span style={{ fontWeight:800, color:"var(--gray-900)", fontSize:13, fontFamily:"Outfit,sans-serif", minWidth:22, textAlign:"right" }}>{count}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div style={{ textAlign:"center", padding:"48px 0", color:"var(--gray-400)" }}>
                                <div style={{ fontSize:34, marginBottom:10 }}>📭</div>
                                <div style={{ fontWeight:600, fontSize:14, fontFamily:"Outfit,sans-serif" }}>No assets found</div>
                                <div style={{ fontSize:12, marginTop:4 }}>Assets will appear here once added</div>
                              </div>
                            )}
                            <div style={{ marginTop:14, fontSize:11, color:"var(--gray-400)", textAlign:"center" }}>
                              Press <kbd style={{ background:"var(--gray-100)", border:"1px solid var(--gray-200)", borderRadius:4, padding:"1px 5px", fontSize:10 }}>ESC</kbd> or click outside to close
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
      </SplitSidebarLayout>
      {!hideFooter && !embedded && <Footer />}
      </>
  );
}
