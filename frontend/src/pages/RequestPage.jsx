// src/pages/RequestPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm, useDebounce } from "../hooks";
import api from "../services/api";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import Button from  '../components/common/Button';
import Alert from '../components/common/Alert';
import { SkeletonTable } from '../components/common/Loading';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import NepalLifeLogo from "../assets/nepallife.png";
import "../styles/Pages.css";

/* ─── Google Fonts ─── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const NL_BLUE       = "#0B5CAB";
const NL_BLUE2      = "#1474F3";
const NL_RED        = "#f31225ef";
const NL_GRADIENT   = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

/* ─── Styles (mirrors Branch.jsx) ─── */
const RP_STYLES = `
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
  .rp-root { font-family:'DM Sans',sans-serif; background:var(--gray-50); max-height:90vh; color:var(--gray-900); }
  .rp-layout { display:flex; max-height:100vh; }

  /* ─── Sidebar ─── */
  .rp-sidebar {
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative; overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1);
    flex-shrink:0;
  }
  .rp-sidebar::before {
    content:''; position:absolute; top:-70px; right:-50px;
    width:180px; height:180px; border-radius:50%;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .rp-sidebar::after {
    content:''; position:absolute; bottom:-50px; left:-30px;
    width:140px; height:140px; border-radius:50%;
    background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%);
    pointer-events:none;
  }
  .rp-sidebar-inner {
    height:100%; display:flex; flex-direction:column;
    padding:26px 20px; min-width:220px; position:relative; z-index:1;
  }
  .rp-nav-item {
    display:flex; align-items:center; gap:11px;
    padding:11px 14px; border-radius:13px;
    background:transparent; border:1.5px solid transparent;
    color:rgba(255,255,255,0.52); font-size:13.5px; font-weight:500;
    cursor:pointer; text-align:left; width:100%;
    transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; letter-spacing:0.01em;
  }
  .rp-nav-item:hover {
    background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08));
    border-color:rgba(59,130,246,0.28);
    color:#93c5fd; transform:translateX(5px);
  }
  .rp-nav-icon {
    width:30px; height:30px; border-radius:9px;
    background:rgba(255,255,255,0.07);
    display:inline-flex; align-items:center; justify-content:center;
    font-size:14px; flex-shrink:0; transition:background 0.2s;
  }
  .rp-nav-item:hover .rp-nav-icon { background:rgba(59,130,246,0.2); }

  /* ─── Main ─── */
  .rp-main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .rp-topbar {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .rp-topbar-left { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .rp-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .rp-content { flex:1; padding:0 4px; overflow-y:auto; }

  /* ─── Panel Toggle Bar ─── */
  .rp-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .rp-toggle-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .rp-toggle-pill:hover { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .rp-toggle-pill.active {
    background:${NL_GRADIENT}; color:white; border-color:transparent;
    box-shadow:0 2px 10px rgba(11,92,171,0.3);
  }
  .rp-toggle-pill .pill-badge {
    position:absolute; top:-6px; right:-6px;
    width:16px; height:16px; border-radius:50%; background:var(--red-500);
    color:white; font-size:9px; font-weight:900; display:flex; align-items:center; justify-content:center;
    font-family:'Outfit',sans-serif; border:2px solid white;
  }

  /* ─── Collapsible Panel ─── */
  .rp-collapsible-panel {
    overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
    max-height:0; opacity:0;
  }
  .rp-collapsible-panel.open { max-height:700px; opacity:1; }

  /* ─── Active Filter Chips ─── */
  .rp-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .rp-filter-chip {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700;
    background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2);
    color:var(--blue-700); font-family:'Outfit',sans-serif;
  }
  .rp-filter-chip button {
    width:14px; height:14px; border-radius:50%; border:none;
    background:rgba(11,92,171,0.15); color:var(--blue-700);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:900; padding:0; line-height:1;
  }
  .rp-filter-chip button:hover { background:var(--red-500); color:white; }
  .rp-clear-all {
    font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer;
    background:none; border:none; padding:2px 6px; border-radius:6px;
    font-family:'Outfit',sans-serif;
  }
  .rp-clear-all:hover { background:var(--red-50); }

  /* ─── Buttons ─── */
  .rp-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .rp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .rp-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .rp-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .rp-btn-primary { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .rp-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .rp-btn-success { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .rp-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .rp-btn-amber { background:var(--amber-500); color:white; }
  .rp-btn-amber:hover:not(:disabled) { background:var(--amber-600); }
  .rp-btn-white { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .rp-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .rp-btn-ghost { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .rp-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .rp-btn-red-outline { background:var(--red-50); border:1.5px solid var(--red-100); color:var(--red-600); }
  .rp-btn-red-outline:hover:not(:disabled) { background:var(--red-100); }
  .rp-btn-blue-outline { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .rp-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .rp-btn-sm { padding:6px 12px; font-size:12px; }
  .rp-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }

  /* ─── Inputs ─── */
  .rp-input, .rp-select, .rp-textarea {
    width:100%; background:#ffffff; border:1.5px solid #cbd5e1;
    border-radius:var(--radius); padding:10px 14px; color:#0f172a; font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
    box-shadow:0 1px 3px rgba(0,0,0,0.05);
  }
  .rp-input:hover, .rp-select:hover, .rp-textarea:hover {
    border-color:#94a3b8;
  }
  .rp-input:focus, .rp-select:focus, .rp-textarea:focus {
    border-color:${NL_BLUE}; box-shadow:0 0 0 3px rgba(11,92,171,0.12); background:#fff;
  }
  .rp-input::placeholder, .rp-textarea::placeholder { color:#94a3b8; font-style:italic; }
  .rp-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230B5CAB' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:36px;
  }
  .rp-select option { color:#0f172a; background:white; }
  .rp-label {
    font-size:11.5px; font-weight:700; color:#374151; margin-bottom:7px; display:flex; align-items:center; gap:5px;
    text-transform:uppercase; letter-spacing:0.05em; font-family:'Outfit',sans-serif;
  }
  .rp-textarea { resize:vertical; line-height:1.6; }

  /* ─── Form Field Wrapper ─── */
  .rp-field { display:flex; flex-direction:column; }
  .rp-field-note { font-size:11px; color:var(--gray-400); margin-top:5px; font-style:italic; }

  /* ─── Form Section Block ─── */
  .rp-form-block {
    border-radius:var(--radius-lg); border:1.5px solid var(--gray-200);
    overflow:hidden; background:white; box-shadow:var(--shadow-sm);
  }
  .rp-form-block-header {
    padding:12px 16px; display:flex; align-items:center; gap:10px;
    border-bottom:1.5px solid var(--gray-100);
  }
  .rp-form-block-icon {
    width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center;
    font-size:15px; flex-shrink:0;
  }
  .rp-form-block-body { padding:16px; display:flex; flex-direction:column; gap:14px; }
  .rp-form-block-grid { display:grid; gap:14px; }
  .rp-form-block-grid-2 { grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); }
  .rp-form-block-grid-3 { grid-template-columns:repeat(3,1fr); }

  /* ─── Filter Cards ─── */
  .rp-filter-card { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .rp-filter-card1 { background:white; border-radius:10px; padding:20px 12px; box-shadow:var(--shadow); }

  /* ─── Table ─── */
  .rp-table-card {
    background:white; margin-top:1px; border-radius:var(--radius);
    border:1.5px solid var(--gray-200); box-shadow:var(--shadow);
    overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px;
  }
  .rp-table { width:100%; border-collapse:collapse; }
  .rp-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE};
    border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .rp-table thead th:nth-child(8) { background:${NL_RED}; }
  .rp-table thead th:nth-child(9) { background:${NL_RED}; }
  .rp-table thead th:nth-child(10) { background:${NL_RED}; }
  .rp-table th, .rp-table td { border-right:0.5px solid rgba(0,0,0,0.08); border-bottom:1px solid #e2e8f0; }
  .rp-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; cursor:pointer; }
  .rp-table tbody tr:last-child { border-bottom:none; }
  .rp-table tbody tr:hover { background:var(--blue-50); }
  .rp-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); }

  /* ─── Badges ─── */
  .rp-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .rp-badge-blue { background:var(--blue-50); color:var(--blue-700); border:1px solid var(--blue-200); }
  .rp-badge-green { background:var(--green-50); color:var(--green-700); border:1px solid var(--green-200); }
  .rp-badge-gray { background:var(--gray-100); color:var(--gray-600); border:1px solid var(--gray-200); }
  .rp-badge-amber { background:var(--amber-50); color:var(--amber-600); border:1px solid var(--amber-100); }
  .rp-badge-red { background:var(--red-50); color:var(--red-600); border:1px solid var(--red-100); }

  /* ─── Status Pill ─── */
  .rp-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; border:1.5px solid; }
  .rp-status::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
  .rp-status-pending  { color:var(--amber-600); border-color:var(--amber-100); background:var(--amber-50); }
  .rp-status-progress { color:var(--blue-700);  border-color:var(--blue-200);  background:var(--blue-50); }
  .rp-status-approved { color:var(--green-700); border-color:var(--green-200); background:var(--green-50); }
  .rp-status-rejected { color:var(--red-600);   border-color:var(--red-100);   background:var(--red-50); }
  .rp-status-done     { color:#15803d;           border-color:#bbf7d0;          background:#f0fdf4; }

  /* ─── Stat Cards ─── */
  .rp-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; margin-bottom:20px; }
  .rp-stat-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); padding:16px 18px; box-shadow:var(--shadow-sm); transition:all 0.18s ease; }
  .rp-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow); transform:translateY(-2px); }
  .rp-stat-value { font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:800; color:var(--gray-900); line-height:1; }
  .rp-stat-label { font-size:11.5px; color:var(--gray-500); margin-top:4px; font-weight:500; }

  /* ─── Preview Modal ─── */
  .rp-preview-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:16px; animation:fadeIn 0.2s ease;
  }
  .rp-preview-panel {
    width:100%; max-width:1020px; max-height:90vh; background:white; border-radius:var(--radius-xl);
    overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .rp-preview-header { background:${NL_GRADIENT_90}; padding:22px 26px; flex-shrink:0; }
  .rp-preview-body { flex:1; overflow-y:auto; background:var(--gray-50); padding:24px 26px; }

  /* ─── Detail Section ─── */
  .rp-detail-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; box-shadow:var(--shadow-sm); }
  .rp-detail-card-header {
    padding:14px 18px; border-bottom:1.5px solid var(--gray-100);
    display:flex; align-items:center; gap:10px;
    background:linear-gradient(135deg,var(--gray-50),white);
  }
  .rp-detail-card-body { padding:6px 18px 18px; }
  .rp-detail-row {
    display:flex; justify-content:space-between; align-items:flex-start;
    padding:9px 8px; border-radius:8px; gap:12px; transition:background 0.12s;
    margin:2px 0;
  }
  .rp-detail-row:hover { background:var(--blue-50); }
  .rp-detail-label {
    font-size:11.5px; font-weight:700; color:var(--gray-500); white-space:nowrap;
    text-transform:uppercase; letter-spacing:0.05em; font-family:'Outfit',sans-serif;
    display:flex; align-items:center; gap:5px;
  }
  .rp-detail-label::before {
    content:''; width:3px; height:12px; border-radius:999px;
    background:linear-gradient(to bottom,${NL_BLUE},${NL_BLUE2});
    display:inline-block; flex-shrink:0;
  }
  .rp-detail-value {
    font-size:13px; font-weight:600; color:var(--gray-900); text-align:right;
    max-width:65%; word-break:break-word; line-height:1.5;
  }
  .rp-detail-value.na { color:var(--gray-300); font-style:italic; font-weight:400; }

  /* ─── Empty State ─── */
  .rp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }

  /* ─── Spinner ─── */
  .rp-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* ─── Search wrapper ─── */
  .rp-search-wrap { position:relative; }
  .rp-search-wrap input { padding-right:38px; }
  .rp-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }

  /* Mobile overlay */
  .rp-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  /* Nepal Life Hero */
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
  .nl-hero-inner { position:relative; padding:16px 20px; display:flex; align-items:left; justify-content:space-between; gap:18px; }
  .nl-logo { width:90px; max-width:28vw; height:auto; display:block; filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22)); animation:floaty 4.5s ease-in-out infinite; }
  .nl-title { font-family:Syne,sans-serif; font-weight:900; font-size:clamp(1.1rem,2vw,1.55rem); letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1; }
  .nl-title .blue { color:var(--nl-blue); }
  .nl-title .red { color:var(--nl-red); }
  .nl-divider { width:46px; height:3px; border-radius:999px; background:linear-gradient(90deg,var(--nl-blue),var(--nl-red)); margin-top:8px; }
  .nl-sub { margin-top:6px; font-size:12px; color:rgba(15,23,42,0.62); line-height:1.5; max-width:600px; }

  /* Form modal internals */
  .rp-form-section-label {
    font-size:10px; font-weight:800; color:var(--gray-500);
    text-transform:uppercase; letter-spacing:0.12em;
    font-family:'Outfit',sans-serif; margin-bottom:10px;
    display:flex; align-items:center; gap:8px;
  }
  .rp-form-section-bar {
    width:3px; height:18px; border-radius:999px;
  }

  /* ─── Asset Picker ─── */
  .rp-asset-picker {
    border:1.5px solid #bfdbfe; border-radius:var(--radius-lg);
    background:linear-gradient(135deg,#eff6ff,#f8faff);
    overflow:hidden;
  }
  .rp-asset-picker-header {
    padding:10px 14px; background:linear-gradient(135deg,${NL_BLUE},${NL_BLUE2});
    display:flex; align-items:center; gap:8px;
  }
  .rp-asset-picker-steps {
    display:flex; align-items:center; gap:0; padding:0; border-bottom:1.5px solid #bfdbfe;
  }
  .rp-picker-step {
    flex:1; padding:10px 14px; display:flex; flex-direction:column; gap:3px;
    border-right:1px solid #bfdbfe; position:relative;
  }
  .rp-picker-step:last-child { border-right:none; }
  .rp-picker-step-num {
    width:20px; height:20px; border-radius:50%; background:${NL_BLUE};
    color:white; font-size:10px; font-weight:800; display:inline-flex;
    align-items:center; justify-content:center; margin-bottom:2px;
    font-family:'Outfit',sans-serif; flex-shrink:0;
  }
  .rp-picker-step-num.done { background:var(--green-600); }
  .rp-picker-step-num.locked { background:var(--gray-300); }
  .rp-asset-result {
    margin:12px 14px 14px; border-radius:var(--radius);
    border:1.5px solid; padding:10px 13px;
    display:flex; align-items:center; gap:10px;
    transition:all 0.18s ease;
  }
  .rp-asset-result.selected {
    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
    border-color:#86efac;
  }
  .rp-asset-result.empty {
    background:var(--gray-50); border-color:var(--gray-200); border-style:dashed;
  }
  .rp-asset-result.loading {
    background:#eff6ff; border-color:#bfdbfe;
  }
  .rp-asset-dot {
    width:10px; height:10px; border-radius:50%; flex-shrink:0;
  }
    .nl-hero-inner { flex-direction:row; text-align:left;}
    .nl-divider { margin-left:auto; margin-right:auto; }
  }
  @media(max-width:1024px) {
    .rp-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .rp-content { padding:3px; }
  }
  @media(max-width:640px) {
    .rp-topbar { padding:8px 10px; }
    .rp-content { padding:1px; }
    .rp-table thead th, .rp-table tbody td { padding:10px 12px; font-size:12px; }
  }
`;

/* ─── Hero ─── */
function NepalLifeHero() {
  return (
    <div className="nl-hero-wrap">
      <div className="nl-hero-inner">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(11,92,171,0.10)", border:"1px solid rgba(11,92,171,0.20)", color:"rgba(11,92,171,0.90)", borderRadius:999, padding:"5px 12px", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:NL_BLUE2, boxShadow:"0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · Request Management
          </div>
          <h1 className="nl-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.70)", fontWeight:800 }}>Insurance Co. Ltd.</span>
            <br />
            <span style={{ fontSize:14, color:"rgba(15,23,42,0.52)", fontWeight:800 }}>"किनकी जीवन अमूल्य छ"</span>
          </h1>
          <div className="nl-divider" />
          <p className="nl-sub">Submit and track IT service requests — issues, replacements, procurement, and maintenance.</p>
        </div>
        <div style={{ flexShrink:0, display:"grid", placeItems:"center" }}>
          <img src={NepalLifeLogo} alt="Nepal Life Insurance Co. Ltd." className="nl-logo" />
        </div>
      </div>
    </div>
  );
}

/* ─── Constants ─── */
const ASSET_GROUPS = [
  { id:"", name:"Select" },
  { id:"H", name:"Hardware" },
  { id:"S", name:"Software" },
  { id:"L", name:"Software Licenses" },
  { id:"I", name:"Internet & VPN" },
  { id:"C", name:"Services" },
];

const ASSET_SUB_CATEGORIES = [
  { code:"DC", group:"H", name:"Desktop Computer" },
  { code:"LC", group:"H", name:"Laptop" },
  { code:"MO", group:"H", name:"Monitor" },
  { code:"FR", group:"H", name:"Firewall Router Device" },
  { code:"NS", group:"H", name:"Network Switches" },
  { code:"CC", group:"H", name:"CCTV Camera" },
  { code:"CR", group:"H", name:"NVR of CCTV" },
  { code:"PR", group:"H", name:"Printers" },
  { code:"SC", group:"H", name:"Scanners" },
  { code:"BD", group:"H", name:"Biometric Devices" },
  { code:"IP", group:"H", name:"IP Phone" },
  { code:"PJ", group:"H", name:"Projectors" },
  { code:"IB", group:"H", name:"Interactive Board" },
  { code:"UP", group:"H", name:"UPS" },
  { code:"BT", group:"H", name:"Battery of UPS" },
  { code:"WL", group:"L", name:"Windows OS Licenses" },
  { code:"WS", group:"L", name:"Windows Server Licenses" },
  { code:"AL", group:"L", name:"Application Software Licenses" },
  { code:"IN", group:"I", name:"Internet" },
  { code:"VP", group:"I", name:"VPN" },
  { code:"MS", group:"S", name:"Maintenance Service" },
];

const REQUEST_SUB_TYPES = [
  { id:"", name:"Select" },
  { id:"Issue", name:"Issue / Problem" },
  { id:"Replacement", name:"Replacement" },
  { id:"Procurement", name:"Procurement" },
  { id:"Installation", name:"Installation" },
  { id:"Maintenance", name:"Maintenance" },
  { id:"Upgrade", name:"Upgrade" },
  { id:"Other", name:"Other" },
];

/* ─── Asset section + route maps (for asset picker) ─── */
const SUBCODE_TO_SECTION = {
  DC:"desktop", DT:"desktop", LC:"laptop", LP:"laptop", PR:"printer",
  SC:"scanner", PJ:"projector", PN:"panel", IP:"ipphone", CC:"cctv",
  CV:"cctv", IN:"connectivity", UP:"ups", SR:"server", SVR:"server",
  FR:"firewall_router", EA:"extra_asset", EX:"extra_asset",
  AL:"application_software", OF:"office_software", BR:"utility_software",
  SE:"security_software", SI:"security_software_installed",
  MS:"services", L:"licenses", LS:"licenses", WL:"windows_os", WS:"windows_servers",
};

const SECTION_PLURAL = {
  desktop:"desktops", laptop:"laptops", printer:"printers", scanner:"scanners",
  projector:"projectors", panel:"panels", ipphone:"ipphones", cctv:"cctvs",
  server:"servers", firewall_router:"firewall-routers", extra_asset:"extra-assets",
  connectivity:"connectivity", ups:"ups",
  application_software:"application-software", office_software:"office-software",
  utility_software:"utility-software", security_software:"security-software",
  security_software_installed:"security-software-installed",
  services:"services", licenses:"licenses", windows_os:"windows-os", windows_servers:"windows-servers",
};

/* derive display label from a raw asset object */
const getAssetLabel = (section, obj) => {
  if (!obj) return "";
  const id   = obj.assetId ?? obj.asset_id ?? obj.id ?? "";
  const name =
    obj.asset_name || obj.software_name || obj.product_name || obj.license_name ||
    obj.service_name || obj.server_name || obj.scanner_name || obj.projector_name ||
    obj.printer_name || obj.panel_name || obj.desktop_ids || obj.ip_telephone_ext_no ||
    obj.ups_model || obj.connectivity_network || "";
  const brand =
    obj.desktop_brand || obj.laptop_brand || obj.panel_brand || obj.cctv_brand || obj.brand || "";
  const user  =
    obj.userName || obj.laptop_user || obj.assigned_user || obj.panel_user || "";
  const parts = [brand, name, user].filter(Boolean).join(" · ");
  return id ? `${id}${parts ? ` — ${parts}` : ""}` : (parts || "Unknown");
};

const initialValues = {
  type:"", category:"", sub_category:"", title:"", asset:"", priority:"Medium",
  description:"", status:"Pending", branchId:"", requestedByName:"",
  requestedByContact:"", purchaseDate:"", warrantyExpiry:"", invoiceNo:"",
  vendorName:"", province:"", district:"", localLevel:"", fiscalYear:"", agreeAccuracy:false,
};

/* ─── Helpers ─── */
const Spinner = ({ size = 28 }) => (
  <div className="rp-spinner" style={{ width:size, height:size }} />
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="rp-detail-card-header">
    <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,var(--blue-500),var(--green-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>{subtitle}</div>}
    </div>
  </div>
);

const getStatusClass = s => {
  const v = String(s||"").toLowerCase();
  if (v === "pending")     return "rp-status rp-status-pending";
  if (v === "in progress") return "rp-status rp-status-progress";
  if (v === "approved" || v === "completed" || v === "done") return "rp-status rp-status-approved";
  if (v === "rejected")    return "rp-status rp-status-rejected";
  return "rp-status rp-status-pending";
};

const getPriorityBadge = p => {
  const v = String(p||"").toLowerCase();
  if (v === "critical") return "rp-badge rp-badge-red";
  if (v === "high")     return "rp-badge rp-badge-amber";
  if (v === "low")      return "rp-badge rp-badge-gray";
  return "rp-badge rp-badge-blue";
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
/* ─── Main Component ─── */
export default function RequestPage() {
  const { token, user, isAdmin, isSubAdmin } = useAuth();
  const navigate = useNavigate();

  const canViewList    = isAdmin || isSubAdmin;
  const canCreate      = isSubAdmin;
  const canEdit        = isAdmin;
  const canStatusUpdate = isAdmin;
  const roleLabel      = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  const [requests, setRequests]       = useState([]);
  const [branches, setBranches]       = useState([]);
  const [menuOpen, setMenuOpen]       = useState(true);
  const [showPanel, setShowPanel]     = useState("hero");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  /* asset picker state */
  const [assetPickerGroup,  setAssetPickerGroup]  = useState("");
  const [assetPickerSubCat, setAssetPickerSubCat] = useState("");
  const [assetItems,        setAssetItems]        = useState([]);
  const [assetItemsLoading, setAssetItemsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalItems, setTotalItems]   = useState(0);

  const activeFiltersCount = [search, filterStatus, filterPriority].filter(Boolean).length;

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm } =
    useForm(initialValues, onSubmitForm);

  const bindInput = name => ({ name, value:values[name]??"", onChange:handleChange, onBlur:handleBlur, error:errors[name], touched:touched[name] });

  const availableSubCategories = useMemo(
    () => (!values.type ? ASSET_SUB_CATEGORIES : ASSET_SUB_CATEGORIES.filter(sc => sc.group === values.type)),
    [values.type]
  );

  const labelGroup  = id   => ASSET_GROUPS.find(g => g.id === id)?.name || id || "—";
  const labelSubCat = code => ASSET_SUB_CATEGORIES.find(s => s.code === code)?.name || code || "—";

  /* sub-cats filtered to the chosen picker group */
  const assetPickerSubCats = useMemo(
    () => (!assetPickerGroup ? ASSET_SUB_CATEGORIES : ASSET_SUB_CATEGORIES.filter(s => s.group === assetPickerGroup)),
    [assetPickerGroup]
  );

  /* fetch real assets from the branch endpoint when sub-cat + branch are chosen */
  const fetchAssetItems = useCallback(async (branchId, subCatCode) => {
    if (!branchId || !subCatCode || !token) { setAssetItems([]); return; }
    const section = SUBCODE_TO_SECTION[String(subCatCode).toUpperCase()];
    const plural  = section ? SECTION_PLURAL[section] : null;
    if (!plural) { setAssetItems([]); return; }
    setAssetItemsLoading(true);
    try {
      const res = await api.get(`/api/branches/${branchId}/${plural}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res?.data?.data ?? res?.data ?? [];
      const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      setAssetItems(arr.map(obj => ({
        value: obj.assetId ?? obj.asset_id ?? obj.id ?? "",
        label: getAssetLabel(section, obj),
        raw:   obj,
      })));
    } catch {
      setAssetItems([]);
    } finally {
      setAssetItemsLoading(false);
    }
  }, [token]);

  const togglePanel = panel => setShowPanel(prev => prev === panel ? "" : panel);

  /* re-fetch assets when branch changes while sub-cat is already selected */
  useEffect(() => {
    if (values.branchId && assetPickerSubCat) {
      fetchAssetItems(values.branchId, assetPickerSubCat);
    } else {
      setAssetItems([]);
    }
  }, [values.branchId, assetPickerSubCat, fetchAssetItems]);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = e => { if (e.key === "Escape") closeDetail(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOpen]);

  const sidebarWidth = () => {
    if (windowWidth < 640)  return menuOpen ? "85vw"  : "0";
    if (windowWidth < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const getReqBranchId = r => r?.branchId ?? r?.branch_id ?? null;
  const getReqUserId   = r => r?.userId   ?? r?.user_id   ?? null;
  const getBranchName  = id => { const b = branches.find(x => Number(x.id) === Number(id)); return b?.name || id || "—"; };

  const fetchRequests = useCallback(async () => {
    if (!token || !canViewList) return;
    setLoading(true);
    try {
      const res = await api.get("/api/requests/all", {
        params:{ page:currentPage, limit:pageSize },
        headers:{ Authorization:`Bearer ${token}` },
      });
      const data       = res?.data;
      const payload    = Array.isArray(data) ? data : data?.data ?? [];
      const pagination = data?.pagination ?? {};
      setRequests(Array.isArray(payload) ? payload : []);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || (Array.isArray(payload) ? payload.length : 0));
    } catch {
      setAlert({ type:"error", title:"Error", message:"Failed to fetch requests" });
    } finally { setLoading(false); }
  }, [token, canViewList, currentPage, pageSize]);

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/branches", { params:{ page:1, limit:5000 }, headers:{ Authorization:`Bearer ${token}` } });
      const payload = res?.data?.data ?? res?.data ?? [];
      setBranches(Array.isArray(payload) ? payload : []);
    } catch { setBranches([]); }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchBranches();
    fetchRequests();
  }, [token, fetchRequests, fetchBranches]);

  const filteredRequests = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase();
    return requests.filter(r => {
      if (q) {
        const hay = [r?.type, r?.title, r?.category, r?.sub_category, r?.asset, r?.status, r?.description,
          String(getReqBranchId(r)??""), String(r?.id??"")].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterStatus   && String(r?.status||"").toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterPriority && String(r?.priority||"").toLowerCase() !== filterPriority.toLowerCase()) return false;
      return true;
    });
  }, [requests, debouncedSearch, filterStatus, filterPriority]);

  /* Stats */
  const stats = useMemo(() => ({
    total:     requests.length,
    pending:   requests.filter(r => String(r.status||"").toLowerCase() === "pending").length,
    progress:  requests.filter(r => String(r.status||"").toLowerCase() === "in progress").length,
    approved:  requests.filter(r => ["approved","completed","done"].includes(String(r.status||"").toLowerCase())).length,
    rejected:  requests.filter(r => String(r.status||"").toLowerCase() === "rejected").length,
    critical:  requests.filter(r => String(r.priority||"").toLowerCase() === "critical").length,
  }), [requests]);

  async function onSubmitForm(formValues) {
    if (!token || !user) { setAlert({ type:"error", title:"Error", message:"You do not have permission" }); return; }
    if (!editingId && !canCreate) { setAlert({ type:"error", title:"Not allowed", message:"Only SubAdmin can create new requests." }); return; }
    if (editingId && !canEdit)   { setAlert({ type:"error", title:"Not allowed", message:"Only Admin can edit requests." }); return; }
    if (!formValues.agreeAccuracy) { setAlert({ type:"error", title:"Agreement required", message:"Please confirm the agreement checkbox." }); return; }
    const payload = {
      type:formValues.type, category:formValues.category||null, sub_category:formValues.sub_category||null,
      title:formValues.title||null, asset:formValues.asset||null, priority:formValues.priority||"Medium",
      description:formValues.description, status:formValues.status||"Pending",
      branchId:formValues.branchId ? Number(formValues.branchId) : null,
      requestedByName:formValues.requestedByName||null, requestedByContact:formValues.requestedByContact||null,
      purchaseDate:formValues.purchaseDate||null, warrantyExpiry:formValues.warrantyExpiry||null,
      invoiceNo:formValues.invoiceNo||null, vendorName:formValues.vendorName||null,
      province:formValues.province||null, district:formValues.district||null,
      localLevel:formValues.localLevel||null, fiscalYear:formValues.fiscalYear||null, agreeAccuracy:true,
    };
    try {
      if (editingId) {
        await api.put(`/api/requests/${editingId}/edit`, payload, { headers:{ Authorization:`Bearer ${token}` } });
        setAlert({ type:"success", title:"Success", message:"Request updated successfully!" });
      } else {
        await api.post("/api/requests", payload, { headers:{ Authorization:`Bearer ${token}` } });
        setAlert({ type:"success", title:"Success", message:"Request submitted successfully!" });
      }
      resetForm(initialValues); setEditingId(null); setShowModal(false); setCurrentPage(1); fetchRequests();
    } catch (err) {
      setAlert({ type:"error", title:"Error", message:err?.response?.data?.message || "Failed to save request" });
    }
  }

  const updateStatusQuick = useCallback(async (id, status) => {
    if (!canStatusUpdate) return;
    try {
      await api.put(`/api/requests/${id}`, { status }, { headers:{ Authorization:`Bearer ${token}` } });
      setAlert({ type:"success", title:"Success", message:"Status updated!" });
      fetchRequests();
    } catch { setAlert({ type:"error", title:"Error", message:"Failed to update status" }); }
  }, [canStatusUpdate, token, fetchRequests]);

      const handleOpenForm = useCallback(() => {
      resetForm(initialValues);
      setEditingId(null); 
      setShowModal(true);
      setAssetPickerGroup("");
      setAssetPickerSubCat("");
      setAssetItems([]);
    }, [resetForm]);
  const closeModal = useCallback(() => { setShowModal(false); resetForm(initialValues); setEditingId(null); setAssetPickerGroup(""); setAssetPickerSubCat(""); setAssetItems([]); }, [resetForm]);

  const handleDelete = useCallback(async id => {
    if (!canEdit || !window.confirm("Delete this request?")) return;
    try {
      await api.delete(`/api/requests/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setAlert({ type:"success", title:"Deleted", message:"Request deleted." });
      fetchRequests();
    } catch { setAlert({ type:"error", title:"Error", message:"Failed to delete request" }); }
  }, [canEdit, token, fetchRequests]);

  const openDetail  = useCallback(req => { setSelectedRequest(req); setDetailOpen(true); }, []);
  const closeDetail = useCallback(() => { setSelectedRequest(null); setDetailOpen(false); }, []);

  const navItems = [
      { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
      { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
      { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
      { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
      { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
      { label: "Asset Tracking", path: "/asset-tracking",       icon: makeIcon(D.radar) },
      { label: "Help & Support", path: "/support",              icon: makeIcon(D.help) },
    ].filter(i => i.show !== false);

  if (loading && requests.length === 0) {
    return (
      <>
        <style>{FONTS}{RP_STYLES}</style>
        <main style={{ background:"var(--gray-50)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
          <Spinner size={40} /><p style={{ color:"var(--gray-500)", fontSize:14, fontWeight:500, fontFamily:"DM Sans,sans-serif" }}>Loading requests…</p>
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
          >
    <div className="rp-root">
      <style>{FONTS}{RP_STYLES}</style>
      <div className="rp-layout">
        {/* ─── MAIN ─── */}
        <main className="rp-main">

          {/* ─── Topbar ─── */}
          <div className="rp-topbar">
            <div className="rp-topbar-left">
            <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>Request Management</div>
            </div>
            <div className="rp-topbar-right">
              <button className="rp-btn rp-btn-blue-outline rp-btn-sm" onClick={fetchRequests}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Refresh
              </button>
              {canCreate && (
                <button className="rp-btn rp-btn-success rp-btn-sm" onClick={handleOpenForm}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  New Request
                </button>
              )}
            </div>
          </div>

          {/* ─── Panel Toggle Bar ─── */}
          <div className="rp-panel-toggle-bar">
            <button className={`rp-toggle-pill ${showPanel === "hero" ? "active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ <span>Overview</span>
            </button>
            <button className={`rp-toggle-pill ${showPanel === "filters" ? "active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 <span>Filters</span>
              {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
            </button>
            <button className={`rp-toggle-pill ${showPanel === "stats" ? "active" : ""}`} onClick={() => togglePanel("stats")}>
              📊 <span>Stats</span>
            </button>

            {/* Active filter chips */}
            <div className="rp-active-filters">
              {search && (
                <span className="rp-filter-chip">
                  🔎 "{search.length > 14 ? search.slice(0,14)+"…" : search}"
                  <button onClick={() => setSearch("")}>×</button>
                </span>
              )}
              {filterStatus && (
                <span className="rp-filter-chip">
                  🔄 {filterStatus}
                  <button onClick={() => setFilterStatus("")}>×</button>
                </span>
              )}
              {filterPriority && (
                <span className="rp-filter-chip">
                  ⚡ {filterPriority}
                  <button onClick={() => setFilterPriority("")}>×</button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button className="rp-clear-all" onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); }}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <span className="rp-badge rp-badge-blue" style={{ fontSize:11 }}>{filteredRequests.length} / {totalItems}</span>
              <span className="rp-badge rp-badge-gray" style={{ fontSize:11 }}>{roleLabel}</span>
            </div>
          </div>

          {/* ─── Collapsible: Hero ─── */}
          <div className={`rp-collapsible-panel ${showPanel === "hero" ? "open" : ""}`}>
            <div className="rp-filter-card" style={{ margin:"2px 2px 0" }}>
              <NepalLifeHero />
            </div>
          </div>

          {/* ─── Collapsible: Filters ─── */}
          <div className={`rp-collapsible-panel ${showPanel === "filters" ? "open" : ""}`}>
            <div className="rp-filter-card1" style={{ margin:"2px 2px 0" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, alignItems:"end" }}>
                <div style={{ gridColumn:"span 2", minWidth:0 }}>
                  <label className="rp-label">Search</label>
                  <div className="rp-search-wrap">
                    <input type="text" placeholder="ID, title, type, category…" className="rp-input" value={search} onChange={e => setSearch(e.target.value)} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="rp-label">Status</label>
                  <select className="rp-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {["Pending","In Progress","Approved","Rejected","Completed","Done"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rp-label">Priority</label>
                  <select className="rp-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">All Priorities</option>
                    {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Collapsible: Stats ─── */}
          <div className={`rp-collapsible-panel ${showPanel === "stats" ? "open" : ""}`}>
            <div className="rp-filter-card" style={{ margin:"2px 2px 0" }}>
              <div className="rp-stats-grid">
                {[
                  { label:"Total Requests", value:stats.total,    color:"var(--gray-900)" },
                  { label:"Pending",        value:stats.pending,  color:"var(--amber-600)" },
                  { label:"In Progress",    value:stats.progress, color:"var(--blue-700)" },
                  { label:"Approved/Done",  value:stats.approved, color:"var(--green-700)" },
                  { label:"Rejected",       value:stats.rejected, color:"var(--red-600)" },
                  { label:"Critical",       value:stats.critical, color:"var(--red-600)" },
                ].map((s,i) => (
                  <div className="rp-stat-card" key={i}>
                    <div className="rp-stat-value" style={{ color:s.color }}>{s.value}</div>
                    <div className="rp-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="rp-content">
            {alert && <div style={{ margin:"8px 0" }}><Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} /></div>}

            {/* ─── Table ─── */}
            <div className="rp-table-card" style={{ overflowX:"auto" }}>
              {loading && requests.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:14 }}>
                  <Spinner size={40} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading requests…</p>
                </div>
              ) : filteredRequests.length ? (
                <table className="rp-table">
                  <thead>
                    <tr>
                      {["#","User","Title","Type","Category","Branch","Priority","Status","View",...(canEdit?["Delete"]:[])].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r, idx) => {
                      const bId = r?.branchId ?? r?.branch_id ?? null;
                      return (
                        <tr key={r.id}>
                          <td style={{ color:"var(--gray-400)", fontWeight:600, fontFamily:"Outfit,sans-serif", fontSize:12 }}>
                            <span className="rp-badge rp-badge-blue">#{r.id}</span>
                          </td>
                          <td style={{ fontWeight:600 }}>{r?.user?.name || getReqUserId(r) || "—"}</td>
                          <td>
                            <div style={{ fontWeight:700, color:"var(--gray-900)", fontSize:13.5 }}>{r.title || "—"}</div>
                            {r.sub_category && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:2 }}>{r.sub_category}</div>}
                          </td>
                          <td>{labelGroup(r.type)}</td>
                          <td style={{ fontSize:12, color:"var(--gray-600)" }}>{labelSubCat(r.category)}</td>
                          <td style={{ fontSize:12, color:"var(--gray-600)" }}>{getBranchName(bId)}</td>
                          <td><span className={getPriorityBadge(r.priority)}>{r.priority || "—"}</span></td>
                          <td>
                            {canStatusUpdate ? (
                              <select
                              className="rp-select"
                              style={{ minWidth:130, fontSize:12, padding:"5px 30px 5px 9px" }}
                              value={r.status}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateStatusQuick(r.id, e.target.value);
                              }}
                            >
                              {["Pending","In Progress","Approved","Rejected","Completed","Done"].map(s => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            ) : (
                              <span className={getStatusClass(r.status)}>{r.status || "—"}</span>
                            )}
                          </td>
                          <td>
                            <button className="rp-btn rp-btn-primary rp-btn-sm" onClick={e => { e.stopPropagation(); openDetail(r); }}>View →</button>
                          </td>
                          {canEdit && (
                            <td>
                              <button className="rp-btn rp-btn-red-outline rp-btn-sm" onClick={e => { e.stopPropagation(); handleDelete(r.id); }}>🗑</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="rp-empty">
                  <svg width="56" height="56" fill="none" stroke="var(--gray-200)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No requests found</p>
                  <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>Try adjusting your filters or create a new request</p>
                  {canCreate && <button className="rp-btn rp-btn-success" onClick={handleOpenForm}>+ New Request</button>}
                </div>
              )}
            </div>

            {filteredRequests.length > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
                pageSize={pageSize} onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }} totalItems={totalItems} />
            )}

            {/* ─── New Request Modal ─── */}
            <Modal
              isOpen={showModal}
              title={
                <div style={{ textAlign:"center" }}>
                  <span style={{ fontSize:17, fontWeight:700, color:"var(--gray-900)", fontFamily:"Outfit,sans-serif" }}>
                    {editingId ? "Edit Request" : "Submit New Request"}
                  </span>
                  <p style={{ fontSize:12, color:"var(--gray-500)", margin:"4px 0 0", fontWeight:400 }}>Fill in the details for the IT service request</p>
                </div>
              }
              onClose={closeModal}
              actions={
                <div style={{ display:"flex", justifyContent:"flex-end", gap:10, width:"100%", borderTop:"1px solid var(--gray-200)", paddingTop:16 }}>
                  <Button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all duration-200 mb-2">✖ Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!values.agreeAccuracy}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all duration-200 mb-2">
                    {editingId ? "💾 Update Request" : "💾 Submit Request"}
                  </Button>
                </div>
              }
            >
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14, padding:"18px 22px" }}>

                {/* ── Classification ── */}
                <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#14532d" }}>Request Classification</div>
                      <div style={{ fontSize:11, color:"#4ade80", marginTop:1 }}>Type, category and title</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">
                    <div className="rp-form-block-grid rp-form-block-grid-2">
                      <div className="rp-field">
                        <label className="rp-label">✏️ Title <span style={{ color:"var(--red-500)" }}>*</span></label>
                        <input className="rp-input" placeholder="Short descriptive title" name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} required />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🔧 Request Sub-Type</label>
                        <select className="rp-select" name="sub_category" value={values.sub_category} onChange={handleChange} onBlur={handleBlur}>
                          {REQUEST_SUB_TYPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🔄 Status</label>
                        <select className="rp-select" name="status" value={values.status} onChange={handleChange} disabled={!canEdit}
                          style={{ opacity:canEdit?1:0.6 }}>
                          {["Pending","In Progress","Approved","Rejected","Completed","Done"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* locatiom */}
                 <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#fef2f2,#fee2e2)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#7f1d1d" }}>Location & Branch</div>
                      <div style={{ fontSize:11, color:"#fca5a5", marginTop:1 }}>Geographic details and branch assignment</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">
                    <div className="rp-form-block-grid rp-form-block-grid-2">
                      <div className="rp-field">
                        <label className="rp-label">🗺 Province</label>
                        <input className="rp-input" placeholder="e.g. Bagmati" name="province" value={values.province} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🏘 District</label>
                        <input className="rp-input" placeholder="e.g. Kathmandu" name="district" value={values.district} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🏙 Local Level</label>
                        <input className="rp-input" placeholder="KMC / Municipality" name="localLevel" value={values.localLevel} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field" style={{ gridColumn:"1 / -1" }}>
                        <label className="rp-label">🏢 Branch <span style={{ color:"var(--red-500)" }}>*</span></label>
                        <select className="rp-select" name="branchId" value={values.branchId} onChange={handleChange} required
                          style={{ borderColor:values.branchId ? NL_BLUE : "#cbd5e1", background:values.branchId ? "#eff6ff" : "white", fontWeight:values.branchId ? 600 : 400 }}>
                          <option value="">— Select Branch —</option>
                          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ── Priority & Status ── */}
                <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#fffbeb,#fef9c3)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#78350f" }}>Asset & Priority</div>
                      <div style={{ fontSize:11, color:"#fbbf24", marginTop:1 }}>Select the asset, then set urgency level</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">

                    {/* ── Cascading Asset Picker ── */}
                    <div className="rp-asset-picker">
                      <div className="rp-asset-picker-header">
                        <span style={{ fontSize:14 }}>📦</span>
                        <div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:12, color:"white" }}>Asset Selector</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", marginTop:1 }}>
                            {!values.branchId
                              ? "⚠ Select a Branch first (Location section below)"
                              : "Filter by category → sub category → pick asset"}
                          </div>
                        </div>
                        {values.asset && (
                          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.35)", color:"white", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700, fontFamily:"Outfit,sans-serif" }}>
                              ✓ {values.asset}
                            </span>
                            <button type="button"
                              onClick={() => { handleChange({ target:{ name:"asset", value:"" } }); setAssetPickerSubCat(""); setAssetItems([]); }}
                              style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.3)", color:"white", borderRadius:7, padding:"3px 8px", fontSize:11, cursor:"pointer", fontFamily:"Outfit,sans-serif", fontWeight:700 }}>
                              ✕ Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step row */}
                      <div className="rp-asset-picker-steps">
                        {/* Step 1 — Group */}
                        <div className="rp-picker-step">
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            <span className={`rp-picker-step-num${assetPickerGroup ? " done" : ""}`}>1</span>
                            <label className="rp-label" style={{ margin:0, fontSize:10.5 }}>Asset Group</label>
                          </div>
                          <select
                            className="rp-select"
                            style={{ fontSize:12 }}
                            value={assetPickerGroup}
                            disabled={!values.branchId}
                            onChange={e => {
                              const group = e.target.value;
                              setAssetPickerGroup(group);
                              setAssetPickerSubCat("");
                              setAssetItems([]);

                              handleChange({ target: { name: "type", value: group } });
                              handleChange({ target: { name: "category", value: "" } });
                              handleChange({ target: { name: "asset", value: "" } });
                            }}
                          >
                            <option value="">— All Groups —</option>
                            {ASSET_GROUPS.filter(g => g.id).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </div>

                        {/* Step 2 — Sub Category */}
                        <div className="rp-picker-step">
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            <span className={`rp-picker-step-num${assetPickerSubCat ? " done" : (!assetPickerGroup ? " locked" : "")}`}>2</span>
                            <label className="rp-label" style={{ margin:0, fontSize:10.5 }}>Sub Category</label>
                          </div>
                          <select
                            className="rp-select"
                            style={{ fontSize:12, opacity:!assetPickerGroup ? 0.5 : 1 }}
                            value={assetPickerSubCat}
                            disabled={!assetPickerGroup || !values.branchId}
                            onChange={e => {
                              const code = e.target.value;
                              setAssetPickerSubCat(code);
                              setAssetItems([]);

                              handleChange({ target: { name: "category", value: code } });
                              handleChange({ target: { name: "asset", value: "" } });

                              if (code && values.branchId) fetchAssetItems(values.branchId, code);
                            }}
                          >
                            <option value="">— Select Sub Cat —</option>
                            {assetPickerSubCats.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                          </select>
                        </div>

                        {/* Step 3 — Asset ID */}
                        <div className="rp-picker-step">
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            <span className={`rp-picker-step-num${values.asset ? " done" : (!assetPickerSubCat ? " locked" : "")}`}>3</span>
                            <label className="rp-label" style={{ margin:0, fontSize:10.5 }}>
                              Asset ID {assetItemsLoading && <span style={{ color:NL_BLUE, fontWeight:600 }}>· Loading…</span>}
                            </label>
                          </div>
                          <select className="rp-select"
                            style={{ fontSize:12, opacity:!assetPickerSubCat ? 0.5 : 1,
                              borderColor: values.asset ? "#16a34a" : "#cbd5e1",
                              background: values.asset ? "#f0fdf4" : "white", fontWeight: values.asset ? 700 : 400 }}
                            value={values.asset}
                            disabled={!assetPickerSubCat || assetItemsLoading}
                            onChange={e => handleChange({ target:{ name:"asset", value:e.target.value } })}>
                            <option value="">
                              {assetItemsLoading ? "Fetching assets…" : assetItems.length === 0 ? "No assets found" : "— Select Asset —"}
                            </option>
                            {assetItems.map((item, i) => (
                              <option key={item.value || i} value={item.value || item.label}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Result strip */}
                      <div className={`rp-asset-result${values.asset ? " selected" : assetItemsLoading ? " loading" : " empty"}`}>
                        {assetItemsLoading ? (
                          <>
                            <div className="rp-spinner" style={{ width:16, height:16, borderTopColor:NL_BLUE, flexShrink:0 }} />
                            <span style={{ fontSize:12, color:NL_BLUE, fontWeight:600 }}>Fetching assets from branch…</span>
                          </>
                        ) : values.asset ? (
                          <>
                            <div className="rp-asset-dot" style={{ background:"#16a34a" }} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:800, color:"#14532d", fontFamily:"Outfit,sans-serif" }}>Asset Selected</div>
                              <div style={{ fontSize:13, fontWeight:700, color:"#166534", marginTop:1 }}>{values.asset}</div>
                              {assetPickerSubCat && <div style={{ fontSize:11, color:"#4ade80", marginTop:1 }}>{labelSubCat(assetPickerSubCat)} · {assetPickerSubCat}</div>}
                            </div>
                            <span style={{ fontSize:18 }}>✅</span>
                          </>
                        ) : (
                          <>
                            <div className="rp-asset-dot" style={{ background:"var(--gray-300)" }} />
                            <span style={{ fontSize:12, color:"var(--gray-400)", fontStyle:"italic" }}>
                              {!values.branchId ? "Select a branch first, then use the filters above" :
                               !assetPickerGroup ? "Step 1: Choose an asset group to begin" :
                               !assetPickerSubCat ? "Step 2: Choose a sub category to load assets" :
                               "Step 3: Pick an asset from the dropdown above"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Priority + Status row */}
                    <div className="rp-form-block-grid" style={{ gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <div className="rp-field">
                        <label className="rp-label">🚨 Priority</label>
                        <select className="rp-select" name="priority" value={values.priority} onChange={handleChange}
                          style={{ borderColor: values.priority==="Critical"?"#dc2626": values.priority==="High"?"#d97706": values.priority==="Low"?"#6b7280":"#cbd5e1",
                            background: values.priority==="Critical"?"#fef2f2": values.priority==="High"?"#fffbeb": values.priority==="Low"?"#f9fafb":"white",
                            fontWeight:700 }}>
                          {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Requester ── */}
                <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#1e3a8a" }}>Requester Information</div>
                      <div style={{ fontSize:11, color:"#60a5fa", marginTop:1 }}>Who is submitting this request</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">
                    <div className="rp-form-block-grid rp-form-block-grid-2">
                      <div className="rp-field">
                        <label className="rp-label">👤 Requested By</label>
                        <input className="rp-input" placeholder="Full name of employee" name="requestedByName" value={values.requestedByName} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">📞 Contact</label>
                        <input className="rp-input" placeholder="Phone / Extension no." name="requestedByContact" value={values.requestedByContact} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Asset Details ── */}
                <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#4c1d95" }}>Asset Details</div>
                      <div style={{ fontSize:11, color:"#c084fc", marginTop:1 }}>Purchase info, warranty, vendor</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">
                    <div className="rp-form-block-grid rp-form-block-grid-2">
                      <div className="rp-field">
                        <label className="rp-label">📅 Purchase Date (AD)</label>
                        <input type="date" className="rp-input" name="purchaseDate" value={values.purchaseDate} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🛡 Warranty Expiry (AD)</label>
                        <input type="date" className="rp-input" name="warrantyExpiry" value={values.warrantyExpiry} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🧾 Invoice No.</label>
                        <input className="rp-input" placeholder="Invoice / Bill number" name="invoiceNo" value={values.invoiceNo} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                      <div className="rp-field">
                        <label className="rp-label">🏪 Vendor Name</label>
                        <input className="rp-input" placeholder="Supplier / vendor name" name="vendorName" value={values.vendorName} onChange={handleChange} onBlur={handleBlur} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Description ── */}
                <div className="rp-form-block">
                  <div className="rp-form-block-header" style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#0f172a" }}>Description <span style={{ color:"var(--red-500)" }}>*</span></div>
                      <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>Detailed explanation of the request</div>
                    </div>
                  </div>
                  <div className="rp-form-block-body">
                    <textarea className="rp-textarea" rows={4}
                      placeholder="Describe the issue or request in detail — include symptoms, affected devices, urgency reason, etc."
                      name="description" value={values.description} onChange={handleChange} required />
                  </div>
                </div>

                {/* ── Agreement ── */}
                <div style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"1.5px solid #86efac", borderRadius:12, padding:"14px 18px" }}>
                  <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer" }}>
                    <input type="checkbox" name="agreeAccuracy" checked={!!values.agreeAccuracy}
                      onChange={handleChange} style={{ marginTop:3, width:16, height:16, accentColor:"#16a34a", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:12.5, color:"#14532d", fontWeight:700, lineHeight:1.6, marginBottom:2 }}>
                        ✅ I confirm that all information provided is accurate and complete.
                      </div>
                      <div style={{ fontSize:11, color:"#16a34a", lineHeight:1.5 }}>
                        If any mistake is found, I take full responsibility for the information submitted.
                      </div>
                    </div>
                  </label>
                </div>
              </form>
            </Modal>

            {/* ─── Detail Preview Modal ─── */}
            {detailOpen && selectedRequest && (() => {
              const r = selectedRequest;
              const pck = (...keys) => { for (const k of keys) { const v = r?.[k]; if (v !== undefined && v !== null && v !== "") return v; } return "—"; };
              const bId = r?.branchId ?? r?.branch_id ?? null;
              const priorityColor = { Critical:"#dc2626", High:"#d97706", Low:"#6b7280", Medium:"#2563eb" }[r.priority] || NL_BLUE;
              const priorityBg    = { Critical:"#fef2f2", High:"#fffbeb", Low:"#f9fafb", Medium:"#eff6ff" }[r.priority] || "#eff6ff";
              return (
                <div className="rp-preview-overlay" onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}>
                  <div className="rp-preview-panel">

                    {/* Header */}
                    <div className="rp-preview-header">
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>
                            Request Details · #{r?.id}
                          </div>
                          <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:900, fontSize:"clamp(1rem,3vw,1.4rem)", color:"white", letterSpacing:"-0.02em", marginBottom:12, lineHeight:1.25 }}>
                            {r?.title || "No title"}
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:7, alignItems:"center" }}>
                            {/* Priority pill — colored */}
                            <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:800, background:priorityBg, color:priorityColor, border:`1.5px solid ${priorityColor}44`, fontFamily:"Outfit,sans-serif" }}>
                              ⚡ {r.priority || "—"}
                            </span>
                            <span className={getStatusClass(r.status)} style={{ background:"rgba(255,255,255,0.15)", borderColor:"rgba(255,255,255,0.35)", color:"white" }}>
                              {r.status || "—"}
                            </span>
                            {r.type && (
                              <span style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.9)", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700, fontFamily:"Outfit,sans-serif" }}>
                                📁 {labelGroup(r.type)}
                              </span>
                            )}
                            {r.category && (
                              <span style={{ background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.75)", borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:600 }}>
                                {labelSubCat(r.category)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="rp-btn rp-btn-sm" style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.3)", color:"white", flexShrink:0 }} onClick={closeDetail}>✕ Close</button>
                      </div>
                    </div>

                    <div className="rp-preview-body">
                      {/* Meta strip */}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18, padding:"12px 16px", background:"white", borderRadius:12, border:"1.5px solid var(--gray-200)", boxShadow:"var(--shadow-sm)" }}>
                        {[
                          { icon:"🏢", label:"Branch", value:getBranchName(bId) },
                          { icon:"👤", label:"Requested By", value:pck("requestedByName","requested_by_name") },
                          { icon:"📞", label:"Contact", value:pck("requestedByContact","requested_by_contact") },
                          { icon:"👁", label:"User", value:r?.user?.name || getReqUserId(r) || "—" },
                        ].map(({icon,label,value}) => (
                          <div key={label} style={{ display:"flex", flexDirection:"column", minWidth:120, padding:"8px 14px", background:"var(--gray-50)", border:"1px solid var(--gray-200)", borderRadius:10, flex:1 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"var(--gray-400)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3, fontFamily:"Outfit,sans-serif" }}>{icon} {label}</div>
                            <div style={{ fontSize:13, fontWeight:700, color: value === "—" ? "var(--gray-300)" : "var(--gray-900)" }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                        {/* Request Info Card */}
                        <div className="rp-detail-card">
                          <div className="rp-detail-card-header" style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)", borderBottom:"1.5px solid #bfdbfe" }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#2563eb,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>📂</div>
                            <div>
                              <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#1e3a8a" }}>Request Info</div>
                              <div style={{ fontSize:11, color:"#60a5fa" }}>Classification details</div>
                            </div>
                          </div>
                          <div className="rp-detail-card-body">
                            {[
                              ["Request ID",  `#${r.id}`],
                              ["Title",        pck("title")],
                              ["Type",         labelGroup(pck("type"))],
                              ["Category",     labelSubCat(pck("category"))],
                              ["Sub Type",     pck("sub_category")],
                              ["Asset / Item", pck("asset")],
                            ].map(([label, value], i) => (
                              <div key={i} className="rp-detail-row">
                                <div className="rp-detail-label">{label}</div>
                                <div className={`rp-detail-value${value === "—" ? " na" : ""}`}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Location & Asset Card */}
                        <div className="rp-detail-card">
                          <div className="rp-detail-card-header" style={{ background:"linear-gradient(135deg,#fef2f2,#fee2e2)", borderBottom:"1.5px solid #fca5a5" }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#ef4444,#f97316)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>📍</div>
                            <div>
                              <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#7f1d1d" }}>Location & Asset</div>
                              <div style={{ fontSize:11, color:"#fca5a5" }}>Branch & procurement info</div>
                            </div>
                          </div>
                          <div className="rp-detail-card-body">
                            {[
                              ["Branch",          getBranchName(bId)],
                              ["Province",        pck("province")],
                              ["District",        pck("district")],
                              ["Local Level",     pck("localLevel","local_level")],
                              ["Fiscal Year",     pck("fiscalYear","fiscal_year")],
                              ["Purchase Date",   pck("purchaseDate","purchase_date")],
                              ["Warranty Expiry", pck("warrantyExpiry","warranty_expiry")],
                              ["Invoice No.",     pck("invoiceNo","invoice_no")],
                              ["Vendor",          pck("vendorName","vendor_name")],
                            ].map(([label, value], i) => (
                              <div key={i} className="rp-detail-row">
                                <div className="rp-detail-label">{label}</div>
                                <div className={`rp-detail-value${value === "—" ? " na" : ""}`}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Description Card — full width */}
                        <div className="rp-detail-card" style={{ gridColumn:"1/-1" }}>
                          <div className="rp-detail-card-header" style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)", borderBottom:"1.5px solid var(--gray-200)" }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0f172a,#1e3a8a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>📝</div>
                            <div>
                              <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:13, color:"#0f172a" }}>Description</div>
                              <div style={{ fontSize:11, color:"var(--gray-400)" }}>Full details of the request</div>
                            </div>
                          </div>
                          <div className="rp-detail-card-body" style={{ padding:"16px 18px" }}>
                            {pck("description") !== "—"
                              ? <p style={{ fontSize:13.5, color:"var(--gray-800)", lineHeight:1.75, margin:0, whiteSpace:"pre-wrap", background:"var(--gray-50)", border:"1px solid var(--gray-200)", borderRadius:10, padding:"14px 16px" }}>
                                  {pck("description")}
                                </p>
                              : <p style={{ color:"var(--gray-300)", fontStyle:"italic", margin:0, fontSize:13 }}>No description provided.</p>
                            }
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop:16, fontSize:11, color:"var(--gray-400)", textAlign:"center" }}>
                        Press <kbd style={{ background:"var(--gray-100)", border:"1px solid var(--gray-300)", borderRadius:5, padding:"1px 6px", fontSize:10, fontFamily:"monospace" }}>ESC</kbd> or click outside to close
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
    </SplitSidebarLayout>
      <Footer />
    </>
  );
}