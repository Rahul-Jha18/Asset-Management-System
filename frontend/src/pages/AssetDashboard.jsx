// src/pages/AssetDashboard.jsx
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { Pie, Bar, Line, Doughnut, Radar } from "react-chartjs-2";
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
import AddCategoryModal from "../components/AddModel/AddCategoryModal";
import AddSubCategoryModal from "../components/AddModel/AddSubCategoryModal";
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

/* ══════════════════════════════════════════════════════════════
   Nepal Life — Asset Dashboard
   Clean, professional, data-dense. Plain / flat chart colors.
   Simple system sans-serif typography (no decorative fonts).
═══════════════════════════════════════════════════════════════ */

const NL_BLUE = "#1D4ED8";
const NL_BLUE_SOFT = "#2563EB";
const NL_RED = "#DC2626";

/* Plain / flat palette used consistently across every chart.
   No gradients, no translucency tricks — just clear, distinct,
   professional colors that read well on white. */
const PALETTE = [
  "#2563EB", // blue
  "#0D9488", // teal
  "#7C3AED", // violet
  "#D97706", // amber
  "#DB2777", // pink
  "#059669", // emerald
  "#DC2626", // red
  "#4F46E5", // indigo
  "#CA8A04", // yellow-700
  "#0891B2", // cyan
  "#EA580C", // orange
  "#65A30D", // lime
  "#9333EA", // purple
  "#0284C7", // sky
  "#BE123C", // rose
  "#15803D", // green
  "#6D28D9", // deep violet
  "#B45309", // deep amber
];

const STATUS_COLORS = { Active: "#16A34A", Inactive: "#DC2626", Repair: "#D97706" };

const FONT_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --nl-blue: ${NL_BLUE};
    --nl-blue-soft: ${NL_BLUE_SOFT};
    --nl-red: ${NL_RED};

    --ink-900: #0F172A;
    --ink-700: #334155;
    --ink-600: #475569;
    --ink-500: #64748B;
    --ink-400: #94A3B8;
    --ink-300: #CBD5E1;
    --ink-200: #E2E8F0;
    --ink-100: #F1F5F9;
    --ink-50:  #F8FAFC;

    --green-50: #F0FDF4;  --green-600: #16A34A; --green-700: #15803D;
    --amber-50: #FFFBEB;  --amber-600: #D97706;
    --red-50:   #FEF2F2;  --red-600:   #DC2626;
    --blue-50:  #EFF6FF;  --blue-200:  #BFDBFE;

    --radius-sm: 8px;
    --radius: 12px;
    --radius-lg: 16px;

    --shadow-sm: 0 1px 2px rgba(15,23,42,0.05);
    --shadow: 0 1px 3px rgba(15,23,42,0.06), 0 6px 16px rgba(15,23,42,0.05);
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ad-root {
    font-family: ${FONT_STACK};
    background: var(--ink-50);
    max-height: 100vh;
    display: flex;
    color: var(--ink-900);
  }
  .ad-layout { display: flex; width: 100%; max-height: 90vh; }
  .ad-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }

  .ad-topbar {
    background: #fff;
    border-bottom: 1px solid var(--ink-200);
    padding: 14px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .ad-title { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.01em; margin: 0; color: var(--ink-900); }
  .ad-subtitle { font-size: 12px; color: var(--ink-500); margin-top: 2px; font-weight: 500; }

  .ad-content { flex: 1; padding: 20px 22px 44px; overflow-y: auto; }

  .ad-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm); font-weight: 600; font-size: 13px;
    border: 1px solid transparent; cursor: pointer; transition: background .15s, border-color .15s;
    font-family: ${FONT_STACK}; line-height: 1; white-space: nowrap;
  }
  .ad-btn-primary { background: var(--nl-blue); color: #fff; }
  .ad-btn-primary:hover { background: #1E40AF; }
  .ad-btn-success { background: var(--green-600); color: #fff; }
  .ad-btn-success:hover { background: var(--green-700); }
  .ad-btn-white { background: #fff; border-color: var(--ink-200); color: var(--ink-700); }
  .ad-btn-white:hover { border-color: var(--nl-blue); color: var(--nl-blue); background: var(--blue-50); }
  .ad-btn-sm { padding: 6px 12px; font-size: 12px; }

  .ad-panel-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
    background: #fff; border: 1px solid var(--ink-200); border-radius: var(--radius);
    padding: 10px 14px; box-shadow: var(--shadow-sm); margin-bottom: 14px;
  }
  .ad-panel-left, .ad-panel-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .ad-toggle-pill {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px;
    font-size: 12px; font-weight: 700; border: 1px solid var(--ink-200); cursor: pointer;
    transition: all .15s ease; background: #fff; color: var(--ink-600); font-family: ${FONT_STACK};
  }
  .ad-toggle-pill:hover { background: var(--blue-50); border-color: var(--blue-200); color: var(--nl-blue); }
  .ad-toggle-pill.active { background: var(--nl-blue); border-color: var(--nl-blue); color: #fff; }

  .ad-chip {
    display: inline-flex; align-items: center; padding: 5px 11px; border-radius: 999px; font-size: 11px;
    font-weight: 700; border: 1px solid var(--ink-200); background: #fff; color: var(--ink-700);
    font-family: ${FONT_STACK};
  }

  .ad-hero {
    background: #fff; border: 1px solid var(--ink-200); border-radius: var(--radius-lg);
    margin-bottom: 14px; animation: fadeUp .3s ease both; overflow: hidden;
  }
  .ad-hero-inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 24px; }
  .ad-logo { width: 56px; height: auto; flex-shrink: 0; }
  .ad-hero-title { font-weight: 800; font-size: clamp(1.1rem, 2.4vw, 1.5rem); letter-spacing: -0.02em; margin: 0; color: var(--ink-900); }
  .ad-hero-title .accent { color: var(--nl-blue); }
  .ad-slogan { font-size: 12px; color: var(--ink-500); font-weight: 500; margin-top: 4px; }

  .ad-filter {
    background: #fff; border-radius: var(--radius-lg); padding: 18px 20px; border: 1px solid var(--ink-200);
    box-shadow: var(--shadow-sm); margin-bottom: 14px; animation: fadeUp .3s ease both;
  }
  .rpt-label {
    display: block; font-size: 11px; font-weight: 700; color: var(--ink-600); letter-spacing: .04em;
    text-transform: uppercase; margin-bottom: 6px; font-family: ${FONT_STACK};
  }

  .ad-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .ad-stat {
    background: #fff; border-radius: var(--radius); padding: 16px 16px; border: 1px solid var(--ink-200);
    box-shadow: var(--shadow-sm); position: relative; overflow: hidden; animation: fadeUp .3s ease both;
  }
  .ad-stat-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .ad-stat-label { font-size: 11px; font-weight: 700; color: var(--ink-500); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
  .ad-stat-num { font-size: 1.7rem; font-weight: 800; line-height: 1; color: var(--ink-900); }
  .ad-stat-sub { font-size: 11px; color: var(--ink-400); margin-top: 6px; font-weight: 500; }

  .ad-two-col { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); gap: 14px; margin-bottom: 14px; }
  .ad-grid-responsive { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-bottom: 14px; }

  .ad-chart {
    background: #fff; border-radius: var(--radius-lg); padding: 18px 20px; border: 1px solid var(--ink-200);
    box-shadow: var(--shadow-sm); animation: fadeUp .3s ease both; min-width: 0;
  }
  .ad-chart-title { font-size: 13.5px; font-weight: 700; color: var(--ink-900); margin: 0 0 3px; }
  .ad-chart-sub { font-size: 11.5px; color: var(--ink-400); margin: 0 0 16px; font-weight: 500; }
  .ad-chart-canvas { position: relative; width: 100%; min-height: 250px; }
  .ad-chart-canvas.sm { min-height: 220px; }
  .ad-chart-canvas.md { min-height: 270px; }
  .ad-chart-canvas.lg { min-height: 320px; }

  .ad-section-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--ink-100); }
  .ad-section-row:last-child { border-bottom: none; }
  .ad-section-bar-bg { flex: 1; height: 7px; border-radius: 999px; background: var(--ink-100); overflow: hidden; }
  .ad-section-bar-fill { height: 100%; border-radius: 999px; }

  .ad-table-wrap { overflow-x: auto; }
  .ad-branch-table { width: 100%; min-width: 720px; border-collapse: collapse; }
  .ad-branch-table th {
    padding: 9px 12px; text-align: left; font-size: 10.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .05em; color: var(--ink-500); background: var(--ink-50); border-bottom: 1px solid var(--ink-200);
    white-space: nowrap; font-family: ${FONT_STACK};
  }
  .ad-branch-table td { padding: 9px 12px; font-size: 12.5px; color: var(--ink-700); border-bottom: 1px solid var(--ink-100); white-space: nowrap; }
  .ad-branch-table tr:hover td { background: var(--blue-50); }
  .ad-branch-table tr:last-child td { border-bottom: none; }

  .ad-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--ink-100);
  }

  .ad-pagination-left,
  .ad-pagination-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ad-page-info {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-500);
  }

  .ad-page-select {
    height: 32px;
    border: 1px solid var(--ink-200);
    border-radius: 8px;
    background: #fff;
    color: var(--ink-700);
    font-size: 12px;
    font-weight: 600;
    padding: 0 8px;
    font-family: ${FONT_STACK};
    outline: none;
  }

  .ad-page-select:focus {
    border-color: var(--nl-blue);
    box-shadow: 0 0 0 3px rgba(37,99,235,.10);
  }

  .ad-page-btn {
    min-width: 32px;
    height: 32px;
    border: 1px solid var(--ink-200);
    border-radius: 8px;
    background: #fff;
    color: var(--ink-700);
    font-size: 12px;
    font-weight: 700;
    font-family: ${FONT_STACK};
    cursor: pointer;
    transition: background .15s, border-color .15s, color .15s;
  }

  .ad-page-btn:hover:not(:disabled) {
    background: var(--blue-50);
    border-color: var(--blue-200);
    color: var(--nl-blue);
  }

  .ad-page-btn.active {
    background: var(--nl-blue);
    border-color: var(--nl-blue);
    color: #fff;
  }

  .ad-page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .ad-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: ${FONT_STACK}; }
  .ad-badge-blue { background: var(--blue-50); color: var(--nl-blue); border: 1px solid var(--blue-200); }

  .ad-status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; font-family: ${FONT_STACK}; }
  .ad-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .ad-status-active { color: var(--green-700); }
  .ad-status-inactive { color: var(--red-600); }
  .ad-status-repair { color: var(--amber-600); }

  .rs-nl .react-select__control {
    border-radius: var(--radius-sm) !important; border: 1px solid var(--ink-200) !important; min-height: 40px !important;
    box-shadow: none !important; background: #fff !important; font-family: ${FONT_STACK} !important; font-size: 13px !important;
  }
  .rs-nl .react-select__control:hover { border-color: var(--ink-300) !important; }
  .rs-nl .react-select__control--is-focused { border-color: var(--nl-blue) !important; box-shadow: 0 0 0 3px rgba(37,99,235,.10) !important; }
  .rs-nl .react-select__single-value { color: var(--ink-900) !important; font-weight: 500; }
  .rs-nl .react-select__placeholder { color: var(--ink-400) !important; }
  .rs-nl .react-select__menu { border-radius: 10px !important; border: 1px solid var(--ink-200) !important; box-shadow: 0 10px 30px rgba(15,23,42,.10) !important; z-index: 200 !important; }
  .ad-filter { position: relative; z-index: 300; }
  .rs-nl { position: relative; z-index: 400; }
  .rs-nl .react-select__option--is-focused { background: var(--blue-50) !important; color: var(--nl-blue) !important; }
  .rs-nl .react-select__option--is-selected { background: var(--blue-200) !important; color: var(--nl-blue) !important; font-weight: 700 !important; }

  .ad-spinner { border-radius: 50%; border: 3px solid var(--ink-200); border-top-color: var(--nl-blue); animation: spin .7s linear infinite; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--ink-300); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--ink-400); }

  @media (max-width: 1200px) { .ad-two-col { grid-template-columns: 1fr; } }
  @media (max-width: 1024px) { .ad-topbar { padding: 12px 16px; } .ad-content { padding: 16px 14px 34px; } .ad-hero-inner { padding: 18px; } }
  @media (max-width: 768px) {
    .ad-hero-inner { flex-direction: column; align-items: flex-start; }
    .ad-logo { width: 46px; align-self: flex-end; }
    .ad-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ad-grid-responsive { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .ad-stat-grid { grid-template-columns: 1fr; }
    .ad-chart, .ad-filter, .ad-hero { border-radius: var(--radius); }
    .ad-content { padding: 12px 10px 28px; }
    .ad-topbar { padding: 10px 10px; }
    .ad-chart-canvas { min-height: 220px; }
  }
`;

/* ── Icon helper ── */
const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

/* ─── Helpers (shared logic with the Asset Master Report) ─── */
const safeArray = (v) => (!v ? [] : Array.isArray(v) ? v : [v]);

const normalizeRoleForScope = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "_");

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

const branchMatchesUserStation = (branch, user) => {
  const stationId = getUserStationId(user);
  if (stationId === null || stationId === undefined || stationId === "") return false;
  const branchIds = [
    branch?.service_station_id,
    branch?.serviceStationId,
    branch?.service_station?.id,
    branch?.serviceStation?.id,
    branch?.station_id,
    branch?.stationId,
    branch?.id,
  ];
  return branchIds.some((value) => String(value || "") === String(stationId));
};

const normalizeText = (v) => String(v ?? "").trim().toLowerCase();

const scopeBranchesForUser = (branches, user, { isAdmin, isSubAdmin, isCorpUser }) => {
  const list = Array.isArray(branches) ? branches : [];
  if (!user) return [];
  const role = normalizeRoleForScope(user?.role);
  const isCorporateUser = isCorpUser || role === "corp_user" || role === "corpuser";

  if (isAdmin) return list;
  if (isSubAdmin || isCorporateUser) return list.filter((b) => branchMatchesUserStation(b, user));
  return list.filter((b) => normalizeText(b?.name) === normalizeText(user?.name));
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
  if (["down", "inactive", "no", "disabled", "dead", "dump", "dumped"].includes(v)) return "Inactive";
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
    rawObj?.assetId ?? rawObj?.asset_id ?? rawObj?.asset_code ?? rawObj?.asset_code_no ?? rawObj?.asset_code_number;
  const val = String(explicit ?? "").trim();
  if (val && val !== "0") return val;
  return "";
};

const getAssignedUser = (section, rawObj) => {
  switch (section) {
    case "desktop":
    case "qr_desktop_computer":
      return rawObj?.userName || rawObj?.desktop_domain || rawObj?.name || "";
    case "laptop":
      return rawObj?.laptop_user || "";
    case "panel":
      return rawObj?.panel_user || "";
    default:
      return rawObj?.assigned_to || rawObj?.assigned_user || rawObj?.userName || "";
  }
};

/* Human-friendly section labels for chart legends / lists */
const displaySectionName = (section) => {
  const s = String(section || "").toLowerCase();
  const map = {
    qr_desktop_computer: "QR Monitor",
    extra_monitor: "Extra Monitor",
    firewall_router: "Firewall / Router",
    application_software: "Application Software",
    office_software: "Office Software",
    utility_software: "Utility Software",
    security_software: "Security Software",
    security_software_installed: "Security Software Installed",
    windows_os: "Windows OS",
    windows_servers: "Windows Servers",
    online_conference_tools: "Online Conference Tools",
  };
  return map[s] || String(section || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
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
        lastUpdated: rawObj?.updatedAt || rawObj?.updated_at || rawObj?.createdAt || rawObj?.created_at || null,
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

    safeArray(b?.inverters || b?.inverter).forEach((inv) => {
      const im = inv?.inverter_model || "";
      pushRow("inverter", inv, {
        subCategoryCode: inv?.sub_category_code || "IV",
        name: inv?.name || "Inverter",
        brand: guessBrand(im),
        model: im,
        purchaseYear: inv?.inverter_purchase_year || "",
        status: inv?.inverter_status || "",
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
        r?.monitor_brand || r?.desktop_brand || r?.laptop_brand || r?.panel_brand || r?.cctv_brand || r?.brand || guessBrand(r?.model_no || r?.model || "");

      const getModel = (r) => r?.system_model || r?.model_no || r?.model || r?.scanner_model || r?.projector_model || r?.printer_model || "";

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
      "qr_desktop_computer",
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
          : sec === "qr_desktop_computer"
          ? safeArray(b?.qrDesktopComputers || b?.qr_desktop_computer || b?.qr_desktop_computers || b?.qrDesktopComputer || b?.qrMonitors || b?.qr_monitors || [])
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
        row?.name || row?.software_name || row?.product_name || row?.license_name || row?.service_name || row?.server_name || row?.tool_name || "";
      const version = row?.version || row?.os_version || "";
      const model =
        `${version}${row?.license_type ? ` | ${row.license_type}` : ""}${row?.quantity ? ` | Qty: ${row.quantity}` : ""}${
          row?.no_of_users ? ` | Users: ${row.no_of_users}` : ""
        }${getExpiry(row) ? ` | Exp: ${getExpiry(row)}` : ""}`.trim() || "";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || fallbackSub,
        name,
        brand: vendor,
        model,
        purchaseYear: getInstalledYear(row),
        status: row?.status || "Active",
      });
    };

    pickBranchArray(b, ["applicationSoftware", "applicationSoftwares"]).forEach((r) => pushSoftware("application_software", r, "AL"));
    pickBranchArray(b, ["officeSoftware", "officeSoftwares"]).forEach((r) => pushSoftware("office_software", r, "OF"));
    pickBranchArray(b, ["utilitySoftware", "utilitySoftwares"]).forEach((r) => pushSoftware("utility_software", r, "BR"));
    pickBranchArray(b, ["securitySoftware", "securitySoftwares"]).forEach((r) => pushSoftware("security_software", r, "SE"));
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
    pickBranchArray(b, ["licenses", "branchLicenses"]).forEach((r) => pushSoftware("licenses", r, "AL"));
    pickBranchArray(b, ["windowsOS", "windowsOs"]).forEach((r) => pushSoftware("windows_os", r, "WL"));
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
    pickBranchArray(b, ["onlineConferenceTools", "onlineConferenceTool", "online_conference_tools"]).forEach((r) =>
      pushSoftware("online_conference_tools", r, "OC")
    );
  }
  return rows;
}

const SECTION_ICONS = {
  desktop: "🖥",
  qr_desktop_computer: "🖥",
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
  inverter: "🔌",
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
  online_conference_tools: "🎥",
};

const gc = (n) => Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length]);

const tooltipCfg = {
  backgroundColor: "#0F172A",
  titleColor: "#fff",
  bodyColor: "#CBD5E1",
  borderColor: "#334155",
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: "700", family: FONT_STACK },
  bodyFont: { size: 12, family: FONT_STACK },
};

const legendCfg = {
  position: "bottom",
  labels: {
    color: "#475569",
    font: { size: 11, weight: "600", family: FONT_STACK },
    padding: 12,
    boxWidth: 11,
    usePointStyle: true,
    pointStyle: "rectRounded",
  },
};

const axLight = {
  grid: { color: "#F1F5F9" },
  ticks: { color: "#94A3B8", font: { size: 11, family: FONT_STACK } },
  border: { color: "#E2E8F0" },
};

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  scales: { y: { ...axLight, beginAtZero: true }, x: { ...axLight, grid: { display: false } } },
};

const barOptsH = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  scales: {
    x: { ...axLight, beginAtZero: true },
    y: { ...axLight, grid: { display: false }, ticks: { ...axLight.ticks, font: { size: 10.5, family: FONT_STACK } } },
  },
};

const stackedBarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: legendCfg, tooltip: tooltipCfg },
  scales: {
    y: { ...axLight, beginAtZero: true, stacked: true },
    x: { ...axLight, grid: { display: false }, stacked: true },
  },
};

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  elements: { line: { tension: 0.35 }, point: { radius: 3.5, hoverRadius: 6, borderWidth: 2, borderColor: "#fff" } },
  scales: { y: { ...axLight, beginAtZero: true }, x: { ...axLight, grid: { display: false } } },
};

const radarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tooltipCfg },
  scales: {
    r: {
      ticks: { backdropColor: "transparent", color: "#94A3B8", font: { size: 10, family: FONT_STACK } },
      grid: { color: "#F1F5F9" },
      angleLines: { color: "#E2E8F0" },
      pointLabels: { color: "#475569", font: { size: 11, weight: "600", family: FONT_STACK } },
    },
  },
};

const D = {
  branch: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  issue:
    "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  graph:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
};

export default function AssetDashboard() {
  const { token, user, isAdmin, isSubAdmin, isCorpUser } = useAuth();
  const navigate = useNavigate();

  const role = normalizeRoleForScope(user?.role);
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
  const [showHero, setShowHero] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [branchSummaryPage, setBranchSummaryPage] = useState(1);
  const [branchSummaryPageSize, setBranchSummaryPageSize] = useState(10);

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

  const roleFilteredBranches = useMemo(
    () => scopeBranchesForUser(branches, user, { isAdmin, isSubAdmin, isCorpUser }),
    [branches, user, isAdmin, isSubAdmin, isCorpUser]
  );

  const canSeeAllBranches = isAdmin;
  const currentUserStationId = getUserStationId(user);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    const res = await api.get("/api/branches/with-assets/all", { headers: { Authorization: `Bearer ${token}` } });
    const allBranches = Array.isArray(res?.data?.data ?? res?.data) ? res.data.data ?? res.data : [];
    setBranches(allBranches);
  }, [token]);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    const res = await api.get("/api/asset-groups", { headers: { Authorization: `Bearer ${token}` } });
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

  const reportRows = useMemo(() => toReportRows(roleFilteredBranches, subCatMap, groupMap), [roleFilteredBranches, subCatMap, groupMap]);

  const filteredRows = useMemo(() => {
    let data = reportRows;

    if (branchFilter?.value) {
      const bn = roleFilteredBranches.find((b) => b.id === branchFilter.value)?.name;
      if (bn) data = data.filter((r) => r.branch === bn);
    }
    if (groupFilter?.value) {
      data = data.filter((r) => String(r.categoryId || "").trim() === String(groupFilter.value).trim());
    }
    if (subCatFilter?.value) {
      data = data.filter((r) => String(r.subCategoryCode || "").trim() === String(subCatFilter.value).trim());
    }
    return data;
  }, [reportRows, roleFilteredBranches, branchFilter, groupFilter, subCatFilter]);

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
    const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);
    return { labels: arr.map((x) => x[0]), values: arr.map((x) => x[1]) };
  }, [filteredRows]);

  const categoryCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const id = r.categoryId?.toString().trim() || "Unassigned";
      m.set(id, (m.get(id) || 0) + 1);
    });
    const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    return { labels: arr.map(([id]) => groupMap.get(id)?.name || id || "Unassigned"), values: arr.map(([, v]) => v) };
  }, [filteredRows, groupMap]);

  const subCatCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const c = r.subCategoryCode?.trim() || null;
      if (!c) return;
      m.set(c, (m.get(c) || 0) + 1);
    });
    const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const filtered = arr.filter(([c]) => {
      if (!groupFilter?.value) return true;
      const sub = subCatMap.get(String(c).trim());
      return String(sub?.group_id || "").trim() === String(groupFilter.value).trim();
    });
    return { labels: filtered.map(([c]) => subCatMap.get(String(c).trim())?.name || c), values: filtered.map(([, v]) => v) };
  }, [filteredRows, subCatMap, groupFilter]);

  const assignedUserCounts = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      const u = String(r.assignedUser || "").trim();
      if (u) m.set(u, (m.get(u) || 0) + 1);
    });
    const arr = Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { labels: arr.map((x) => x[0]), values: arr.map((x) => x[1]) };
  }, [filteredRows]);

  const assignedUserTotal = useMemo(() => {
    const s = new Set();
    filteredRows.forEach((r) => {
      const u = String(r.assignedUser || "").trim();
      if (u) s.add(u);
    });
    return s.size;
  }, [filteredRows]);

  /* Category × Status — top 6 categories, stacked by status, for a health-at-a-glance view */
  const categoryStatusStack = useMemo(() => {
    const top = categoryCounts.labels.slice(0, 6);
    const perCat = top.map((label) => {
      const rowsInCat = filteredRows.filter((r) => (groupMap.get(String(r.categoryId))?.name || r.categoryId || "Unassigned") === label);
      const c = { Active: 0, Inactive: 0, Repair: 0 };
      rowsInCat.forEach((r) => {
        const s = normalizeStatus(r.status);
        c[s] = (c[s] || 0) + 1;
      });
      return c;
    });
    return {
      labels: top,
      active: perCat.map((c) => c.Active),
      inactive: perCat.map((c) => c.Inactive),
      repair: perCat.map((c) => c.Repair),
    };
  }, [categoryCounts.labels, filteredRows, groupMap]);

  /* Per-branch summary table */
  const branchSummary = useMemo(() => {
    const m = new Map();
    filteredRows.forEach((r) => {
      if (!m.has(r.branch)) m.set(r.branch, { branch: r.branch, total: 0, Active: 0, Inactive: 0, Repair: 0, sections: new Map() });
      const rec = m.get(r.branch);
      rec.total += 1;
      const s = normalizeStatus(r.status);
      rec[s] = (rec[s] || 0) + 1;
      rec.sections.set(r.section, (rec.sections.get(r.section) || 0) + 1);
    });
    return Array.from(m.values())
      .map((rec) => {
        let topSection = "";
        let topCount = 0;
        rec.sections.forEach((v, k) => {
          if (v > topCount) {
            topCount = v;
            topSection = k;
          }
        });
        return { ...rec, topSection, topCount };
      })
      .sort((a, b) => b.total - a.total);
  }, [filteredRows]);

  useEffect(() => {
    setBranchSummaryPage(1);
  }, [branchFilter, groupFilter, subCatFilter, branchSummaryPageSize]);

  const branchSummaryTotalPages = Math.max(1, Math.ceil(branchSummary.length / branchSummaryPageSize));

  const safeBranchSummaryPage = Math.min(branchSummaryPage, branchSummaryTotalPages);

  const paginatedBranchSummary = useMemo(() => {
    const start = (safeBranchSummaryPage - 1) * branchSummaryPageSize;
    return branchSummary.slice(start, start + branchSummaryPageSize);
  }, [branchSummary, safeBranchSummaryPage, branchSummaryPageSize]);

  const branchSummaryStart = branchSummary.length === 0 ? 0 : (safeBranchSummaryPage - 1) * branchSummaryPageSize + 1;
  const branchSummaryEnd = Math.min(safeBranchSummaryPage * branchSummaryPageSize, branchSummary.length);

  const branchSummaryPageNumbers = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safeBranchSummaryPage - half);
    let end = Math.min(branchSummaryTotalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safeBranchSummaryPage, branchSummaryTotalPages]);

  const branchOptions = useMemo(
    () => [
      { value: "", label: "All Branches" },
      ...roleFilteredBranches.map((b) => ({ value: b.id, label: b.name })).sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [roleFilteredBranches]
  );

  const groupOptions = useMemo(
    () => [{ value: "", label: "All Categories" }, ...groups.map((g) => ({ value: g.id, label: `${g.name} (${g.id})` }))],
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
    { label: "Analytics", path: "/assetdashboard", icon: makeIcon(D.graph) },
    { label: "Branches", path: "/branches", icon: makeIcon(D.branch) },
    { label: "Asset Master", path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Issue Tracker", path: "/branch-issues", icon: makeIcon(D.issue) },
    { label: "Requests", path: "/requests", icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users", path: "/admin/users", icon: makeIcon(D.users), show: isAdmin },
  ].filter((i) => i.show !== false);

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: FONT_STACK }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: NL_RED }}>Unauthorized</h2>
          <p style={{ color: "#64748B" }}>Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E2E8F0",
              borderTopColor: NL_BLUE,
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#64748B", fontFamily: FONT_STACK, fontWeight: 600 }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSubAdmin && !isCorpUser && !currentUserStationId && roleFilteredBranches.length === 0) {
    return (
      <>
        <style>{STYLES}</style>
        <SplitSidebarLayout navItems={navItems} user={user}>
          <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: FONT_STACK, padding: 24 }}>
            <div style={{ textAlign: "center", maxWidth: 460 }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏢</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: NL_RED, margin: 0 }}>Branch / Station not assigned</h2>
              <p style={{ color: "#64748B", lineHeight: 1.7 }}>
                This user account does not have a service station assigned. Please assign a station in Admin Users to view the asset dashboard.
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
      <style>{STYLES}</style>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="ad-root">
          <div className="ad-layout">
            <section className="ad-main">
              <div className="ad-topbar">
                <div>
                  <h1 className="ad-title">Asset Dashboard</h1>
                  <div className="ad-subtitle">
                    {totalAll.toLocaleString()} assets · {roleFilteredBranches.length} branches · {sectionCounts.length} sections
                    {!canSeeAllBranches && currentUserStationId ? ` · Station ${currentUserStationId}` : ""} · {roleLabel}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {isAdmin && (
                    <>
                      <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => setShowAddCategoryModal(true)}>
                        + Category
                      </button>
                      <button className="ad-btn ad-btn-success ad-btn-sm" onClick={() => setShowAddSubCategoryModal(true)}>
                        + Sub-Category
                      </button>
                    </>
                  )}
                  <button className="ad-btn ad-btn-white ad-btn-sm" onClick={() => navigate("/branch-assets-report")}>
                     Open Asset Master
                  </button>
                </div>
              </div>

              <div className="ad-content">
                <div className="ad-panel-bar">
                  <div className="ad-panel-left">
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".05em" }}>View</span>
                    <button className={`ad-toggle-pill ${showHero ? "active" : ""}`} onClick={() => setShowHero((v) => !v)}>
                      🏛 Overview
                    </button>
                    <button className={`ad-toggle-pill ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((v) => !v)}>
                      🔍 Filters
                    </button>
                  </div>

                  <div className="ad-panel-right">
                    <span className="ad-chip" style={{ background: NL_BLUE, color: "white", border: "none" }}>
                      {totalFiltered.toLocaleString()} Visible
                    </span>
                    {!canSeeAllBranches && currentUserStationId && (
                      <span className="ad-chip" style={{ borderColor: "var(--blue-200)", color: NL_BLUE, background: "var(--blue-50)" }}>
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
                          Nepal Life <span className="accent">Insurance</span> — IT Asset Registry
                        </h2>
                        <p className="ad-slogan">Centralized, real-time visibility across every branch, category and asset type.</p>
                      </div>
                      <img src={NepalLifeLogo} alt="Nepal Life" className="ad-logo" />
                    </div>
                  </div>
                )}

                {showFilters && (
                  <div className="ad-filter">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink-900)" }}>🔍 Filter Assets</div>
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

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                      {[
                        { label: "Branch", options: branchOptions, value: branchFilter, onChange: setBranchFilter },
                        {
                          label: "Category",
                          options: groupOptions,
                          value: groupFilter,
                          onChange: (v) => {
                            setGroupFilter(v);
                            setSubCatFilter(null);
                          },
                        },
                        { label: "Sub-Category", options: subCatOptions, value: subCatFilter, onChange: setSubCatFilter },
                      ].map(({ label, options, value, onChange }) => (
                        <div key={label}>
                          <label className="rpt-label">{label}</label>
                          <Select options={options} value={value} onChange={onChange} placeholder={`All ${label}s`} isClearable classNamePrefix="react-select" className="rs-nl" />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                      <span className="ad-chip" style={{ background: NL_BLUE, color: "white", border: "none" }}>
                        {totalFiltered.toLocaleString()} Shown
                      </span>
                      {branchFilter?.value && (
                        <span className="ad-chip" style={{ borderColor: "var(--blue-200)", color: NL_BLUE, background: "var(--blue-50)" }}>
                          🏢 {branchFilter.label}
                        </span>
                      )}
                      {groupFilter?.value && (
                        <span className="ad-chip" style={{ borderColor: "#DDD6FE", color: "#6D28D9", background: "#F5F3FF" }}>
                          🗂 {groupFilter.label}
                        </span>
                      )}
                      {subCatFilter?.value && (
                        <span className="ad-chip" style={{ borderColor: "#BBF7D0", color: "#15803D", background: "#F0FDF4" }}>
                          🏷 {subCatFilter.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 1: section breakdown + status donut */}
                <div className="ad-two-col">
                  <div className="ad-chart">
                    <p className="ad-chart-title">Asset Section Breakdown</p>
                    <p className="ad-chart-sub">Every asset type, ranked by count ({sectionCounts.length} sections)</p>
                    <div>
                      {sectionCounts.map(([sec, cnt], i) => (
                        <div key={sec} className="ad-section-row">
                          <div style={{ width: 26, fontSize: 15, textAlign: "center", flexShrink: 0 }}>{SECTION_ICONS[sec] || "📦"}</div>
                          <div
                            style={{
                              minWidth: 130,
                              maxWidth: 170,
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: "var(--ink-700)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {displaySectionName(sec)}
                          </div>
                          <div className="ad-section-bar-bg">
                            <div className="ad-section-bar-fill" style={{ width: `${(cnt / maxSection) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                          </div>
                          <div style={{ minWidth: 40, textAlign: "right", fontWeight: 800, fontSize: 12, color: PALETTE[i % PALETTE.length] }}>{cnt}</div>
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
                              backgroundColor: [STATUS_COLORS.Active, STATUS_COLORS.Inactive, STATUS_COLORS.Repair],
                              borderWidth: 2,
                              borderColor: "#fff",
                              hoverBorderWidth: 2,
                            },
                          ],
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: legendCfg, tooltip: tooltipCfg } }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
                      {[
                        { label: "Active", val: statusCounts.Active, cls: "ad-status-active" },
                        { label: "Inactive", val: statusCounts.Inactive, cls: "ad-status-inactive" },
                        { label: "Repair", val: statusCounts.Repair, cls: "ad-status-repair" },
                      ].map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <span className={`ad-status ${s.cls}`}>{s.label}</span>
                          <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: category pie, sub-category pie, category-status stacked */}
                <div className="ad-grid-responsive">
                  <div className="ad-chart">
                    <p className="ad-chart-title">Assets by Category</p>
                    <p className="ad-chart-sub">{categoryCounts.labels.length} categories found</p>
                    <div className="ad-chart-canvas md">
                      <Pie
                        data={{
                          labels: categoryCounts.labels,
                          datasets: [{ data: categoryCounts.values, backgroundColor: gc(categoryCounts.values.length), borderWidth: 2, borderColor: "#fff" }],
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendCfg, tooltip: tooltipCfg } }}
                      />
                    </div>
                  </div>

                  <div className="ad-chart">
                    <p className="ad-chart-title">Assets by Sub-Category</p>
                    <p className="ad-chart-sub">{subCatCounts.labels.length} sub-categories shown (top 15)</p>
                    <div className="ad-chart-canvas md">
                      <Pie
                        data={{
                          labels: subCatCounts.labels,
                          datasets: [{ data: subCatCounts.values, backgroundColor: gc(subCatCounts.values.length), borderWidth: 2, borderColor: "#fff" }],
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendCfg, tooltip: tooltipCfg } }}
                      />
                    </div>
                  </div>
                </div>
                {/* Row 4: full section horizontal breakdown + radar */}
                <div className="ad-grid-responsive">
                  <div className="ad-chart">
                    <p className="ad-chart-title">Section Comparison</p>
                    <p className="ad-chart-sub">All {sectionCounts.length} sections compared, side by side</p>
                    <div className="ad-chart-canvas lg">
                      <Bar
                        data={{
                          labels: sectionCounts.map(([s]) => displaySectionName(s)),
                          datasets: [
                            {
                              label: "Assets",
                              data: sectionCounts.map(([, c]) => c),
                              backgroundColor: sectionCounts.map((_, i) => PALETTE[i % PALETTE.length]),
                              borderRadius: 5,
                            },
                          ],
                        }}
                        options={barOptsH}
                      />
                    </div>
                  </div>

                  <div className="ad-chart">
                    <p className="ad-chart-title">Leading Sections (Top 6)</p>
                    <p className="ad-chart-sub">Multi-axis comparison of the largest sections</p>
                    <div className="ad-chart-canvas lg">
                      <Radar
                        data={{
                          labels: sectionCounts.slice(0, 6).map(([s]) => displaySectionName(s)),
                          datasets: [
                            {
                              label: "Assets",
                              data: sectionCounts.slice(0, 6).map(([, c]) => c),
                              backgroundColor: "rgba(37,99,235,0.12)",
                              borderColor: NL_BLUE_SOFT,
                              borderWidth: 2,
                              pointBackgroundColor: NL_BLUE_SOFT,
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

                {/* Row 5: branch trend line */}
                <div className="ad-chart">
                  <p className="ad-chart-title">Assets per Branch</p>
                  <p className="ad-chart-sub">Distribution across all {roleFilteredBranches.length} branches — top 15 shown</p>
                  <div className="ad-chart-canvas lg">
                    <Line
                      data={{
                        labels: branchCounts.labels,
                        datasets: [
                          {
                            label: "Assets",
                            data: branchCounts.values,
                            fill: true,
                            backgroundColor: "rgba(37,99,235,0.06)",
                            borderColor: NL_BLUE_SOFT,
                            borderWidth: 2.5,
                            tension: 0.35,
                            pointBackgroundColor: NL_BLUE_SOFT,
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 7,
                          },
                        ],
                      }}
                      options={lineOpts}
                    />
                  </div>
                </div>
                {/* Row 7: branch summary table */}
                <div className="ad-chart">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p className="ad-chart-title">Branch Summary</p>
                      <p className="ad-chart-sub">
                        Asset totals, status split and leading section for every branch in view
                      </p>
                    </div>

                    <span className="ad-chip" style={{ background: "var(--blue-50)", color: NL_BLUE, borderColor: "var(--blue-200)" }}>
                      {branchSummary.length.toLocaleString()} Branches
                    </span>
                  </div>

                  <div className="ad-table-wrap">
                    <table className="ad-branch-table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>Total</th>
                          <th>Active</th>
                          <th>Inactive</th>
                          <th>Repair</th>
                          <th>Leading Section</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBranchSummary.map((b) => (
                          <tr key={b.branch}>
                            <td style={{ fontWeight: 700, color: "var(--ink-900)" }}>{b.branch}</td>
                            <td>
                              <span className="ad-badge ad-badge-blue">{b.total}</span>
                            </td>
                            <td>
                              <span className="ad-status ad-status-active">{b.Active || 0}</span>
                            </td>
                            <td>
                              <span className="ad-status ad-status-inactive">{b.Inactive || 0}</span>
                            </td>
                            <td>
                              <span className="ad-status ad-status-repair">{b.Repair || 0}</span>
                            </td>
                            <td>
                              {b.topSection ? (
                                <>
                                  {SECTION_ICONS[b.topSection] || "📦"} {displaySectionName(b.topSection)} ({b.topCount})
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}

                        {branchSummary.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px 12px" }}>
                              No branch data for the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {branchSummary.length > 0 && (
                    <div className="ad-pagination">
                      <div className="ad-pagination-left">
                        <span className="ad-page-info">
                          Showing {branchSummaryStart.toLocaleString()}-{branchSummaryEnd.toLocaleString()} of {branchSummary.length.toLocaleString()}
                        </span>

                        <select
                          className="ad-page-select"
                          value={branchSummaryPageSize}
                          onChange={(e) => setBranchSummaryPageSize(Number(e.target.value))}
                        >
                          <option value={5}>5 rows</option>
                          <option value={10}>10 rows</option>
                          <option value={15}>15 rows</option>
                          <option value={25}>25 rows</option>
                        </select>
                      </div>

                      <div className="ad-pagination-right">
                        <button
                          type="button"
                          className="ad-page-btn"
                          onClick={() => setBranchSummaryPage(1)}
                          disabled={safeBranchSummaryPage === 1}
                          title="First page"
                        >
                          «
                        </button>

                        <button
                          type="button"
                          className="ad-page-btn"
                          onClick={() => setBranchSummaryPage((p) => Math.max(1, p - 1))}
                          disabled={safeBranchSummaryPage === 1}
                          title="Previous page"
                        >
                          ‹
                        </button>

                        {branchSummaryPageNumbers.map((page) => (
                          <button
                            key={page}
                            type="button"
                            className={`ad-page-btn ${page === safeBranchSummaryPage ? "active" : ""}`}
                            onClick={() => setBranchSummaryPage(page)}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="ad-page-btn"
                          onClick={() => setBranchSummaryPage((p) => Math.min(branchSummaryTotalPages, p + 1))}
                          disabled={safeBranchSummaryPage === branchSummaryTotalPages}
                          title="Next page"
                        >
                          ›
                        </button>

                        <button
                          type="button"
                          className="ad-page-btn"
                          onClick={() => setBranchSummaryPage(branchSummaryTotalPages)}
                          disabled={safeBranchSummaryPage === branchSummaryTotalPages}
                          title="Last page"
                        >
                          »
                        </button>
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

      <AddCategoryModal isOpen={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)} onSuccess={refreshCats} token={token} />
      <AddSubCategoryModal isOpen={showAddSubCategoryModal} onClose={() => setShowAddSubCategoryModal(false)} onSuccess={refreshCats} token={token} groups={groups} />
    </>
  );
}