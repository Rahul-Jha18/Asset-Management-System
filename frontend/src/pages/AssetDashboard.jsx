// src/pages/AssetDashboard.jsx
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Pie, Bar, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AddCategoryModal from '../components/AddModel/AddCategoryModal';
import AddSubCategoryModal from '../components/AddModel/AddSubCategoryModal';
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

/* ─── Nepal Life brand ─── */
const NL_BLUE = "#0B5CAB";
const NL_BLUE2 = "#1474F3";
const NL_RED = "#f31225ef";
const NL_GRADIENT = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
`;

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --nl-blue: ${NL_BLUE};
    --nl-blue2: ${NL_BLUE2};
    --nl-red: ${NL_RED};

    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;

    --green-50: #f0fdf4;
    --green-100: #dcfce7;
    --green-600: #16a34a;
    --green-700: #15803d;

    --amber-50: #fffbeb;
    --amber-100: #fef3c7;
    --amber-600: #d97706;

    --red-50: #fef2f2;
    --red-100: #fee2e2;
    --red-600: #dc2626;

    --purple-50: #f5f3ff;
    --purple-100: #ede9fe;
    --purple-600: #7c3aed;

    --blue-50: #eff6ff;
    --blue-100: #dbeafe;

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.05);
    --shadow-md: 0 6px 18px rgba(0,0,0,0.08), 0 18px 40px rgba(0,0,0,0.08);
    --shadow-lg: 0 12px 28px rgba(0,0,0,0.10), 0 28px 70px rgba(0,0,0,0.10);

    --radius: 12px;
    --radius-lg: 16px;
    --radius-xl: 22px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

  .ad-root {
    font-family: "DM Sans", sans-serif;
    background: var(--gray-50);
    max-height: 100vh;
    border-radius: var(--radius-lg);
    display: flex;
  }

  .ad-layout {
    display: flex;
    width: 100%;
    border-radius: var(--radius-lg);
    max-height: 90vh;
  }

  .ad-sidebar {
    background: linear-gradient(170deg, #0f172a 0%, #1e3a5f 50%, #0d2137 100%);
    border-right: 1px solid rgba(59,130,246,.15);
    box-shadow: 6px 0 32px rgba(0,0,0,.28);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    transition: width .3s cubic-bezier(.4,0,.2,1);
  }

  .ad-sidebar::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .ad-sidebar::after {
    content: "";
    position: absolute;
    bottom: -40px;
    left: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(243,18,37,.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .ad-mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 49;
    background: rgba(17,24,39,.45);
    backdrop-filter: blur(2px);
  }

  .ad-nav-btn {
    width: 100%;
    text-align: left;
    padding: 11px 15px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid transparent;
    color: rgba(255,255,255,.58);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    display: flex;
    align-items: center;
    gap: 11px;
    font-family: "DM Sans", sans-serif;
    letter-spacing: .01em;
  }

  .ad-nav-btn:hover {
    background: linear-gradient(135deg, rgba(59,130,246,.15), rgba(243,18,37,.06));
    border-color: rgba(59,130,246,.25);
    color: #93c5fd;
    transform: translateX(5px);
  }

  .ad-nav-btn.active {
    background: linear-gradient(135deg, rgba(59,130,246,.25), rgba(34,197,94,.12));
    border-color: rgba(59,130,246,.4);
    color: #60a5fa;
  }

  .ad-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ad-topbar {
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--gray-200);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: var(--shadow-sm);
  }

  .ad-content {
    flex: 1;
    padding: 18px 20px 40px;
    overflow-y: auto;
  }

  .ad-hero {
    position: relative;
    background: linear-gradient(135deg, rgba(11,92,171,.06) 0%, rgba(255,255,255,.92) 50%, rgba(225,29,46,.04) 100%);
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin-bottom: 16px;
    animation: fadeUp .45s ease both;
  }

  .ad-hero::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(ellipse at 15% 50%, rgba(20,116,243,.10) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 40%, rgba(225,29,46,.07) 0%, transparent 55%);
    pointer-events: none;
  }

  .ad-hero-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 22px;
  }

  .ad-logo {
    width: 72px;
    height: auto;
    flex-shrink: 0;
    filter: drop-shadow(0 4px 10px rgba(2,32,53,.20));
    animation: floaty 4.5s ease-in-out infinite;
  }

  .ad-hero-title {
    font-family: Syne, sans-serif;
    font-weight: 900;
    font-size: clamp(1.3rem, 2.8vw, 1.85rem);
    letter-spacing: -.03em;
    margin: 0;
    color: #0F172A;
    line-height: 1.15;
  }

  .ad-hero-title .blue { color: ${NL_BLUE}; }
  .ad-hero-title .red { color: ${NL_RED}; }

  .ad-divider-sm {
    width: 44px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, ${NL_BLUE}, ${NL_RED});
    margin-top: 8px;
  }

  .ad-slogan {
    font-size: 11px;
    color: rgba(15,23,42,.50);
    font-weight: 700;
    margin-top: 6px;
    letter-spacing: .02em;
  }

  .ad-hero-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin-top: 16px;
    max-width: 760px;
  }

  .ad-hstat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,.88);
    border: 1.5px solid rgba(11,92,171,.12);
    box-shadow: 0 2px 8px rgba(11,92,171,.06);
  }

  .ad-hstat-num {
    font-family: Syne, sans-serif;
    font-weight: 800;
    font-size: 1.35rem;
    background: ${NL_GRADIENT};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  }

  .ad-hstat-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: .1em;
    margin-top: 4px;
    font-family: Outfit, sans-serif;
    text-align: center;
  }

  .ad-panel-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    background: white;
    border: 1.5px solid var(--gray-200);
    border-radius: 16px;
    padding: 12px 14px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 12px;
    animation: fadeUp .45s ease both;
  }

  .ad-panel-left,
  .ad-panel-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ad-toggle-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border: 1.5px solid var(--gray-200);
    cursor: pointer;
    transition: all .18s ease;
    font-family: Outfit, sans-serif;
    letter-spacing: .02em;
    background: white;
    color: var(--gray-600);
  }

  .ad-toggle-pill:hover {
    background: var(--blue-50);
    border-color: #bfdbfe;
    color: ${NL_BLUE};
  }

  .ad-toggle-pill.active {
    background: ${NL_BLUE};
    border-color: ${NL_BLUE};
    color: white;
    box-shadow: 0 4px 12px rgba(11,92,171,.25);
  }

  .ad-chip {
    
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    border: 1.5px solid var(--gray-200);
    background: white;
    color: var(--gray-700);
    font-family: Outfit, sans-serif;
    box-shadow: var(--shadow-sm);
  }

  .ad-filter {
    background: white;
    border-radius: var(--radius-xl);
    padding: 18px 20px;
    border: 1.5px solid var(--gray-200);
    box-shadow: var(--shadow);
    margin-bottom: 16px;
    animation: fadeUp .45s ease both;
  }

  .rpt-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    color: #475569;
    letter-spacing: .10em;
    text-transform: uppercase;
    margin-bottom: 7px;
    font-family: Outfit, sans-serif;
  }

  .ad-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .ad-stat {
    background: white;
    border-radius: var(--radius-xl);
    padding: 20px 18px;
    border: 1.5px solid var(--gray-200);
    box-shadow: var(--shadow);
    transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s, border-color .2s;
    position: relative;
    overflow: hidden;
    cursor: default;
    animation: fadeUp .45s ease both;
  }

  .ad-stat:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .ad-stat-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .ad-stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .ad-stat-num {
    font-family: Syne, sans-serif;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 6px;
  }

  .ad-stat-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: .1em;
    font-family: Outfit, sans-serif;
  }

  .ad-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
    gap: 16px;
    margin-bottom: 16px;
  }

  .ad-grid-responsive {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .ad-chart {
    background: white;
    border-radius: var(--radius-xl);
    padding: 20px 20px;
    border: 1.5px solid var(--gray-200);
    box-shadow: var(--shadow);
    transition: box-shadow .25s, border-color .2s, transform .2s;
    animation: fadeUp .45s ease both;
    min-width: 0;
  }

  .ad-chart:hover {
    box-shadow: var(--shadow-md);
    border-color: ${NL_BLUE}33;
    transform: translateY(-2px);
  }

  .ad-chart-title {
    font-family: Syne, sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: var(--gray-900);
    margin: 0 0 4px;
  }

  .ad-chart-sub {
    font-size: 11px;
    color: var(--gray-400);
    margin: 0 0 18px;
    font-family: Outfit, sans-serif;
  }

  .ad-chart-canvas {
    position: relative;
    width: 100%;
    min-height: 250px;
  }

  .ad-chart-canvas.sm { min-height: 220px; }
  .ad-chart-canvas.md { min-height: 280px; }
  .ad-chart-canvas.lg { min-height: 320px; }

  .ad-section-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid var(--gray-100);
  }

  .ad-section-row:last-child {
    border-bottom: none;
  }

  .ad-section-bar-bg {
    flex: 1;
    height: 8px;
    border-radius: 999px;
    background: var(--gray-100);
    overflow: hidden;
  }

  .ad-section-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }

  .ad-table-wrap {
    overflow-x: auto;
  }

  .ad-branch-table {
    width: 100%;
    min-width: 680px;
    border-collapse: collapse;
  }

  .ad-branch-table th {
    padding: 10px 12px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .09em;
    color: rgba(255,255,255,.95);
    background: ${NL_BLUE};
    font-family: Outfit, sans-serif;
    white-space: nowrap;
  }

  .ad-branch-table th:first-child { border-radius: 10px 0 0 0; }
  .ad-branch-table th:last-child { border-radius: 0 10px 0 0; }

  .ad-branch-table td {
    padding: 10px 12px;
    font-size: 12px;
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-100);
    white-space: nowrap;
  }

  .ad-branch-table tr:hover td {
    background: var(--blue-50);
  }

  .ad-branch-table tr:last-child td {
    border-bottom: none;
  }

  .ad-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    font-family: Outfit, sans-serif;
  }

  .ad-badge-blue {
    background: var(--blue-50);
    color: ${NL_BLUE};
    border: 1px solid #bfdbfe;
  }

  .ad-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    font-family: Outfit, sans-serif;
  }

  .ad-status::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .ad-status-active { color: var(--green-700); }
  .ad-status-inactive { color: var(--red-600); }
  .ad-status-repair { color: var(--amber-600); }

  .ad-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 13px;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all .18s ease;
    font-family: Outfit, sans-serif;
    letter-spacing: .01em;
    line-height: 1;
    white-space: nowrap;
  }

  .ad-btn:hover { transform: translateY(-1px); }
  .ad-btn:active { transform: scale(.98); }

  .ad-btn-primary {
    background: ${NL_BLUE};
    color: white;
    box-shadow: 0 4px 14px rgba(11,92,171,.3);
  }
  .ad-btn-primary:hover { background: #0a4f96; }

  .ad-btn-success {
    background: var(--green-600);
    color: white;
    box-shadow: 0 4px 14px rgba(22,163,74,.25);
  }

  .ad-btn-white {
    background: white;
    border-color: var(--gray-200);
    color: var(--gray-700);
    box-shadow: var(--shadow-sm);
  }

  .ad-btn-white:hover {
    border-color: ${NL_BLUE};
    color: ${NL_BLUE};
    background: var(--blue-50);
  }

  .ad-btn-sm {
    padding: 7px 14px;
    font-size: 12px;
  }

  .rs-nl .react-select__control {
    border-radius: 12px !important;
    border: 1.5px solid #e2e8f0 !important;
    min-height: 42px !important;
    box-shadow: none !important;
    background: #fff !important;
    font-family: "DM Sans", sans-serif !important;
  }

  .rs-nl .react-select__control:hover {
    border-color: #94a3b8 !important;
  }

  .rs-nl .react-select__control--is-focused {
    border-color: ${NL_BLUE} !important;
    box-shadow: 0 0 0 4px rgba(11,92,171,.10) !important;
  }

  .rs-nl .react-select__single-value {
    color: #1e293b !important;
    font-weight: 600;
  }

  .rs-nl .react-select__placeholder {
    color: #94a3b8 !important;
  }

  .rs-nl .react-select__menu {
    border-radius: 14px !important;
    border: 1.5px solid #e2e8f0 !important;
    box-shadow: 0 12px 40px rgba(0,0,0,.10) !important;
    z-index: 200 !important;
  }
  .ad-filter {
    position: relative;
    z-index: 300;
  }
  .rs-nl {
    position: relative;
    z-index: 400;
  }
  .rs-nl .react-select__option--is-focused {
    background: #eff6ff !important;
    color: ${NL_BLUE} !important;
  }

  .rs-nl .react-select__option--is-selected {
    background: #dbeafe !important;
    color: ${NL_BLUE} !important;
    font-weight: 700 !important;
  }

  .ad-spinner {
    border-radius: 50%;
    border: 3px solid var(--gray-200);
    border-top-color: ${NL_BLUE};
    animation: spin .7s linear infinite;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

  @media (max-width: 1200px) {
    .ad-two-col {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1024px) {
    .ad-topbar {
      padding: 12px 16px;
    }
    .ad-content {
      padding: 16px 14px 34px;
    }
    .ad-hero-inner {
      padding: 18px;
    }
  }

  @media (max-width: 768px) {
    .ad-hero-inner {
      flex-direction: column;
      align-items: flex-start;
    }

    .ad-logo {
      width: 60px;
      align-self: flex-end;
    }

    .ad-hero-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
      max-width: 100%;
    }

    .ad-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ad-grid-responsive {
      grid-template-columns: 1fr;
    }

    .ad-panel-bar {
      padding: 10px 12px;
    }

    .ad-topbar {
      justify-content: center;
    }

    .ad-topbar > div {
      width: 100%;
      justify-content: center !important;
      text-align: center !important;
    }
  }

  @media (max-width: 560px) {
    .ad-stat-grid {
      grid-template-columns: 1fr;
    }

    .ad-hero-stats {
      grid-template-columns: 1fr 1fr;
    }

    .ad-chart,
    .ad-filter,
    .ad-hero {
      border-radius: 16px;
    }

    .ad-content {
      padding: 12px 10px 28px;
    }

    .ad-topbar {
      padding: 10px 10px;
    }

    .ad-chart-canvas {
      min-height: 220px;
    }
  }
`;

/* ── Icon helper ── */
const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

/* ─── Helpers ─── */
const safeArray = (v) => (!v ? [] : Array.isArray(v) ? v : [v]);

const normalizeRoleForScope = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "_");

const canViewAllBranches = (user) => {
  const role = normalizeRoleForScope(user?.role);

  return ["admin", "subadmin", "corp_user", "corpuser"].includes(role);
};

const getUserStationId = (user) =>
  user?.service_station_id ??
  user?.serviceStationId ??
  user?.branch_id ??
  user?.branchId ??
  user?.station_id ??
  user?.stationId ??
  user?.service_station?.id ??
  user?.serviceStation?.id ??
  user?.branch?.id ??
  null;

const branchBelongsToUserStation = (branch, user) => {
  const userStationId = getUserStationId(user);

  if (userStationId === null || userStationId === undefined || userStationId === "") {
    return false;
  }

  const branchIds = [
    branch?.id,
    branch?.branch_id,
    branch?.branchId,
    branch?.service_station_id,
    branch?.serviceStationId,
    branch?.station_id,
    branch?.stationId,
    branch?.service_station?.id,
    branch?.serviceStation?.id,
  ];

  return branchIds.some((value) => String(value || "") === String(userStationId));
};

const scopeBranchesForUser = (branches, user) => {
  const list = Array.isArray(branches) ? branches : [];

  if (canViewAllBranches(user)) {
    return list;
  }

  return list.filter((branch) => branchBelongsToUserStation(branch, user));
};


const guessBrand = (model) => {
  if (!model) return "";
  const s = String(model).trim();
  return s.split(/\s+/)[0] || "";
};

function yearFromDate(d) {
  if (!d) return "";
  try {
    const y = new Date(d).getFullYear();
    return Number.isFinite(y) ? String(y) : "";
  } catch {
    return "";
  }
}

const normalizeStatus = (raw) => {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return "Active";
  if (["active", "up", "running", "yes", "ok"].includes(v)) return "Active";
  if (["down", "inactive", "no", "disabled", "dead"].includes(v)) return "Inactive";
  if (["repair", "in repair", "maintenance", "maintain", "service", "servicing", "broken", "faulty", "problem"].includes(v)) return "Repair";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const pickBranchArray = (obj, keys = []) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v) && v.length) return v;
    if (v && !Array.isArray(v)) return safeArray(v);
  }
  return [];
};

const getAssetCode = (section, rawObj) => {
  const explicit =
    rawObj?.assetId ??
    rawObj?.asset_id ??
    rawObj?.asset_code ??
    rawObj?.asset_code_no ??
    rawObj?.asset_code_number;
  const val = String(explicit ?? "").trim();
  if (val && val !== "0") return val;
  return "";
};

const getAssignedUser = (section, rawObj) => {
  switch (section) {
    case "desktop":
      return rawObj?.userName || rawObj?.desktop_domain || rawObj?.name || "";
    case "laptop":
      return rawObj?.laptop_user || "";
    case "printer":
      return rawObj?.assigned_user || "";
    case "panel":
      return rawObj?.panel_user || "";
    case "ipphone":
      return rawObj?.assigned_user || "";
    case "switch":
      return rawObj?.assigned_user || "";
    case "extra_monitor":
      return rawObj?.assigned_user || "";
    default:
      return rawObj?.assigned_to || rawObj?.assigned_user || rawObj?.userName || "";
  }
};

function toReportRows(branches, subCatMap, groupMap) {
  const rows = [];
  for (const b of branches || []) {
    const branchName = b?.name || "N/A";
    const branchId = b?.id ?? null;

    const pushRow = (section, rawObj, defaults) => {
      const subCode = defaults.subCategoryCode || rawObj?.sub_category_code || "";
      const subRow = subCatMap.get(String(subCode));
      const subName = subRow?.name || "";
      const groupId = subRow?.group_id ?? subRow?.groupId ?? "";
      const categoryId = groupId ? groupMap.get(groupId)?.id || groupId : "";

      rows.push({
        branchId,
        section,
        assetId: getAssetCode(section, rawObj),
        subCategoryCode: subCode,
        categoryId,
        subCategoryName: subName,
        branch: branchName,
        brand: defaults.brand ?? "",
        name: defaults.name ?? "",
        model: defaults.model ?? "",
        purchaseYear: defaults.purchaseYear ?? "",
        lastUpdated:
          rawObj?.updatedAt ||
          rawObj?.updated_at ||
          rawObj?.createdAt ||
          rawObj?.created_at ||
          null,
        status: normalizeStatus(defaults.status),
        assignedUser: getAssignedUser(section, rawObj),
        details: { ...rawObj },
      });
    };

    safeArray(b?.connectivity).forEach((c) =>
      pushRow("connectivity", c, {
        subCategoryCode: c?.sub_category_code || "IN",
        name: "Connectivity",
        brand: "",
        model: c?.connectivity_network || "LAN",
        purchaseYear: c?.installed_year || "",
        status: c?.connectivity_status || "",
      })
    );

    safeArray(b?.ups).forEach((u) => {
      const um = u?.ups_model || "";
      pushRow("ups", u, {
        subCategoryCode: u?.sub_category_code || "UP",
        name: "UPS",
        brand: guessBrand(um),
        model: um,
        purchaseYear: u?.ups_purchase_year || "",
        status: u?.ups_status || "",
      });
    });

    const pushDevice = (section, row) => {
      const purchaseYear =
        row?.monitor_purchase_year ||
        row?.panel_purchase_year ||
        yearFromDate(row?.purchase_date) ||
        row?.purchased_year ||
        row?.installed_year ||
        "";

      const deviceName =
        row?.monitor_name ||
        row?.asset_name ||
        row?.server_name ||
        row?.firewall_name ||
        row?.name ||
        row?.scanner_name ||
        row?.projector_name ||
        row?.printer_name ||
        row?.panel_name ||
        row?.desktop_ids ||
        row?.ip_telephone_ext_no ||
        "";

      const getBrand = (r) =>
        r?.monitor_brand ||
        r?.desktop_brand ||
        r?.laptop_brand ||
        r?.panel_brand ||
        r?.cctv_brand ||
        r?.brand ||
        guessBrand(r?.model_no || r?.model || "");

      const getModel = (r) =>
        r?.system_model ||
        r?.model_no ||
        r?.model ||
        r?.scanner_model ||
        r?.projector_model ||
        r?.printer_model ||
        "";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || "",
        name: deviceName,
        brand: getBrand(row) || "",
        model: getModel(row) || "",
        purchaseYear,
        status:
          row?.monitor_status ||
          row?.printer_status ||
          row?.projector_status ||
          row?.panel_status ||
          row?.ip_telephone_status ||
          row?.status ||
          "Active",
      });
    };

    [
      "scanner",
      "projector",
      "printer",
      "desktop",
      "laptop",
      "cctv",
      "panel",
      "ipphone",
      "server",
      "firewall_router",
      "switch",
      "extra_monitor",
    ].forEach((sec) => {
      const arr =
        sec === "cctv"
          ? safeArray(b?.cctvs)
          : sec === "ipphone"
          ? safeArray(b?.ipphones)
          : sec === "server"
          ? safeArray(b?.servers)
          : sec === "firewall_router"
          ? safeArray(b?.firewallRouters || b?.firewall_routers || b?.firewalls || [])
          : sec === "switch"
          ? safeArray(b?.switches || b?.switch || [])
          : sec === "extra_monitor"
          ? safeArray(b?.extraMonitors || b?.extra_monitors || b?.extraMonitor || b?.extra_monitor || [])
          : safeArray(b?.[sec + "s"]);

      arr.forEach((r) => pushDevice(sec, r));
    });

    const getVendor = (r) => r?.vendor ?? r?.vendor_name ?? r?.provider ?? r?.provider_name ?? "";
    const getInstalledYear = (r) =>
      yearFromDate(r?.installed_on || r?.install_date || r?.purchase_date || r?.installed_date || r?.start_date) || "";
    const getExpiry = (r) => r?.expiry_on || r?.expiry_date || r?.expiryDate || null;

    const pushSoftware = (section, row, fallbackSub) => {
      const vendor = getVendor(row);
      const name =
        row?.name ||
        row?.software_name ||
        row?.product_name ||
        row?.license_name ||
        row?.service_name ||
        row?.server_name ||
        "";
      const version = row?.version || row?.os_version || "";
      const model = `${version}${row?.license_type ? ` | ${row.license_type}` : ""}${row?.quantity ? ` | Qty: ${row.quantity}` : ""}${getExpiry(row) ? ` | Exp: ${getExpiry(row)}` : ""}`.trim() || "";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || fallbackSub,
        name,
        brand: vendor,
        model,
        purchaseYear: getInstalledYear(row),
        status: row?.status || "Active",
      });
    };

    pickBranchArray(b, ["applicationSoftware", "applicationSoftwares"]).forEach((r) =>
      pushSoftware("application_software", r, "AL")
    );
    pickBranchArray(b, ["officeSoftware", "officeSoftwares"]).forEach((r) =>
      pushSoftware("office_software", r, "OF")
    );
    pickBranchArray(b, ["utilitySoftware", "utilitySoftwares"]).forEach((r) =>
      pushSoftware("utility_software", r, "BR")
    );
    pickBranchArray(b, ["securitySoftware", "securitySoftwares"]).forEach((r) =>
      pushSoftware("security_software", r, "SE")
    );
    pickBranchArray(b, ["securitySoftwareInstalled", "securitySoftwaresInstalled"]).forEach((r) => {
      const d = r?.pc_name ? ` (${r.pc_name})` : "";
      const bn = r?.product_name || r?.name || "Security Agent";
      pushSoftware("security_software_installed", { ...r, name: `${bn}${d}` }, "SE");
    });
    pickBranchArray(b, ["services", "branchServices"]).forEach((r) => {
      const provider = getVendor(r);
      pushRow("services", r, {
        subCategoryCode: r?.sub_category_code || "MS",
        name: r?.name || r?.service_name || "Service",
        brand: provider,
        model: `${r?.contract_no ? `Contract: ${r.contract_no}` : ""}${r?.provider_contact ? ` | ${r.provider_contact}` : ""}`.trim(),
        purchaseYear: getInstalledYear(r),
        status: r?.status || "Active",
      });
    });
    pickBranchArray(b, ["licenses", "branchLicenses"]).forEach((r) =>
      pushSoftware("licenses", r, "AL")
    );
    pickBranchArray(b, ["windowsOS", "windowsOs"]).forEach((r) =>
      pushSoftware("windows_os", r, "WL")
    );
    pickBranchArray(b, ["windowsServers", "branchWindowsServers"]).forEach((r) => {
      const role = r?.server_role ? `Role: ${r.server_role}` : "Windows Server";
      const ver = r?.os_version || r?.version || "";
      const model = `${ver} | ${role}${r?.cores_licensed ? ` | Cores: ${r.cores_licensed}` : ""}${r?.expiry_date ? ` | Exp: ${r.expiry_date}` : ""}`.trim();

      pushRow("windows_servers", r, {
        subCategoryCode: r?.sub_category_code || "WS",
        name: r?.server_name || r?.name || "Windows Server",
        brand: r?.vendor_name || "Microsoft",
        model,
        purchaseYear: yearFromDate(r?.created_at) || getInstalledYear(r) || "",
        status: r?.status || "Active",
      });
    });
  }
  return rows;
}

const SECTION_ICONS = {
  desktop: "🖥",
  laptop: "💻",
  printer: "🖨",
  scanner: "📠",
  projector: "📽",
  panel: "📺",
  ipphone: "📞",
  cctv: "📹",
  server: "🖧",
  firewall_router: "🔒",
  connectivity: "🌐",
  ups: "🔋",
  switch: "🔀",
  extra_monitor: "🖥",
  application_software: "💾",
  office_software: "📋",
  utility_software: "🔧",
  security_software: "🛡",
  security_software_installed: "🔐",
  services: "🔩",
  licenses: "🪪",
  windows_os: "🪟",
  windows_servers: "🏗",
};

const PALETTE = [
  "#0B5CAB",
  "#1474F3",
  "#f31225",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f472b6",
  "#14b8a6",
  "#eab308",
  "#06b6d4",
  "#a78bfa",
  "#f43f5e",
  "#0ea5e9",
  "#84cc16",
  "#fb923c",
  "#e879f9",
  "#34d399",
  "#fbbf24",
];

const gc = (n) => Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length]);

const tooltipCfg = {
  backgroundColor: "#0f172a",
  titleColor: "#fff",
  bodyColor: "#94a3b8",
  borderColor: "#334155",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 10,
  titleFont: { size: 13, weight: "700", family: "Syne,sans-serif" },
  bodyFont: { size: 12, family: "DM Sans,sans-serif" },
};

const legendCfg = {
  position: "bottom",
  labels: {
    color: "#64748b",
    font: { size: 11, weight: "600", family: "DM Sans,sans-serif" },
    padding: 14,
    boxWidth: 12,
  },
};

const axLight = {
  grid: { color: "#f1f5f9" },
  ticks: { color: "#94a3b8", font: { size: 11, family: "DM Sans,sans-serif" } },
  border: { color: "#e2e8f0" },
};

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  scales: {
    y: { ...axLight, beginAtZero: true },
    x: { ...axLight, grid: { display: false } },
  },
};

const barOptsH = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  scales: {
    x: { ...axLight, beginAtZero: true },
    y: {
      ...axLight,
      grid: { display: false },
      ticks: { ...axLight.ticks, font: { size: 10, family: "DM Sans,sans-serif" } },
    },
  },
};

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  elements: {
    line: { tension: 0.4 },
    point: { radius: 4, hoverRadius: 7, borderWidth: 2, borderColor: "#fff" },
  },
  scales: {
    y: { ...axLight, beginAtZero: true },
    x: { ...axLight, grid: { display: false } },
  },
};

const radarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: legendCfg, tooltip: tooltipCfg },
  scales: {
    r: {
      ticks: {
        backdropColor: "transparent",
        color: "#94a3b8",
        font: { size: 10 },
      },
      grid: { color: "#f1f5f9" },
      angleLines: { color: "#e2e8f0" },
      pointLabels: {
        color: "#475569",
        font: { size: 11, weight: "600" },
      },
    },
  },
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

export default function AssetDashboard() {
  const { token, user, isAdmin, isSubAdmin, isCorpUser } = useAuth();
  const navigate = useNavigate();

  const role = normalizeRoleForScope(user?.role);
  const canSeeAllBranches = canViewAllBranches(user);
  const currentUserStationId = getUserStationId(user);

  const roleLabel =
    isAdmin || role === "admin"
      ? "ADMIN"
      : isSubAdmin || role === "subadmin"
      ? "SUB ADMIN"
      : isCorpUser || role === "corp_user"
      ? "CORPORATE USER"
      : "USER";

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subCats, setSubCats] = useState([]);

  const [branchFilter, setBranchFilter] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [subCatFilter, setSubCatFilter] = useState(null);

  const [menuOpen, setMenuOpen] = useState(true);
  const [showHero, setShowHero] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    if (windowWidth < 1024) setMenuOpen(false);
    if (windowWidth >= 1024) setMenuOpen(true);
  }, [windowWidth]);

  const sidebarWidth = () => {
    if (windowWidth < 640) return menuOpen ? "84vw" : "0";
    if (windowWidth < 1024) return menuOpen ? "270px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    const res = await api.get("/api/branches/with-assets/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allBranches = Array.isArray(res?.data?.data ?? res?.data)
      ? res.data.data ?? res.data
      : [];

    setBranches(scopeBranchesForUser(allBranches, user));
  }, [token, user]);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    const res = await api.get("/api/asset-groups", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGroups(res?.data?.data || []);
  }, [token]);

  const fetchSubCats = useCallback(
    async (gid) => {
      if (!token) return;
      const res = await api.get(`/api/asset-sub-categories${gid ? `?groupId=${gid}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCats(res?.data?.data || []);
    },
    [token]
  );

  const refreshCats = useCallback(async () => {
    if (!token) return;
    try {
      await Promise.all([fetchGroups(), fetchSubCats("")]);
    } catch (e) {
      console.error(e);
    }
  }, [token, fetchGroups, fetchSubCats]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all([fetchAll(), fetchGroups(), fetchSubCats("")]);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchAll, fetchGroups, fetchSubCats]);

  const subCatMap = useMemo(() => {
    const m = new Map();
    subCats.forEach((s) => {
      if (s?.code != null) m.set(String(s.code).trim(), s);
    });
    return m;
  }, [subCats]);

  const groupMap = useMemo(() => {
    const m = new Map();
    groups.forEach((g) => {
      if (g?.id != null) m.set(g.id, g);
    });
    return m;
  }, [groups]);

  const reportRows = useMemo(() => toReportRows(branches, subCatMap, groupMap), [branches, subCatMap, groupMap]);

  const filteredRows = useMemo(() => {
    let data = reportRows;

    if (branchFilter?.value) {
      const bn = branches.find((b) => b.id === branchFilter.value)?.name;
      if (bn) data = data.filter((r) => r.branch === bn);
    }

    if (groupFilter?.value) {
      data = data.filter((r) => String(r.categoryId || "").trim() === String(groupFilter.value).trim());
    }

    if (subCatFilter?.value) {
      data = data.filter((r) => String(r.subCategoryCode || "").trim() === String(subCatFilter.value).trim());
    }

    return data;
  }, [reportRows, branches, branchFilter, groupFilter, subCatFilter]);

  const totalAll = reportRows.length;
  const totalFiltered = filteredRows.length;

  const statusCounts = useMemo(() => {
    const c = { Active: 0, Inactive: 0, Repair: 0 };
    filteredRows.forEach((r) => {
      const s = normalizeStatus(r.status);
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [filteredRows]);

  const sectionCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => m.set(r.section, (m.get(r.section) || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const branchCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => m.set(r.branch, (m.get(r.branch) || 0) + 1));
    const arr = Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    return { labels: arr.map((x) => x[0]), values: arr.map((x) => x[1]) };
  }, [filteredRows]);

  const categoryCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const id = r.categoryId?.toString().trim() || "Unknown";
      m.set(id, (m.get(id) || 0) + 1);
    });
    const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    return {
      labels: arr.map(([id]) => groupMap.get(id)?.name || id || "Unknown"),
      values: arr.map(([, v]) => v),
    };
  }, [filteredRows, groupMap]);

  const subCatCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const c = r.subCategoryCode?.trim() || null;
      if (!c) return;
      m.set(c, (m.get(c) || 0) + 1);
    });

    const arr = Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const filtered = arr.filter(([c]) => {
      if (!groupFilter?.value) return true;
      const sub = subCatMap.get(String(c).trim());
      return String(sub?.group_id || "").trim() === String(groupFilter.value).trim();
    });

    return {
      labels: filtered.map(([c]) => subCatMap.get(String(c).trim())?.name || c),
      values: filtered.map(([, v]) => v),
    };
  }, [filteredRows, subCatMap, groupFilter]);

  const assignedUserCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const u = String(r.assignedUser || "").trim();
      if (u) m.set(u, (m.get(u) || 0) + 1);
    });
    const arr = Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return { labels: arr.map((x) => x[0]), values: arr.map((x) => x[1]) };
  }, [filteredRows]);

  const branchOptions = useMemo(
    () => [
      { value: "", label: "All Branches" },
      ...branches
        .map((b) => ({ value: b.id, label: b.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [branches]
  );

  const groupOptions = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...groups.map((g) => ({ value: g.id, label: `${g.name} (${g.id})` })),
    ],
    [groups]
  );

  const subCatOptions = useMemo(
    () => [
      { value: "", label: "All Sub-Categories" },
      ...subCats
        .filter((s) => !groupFilter?.value || String(s.group_id) === String(groupFilter?.value))
        .map((s) => ({ value: s.code, label: `${s.name} (${s.code})` })),
    ],
    [subCats, groupFilter]
  );

    const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Issue Tracker", path: "/branch-issues",         icon: makeIcon(D.issue) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
  ].filter(i => i.show !== false);

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
          <h2
            style={{
              fontFamily: "Syne,sans-serif",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: NL_RED,
            }}
          >
            Unauthorized
          </h2>
          <p style={{ color: "#64748b" }}>Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid #e2e8f0",
              borderTopColor: NL_BLUE,
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#64748b", fontFamily: "DM Sans,sans-serif", fontWeight: 600 }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (!canSeeAllBranches && !currentUserStationId) {
    return (
      <>
        <style>{FONTS + STYLES}</style>
        <SplitSidebarLayout navItems={navItems} user={user}>
          <div
            style={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              fontFamily: "DM Sans,sans-serif",
              padding: 24,
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 460 }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏢</div>
              <h2
                style={{
                  fontFamily: "Syne,sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: NL_RED,
                  margin: 0,
                }}
              >
                Branch / Station not assigned
              </h2>
              <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                This user account does not have a service station assigned. Please assign
                service_station_id in Admin Users to view branch asset dashboard data.
              </p>
            </div>
          </div>
        </SplitSidebarLayout>
        <Footer />
      </>
    );
  }

  const maxSection = sectionCounts[0]?.[1] || 1;

  return (
    <>
      <style>{FONTS + STYLES}</style>
      <SplitSidebarLayout
              navItems={navItems}
              user={user}
            >
      <div className="ad-root">
        <div className="ad-layout">
          <section className="ad-main">
            <div className="ad-topbar">
              <div style={{ flex: 1, textAlign: "center", minWidth: 180 }}>
                <h1
                  style={{
                    fontFamily: "Syne,sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.1rem,2vw,1.4rem)",
                    color: NL_BLUE,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Asset <span style={{ color: NL_RED }}>Dashboard</span>
                </h1>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--gray-400)",
                    marginTop: 2,
                    fontFamily: "Outfit,sans-serif",
                  }}
                >
                  {totalAll.toLocaleString()} assets · {branches.length} branches · {sectionCounts.length} sections
                  {!canSeeAllBranches && currentUserStationId ? ` · Station ${currentUserStationId}` : ""}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {isAdmin && (
                  <>
                    <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => setShowAddCategoryModal(true)}>
                      + Category
                    </button>
                    <button className="ad-btn ad-btn-success ad-btn-sm" onClick={() => setShowAddSubCategoryModal(true)}>
                      + Sub-Cat
                    </button>
                  </>
                )}
                <button className="ad-btn ad-btn-white ad-btn-sm" onClick={() => navigate("/branch-assets-report")}>
                  📦 Asset Master
                </button>
              </div>
            </div>

            <div className="ad-content">
              <div className="ad-panel-bar">
                <div className="ad-panel-left">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--gray-400)",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    View
                  </span>

                  <button
                    className={`ad-toggle-pill ${showHero ? "active" : ""}`}
                    onClick={() => setShowHero((v) => !v)}
                  >
                    🏛 Hero
                  </button>

                  <button
                    className={`ad-toggle-pill ${showFilters ? "active" : ""}`}
                    onClick={() => setShowFilters((v) => !v)}
                  >
                    🔍 Filters
                  </button>
                </div>

                <div className="ad-panel-right">
                  <span className="ad-chip" style={{ background: NL_GRADIENT, color: "white", border: "none" }}>
                    {totalFiltered.toLocaleString()} Visible
                  </span>

                  {!canSeeAllBranches && currentUserStationId && (
                    <span className="ad-chip" style={{ borderColor: "#bfdbfe", color: NL_BLUE, background: "#eff6ff" }}>
                      Station {currentUserStationId}
                    </span>
                  )}

                  {(branchFilter?.value || groupFilter?.value || subCatFilter?.value) && (
                    <button
                      className="ad-btn ad-btn-white ad-btn-sm"
                      onClick={() => {
                        setBranchFilter(null);
                        setGroupFilter(null);
                        setSubCatFilter(null);
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {showHero && (
                <div className="ad-hero">
                  <div className="ad-hero-inner">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 className="ad-hero-title">
                        <span className="blue">NEPAL</span>
                        <span className="red">LIFE</span>{" "}
                        <span style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
                          Insurance Co. Ltd.
                        </span>
                      </h2>
                      <div className="ad-divider-sm" />
                      <p className="ad-slogan">
                        "किनकी जीवन अमूल्य छ" &nbsp;·&nbsp; Asset Information Management System
                      </p>

                      <div className="ad-hero-stats">
                        {[
                          { num: totalAll.toLocaleString(), label: "Total Assets" },
                          { num: totalFiltered.toLocaleString(), label: "Filtered" },
                          { num: branches.length, label: "Branches" },
                          { num: sectionCounts.length, label: "Sections" },
                          { num: statusCounts.Active.toLocaleString(), label: "Active" },
                          { num: statusCounts.Repair.toLocaleString(), label: "Repair" },
                        ].map((s, i) => (
                          <div key={i} className="ad-hstat">
                            <span className="ad-hstat-num">{s.num}</span>
                            <span className="ad-hstat-label">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <img src={NepalLifeLogo} alt="Nepal Life" className="ad-logo" />
                  </div>
                </div>
              )}

              {showFilters && (
                <div className="ad-filter">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Syne,sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: "var(--gray-900)",
                      }}
                    >
                      🔍 Filter Assets
                    </div>

                    {(branchFilter?.value || groupFilter?.value || subCatFilter?.value) && (
                      <button
                        className="ad-btn ad-btn-white ad-btn-sm"
                        onClick={() => {
                          setBranchFilter(null);
                          setGroupFilter(null);
                          setSubCatFilter(null);
                        }}
                      >
                        ✕ Clear Filters
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                      gap: 14,
                      
                    }}
                  >
                    {[
                      {
                        label: "Branch",
                        options: branchOptions,
                        value: branchFilter,
                        onChange: setBranchFilter,
                      },
                      {
                        label: "Category",
                        options: groupOptions,
                        value: groupFilter,
                        onChange: (v) => {
                          setGroupFilter(v);
                          setSubCatFilter(null);
                        },
                      },
                      {
                        label: "Sub-Category",
                        options: subCatOptions,
                        value: subCatFilter,
                        onChange: setSubCatFilter,
                      },
                    ].map(({ label, options, value, onChange }) => (
                      <div key={label}>
                        <label className="rpt-label">{label}</label>
                        <Select
                          options={options}
                          value={value}
                          onChange={onChange}
                          placeholder={`All ${label}s`}
                          isClearable
                          classNamePrefix="react-select"
                          className="rs-nl"
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                    <span className="ad-chip" style={{ background: NL_GRADIENT, color: "white", border: "none" }}>
                      {totalFiltered.toLocaleString()} Shown
                    </span>

                    {branchFilter?.value && (
                      <span className="ad-chip" style={{ borderColor: `${NL_BLUE}44`, color: NL_BLUE, background: "#eff6ff" }}>
                        🏢 {branchFilter.label}
                      </span>
                    )}

                    {groupFilter?.value && (
                      <span className="ad-chip" style={{ borderColor: "#c4b5fd", color: "#7c3aed", background: "#f5f3ff" }}>
                        🗂 {groupFilter.label}
                      </span>
                    )}

                    {subCatFilter?.value && (
                      <span className="ad-chip" style={{ borderColor: "#86efac", color: "#15803d", background: "#f0fdf4" }}>
                        🏷 {subCatFilter.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="ad-two-col">
                <div className="ad-chart">
                  <p className="ad-chart-title">Asset Section Breakdown</p>
                  <p className="ad-chart-sub">All asset types ranked by count</p>

                  <div>
                    {sectionCounts.slice(0, 14).map(([sec, cnt], i) => (
                      <div key={sec} className="ad-section-row">
                        <div style={{ width: 28, fontSize: 16, textAlign: "center", flexShrink: 0 }}>
                          {SECTION_ICONS[sec] || "📦"}
                        </div>
                        <div
                          style={{
                            minWidth: 80,
                            maxWidth: 120,
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--gray-600)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sec}
                        </div>
                        <div className="ad-section-bar-bg">
                          <div
                            className="ad-section-bar-fill"
                            style={{
                              width: `${(cnt / maxSection) * 100}%`,
                              background: PALETTE[i % PALETTE.length],
                            }}
                          />
                        </div>
                        <div
                          style={{
                            minWidth: 36,
                            textAlign: "right",
                            fontFamily: "Outfit,sans-serif",
                            fontWeight: 800,
                            fontSize: 12,
                            color: PALETTE[i % PALETTE.length],
                          }}
                        >
                          {cnt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ad-chart">
                  <p className="ad-chart-title">Status Distribution</p>
                  <p className="ad-chart-sub">Active · Inactive · Repair</p>

                  <div className="ad-chart-canvas sm">
                    <Doughnut
                      data={{
                        labels: ["Active", "Inactive", "Repair"],
                        datasets: [
                          {
                            data: [statusCounts.Active, statusCounts.Inactive, statusCounts.Repair],
                            backgroundColor: ["#16a34a", NL_RED, "#d97706"],
                            borderWidth: 3,
                            borderColor: "#fff",
                            hoverBorderWidth: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "68%",
                        plugins: { legend: legendCfg, tooltip: tooltipCfg },
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 12,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {[
                      { label: "Active", val: statusCounts.Active, cls: "ad-status-active" },
                      { label: "Inactive", val: statusCounts.Inactive, cls: "ad-status-inactive" },
                      { label: "Repair", val: statusCounts.Repair, cls: "ad-status-repair" },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <span className={`ad-status ${s.cls}`}>{s.label}</span>
                        <div
                          style={{
                            fontFamily: "Syne,sans-serif",
                            fontWeight: 800,
                            fontSize: 18,
                            marginTop: 2,
                          }}
                        >
                          {s.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ad-grid-responsive">
                <div className="ad-chart">
                  <p className="ad-chart-title">Assets by Category</p>
                  <p className="ad-chart-sub">{categoryCounts.labels.length} categories found</p>
                  <div className="ad-chart-canvas md">
                    <Pie
                      data={{
                        labels: categoryCounts.labels,
                        datasets: [
                          {
                            data: categoryCounts.values,
                            backgroundColor: gc(categoryCounts.values.length),
                            borderWidth: 3,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: legendCfg, tooltip: tooltipCfg },
                      }}
                    />
                  </div>
                </div>

                <div className="ad-chart">
                  <p className="ad-chart-title">Assets by Sub-Category</p>
                  <p className="ad-chart-sub">{subCatCounts.labels.length} sub-categories shown</p>
                  <div className="ad-chart-canvas md">
                    <Pie
                      data={{
                        labels: subCatCounts.labels,
                        datasets: [
                          {
                            data: subCatCounts.values,
                            backgroundColor: gc(subCatCounts.values.length),
                            borderWidth: 3,
                            borderColor: "#fff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: legendCfg, tooltip: tooltipCfg },
                      }}
                    />
                  </div>
                </div>

                <div className="ad-chart">
                  <p className="ad-chart-title">Assets by Section (Polar)</p>
                  <p className="ad-chart-sub">Radial breakdown of all sections</p>
                  <div className="ad-chart-canvas md">
                    <PolarArea
                      data={{
                        labels: sectionCounts.slice(0, 10).map(([s]) => `${SECTION_ICONS[s] || ""} ${s}`),
                        datasets: [
                          {
                            data: sectionCounts.slice(0, 10).map(([, c]) => c),
                            backgroundColor: gc(10).map((c) => `${c}cc`),
                            borderColor: gc(10),
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: legendCfg, tooltip: tooltipCfg },
                        scales: {
                          r: {
                            ticks: {
                              backdropColor: "transparent",
                              color: "#94a3b8",
                              font: { size: 10 },
                            },
                            grid: { color: "#f1f5f9" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="ad-grid-responsive">
                <div className="ad-chart">
                  <p className="ad-chart-title">Assets per Category (Bar)</p>
                  <p className="ad-chart-sub">Grouped by category code</p>
                  <div className="ad-chart-canvas md">
                    <Bar
                      data={{
                        labels: categoryCounts.labels,
                        datasets: [
                          {
                            label: "Assets",
                            data: categoryCounts.values,
                            backgroundColor: gc(categoryCounts.values.length),
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={barOpts}
                    />
                  </div>
                </div>

                <div className="ad-chart">
                  <p className="ad-chart-title">Top Sub-Categories (Bar)</p>
                  <p className="ad-chart-sub">Up to 15 sub-categories by count</p>
                  <div className="ad-chart-canvas md">
                    <Bar
                      data={{
                        labels: subCatCounts.labels,
                        datasets: [
                          {
                            label: "Assets",
                            data: subCatCounts.values,
                            backgroundColor: gc(subCatCounts.values.length),
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={barOpts}
                    />
                  </div>
                </div>
              </div>

              <div className="ad-grid-responsive">
                <div className="ad-chart">
                  <p className="ad-chart-title">Section Horizontal Breakdown</p>
                  <p className="ad-chart-sub">All {sectionCounts.length} sections compared</p>
                  <div className="ad-chart-canvas lg">
                    <Bar
                      data={{
                        labels: sectionCounts.map(([s]) => `${SECTION_ICONS[s] || ""} ${s}`),
                        datasets: [
                          {
                            label: "Assets",
                            data: sectionCounts.map(([, c]) => c),
                            backgroundColor: sectionCounts.map((_, i) => `${PALETTE[i % PALETTE.length]}cc`),
                            borderColor: sectionCounts.map((_, i) => PALETTE[i % PALETTE.length]),
                            borderWidth: 1.5,
                            borderRadius: 6,
                          },
                        ],
                      }}
                      options={barOptsH}
                    />
                  </div>
                </div>

                <div className="ad-chart">
                  <p className="ad-chart-title">Section Radar (Top 6)</p>
                  <p className="ad-chart-sub">Multi-axis comparison of leading sections</p>
                  <div className="ad-chart-canvas lg">
                    <Radar
                      data={{
                        labels: sectionCounts.slice(0, 6).map(([s]) => `${SECTION_ICONS[s] || ""} ${s}`),
                        datasets: [
                          {
                            label: "All Branches",
                            data: sectionCounts.slice(0, 6).map(([, c]) => c),
                            backgroundColor: `${NL_BLUE}22`,
                            borderColor: NL_BLUE,
                            borderWidth: 2,
                            pointBackgroundColor: NL_BLUE,
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                          },
                        ],
                      }}
                      options={radarOpts}
                    />
                  </div>
                </div>
              </div>

              <div className="ad-chart">
                <p className="ad-chart-title">Assets per Branch (Line)</p>
                <p className="ad-chart-sub">Distribution across all {branches.length} branches — top 15 shown</p>
                <div className="ad-chart-canvas lg">
                  <Line
                    data={{
                      labels: branchCounts.labels,
                      datasets: [
                        {
                          label: "Assets",
                          data: branchCounts.values,
                          fill: true,
                          backgroundColor: `${NL_BLUE}12`,
                          borderColor: NL_BLUE,
                          borderWidth: 2.5,
                          tension: 0.4,
                          pointBackgroundColor: NL_BLUE,
                          pointBorderColor: "#fff",
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 8,
                        },
                      ],
                    }}
                    options={lineOpts}
                  />
                </div>
              </div>

              <div className="ad-grid-responsive">
                <div className="ad-chart">
                  <p className="ad-chart-title">Branch Asset Bar</p>
                  <p className="ad-chart-sub">Top 15 branches by asset count</p>
                  <div className="ad-chart-canvas md">
                    <Bar
                      data={{
                        labels: branchCounts.labels,
                        datasets: [
                          {
                            label: "Assets",
                            data: branchCounts.values,
                            backgroundColor: branchCounts.values.map((_, i) => `${PALETTE[i % PALETTE.length]}cc`),
                            borderColor: branchCounts.values.map((_, i) => PALETTE[i % PALETTE.length]),
                            borderWidth: 1.5,
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={barOpts}
                    />
                  </div>
                </div>

                {assignedUserCounts.labels.length > 0 && (
                  <div className="ad-chart">
                    <p className="ad-chart-title">Top Assigned Users</p>
                    <p className="ad-chart-sub">Users with most assigned assets (top 10)</p>
                    <div className="ad-chart-canvas md">
                      <Bar
                        data={{
                          labels: assignedUserCounts.labels,
                          datasets: [
                            {
                              label: "Assets Assigned",
                              data: assignedUserCounts.values,
                              backgroundColor: gc(assignedUserCounts.values.length).map((c) => `${c}cc`),
                              borderColor: gc(assignedUserCounts.values.length),
                              borderWidth: 1.5,
                              borderRadius: 8,
                            },
                          ],
                        }}
                        options={barOptsH}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      </SplitSidebarLayout>

      <Footer />

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={refreshCats}
        token={token}
      />

      <AddSubCategoryModal
        isOpen={showAddSubCategoryModal}
        onClose={() => setShowAddSubCategoryModal(false)}
        onSuccess={refreshCats}
        token={token}
        groups={groups}
      />
    </>
  );
}