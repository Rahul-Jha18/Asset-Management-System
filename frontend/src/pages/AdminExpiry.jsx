// src/pages/AdminExpiry.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";

/* ─────────────────────────────────────────────
   FONTS + STYLES  (same brand as Landing.jsx)
───────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Outfit:wght@400;500;600;700;800;900&display=swap');`;

const STYLES = `
  :root {
    --nl-blue:    #0B5CAB;
    --nl-blue2:   #1474F3;
    --nl-red:     #E11D2E;
    --nl-bg:      #F5F8FF;
    --nl-ink:     #0F172A;
    --nl-grad:    linear-gradient(135deg, #0B5CAB 0%, #1474F3 55%, #E11D2E 100%);
    --nl-grad-90: linear-gradient(90deg,  #0B5CAB 82%, #E11D2E 100%);

    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-600:#2563eb; --blue-700:#1d4ed8;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-600:#dc2626; --red-700:#b91c1c;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-600:#d97706;
    --rose-500:#f43f5e; --rose-600:#e11d48;
    --violet-50:#f5f3ff; --violet-100:#ede9fe; --violet-600:#7c3aed; --violet-700:#6d28d9;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#ffffff;

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow:    0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.06), 0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.10);
    --radius:10px; --radius-lg:14px; --radius-xl:18px; --radius-2xl:24px;
  }

  @keyframes fadeInUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes floaty    { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }

  /* ── Page shell ── */
  .nx-root {
    font-family:'DM Sans',sans-serif;
    background:var(--nl-bg); min-height:100vh; color:var(--nl-ink);
    position:relative; overflow-x:hidden;
  }
  .nx-grid-bg {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(11,92,171,0.032) 1px,transparent 1px),
      linear-gradient(90deg,rgba(11,92,171,0.032) 1px,transparent 1px);
    background-size:44px 44px;
  }
  .nx-glow-tr {
    position:fixed; top:-14%; right:-8%;
    width:min(700px,70vw); height:min(560px,56vh);
    background:radial-gradient(ellipse,rgba(20,116,243,0.14) 0%,transparent 66%);
    pointer-events:none; z-index:0;
  }
  .nx-glow-bl {
    position:fixed; bottom:-8%; left:-6%;
    width:min(560px,56vw); height:min(560px,56vw);
    background:radial-gradient(ellipse,rgba(225,29,46,0.09) 0%,transparent 66%);
    pointer-events:none; z-index:0;
  }

  /* ── Wrapper ── */
  .nx-wrap {
    position:relative; z-index:10;
    max-width:1160px; margin:0 auto;
    padding:0 clamp(12px,2.5vw,28px);
    padding-top:clamp(22px,3.5vw,40px);
    padding-bottom:clamp(32px,4vw,60px);
  }

  /* ── Hero ── */
  .nx-hero {
    border:1.5px solid rgba(11,92,171,0.12);
    border-radius:clamp(18px,2.5vw,28px);
    background:linear-gradient(135deg,rgba(11,92,171,0.09) 0%,rgba(255,255,255,0.88) 44%,rgba(225,29,46,0.07) 100%);
    box-shadow:0 20px 70px rgba(2,32,53,0.10),0 1px 0 rgba(255,255,255,.7) inset;
    overflow:hidden; position:relative;
    animation:fadeInUp 0.6s ease both;
  }
  .nx-hero::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:
      radial-gradient(ellipse at 12% 25%,rgba(20,116,243,0.20) 0%,transparent 52%),
      radial-gradient(ellipse at 88% 18%,rgba(225,29,46,0.14) 0%,transparent 50%),
      radial-gradient(ellipse at 60% 90%,rgba(11,92,171,0.08) 0%,transparent 55%);
  }
  .nx-hero::after {
    content:''; position:absolute; top:-1px; right:-1px;
    width:clamp(80px,12vw,160px); height:clamp(80px,12vw,160px);
    background:linear-gradient(225deg,rgba(225,29,46,0.12) 0%,transparent 60%);
    border-radius:0 clamp(18px,2.5vw,28px) 0 0; pointer-events:none;
  }
  .nx-hero-inner {
    position:relative; z-index:2;
    padding:clamp(22px,3.5vw,44px) clamp(20px,3.5vw,44px);
    display:flex; align-items:center; justify-content:space-between;
    gap:clamp(18px,3vw,38px); flex-wrap:wrap;
  }
  .nx-hero-text { flex:1; min-width:240px; }
  .nx-eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.18);
    color:var(--nl-blue); border-radius:999px;
    padding:5px 14px; font-family:Outfit,sans-serif;
    font-size:10px; font-weight:900; letter-spacing:.09em; text-transform:uppercase;
    margin-bottom:10px; animation:fadeInUp 0.5s ease both;
  }
  .nx-eyebrow-dot {
    width:7px; height:7px; border-radius:50%;
    background:var(--nl-blue2); box-shadow:0 0 10px rgba(20,116,243,0.7);
    animation:pulse 2s ease infinite;
  }
  .nx-title {
    font-family:Syne,sans-serif; font-weight:900;
    font-size:clamp(1.35rem,3vw,2rem);
    letter-spacing:-0.03em; margin:0 0 4px; color:var(--nl-ink); line-height:1.08;
  }
  .nx-title .blue{color:var(--nl-blue);}
  .nx-title .red{color:var(--nl-red);}
  .nx-divider {
    width:clamp(36px,5vw,52px); height:3px; border-radius:999px;
    background:linear-gradient(90deg,var(--nl-blue),var(--nl-red));
    margin:10px 0 12px;
  }
  .nx-sub {
    font-size:clamp(12px,1.2vw,14px); color:rgba(15,23,42,0.56);
    line-height:1.68; max-width:580px; margin:0;
  }
  .nx-logo-col { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:10px; }
  .nx-logo {
    width:clamp(72px,9vw,110px); height:auto;
    filter:drop-shadow(0 10px 22px rgba(2,32,53,0.20));
    animation:floaty 5s ease-in-out infinite;
  }
  .nx-live-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:999px;
    background:rgba(34,197,94,0.10); border:1px solid rgba(34,197,94,0.25);
    font-family:Outfit,sans-serif; font-size:10px; font-weight:800;
    color:#15803d; letter-spacing:0.06em; white-space:nowrap;
  }
  .nx-live-dot {
    width:7px; height:7px; border-radius:50%;
    background:#22c55e; box-shadow:0 0 8px rgba(34,197,94,0.6);
    animation:pulse 1.6s ease infinite;
  }

  /* ── Stat bar ── */
  .nx-stat-bar {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr));
    gap:clamp(8px,1.5vw,16px);
    background:rgba(255,255,255,0.80);
    border:1.5px solid rgba(11,92,171,0.10);
    border-radius:clamp(14px,2vw,22px);
    padding:clamp(14px,2vw,22px) clamp(16px,2.5vw,32px);
    box-shadow:0 4px 20px rgba(2,32,53,0.07);
    backdrop-filter:blur(10px);
    position:relative; overflow:hidden;
    animation:fadeInUp 0.7s 0.1s ease both;
    margin:clamp(14px,2vw,20px) 0;
  }
  .nx-stat-bar::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,var(--nl-blue) 0%,var(--nl-blue2) 50%,var(--nl-red) 100%);
  }
  .nx-stat-item { text-align:center; padding:clamp(6px,0.8vw,10px) 4px; }
  .nx-stat-num {
    font-family:Syne,sans-serif;
    font-size:clamp(1.25rem,2.5vw,1.85rem); font-weight:900;
    background:linear-gradient(135deg,var(--nl-blue) 0%,var(--nl-red) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; line-height:1.1; display:block;
  }
  .nx-stat-lbl {
    font-size:10px; color:rgba(15,23,42,0.40); margin-top:4px;
    font-family:Outfit,sans-serif; font-weight:600; letter-spacing:0.03em;
  }

  /* ── Controls bar ── */
  .nx-controls {
    background:rgba(255,255,255,0.85);
    border:1.5px solid rgba(11,92,171,0.10);
    border-radius:var(--radius-xl);
    padding:14px 18px;
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    box-shadow:var(--shadow); backdrop-filter:blur(8px);
    animation:fadeInUp 0.6s 0.15s ease both;
  }
  .nx-filter-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:999px; border:1.5px solid;
    font-family:Outfit,sans-serif; font-size:12px; font-weight:700;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    background:white;
  }
  .nx-filter-pill:hover { transform:translateY(-1px); box-shadow:var(--shadow-sm); }
  .nx-filter-pill.all { border-color:rgba(11,92,171,0.22); color:var(--nl-blue); }
  .nx-filter-pill.all.active { background:var(--nl-blue); color:white; box-shadow:0 2px 10px rgba(11,92,171,0.30); }
  .nx-filter-pill.unread { border-color:rgba(225,29,46,0.25); color:var(--nl-red); }
  .nx-filter-pill.unread.active { background:var(--nl-red); color:white; box-shadow:0 2px 10px rgba(225,29,46,0.28); }
  .nx-filter-pill.expiry { border-color:rgba(245,158,11,0.30); color:#92400e; }
  .nx-filter-pill.expiry.active { background:#d97706; color:white; box-shadow:0 2px 10px rgba(217,119,6,0.30); }

  .nx-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 16px; border-radius:var(--radius); border:none;
    font-family:Outfit,sans-serif; font-size:12px; font-weight:700;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap; letter-spacing:0.01em;
  }
  .nx-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .nx-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .nx-btn-green { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .nx-btn-blue  { background:var(--nl-blue2); color:white; box-shadow:0 2px 8px rgba(20,116,243,0.25); }
  .nx-btn-red   { background:var(--red-600);  color:white; box-shadow:0 2px 8px rgba(220,38,38,0.25); }
  .nx-btn-violet{ background:#7c3aed; color:white; box-shadow:0 2px 8px rgba(124,58,237,0.25); }
  .nx-btn-ghost { background:white; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .nx-btn-sm    { padding:6px 12px; font-size:11px; }
  .nx-sep { width:1px; height:24px; background:var(--gray-200); flex-shrink:0; }
  .nx-spacer { flex:1; }

  /* ── Notification cards ── */
  .nx-list { display:flex; flex-direction:column; gap:clamp(8px,1.2vw,12px); animation:fadeInUp 0.6s 0.2s ease both; }

  .nx-card {
    background:rgba(255,255,255,0.92);
    border:1.5px solid rgba(11,92,171,0.09);
    border-radius:var(--radius-xl);
    box-shadow:var(--shadow);
    overflow:hidden; transition:all 0.25s cubic-bezier(0.34,1.2,0.64,1);
    position:relative;
  }
  .nx-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); border-color:rgba(11,92,171,0.18); }
  .nx-card.unread { border-left:3.5px solid var(--nl-red); }
  .nx-card.expiry { border-left:3.5px solid #d97706; }
  .nx-card.selected { border-color:rgba(20,116,243,0.40); box-shadow:0 0 0 3px rgba(20,116,243,0.10),var(--shadow); }

  /* Card accent strip (top) */
  .nx-card-strip {
    height:3px;
    background:linear-gradient(90deg,var(--nl-blue) 0%,var(--nl-blue2) 50%,var(--nl-red) 100%);
  }
  .nx-card.expiry .nx-card-strip { background:linear-gradient(90deg,#d97706 0%,#f59e0b 100%); }
  .nx-card.unread .nx-card-strip { background:linear-gradient(90deg,var(--nl-red) 0%,#f43f5e 100%); }

  .nx-card-header {
    display:flex; align-items:center; gap:12px;
    padding:clamp(12px,1.5vw,16px) clamp(14px,1.8vw,20px);
    cursor:pointer; user-select:none;
  }
  .nx-card-icon {
    width:40px; height:40px; border-radius:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:18px;
    transition:transform 0.25s ease;
  }
  .nx-card:hover .nx-card-icon { transform:scale(1.10) rotate(-4deg); }

  .nx-card-title-row { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
  .nx-card-title {
    font-family:Outfit,sans-serif; font-weight:800;
    font-size:clamp(13px,1.3vw,15px); color:var(--nl-ink);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    margin:0;
  }
  .nx-card-meta { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }

  .nx-badge {
    display:inline-flex; align-items:center; padding:2px 8px; border-radius:6px;
    font-size:10px; font-weight:800; font-family:Outfit,sans-serif; letter-spacing:0.06em;
    border:1px solid;
  }
  .nx-badge-unread  { background:var(--red-50);    color:var(--red-600);    border-color:var(--red-100); }
  .nx-badge-expiry  { background:var(--amber-50);  color:#92400e;           border-color:var(--amber-100); }
  .nx-badge-type    { background:var(--blue-50);   color:var(--blue-700);   border-color:var(--blue-100); }
  .nx-badge-info    { background:var(--violet-50); color:var(--violet-700); border-color:var(--violet-100); }
  .nx-badge-read    { background:var(--green-50);  color:var(--green-700);  border-color:var(--green-100); }
  .nx-badge-gray    { background:var(--gray-100);  color:var(--gray-600);   border-color:var(--gray-200); }

  .nx-card-time {
    flex-shrink:0; font-size:11px; color:var(--gray-400);
    font-family:Outfit,sans-serif; font-weight:600;
    display:flex; align-items:center; gap:8px;
  }
  .nx-chevron {
    width:20px; height:20px; color:var(--gray-400); flex-shrink:0;
    transition:transform 0.25s ease;
  }
  .nx-chevron.open { transform:rotate(180deg); }

  /* Expanded body */
  .nx-card-body {
    border-top:1.5px solid rgba(11,92,171,0.07);
    animation:slideDown 0.22s ease both;
  }
  .nx-card-body-inner { padding:clamp(14px,1.8vw,20px) clamp(14px,1.8vw,20px); }
  .nx-card-message {
    font-size:13.5px; line-height:1.72; color:var(--gray-700);
    white-space:pre-wrap; margin:0;
  }
  .nx-expiry-alert {
    margin-top:14px; padding:12px 14px; border-radius:var(--radius);
    background:var(--amber-50); border:1.5px solid var(--amber-100);
    display:flex; align-items:flex-start; gap:10px;
    font-size:13px; font-weight:600; color:#78350f; line-height:1.55;
  }
  .nx-card-footer {
    padding:10px clamp(14px,1.8vw,20px) clamp(12px,1.5vw,16px);
    display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    border-top:1px solid var(--gray-100);
  }
  .nx-card-id { font-size:10.5px; color:var(--gray-400); font-family:Outfit,sans-serif; margin-left:auto; }

  /* Empty state */
  .nx-empty {
    text-align:center; padding:clamp(40px,6vw,80px) 20px;
    background:rgba(255,255,255,0.80); border:1.5px solid rgba(11,92,171,0.08);
    border-radius:var(--radius-2xl); box-shadow:var(--shadow);
  }
  .nx-empty-icon { font-size:clamp(44px,6vw,64px); margin-bottom:16px; }

  /* Spinner */
  .nx-spinner {
    border-radius:50%; border:2.5px solid var(--gray-200);
    border-top-color:var(--nl-blue2); animation:spin 0.7s linear infinite;
  }

  /* Toast */
  .nx-toast {
    position:fixed; top:clamp(12px,2vw,20px); right:clamp(12px,2vw,20px);
    z-index:9999; border-radius:var(--radius-lg); padding:13px 18px;
    font-family:Outfit,sans-serif; font-size:13px; font-weight:700;
    display:flex; align-items:center; gap:10px;
    box-shadow:var(--shadow-lg); min-width:260px; max-width:360px;
    border:1.5px solid; animation:scaleIn 0.2s ease both;
  }
  .nx-toast-success { background:var(--green-50); border-color:var(--green-200); color:var(--green-700); }
  .nx-toast-error   { background:var(--red-50);   border-color:var(--red-100);   color:var(--red-600); }

  /* Access denied */
  .nx-denied {
    min-height:80vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:16px; text-align:center;
  }

  /* Selection checkbox */
  .nx-checkbox {
    width:18px; height:18px; accent-color:var(--nl-blue2);
    cursor:pointer; flex-shrink:0; border-radius:4px;
  }

  @media(max-width:768px) {
    .nx-hero-inner { flex-direction:column; text-align:center; }
    .nx-divider { margin-left:auto; margin-right:auto; }
    .nx-sub { margin-left:auto; margin-right:auto; }
    .nx-logo-col { flex-direction:row; justify-content:center; }
    .nx-eyebrow { margin-left:auto; margin-right:auto; }
    .nx-stat-bar { grid-template-columns:repeat(3,1fr); }
    .nx-card-time .nx-date { display:none; }
  }
  @media(max-width:480px) {
    .nx-stat-bar { grid-template-columns:repeat(2,1fr); }
    .nx-controls { padding:10px 12px; }
  }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getNotifStyle = (n) => {
  const t = String(n?.type || "").toUpperCase();
  const msg = String(n?.message || "").toLowerCase();
  if (t === "EXPIRY" || msg.includes("expiry") || msg.includes("warranty"))
    return { icon:"⚠️", iconBg:"var(--amber-50)", iconColor:"#92400e", cardClass:"expiry" };
  if (!n?.is_read)
    return { icon:"🔔", iconBg:"var(--red-50)", iconColor:"var(--red-600)", cardClass:"unread" };
  return { icon:"✅", iconBg:"var(--green-50)", iconColor:"var(--green-700)", cardClass:"" };
};

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString("en-NP", { dateStyle:"medium", timeStyle:"short" });
};

const fmtDateShort = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString("en-NP", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
};

const Spinner = ({ size=32 }) => (
  <div className="nx-spinner" style={{ width:size, height:size }} />
);

/* ─────────────────────────────────────────────
   NOTIFICATION CARD
───────────────────────────────────────────── */
function NotifCard({ n, isOpen, onToggle, onMarkRead, onDelete, selectionMode, isSelected, onToggleSelect }) {
  const { icon, iconBg, iconColor, cardClass } = getNotifStyle(n);
  const isExpiry = String(n?.type || "").toUpperCase() === "EXPIRY" ||
    String(n?.message || "").toLowerCase().includes("expiry") ||
    String(n?.message || "").toLowerCase().includes("warranty");

  return (
    <div className={`nx-card ${cardClass} ${isSelected ? "selected" : ""}`}>
      <div className="nx-card-strip" />

      {/* Header */}
      <div className="nx-card-header" onClick={onToggle}>
        {selectionMode && (
          <input
            type="checkbox"
            className="nx-checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Icon */}
        <div className="nx-card-icon" style={{ background:iconBg, color:iconColor }}>
          {icon}
        </div>

        {/* Title + badges */}
        <div className="nx-card-title-row">
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <p className="nx-card-title">{n.title || "Notification"}</p>
          </div>
          <div className="nx-card-meta">
            {!n.is_read && <span className="nx-badge nx-badge-unread">UNREAD</span>}
            {n.is_read  && <span className="nx-badge nx-badge-read">READ</span>}
            {isExpiry   && <span className="nx-badge nx-badge-expiry">⚠ EXPIRY</span>}
            {n.type && !isExpiry && (
              <span className="nx-badge nx-badge-type">{String(n.type).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Time + chevron */}
        <div className="nx-card-time">
          <span className="nx-date">{fmtDateShort(n.createdAt)}</span>
          <svg className={`nx-chevron ${isOpen ? "open" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="nx-card-body">
          <div className="nx-card-body-inner">
            {/* Message */}
            <p className="nx-card-message">{n.message || "No details available."}</p>

            {/* Metadata grid */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
              gap:10, marginTop:16
            }}>
              {[
                { k:"Notification ID", v:`#${n.id}` },
                { k:"Type",            v:n.type ? String(n.type).toUpperCase() : "—" },
                { k:"Status",          v:n.is_read ? "Read" : "Unread" },
                { k:"Date & Time",     v:fmtDate(n.createdAt) || "—" },
              ].map((item) => (
                <div key={item.k} style={{
                  background:"var(--gray-50)", border:"1.5px solid var(--gray-200)",
                  borderRadius:"var(--radius)", padding:"10px 12px"
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--gray-400)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>
                    {item.k}
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-800)" }}>{item.v}</div>
                </div>
              ))}
            </div>

            {/* Expiry warning */}
            {isExpiry && (
              <div className="nx-expiry-alert">
                <span style={{ fontSize:20, flexShrink:0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight:800, marginBottom:3 }}>Expiry Alert — Immediate Action Required</div>
                  <div style={{ fontWeight:500 }}>This notification relates to an expiring asset or warranty. Please review the relevant assets and take action before the deadline.</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="nx-card-footer">
            {!n.is_read && (
              <button className="nx-btn nx-btn-green nx-btn-sm" onClick={() => onMarkRead(n.id)}>
                ✓ Mark as Read
              </button>
            )}
            <button className="nx-btn nx-btn-red nx-btn-sm" onClick={() => onDelete(n.id)}>
              🗑 Delete
            </button>
            <span className="nx-card-id">ID: {n.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function AdminExpiry() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState("ALL");
  const [expandedId, setExpandedId]   = useState(null);
  const [alert, setAlert]             = useState({ type:"", message:"" });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const showMsg = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type:"", message:"" }), 4000);
  };

  const load = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const res = await api.get("/api/notifications", {
        headers:{ Authorization:`Bearer ${token}` },
        params:{ limit:200 },
      });
      setRows(res?.data?.data || []);
      setSelectedIds(new Set());
    } catch {
      showMsg("error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, isAdmin]);

  /* ── Filtering ── */
  const viewRows = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (filter === "UNREAD") return list.filter((n) => !n?.is_read);
    if (filter === "EXPIRY") {
      return list.filter((n) => {
        const t = String(n?.type || "").toUpperCase();
        if (t === "EXPIRY") return true;
        const title = String(n?.title || "").toLowerCase();
        const msg   = String(n?.message || "").toLowerCase();
        return title.includes("expiry") || msg.includes("expiry") || msg.includes("warranty");
      });
    }
    return list;
  }, [rows, filter]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    return {
      total:   list.length,
      unread:  list.filter((n) => !n?.is_read).length,
      expiry:  list.filter((n) => {
        const t = String(n?.type || "").toUpperCase();
        const m = String(n?.message || "").toLowerCase();
        return t === "EXPIRY" || m.includes("expiry") || m.includes("warranty");
      }).length,
      read: list.filter((n) => n?.is_read).length,
    };
  }, [rows]);

  /* ── Actions ── */
  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      load(); showMsg("success", "Notification marked as read");
    } catch { showMsg("error", "Failed to mark as read"); }
  };

  const markAllRead = async () => {
    try {
      await api.put(`/api/notifications/read-all`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      load(); showMsg("success", "All notifications marked as read");
    } catch { showMsg("error", "Failed to mark all as read"); }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await api.delete(`/api/notifications/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      load(); showMsg("success", "Notification deleted");
    } catch { showMsg("error", "Failed to delete notification"); }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected notifications?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          api.delete(`/api/notifications/${id}`, { headers:{ Authorization:`Bearer ${token}` } })
        )
      );
      load(); showMsg("success", `${selectedIds.size} notifications deleted`);
    } catch { showMsg("error", "Failed to delete selected"); }
  };

  /* ── Selection ── */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };
  const selectAll   = () => setSelectedIds(new Set(viewRows.map((n) => n.id)));
  const deselectAll = () => setSelectedIds(new Set());

  /* ── Access denied ── */
  if (!isAdmin) {
    return (
      <>
        <style>{FONTS}{STYLES}</style>
        <div className="nx-root">
          <div className="nx-grid-bg" />
          <div className="nx-wrap">
            <div className="nx-denied">
              <div style={{ fontSize:64 }}>🔒</div>
              <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:"clamp(1.3rem,3vw,1.8rem)", color:"var(--nl-ink)", margin:0 }}>
                Access Denied
              </h2>
              <p style={{ color:"var(--gray-500)", fontSize:14 }}>You need admin privileges to view this page.</p>
              <button className="nx-btn nx-btn-blue" onClick={() => navigate("/")}>← Go Home</button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <style>{FONTS}{STYLES}</style>

      {/* Toast */}
      {alert.message && (
        <div className={`nx-toast ${alert.type === "success" ? "nx-toast-success" : "nx-toast-error"}`}>
          <span style={{ fontSize:18 }}>{alert.type === "success" ? "✅" : "❌"}</span>
          {alert.message}
        </div>
      )}

      <div className="nx-root">
        <div className="nx-grid-bg" />
        <div className="nx-glow-tr" />
        <div className="nx-glow-bl" />

        <div className="nx-wrap">

          {/* ── HERO ── */}
          <div className="nx-hero">
            <div className="nx-hero-inner">
              <div className="nx-hero-text">
                <div className="nx-eyebrow">
                  <div className="nx-eyebrow-dot" />
                  Nepal Life · Asset IMS · Notifications
                </div>
                <h1 className="nx-title">
                  <span className="blue">Notification</span>{" "}
                  <span className="red">Center</span>
                </h1>
                <div className="nx-divider" />
                <p className="nx-sub">
                  Monitor, manage, and act on all system notifications — expiry alerts, 
                  service updates, and asset warnings across all branches.
                </p>
              </div>
              <div className="nx-logo-col">
              <button
                onClick={() => navigate("/")}
                title="Go Home"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={NepalLifeLogo} alt="Nepal Life" className="nx-logo" />
              </button>

              <div className="nx-live-badge">
                <span className="nx-live-dot" />
                Live Notifications
              </div>
            </div>
            </div>
          </div>
          {/* ── CONTROLS ── */}
          <div className="nx-controls">
            {/* Filter pills */}
            {[
              { key:"ALL",    label:`All (${stats.total})`,           cls:"all" },
              { key:"UNREAD", label:`Unread (${stats.unread})`,       cls:"unread" },
              { key:"EXPIRY", label:`⚠ Expiry (${stats.expiry})`,    cls:"expiry" },
            ].map((f) => (
              <button
                key={f.key}
                className={`nx-filter-pill ${f.cls} ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}

            <div className="nx-sep" />

            {/* Action buttons */}
            <button className="nx-btn nx-btn-green" onClick={markAllRead}>
              ✓ Mark All Read
            </button>

            <button
              className={`nx-btn ${selectionMode ? "nx-btn-ghost" : "nx-btn-blue"}`}
              onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
            >
              {selectionMode ? "✕ Cancel" : "☑ Select"}
            </button>

            {selectionMode && viewRows.length > 0 && (
              <>
                {selectedIds.size !== viewRows.length && (
                  <button className="nx-btn nx-btn-ghost" onClick={selectAll}>Select All</button>
                )}
                {selectedIds.size > 0 && (
                  <>
                    <button className="nx-btn nx-btn-ghost" onClick={deselectAll}>Deselect</button>
                    <button className="nx-btn nx-btn-red" onClick={deleteSelected}>
                      🗑 Delete ({selectedIds.size})
                    </button>
                  </>
                )}
              </>
            )}

            <div className="nx-spacer" />

            <button className="nx-btn nx-btn-ghost" onClick={load} disabled={loading} title="Refresh">
              {loading ? <Spinner size={14}/> : "↺ Refresh"}
            </button>
          </div>

          {/* ── LIST ── */}
          <div style={{ marginTop:"clamp(10px,1.5vw,16px)" }}>
            {loading ? (
              <div className="nx-empty">
                <Spinner size={40}/>
                <p style={{ marginTop:16, color:"var(--gray-500)", fontSize:14 }}>Loading notifications…</p>
              </div>
            ) : viewRows.length === 0 ? (
              <div className="nx-empty">
                <div className="nx-empty-icon">🔔</div>
                <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:900, fontSize:"clamp(1.1rem,2vw,1.4rem)", margin:"0 0 8px", color:"var(--nl-ink)" }}>
                  No notifications found
                </h3>
                <p style={{ color:"var(--gray-400)", fontSize:13, margin:"0 0 20px" }}>
                  {filter === "ALL" ? "You're all caught up!" : `No ${filter.toLowerCase()} notifications.`}
                </p>
                {filter !== "ALL" && (
                  <button className="nx-btn nx-btn-blue" onClick={() => setFilter("ALL")}>
                    Show All Notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="nx-list">
                {viewRows.map((n) => (
                  <NotifCard
                    key={n.id}
                    n={n}
                    isOpen={expandedId === n.id}
                    onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(n.id)}
                    onToggleSelect={(e) => { e.stopPropagation(); toggleSelect(n.id); }}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}