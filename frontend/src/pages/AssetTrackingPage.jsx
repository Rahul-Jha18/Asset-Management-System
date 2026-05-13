// src/pages/AssetTracking.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer.jsx";

/* ── Brand ── */
const NL_BLUE  = "#0B5CAB";
const NL_BLUE2 = "#1474F3";
const NL_RED   = "#f31225ef";
const NL_GRADIENT = `linear-gradient(135deg,${NL_BLUE} 0%,${NL_BLUE2} 55%,${NL_RED} 100%)`;

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

const STYLES = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --nl-blue:${NL_BLUE};--nl-blue2:${NL_BLUE2};--nl-red:${NL_RED};
  --gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;
  --gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;
  --gray-800:#1f2937;--gray-900:#111827;--white:#fff;
  --blue-50:#eff6ff;--blue-100:#dbeafe;--blue-200:#bfdbfe;
  --blue-600:#2563eb;--blue-700:#1d4ed8;
  --green-50:#f0fdf4;--green-100:#dcfce7;--green-200:#bbf7d0;
  --green-600:#16a34a;--green-700:#15803d;
  --red-50:#fef2f2;--red-100:#fee2e2;--red-500:#ef4444;--red-600:#dc2626;
  --amber-50:#fffbeb;--amber-100:#fef3c7;--amber-500:#f59e0b;--amber-600:#d97706;
  --purple-50:#f5f3ff;--purple-100:#ede9fe;--purple-200:#ddd6fe;
  --purple-600:#7c3aed;--purple-700:#6d28d9;
  --shadow-sm:0 1px 2px rgba(0,0,0,.05);
  --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.05);
  --shadow-md:0 4px 6px rgba(0,0,0,.06),0 10px 24px rgba(0,0,0,.08);
  --shadow-lg:0 8px 16px rgba(0,0,0,.08),0 24px 48px rgba(0,0,0,.1);
  --radius:10px;--radius-lg:14px;--radius-xl:18px;
}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes scanLine{0%{top:-4px}100%{top:calc(100% + 4px)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── Root ── */
.at-root{font-family:'DM Sans',sans-serif;color:var(--gray-900);min-height:100%}

/* ── Topbar ── */
.at-topbar{
  background:var(--white);border-bottom:1px solid var(--gray-100);
  padding:6px 16px;display:flex;align-items:center;justify-content:space-between;
  gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:30;
  box-shadow:0 1px 4px rgba(0,0,0,.06);
}
.at-topbar-left{display:flex;align-items:center;gap:10px}
.at-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* ── Buttons ── */
.at-btn{
  display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
  border-radius:var(--radius);font-weight:700;font-size:13px;border:none;
  cursor:pointer;transition:all .18s ease;white-space:nowrap;
  font-family:'Outfit',sans-serif;letter-spacing:.01em;line-height:1;
}
.at-btn:disabled{opacity:.5;cursor:not-allowed}
.at-btn:hover:not(:disabled){transform:translateY(-1px)}
.at-btn:active:not(:disabled){transform:translateY(0) scale(.98)}
.at-btn-primary{background:${NL_BLUE};color:white;box-shadow:0 2px 10px rgba(11,92,171,.3)}
.at-btn-primary:hover:not(:disabled){background:${NL_BLUE2}}
.at-btn-scan{
  background:${NL_GRADIENT};color:white;
  box-shadow:0 4px 14px rgba(11,92,171,.35);
  position:relative;overflow:hidden;
}
.at-btn-scan::after{
  content:'';position:absolute;left:-100%;top:0;width:60%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
  animation:shimmer 2.2s ease-in-out infinite;
}
@keyframes shimmer{0%{left:-60%}100%{left:120%}}
.at-btn-white{background:white;border:1.5px solid var(--gray-200);color:var(--gray-700);box-shadow:var(--shadow-sm)}
.at-btn-white:hover:not(:disabled){border-color:var(--blue-200);color:var(--blue-700);background:var(--blue-50)}
.at-btn-outline{background:var(--gray-50);border:1.5px solid var(--gray-200);color:var(--gray-600)}
.at-btn-outline:hover:not(:disabled){background:var(--gray-100);border-color:var(--gray-300)}
.at-btn-sm{padding:6px 13px;font-size:12px}
.at-btn-view{
  background:var(--gray-900);color:white;padding:7px 16px;
  border-radius:8px;font-size:12px;font-weight:700;
  border:none;cursor:pointer;transition:all .18s ease;
  font-family:'Outfit',sans-serif;
}
.at-btn-view:hover{background:var(--gray-800);transform:translateY(-1px)}

/* ── Filter Card ── */
.at-filter-card{
  background:white;border-radius:var(--radius-xl);
  border:1.5px solid var(--gray-200);box-shadow:var(--shadow);
  padding:20px 20px 18px;margin-bottom:14px;
  animation:fadeUp .35s ease both;
}
.at-filter-grid{
  display:grid;
  grid-template-columns:1fr auto auto;
  gap:12px;align-items:end;
  margin-bottom:14px;
}
@media(max-width:768px){
  .at-filter-grid{grid-template-columns:1fr;gap:10px}
}
@keyframes maintainPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(184, 19, 19, 0.23);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(180, 24, 24, 0.1);
  }
}

@keyframes maintainBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: .75; }
}

@keyframes maintainStripe {
  0% { background-position: 0 0; }
  100% { background-position: 120px 0; }
}

.maintainance{
  position: relative;
  z-index: 100;
  width: 100%;
  justify-content: center;
  font-size: 62px;
  font-weight: 800;
  color: var(--red-600);
  background:
    repeating-linear-gradient(
      45deg,
      rgba(141, 27, 27, 0.16) 0 12px,
      rgba(245, 159, 11, 0.68) 12px 24px
    ),
    var(--red-50);
  background-size: 120px 120px;
  border: 1.5px solid var(--red-100);
  padding: 70px 16px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  text-shadow: 4px 6px 25px rgba(184, 19, 19, 0.89);
  animation: maintainPulse 1.8s ease-in-out infinite,
             maintainStripe 3s linear infinite;
}

.maintainance span{
  animation: maintainBlink 2s ease-in-out infinite;
  color: black;
  text-shadow: 4px 6px 5px rgba(243, 8, 8, 0.94);

}
  /* ── Inputs / Selects ── */
.at-input,.at-select{
  width:100%;background:var(--gray-50);border:1.5px solid var(--gray-300);
  border-radius:var(--radius);padding:10px 14px;color:var(--gray-900);
  font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;
  transition:all .18s ease;
}
.at-input:focus,.at-select:focus{border-color:${NL_BLUE};box-shadow:0 0 0 3px rgba(11,92,171,.10)}
.at-input::placeholder{color:var(--gray-400)}
.at-select{
  cursor:pointer;appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:calc(100% - 12px) center;padding-right:34px;
  min-width:140px;
}
.at-label{
  font-size:10.5px;font-weight:800;color:var(--gray-600);margin-bottom:7px;
  display:block;text-transform:uppercase;letter-spacing:.1em;
  font-family:'Outfit',sans-serif;
}

/* ── Action Bar ── */
.at-action-bar{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding-top:6px;border-top:1px solid var(--gray-100);
}
.at-count-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;
  background:var(--gray-100);border:1.5px solid var(--gray-200);
  color:var(--gray-700);font-family:'Outfit',sans-serif;
}

/* ── Scan Indicator ── */
.at-scan-badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 13px;border-radius:999px;font-size:11px;font-weight:700;
  font-family:'Outfit',sans-serif;letter-spacing:.04em;
}
.at-scan-badge.scanning{background:rgba(11,92,171,.10);border:1px solid rgba(11,92,171,.22);color:${NL_BLUE}}
.at-scan-badge.done{background:var(--green-50);border:1px solid var(--green-200);color:var(--green-700)}
.at-scan-badge.idle{background:var(--gray-100);border:1px solid var(--gray-200);color:var(--gray-500)}
.at-scan-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.at-scan-dot.pulse{animation:pulse 1s ease infinite}

/* ── Table Card ── */
.at-table-card{
  background:white;border-radius:var(--radius-xl);
  border:1.5px solid var(--gray-200);box-shadow:var(--shadow);
  overflow:hidden;animation:fadeUp .4s ease both;
  animation-delay:.1s;opacity:0;animation-fill-mode:forwards;
}
.at-table-header{
  padding:16px 20px;background:linear-gradient(to right,var(--gray-50),white);
  border-bottom:1.5px solid var(--gray-200);
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:10px;
}
.at-table-wrap{overflow-x:auto}
.at-table{width:100%;border-collapse:collapse;min-width:860px}
.at-table thead th{
  padding:11px 16px;text-align:left;font-size:10.5px;font-weight:700;
  color:rgba(255,255,255,.94);text-transform:uppercase;letter-spacing:.09em;
  white-space:nowrap;font-family:'Outfit',sans-serif;background:${NL_BLUE};
  border-right:.5px solid rgba(255,255,255,.15);
}
.at-table thead th:last-child{background:${NL_RED};border-right:none}
.at-table th,.at-table td{border-right:.5px solid rgba(0,0,0,.07);border-bottom:1px solid var(--gray-100)}
.at-table tbody tr{transition:background .12s;cursor:pointer}
.at-table tbody tr:last-child td{border-bottom:none}
.at-table tbody tr:hover{background:var(--blue-50)}
.at-table tbody td{padding:13px 16px;font-size:13px;color:var(--gray-700);vertical-align:middle}

/* ── Badges ── */
.at-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;line-height:1}
.at-badge-blue{background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-200)}
.at-badge-green{background:var(--green-50);color:var(--green-700);border:1px solid var(--green-200)}
.at-badge-red{background:var(--red-50);color:var(--red-600);border:1px solid var(--red-100)}
.at-badge-amber{background:var(--amber-50);color:var(--amber-600);border:1px solid var(--amber-100)}
.at-badge-purple{background:var(--purple-50);color:var(--purple-700);border:1px solid var(--purple-200)}
.at-badge-gray{background:var(--gray-100);color:var(--gray-600);border:1px solid var(--gray-200)}

/* ── Status pill ── */
.at-status{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;border:1.5px solid}
.at-status::before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.at-status-online{color:var(--green-700);border-color:var(--green-200);background:var(--green-50)}
.at-status-offline{color:var(--red-600);border-color:var(--red-100);background:var(--red-50)}
.at-status-unknown{color:var(--gray-600);border-color:var(--gray-200);background:var(--gray-100)}
.at-status-warning{color:var(--amber-600);border-color:var(--amber-100);background:var(--amber-50)}

/* ── Location badge ── */
.at-loc{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;border:1.5px solid}
.at-loc-match{color:var(--blue-700);border-color:var(--blue-200);background:var(--blue-50)}
.at-loc-mismatch{color:var(--purple-700);border-color:var(--purple-200);background:var(--purple-50)}
.at-loc-unknown{color:var(--gray-600);border-color:var(--gray-200);background:var(--gray-100)}

/* ── Asset ID link ── */
.at-asset-id{color:${NL_BLUE};font-weight:700;font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;text-decoration:none}
.at-asset-id:hover{text-decoration:underline;color:${NL_BLUE2}}

/* ── Mono ── */
.at-mono{font-family:'Courier New',monospace;font-size:12px;background:var(--gray-50);border:1px solid var(--gray-200);border-radius:6px;padding:2px 8px;color:var(--gray-800)}

/* ── Empty ── */
.at-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 20px;gap:12px;text-align:center}
.at-spinner{border-radius:50%;border:2.5px solid var(--gray-200);border-top-color:${NL_BLUE};animation:spin .7s linear infinite}

/* ── Scan overlay animation ── */
.at-scan-overlay{position:relative;overflow:hidden}
.at-scan-overlay::after{
  content:'';position:absolute;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,${NL_BLUE},${NL_BLUE2},transparent);
  animation:scanLine 1.4s linear infinite;
  pointer-events:none;z-index:5;opacity:.7;
}

/* ── Stat cards ── */
.at-stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-bottom:14px}
.at-stat{
  background:white;border-radius:var(--radius-lg);border:1.5px solid var(--gray-200);
  padding:14px 16px;box-shadow:var(--shadow-sm);transition:all .18s ease;
}
.at-stat:hover{border-color:var(--blue-200);box-shadow:var(--shadow);transform:translateY(-2px)}
.at-stat-num{font-family:Syne,sans-serif;font-size:1.65rem;font-weight:800;color:var(--gray-900);line-height:1}
.at-stat-lbl{font-size:10.5px;color:var(--gray-500);margin-top:5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;font-family:'Outfit',sans-serif}

/* ── Detail modal ── */
.at-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(17,24,39,.62);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px}
.at-modal-panel{width:100%;max-width:640px;max-height:90vh;background:white;border-radius:var(--radius-xl);overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);border:1.5px solid var(--gray-200)}
.at-modal-header{background:${NL_GRADIENT};padding:20px 24px;flex-shrink:0}
.at-modal-body{flex:1;overflow-y:auto;padding:22px 24px;background:var(--gray-50)}
.at-modal-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--gray-100);gap:12px}
.at-modal-row:last-child{border-bottom:none}
.at-modal-label{font-size:12px;font-weight:700;color:var(--gray-500);white-space:nowrap;text-transform:uppercase;letter-spacing:.05em;font-family:'Outfit',sans-serif}
.at-modal-value{font-size:13px;font-weight:600;color:var(--gray-900);text-align:right;max-width:60%;word-break:break-word}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:999px}
::-webkit-scrollbar-thumb:hover{background:var(--gray-400)}

@media(max-width:640px){
  .at-stats-row{grid-template-columns:repeat(2,1fr)}
  .at-table thead th,.at-table tbody td{padding:10px 12px;font-size:12px}
}
`;

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

/* ── Helpers ── */
const fmt = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
  } catch { return d; }
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  if (s === "online" || s === "up" || s === "active")
    return <span className="at-status at-status-online">Online</span>;
  if (s === "offline" || s === "down" || s === "inactive")
    return <span className="at-status at-status-offline">Offline</span>;
  if (s === "warning" || s === "degraded")
    return <span className="at-status at-status-warning">Warning</span>;
  return <span className="at-status at-status-unknown">{status || "Unknown"}</span>;
};

const LocationBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  if (s === "match" || s === "verified")
    return <span className="at-loc at-loc-match">Match</span>;
  if (s === "mismatch" || s === "moved")
    return <span className="at-loc at-loc-mismatch">Mismatch</span>;
  return <span className="at-loc at-loc-unknown">{status || "Unknown"}</span>;
};

/* ── Detail Modal ── */
function DetailModal({ asset, onClose }) {
  if (!asset) return null;
  const rows = [
    ["Asset ID",      asset.asset_id],
    ["Label",         asset.label],
    ["Branch",        asset.branch_name],
    ["Type",          asset.type],
    ["IP Address",    asset.ip_address],
    ["Hostname",      asset.hostname],
    ["MAC Address",   asset.mac_address],
    ["Method",        asset.scan_method],
    ["Device Status", asset.device_status],
    ["Location Status", asset.location_status],
    ["OS",            asset.os],
    ["Manufacturer",  asset.manufacturer],
    ["Model",         asset.model],
    ["Last Seen",     fmt(asset.last_seen)],
    ["First Seen",    fmt(asset.first_seen)],
    ["Notes",         asset.notes],
  ].filter(([, v]) => v && String(v).trim());

  return (
    <div className="at-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="at-modal-panel">
        <div className="at-modal-header">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.55)", letterSpacing:".14em", textTransform:"uppercase", fontFamily:"Outfit,sans-serif", marginBottom:7 }}>
                Asset Detail
              </div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:"clamp(1rem,3vw,1.4rem)", color:"white", marginBottom:8 }}>
                {asset.label || asset.asset_id}
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <StatusBadge status={asset.device_status} />
                <LocationBadge status={asset.location_status} />
                <span className="at-mono" style={{ background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,255,255,.9)" }}>
                  {asset.ip_address}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background:"rgba(255,255,255,.15)", border:"1.5px solid rgba(255,255,255,.25)", color:"white", borderRadius:9, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="at-modal-body">
          <div style={{ background:"white", borderRadius:12, border:"1.5px solid var(--gray-200)", overflow:"hidden" }}>
            {rows.map(([label, value]) => (
              <div key={label} className="at-modal-row" style={{ padding:"10px 16px" }}>
                <div className="at-modal-label">{label}</div>
                <div className="at-modal-value">
                  {label === "IP Address" || label === "MAC Address"
                    ? <span className="at-mono">{value}</span>
                    : label === "Device Status"
                    ? <StatusBadge status={value} />
                    : label === "Location Status"
                    ? <LocationBadge status={value} />
                    : <span>{value}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function AssetTracking() {
  const { token, isAdmin, isSubAdmin, user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [alert, setAlert] = useState(null);

  const [search, setSearch] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const [selectedAsset, setSelectedAsset] = useState(null);

  /* ── fetch scanned assets ── */
  const fetchAssets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/api/asset-tracking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setAssets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load tracked assets";
      setAlert({ type: "error", message: msg });
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ── trigger live network scan ── */
  const runScan = async () => {
    if (!token || scanning) return;
    setScanning(true);
    setScanDone(false);
    setAlert(null);
    try {
      await api.post("/api/asset-tracking/scan", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScanDone(true);
      await fetchAssets();
      setAlert({ type: "success", message: "Network scan completed successfully." });
    } catch (err) {
      const msg = err?.response?.data?.message || "Scan failed — check network connectivity.";
      setAlert({ type: "error", message: msg });
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return assets.filter((a) => {
      if (deviceStatus && String(a.device_status || "").toLowerCase() !== deviceStatus.toLowerCase()) return false;
      if (locationStatus && String(a.location_status || "").toLowerCase() !== locationStatus.toLowerCase()) return false;
      if (q) {
        const blob = [a.asset_id, a.label, a.branch_name, a.ip_address, a.hostname, a.type, a.mac_address]
          .filter(Boolean).join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [assets, search, deviceStatus, locationStatus]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:    assets.length,
    online:   assets.filter(a => String(a.device_status || "").toLowerCase() === "online").length,
    offline:  assets.filter(a => String(a.device_status || "").toLowerCase() === "offline").length,
    mismatch: assets.filter(a => String(a.location_status || "").toLowerCase() === "mismatch").length,
    match:    assets.filter(a => String(a.location_status || "").toLowerCase() === "match").length,
  }), [assets]);

  /* ── nav items ── */
  const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
    { label: "Asset Tracking", path: "/asset-tracking",       icon: makeIcon(D.radar) },
    { label: "Help & Support", path: "/support",              icon: makeIcon(D.help) },
  ].filter(i => i.show !== false);

  return (
    <div className="at-root">
      <style>{FONTS}{STYLES}</style>
      <SplitSidebarLayout
        navItems={navItems}
        user={user}
      >
        {/* ── Alert ── */}
        {alert && (
          <div style={{
            margin: "0 0 12px",
            padding: "11px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: alert.type === "error" ? "var(--red-50)" : "var(--green-50)",
            border: `1.5px solid ${alert.type === "error" ? "var(--red-100)" : "var(--green-200)"}`,
            color: alert.type === "error" ? "var(--red-600)" : "var(--green-700)",
          }}>
            <span>{alert.type === "error" ? "⚠ " : "✓ "}{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontWeight:800, fontSize:14 }}
              >✕</button>
          </div>
        )}
        
        {/* ── Stat Cards ── */}
        <div className="at-stats-row">
          {[
            { label:"Total Tracked",  value:stats.total,    color:"var(--blue-600)" },
            { label:"Online",         value:stats.online,   color:"var(--green-600)" },
            { label:"Offline",        value:stats.offline,  color:"var(--red-600)" },
            { label:"Location Match", value:stats.match,    color:"var(--blue-700)" },
            { label:"Mismatch",       value:stats.mismatch, color:"var(--purple-700)" },
          ].map(s => (
            <div key={s.label} className="at-stat">
              <div className="at-stat-num" style={{ color:s.color }}>{s.value}</div>
              <div className="at-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
         {/* ── Topbar ── */}
        <div className="at-topbar" style={{ marginBottom: 14 }}>
          <div className="at-topbar-right">
           {scanning && (
              <span className="at-scan-badge scanning">
                <span className="at-scan-dot pulse" />
                Scanning…
              </span>
            )}
            {!scanning && scanDone && (
              <span className="at-scan-badge done">
                <span className="at-scan-dot" />
                Scan Complete
              </span>
            )}
            {!scanning && !scanDone && (
              <span className="at-scan-badge idle">
                <span className="at-scan-dot" />
                Idle
              </span>
            )}
          <div className="at-topbar-right">
            <span className="at-badge at-badge-blue" style={{ fontSize:11 }}>
              {filtered.length} / {assets.length}
            </span>
            <span className="at-badge at-badge-gray" style={{ fontSize:11 }}>
              {isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER"}
            </span>
          </div>
        </div>
        </div>
        <div className="maintainance">
          ⚠ Under Maintenance<span>. . .</span>
        </div>
        {/* ── Filter Card ── */}
        <div className="at-filter-card">
          <div className="at-filter-grid">
            {/* Search */}
            <div>
              <label className="at-label">Search</label>
              <div style={{ position:"relative" }}>
                <input
                  type="text"
                  className="at-input"
                  placeholder="Asset ID, label, branch, hostname, IP…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingRight:38 }}
                />
                <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--gray-400)", pointerEvents:"none" }}
                  width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Device Status */}
            <div>
              <label className="at-label">Device Status</label>
              <select className="at-select" value={deviceStatus} onChange={e => setDeviceStatus(e.target.value)}>
                <option value="">All</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Warning">Warning</option>
              </select>
            </div>

            {/* Location Status */}
            <div>
              <label className="at-label">Location Status</label>
              <select className="at-select" value={locationStatus} onChange={e => setLocationStatus(e.target.value)}>
                <option value="">All</option>
                <option value="Match">Match</option>
                <option value="Mismatch">Mismatch</option>
              </select>
            </div>
          </div>

          {/* Action bar */}
          <div className="at-action-bar">
            <button
              className="at-btn at-btn-scan"
              onClick={runScan}
              disabled={scanning}
            >
              {scanning ? (
                <div className="at-spinner" style={{ width:14, height:14, borderColor:"rgba(255,255,255,.3)", borderTopColor:"white" }} />
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={D.scan} />
                </svg>
              )}
              {scanning ? "Scanning…" : "Scan Now"}
            </button>

            <button className="at-btn at-btn-white at-btn-sm" onClick={fetchAssets} disabled={loading}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <button
              className="at-btn at-btn-outline at-btn-sm"
              onClick={() => { setDeviceStatus(""); setLocationStatus(""); setSearch(""); }}
            >
              Apply Filters
            </button>

            <span className="at-count-pill">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>

            {(search || deviceStatus || locationStatus) && (
              <button
                className="at-btn at-btn-sm"
                onClick={() => { setSearch(""); setDeviceStatus(""); setLocationStatus(""); }}
                style={{ background:"var(--red-50)", border:"1.5px solid var(--red-100)", color:"var(--red-600)", fontWeight:700 }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className={`at-table-card${scanning ? " at-scan-overlay" : ""}`}>
          <div className="at-table-header">
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:16, color:"var(--gray-900)", marginBottom:3 }}>
                Tracked Assets
              </div>
              <div style={{ fontSize:12.5, color:"var(--gray-500)", fontFamily:"DM Sans,sans-serif" }}>
                On-demand live network scan results.
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {loading && <div className="at-spinner" style={{ width:20, height:20 }} />}
              <span className="at-badge at-badge-blue">{filtered.length}</span>
            </div>
          </div>

          <div className="at-table-wrap">
            {loading && assets.length === 0 ? (
              <div className="at-empty">
                <div className="at-spinner" style={{ width:44, height:44 }} />
                <p style={{ color:"var(--gray-500)", margin:0, fontSize:14, fontFamily:"DM Sans,sans-serif" }}>Loading assets…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="at-empty">
                <div style={{ fontSize:56 }}>📡</div>
                <p style={{ color:"var(--gray-800)", fontWeight:700, margin:0, fontSize:15, fontFamily:"Outfit,sans-serif" }}>
                  {assets.length === 0 ? "No assets tracked yet" : "No matching assets"}
                </p>
                <p style={{ color:"var(--gray-400)", margin:0, fontSize:13 }}>
                  {assets.length === 0
                    ? "Run a scan to discover networked devices across branches."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {assets.length === 0 && (
                  <button className="at-btn at-btn-scan" onClick={runScan} disabled={scanning}>
                    {scanning ? "Scanning…" : "🔍 Start Scan"}
                  </button>
                )}
              </div>
            ) : (
              <table className="at-table">
                <thead>
                  <tr>
                    {["Asset ID","Label","Branch","Type","IP","Device","Location","Method","Last Seen","Action"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, idx) => (
                    <tr key={a.id ?? idx} onClick={() => setSelectedAsset(a)}>
                      <td>
                        <span className="at-asset-id">{a.asset_id || `#${(a.id ?? idx + 1)}`}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight:600, color:"var(--gray-900)", fontSize:13 }}>{a.label || "—"}</div>
                        {a.hostname && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:2 }}>{a.hostname}</div>}
                      </td>
                      <td style={{ fontWeight:600 }}>{a.branch_name || "—"}</td>
                      <td>
                        <span className="at-badge at-badge-blue">{a.type || "—"}</span>
                      </td>
                      <td>
                        <span className="at-mono">{a.ip_address || "—"}</span>
                      </td>
                      <td>
                        <StatusBadge status={a.device_status} />
                      </td>
                      <td>
                        <LocationBadge status={a.location_status} />
                      </td>
                      <td>
                        <span style={{ fontSize:12, color:"var(--gray-600)", fontFamily:"'Courier New',monospace" }}>
                          {a.scan_method || "tcp"}
                        </span>
                      </td>
                      <td style={{ fontSize:12, color:"var(--gray-500)", whiteSpace:"nowrap" }}>
                        {fmt(a.last_seen)}
                      </td>
                      <td>
                        <button
                          className="at-btn-view"
                          onClick={e => { e.stopPropagation(); setSelectedAsset(a); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
            </SplitSidebarLayout>
        {/* ── Detail Modal ── */}
        {selectedAsset && (
          <DetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      <Footer />
    </div>
  );
}