import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NepalLifeLogo from "../assets/nepallife.png";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Layout/Footer";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";

const API_BASE = "http://192.168.0.244:5000";

/* ── Brand ── */
const NL_BLUE        = "#0B5CAB";
const NL_BLUE2       = "#1474F3";
const NL_RED         = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg,${NL_BLUE} 0%,${NL_BLUE2} 55%,${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg,${NL_BLUE} 70%,${NL_RED} 30%)`;

/* ── File-type groups ── */
const FILE_TYPE_GROUPS = [
  { label: "PDF",   value: "pdf",   mime: ["application/pdf"] },
  { label: "Image", value: "image", mime: ["image/"] },
  { label: "Word",  value: "word",  mime: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml"] },
  { label: "Excel", value: "excel", mime: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml"] },
  { label: "Text",  value: "text",  mime: ["text/plain", "text/csv"] },
  { label: "Other", value: "other", mime: [] },
];

const matchTypeGroup = (mime, group) => {
  if (!mime) return group === "other";
  const m = mime.toLowerCase();
  const g = FILE_TYPE_GROUPS.find(x => x.value === group);
  if (!g) return false;
  if (g.value === "other")
    return !FILE_TYPE_GROUPS.filter(x => x.value !== "other").some(x => x.mime.some(p => m.includes(p)));
  return g.mime.some(p => m.includes(p));
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const PAGE_STYLES = `
  *,*::before,*::after{box-sizing:border-box;}
  :root{
    --nl-blue:${NL_BLUE}; --nl-blue2:${NL_BLUE2}; --nl-red:${NL_RED};
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8; --blue-900:#1e3a8a;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
    --violet-50:#f5f3ff; --violet-100:#ede9fe; --violet-200:#ddd6fe; --violet-700:#6d28d9;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#fff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px; --nl-ink:#0F172A;
  }

  @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
  @keyframes bounceIn{0%{opacity:0;transform:scale(0.94) translateY(10px)}60%{transform:scale(1.02) translateY(-3px)}100%{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

  .fl-root{font-family:'DM Sans',sans-serif;background:var(--gray-50);max-height:90vh;color:var(--gray-900);}
  .fl-layout{display:flex;max-height:100vh;}

  /* ── Sidebar ── */
  .fl-sidebar{
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative;overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1);flex-shrink:0;
  }
  .fl-sidebar::before{content:'';position:absolute;top:-70px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);pointer-events:none;}
  .fl-sidebar::after{content:'';position:absolute;bottom:-50px;left:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%);pointer-events:none;}
  .fl-sidebar-inner{height:100%;display:flex;flex-direction:column;padding:26px 20px;min-width:220px;position:relative;z-index:1;}
  .fl-nav-item{display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:13px;background:transparent;border:1.5px solid transparent;color:rgba(255,255,255,0.52);font-size:13.5px;font-weight:500;cursor:pointer;text-align:left;width:100%;transition:all 0.22s cubic-bezier(0.4,0,0.2,1);font-family:'DM Sans',sans-serif;letter-spacing:0.01em;}
  .fl-nav-item:hover{background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08));border-color:rgba(59,130,246,0.28);color:#93c5fd;transform:translateX(5px);}
  .fl-nav-item:hover .fl-nav-icon{background:rgba(59,130,246,0.2);}
  .fl-nav-icon{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,0.07);display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:background 0.2s;}

  /* ── Main ── */
  .fl-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;}
  .fl-topbar{background:var(--white);border-bottom:1px solid var(--gray-100);padding:6px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:30;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .fl-topbar-left,.fl-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .fl-content{flex:1;padding:0 4px;overflow-y:auto;}

  /* ── Panel Toggle Bar ── */
  .fl-panel-toggle-bar{
    background:white;border-bottom:1px solid var(--gray-100);
    padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
    position:sticky;top:49px;z-index:25;box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .fl-toggle-pill{
    display:inline-flex;align-items:center;gap:6px;
    padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;
    border:1.5px solid var(--gray-200);background:var(--gray-50);
    color:var(--gray-600);cursor:pointer;transition:all 0.18s ease;
    font-family:'Outfit',sans-serif;position:relative;
  }
  .fl-toggle-pill:hover{border-color:var(--blue-300);color:var(--blue-700);background:var(--blue-50);}
  .fl-toggle-pill.active{background:${NL_GRADIENT};color:white;border-color:transparent;box-shadow:0 2px 10px rgba(11,92,171,0.3);}
  .fl-toggle-pill .pill-badge{
    position:absolute;top:-6px;right:-6px;
    width:16px;height:16px;border-radius:50%;background:var(--red-500);
    color:white;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;
    font-family:'Outfit',sans-serif;border:2px solid white;
  }

  /* ── Collapsible panels ── */
  .fl-collapsible-panel{overflow:hidden;transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1),opacity 0.3s ease;max-height:0;opacity:0;}
  .fl-collapsible-panel.open{max-height:700px;opacity:1;}

  /* ── Active filter chips ── */
  .fl-active-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0;}
  .fl-filter-chip{
    display:inline-flex;align-items:center;gap:5px;
    padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;
    background:rgba(11,92,171,0.08);border:1px solid rgba(11,92,171,0.2);
    color:var(--blue-700);font-family:'Outfit',sans-serif;
  }
  .fl-filter-chip button{
    width:14px;height:14px;border-radius:50%;border:none;
    background:rgba(11,92,171,0.15);color:var(--blue-700);
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:900;padding:0;line-height:1;
  }
  .fl-filter-chip button:hover{background:var(--red-500);color:white;}
  .fl-clear-all{font-size:11px;font-weight:700;color:var(--red-600);cursor:pointer;background:none;border:none;padding:2px 6px;border-radius:6px;font-family:'Outfit',sans-serif;}
  .fl-clear-all:hover{background:var(--red-50);}

  /* ── Buttons ── */
  .fl-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius);font-weight:600;font-size:13px;border:none;cursor:pointer;transition:all 0.18s ease;white-space:nowrap;font-family:'Outfit',sans-serif;letter-spacing:0.01em;line-height:1;text-decoration:none;}
  .fl-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .fl-btn:hover:not(:disabled){transform:translateY(-1px);}
  .fl-btn:active:not(:disabled){transform:translateY(0) scale(0.98);}
  .fl-btn-success{background:var(--green-600);color:white;box-shadow:0 2px 8px rgba(22,163,74,0.25);}
  .fl-btn-success:hover:not(:disabled){background:var(--green-700);}
  .fl-btn-white{background:white;border:1.5px solid var(--gray-200);color:var(--gray-700);box-shadow:var(--shadow-sm);}
  .fl-btn-white:hover:not(:disabled){border-color:var(--blue-300);color:var(--blue-700);background:var(--blue-50);}
  .fl-btn-blue-outline{background:var(--blue-50);border:1.5px solid var(--blue-200);color:var(--blue-700);}
  .fl-btn-blue-outline:hover:not(:disabled){background:var(--blue-100);}
  .fl-btn-red-outline{background:var(--red-50);border:1.5px solid var(--red-100);color:var(--red-600);}
  .fl-btn-red-outline:hover:not(:disabled){background:var(--red-100);}
  .fl-btn-sm{padding:6px 12px;font-size:12px;}
  .fl-btn-icon{width:34px;height:34px;padding:0;justify-content:center;border-radius:var(--radius);}

  /* ── Filter card ── */
  .fl-filter-card{background:white;border-radius:10px;padding:14px 12px;box-shadow:var(--shadow);}
  .fl-filter-card1{background:white;border-radius:10px;padding:20px 12px;box-shadow:var(--shadow);}

  /* ── Stats grid ── */
  .fl-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;margin-bottom:4px;}
  .fl-stat-card{background:white;border-radius:var(--radius-lg);border:1.5px solid var(--gray-200);padding:16px 18px;box-shadow:var(--shadow-sm);transition:all 0.18s ease;}
  .fl-stat-card:hover{border-color:var(--blue-200);box-shadow:var(--shadow);transform:translateY(-2px);}
  .fl-stat-value{font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:800;color:var(--gray-900);line-height:1;}
  .fl-stat-label{font-size:11.5px;color:var(--gray-500);margin-top:4px;font-weight:500;}

  /* ── Hero ── */
  .fl-hero-wrap{border:1px solid rgba(11,92,171,0.12);border-radius:20px;padding:0 7px 7px 7px;background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);box-shadow:0 18px 60px rgba(2,32,53,0.14);overflow:hidden;position:relative;}
  .fl-hero-wrap::before{content:'';position:absolute;inset:-2px;background:radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);pointer-events:none;}
  .fl-hero-inner{position:relative;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:18px;}
  .fl-logo{width:88px;max-width:30vw;height:auto;display:block;filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22));animation:floaty 4.5s ease-in-out infinite;}
  .fl-title{font-family:Syne,sans-serif;font-weight:900;font-size:clamp(1.1rem,2vw,1.5rem);letter-spacing:-0.03em;margin:0;color:var(--nl-ink);line-height:1.1;}
  .fl-title .blue{color:var(--nl-blue);} .fl-title .red{color:var(--nl-red);}
  .fl-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(11,92,171,0.10);border:1px solid rgba(11,92,171,0.20);color:rgba(11,92,171,0.90);border-radius:999px;padding:5px 12px;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;}
  .fl-divider{width:46px;height:3px;border-radius:999px;background:linear-gradient(90deg,var(--nl-blue),var(--nl-red));margin-top:8px;}
  .fl-sub{margin-top:6px;font-size:11.5px;color:rgba(15,23,42,0.62);line-height:1.6;max-width:680px;}

  /* ── Table ── */
  .fl-table-card{background:white;margin-top:1px;border-radius:var(--radius);border:1.5px solid var(--gray-200);box-shadow:var(--shadow);overflow:hidden;animation:fadeUp 0.35s ease both;margin-bottom:20px;}
  .fl-table{width:100%;border-collapse:collapse;}
  .fl-table thead th{
    padding:12px 16px;text-align:left;font-size:10.5px;font-weight:700;
    color:rgba(255,255,255,0.92);text-transform:uppercase;letter-spacing:0.09em;
    white-space:nowrap;font-family:'Outfit',sans-serif;
    background:${NL_BLUE};
    border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .fl-table thead th:nth-child(7){background:${NL_RED};}
  .fl-table thead th:nth-child(8){background:${NL_RED};}
  .fl-table th,.fl-table td{border-right:0.5px solid rgba(0,0,0,0.07);border-bottom:1px solid #e2e8f0;}
  .fl-table tbody tr{border-bottom:1px solid var(--gray-100);transition:background 0.12s;cursor:pointer;}
  .fl-table tbody tr:last-child{border-bottom:none;}
  .fl-table tbody tr:hover{background:var(--blue-50);}
  .fl-table tbody td{padding:13px 16px;font-size:13px;color:var(--gray-700);vertical-align:top;}

  /* ── Badges ── */
  .fl-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;}
  .fl-badge-blue{background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-200);}
  .fl-badge-green{background:var(--green-50);color:var(--green-700);border:1px solid var(--green-200);}
  .fl-badge-gray{background:var(--gray-100);color:var(--gray-600);border:1px solid var(--gray-200);}
  .fl-badge-amber{background:var(--amber-50);color:var(--amber-600);border:1px solid var(--amber-100);}
  .fl-badge-violet{background:var(--violet-50);color:var(--violet-700);border:1px solid var(--violet-200);}
  .fl-badge-red{background:var(--red-50);color:var(--red-600);border:1px solid var(--red-100);}

  /* ── Form controls ── */
  .fl-input,.fl-select,.fl-textarea,.fl-file{
    width:100%;background:#ffffff;border:1.5px solid #cbd5e1;
    border-radius:var(--radius);padding:10px 14px;color:#0f172a;font-size:13.5px;
    font-family:'DM Sans',sans-serif;outline:none;transition:all 0.18s ease;
    box-shadow:0 1px 3px rgba(0,0,0,0.05);
  }
  .fl-input:hover,.fl-select:hover,.fl-textarea:hover{border-color:#94a3b8;}
  .fl-input:focus,.fl-select:focus,.fl-textarea:focus{border-color:${NL_BLUE};box-shadow:0 0 0 3px rgba(11,92,171,0.12);background:#fff;}
  .fl-input::placeholder,.fl-textarea::placeholder{color:#94a3b8;font-style:italic;}
  .fl-select{
    cursor:pointer;appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230B5CAB' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:calc(100% - 12px) center;padding-right:34px;
  }
  .fl-select option{color:#0f172a;background:white;}
  .fl-textarea{resize:vertical;min-height:110px;line-height:1.6;}
  .fl-label{font-size:11.5px;font-weight:700;color:#374151;margin-bottom:7px;display:flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:0.05em;font-family:'Outfit',sans-serif;}

  /* ── Form blocks (upload modal) ── */
  .fl-form-block{border-radius:var(--radius-lg);border:1.5px solid var(--gray-200);overflow:hidden;background:white;box-shadow:var(--shadow-sm);}
  .fl-form-block-header{padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1.5px solid var(--gray-100);}
  .fl-form-block-body{padding:16px;display:flex;flex-direction:column;gap:14px;}
  .fl-form-grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}

  /* ── Branch loading indicator ── */
  .fl-branch-loading{
    display:flex;align-items:center;gap:8px;padding:10px 14px;
    border:1.5px solid #cbd5e1;border-radius:var(--radius);
    background:#f8fafc;color:var(--gray-400);font-size:13px;
    font-family:'DM Sans',sans-serif;
  }
  .fl-branch-loading .dot{
    width:6px;height:6px;border-radius:50%;background:var(--blue-400);
    animation:pulse 1.2s ease-in-out infinite;
  }
  .fl-branch-loading .dot:nth-child(2){animation-delay:0.2s;}
  .fl-branch-loading .dot:nth-child(3){animation-delay:0.4s;}

  /* ── Branch select with count badge ── */
  .fl-branch-select-wrap{position:relative;}
  .fl-branch-count-badge{
    position:absolute;right:36px;top:50%;transform:translateY(-50%);
    font-size:10px;font-weight:700;color:var(--gray-400);
    font-family:'Outfit',sans-serif;pointer-events:none;
  }

  /* ── Alerts ── */
  .fl-alert{border-radius:var(--radius);padding:12px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;border:1.5px solid;margin:8px 0;}
  .fl-alert-success{background:var(--green-50);border-color:var(--green-200);color:var(--green-700);}
  .fl-alert-error{background:var(--red-50);border-color:var(--red-100);color:var(--red-600);}

  /* ── Empty state ── */
  .fl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;}
  .fl-spinner{border-radius:50%;border:2.5px solid var(--gray-200);border-top-color:var(--blue-500);animation:spin 0.7s linear infinite;}
  .fl-mobile-overlay{position:fixed;inset:0;z-index:49;background:rgba(17,24,39,0.4);}

  /* ── Detail modal (preview) ── */
  .fl-preview-overlay{
    position:fixed;inset:0;z-index:9999;background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
    padding:16px;animation:fadeIn 0.2s ease;
  }
  .fl-preview-panel{
    width:100%;max-width:1020px;max-height:90vh;background:white;border-radius:var(--radius-xl);
    overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .fl-preview-header{background:${NL_GRADIENT_90};padding:22px 26px;flex-shrink:0;}
  .fl-preview-body{flex:1;overflow-y:auto;background:var(--gray-50);padding:24px 26px;}

  /* ── Preview zone (file renderer inside detail) ── */
  .fl-preview-zone{
    background:#f1f5f9;border:1.5px solid var(--gray-200);border-radius:var(--radius-lg);
    display:flex;align-items:center;justify-content:center;
    min-height:280px;overflow:hidden;position:relative;margin-bottom:20px;
  }
  .fl-preview-zone > img{max-width:100%;max-height:50vh;object-fit:contain;display:block;}
  .fl-preview-zone > iframe{width:100%;height:50vh;border:none;display:block;}

  /* ── Detail cards ── */
  .fl-detail-card{background:white;border-radius:var(--radius-lg);border:1.5px solid var(--gray-200);overflow:hidden;box-shadow:var(--shadow-sm);}
  .fl-detail-card-header{padding:14px 18px;border-bottom:1.5px solid var(--gray-100);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--gray-50),white);}
  .fl-detail-card-body{padding:6px 18px 18px;}
  .fl-detail-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 8px;border-radius:8px;gap:12px;transition:background 0.12s;margin:2px 0;}
  .fl-detail-row:hover{background:var(--blue-50);}
  .fl-detail-label{font-size:11.5px;font-weight:700;color:var(--gray-500);white-space:nowrap;text-transform:uppercase;letter-spacing:0.05em;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:5px;}
  .fl-detail-label::before{content:'';width:3px;height:12px;border-radius:999px;background:linear-gradient(to bottom,${NL_BLUE},${NL_BLUE2});display:inline-block;flex-shrink:0;}
  .fl-detail-value{font-size:13px;font-weight:600;color:var(--gray-900);text-align:right;max-width:65%;word-break:break-word;line-height:1.5;}
  .fl-detail-value.na{color:var(--gray-300);font-style:italic;font-weight:400;}

  /* ── Upload modal ── */
  .fl-modal-overlay{position:fixed;inset:0;z-index:9990;background:rgba(17,24,39,0.6);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;animation:fadeIn 0.2s ease;}
  .fl-modal-panel{width:100%;max-width:720px;background:white;border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-lg);animation:scaleIn 0.25s ease both;border:1.5px solid var(--gray-200);margin-top:12px;}
  .fl-modal-header{background:${NL_GRADIENT_90};padding:22px 26px;}
  .fl-modal-body{padding:20px 26px;display:flex;flex-direction:column;gap:14px;}
  .fl-modal-footer{padding:16px 26px 24px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--gray-100);}

  /* ── Drag-drop zone ── */
  .fl-dropzone{
    border:2px dashed #cbd5e1;border-radius:var(--radius-lg);
    padding:28px 20px;text-align:center;cursor:pointer;
    transition:all 0.2s ease;background:#f8fafc;position:relative;
  }
  .fl-dropzone:hover,.fl-dropzone.drag-over{
    border-color:${NL_BLUE};background:var(--blue-50);
  }
  .fl-dropzone input[type="file"]{
    position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
  }
  .fl-dropzone-icon{font-size:36px;margin-bottom:10px;display:block;}
  .fl-dropzone-text{font-size:13px;font-weight:600;color:var(--gray-600);}
  .fl-dropzone-sub{font-size:11px;color:var(--gray-400);margin-top:4px;}
  .fl-file-selected{
    display:flex;align-items:center;gap:12px;padding:12px 16px;
    background:var(--green-50);border:1.5px solid var(--green-200);
    border-radius:var(--radius);margin-top:10px;
  }
  .fl-file-selected-icon{font-size:22px;flex-shrink:0;}
  .fl-file-selected-name{font-size:13px;font-weight:700;color:var(--green-700);word-break:break-all;}
  .fl-file-selected-size{font-size:11px;color:var(--green-600);margin-top:2px;}
  .fl-file-selected-clear{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:16px;line-height:1;padding:2px;}
  .fl-file-selected-clear:hover{color:var(--red-500);}

  /* ── Search wrapper ── */
  .fl-search-wrap{position:relative;}
  .fl-search-wrap .icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);pointer-events:none;}
  .fl-search-wrap input{padding-right:38px;}

  /* ── Scrollbar ── */
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:999px;}

  @media(max-width:1024px){
    .fl-sidebar{position:fixed;top:0;left:0;height:100vh;z-index:100;}
    .fl-content{padding:3px;}
  }
  @media(max-width:640px){
    .fl-topbar{padding:8px 10px;}.fl-content{padding:1px;}
    .fl-table thead th,.fl-table tbody td{padding:10px 12px;font-size:12px;}
    .fl-hero-inner{flex-direction:column;text-align:center;}
    .fl-divider{margin-left:auto;margin-right:auto;}
    .fl-modal-body,.fl-modal-header,.fl-modal-footer{padding-left:16px;padding-right:16px;}
    .fl-preview-panel{max-height:95vh;}
    .fl-form-grid-2{grid-template-columns:1fr;}
  }
`;

/* ── Icons ── */
function Ic({ d, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
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

const Spinner = ({ size = 28 }) => <div className="fl-spinner" style={{ width: size, height: size }} />;

/* ── Category badge style ── */
const catBadge = cat => {
  const c = (cat || "").toLowerCase();
  if (["memo", "letter"].includes(c)) return "fl-badge fl-badge-blue";
  if (c === "image")                  return "fl-badge fl-badge-green";
  if (["pdf", "report"].includes(c))  return "fl-badge fl-badge-amber";
  if (c === "document")               return "fl-badge fl-badge-violet";
  return "fl-badge fl-badge-gray";
};

/* ── File type icon ── */
const fileTypeIcon = mime => {
  if (!mime) return "📄";
  const m = mime.toLowerCase();
  if (m.startsWith("image/"))    return "🖼️";
  if (m.includes("pdf"))         return "📕";
  if (m.includes("word") || m.includes("document")) return "📝";
  if (m.includes("excel") || m.includes("sheet"))   return "📊";
  if (m.startsWith("text/"))     return "📃";
  return "📄";
};

/* ── BranchSelect: shared component for both filter and upload form ── */
function BranchSelect({ value, onChange, branches, loading, placeholder = "Select branch", className = "fl-select", showFileCounts = false, fileCounts = {} }) {
  if (loading) {
    return (
      <div className="fl-branch-loading">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span style={{ fontSize: 12, color: "var(--gray-400)" }}>Loading branches…</span>
      </div>
    );
  }
  return (
    <select className={className} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {branches.map(b => {
        const count = fileCounts[b];
        const label = showFileCounts && count !== undefined
          ? `${b} (${count} file${count !== 1 ? "s" : ""})`
          : b;
        return <option key={b} value={b}>{label}</option>;
      })}
    </select>
  );
}

/* ════════════════════════════════════════════
   FILE PREVIEW (inside detail modal)
════════════════════════════════════════════ */
function FilePreview({ file, fileUrl }) {
  const [imgErr, setImgErr] = useState(false);
  const mime = (file.mime_type || "").toLowerCase();

  if (mime.startsWith("image/")) {
    if (imgErr) return (
      <div style={{ textAlign: "center", padding: "32px 20px" }}>
        <span style={{ fontSize: 64 }}>🖼️</span>
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--gray-500)", fontWeight: 600 }}>Could not load image</div>
        <a href={fileUrl} target="_blank" rel="noreferrer" className="fl-btn fl-btn-blue-outline fl-btn-sm" style={{ marginTop: 12 }}>🔗 Open in new tab</a>
      </div>
    );
    return <img src={fileUrl} alt={file.title || file.original_name} onError={() => setImgErr(true)} />;
  }
  if (mime.includes("pdf"))
    return <iframe src={`${fileUrl}#view=FitH&toolbar=1`} title={file.title} />;
  if (mime.includes("word") || mime.includes("document") || mime.includes("sheet") || mime.includes("excel"))
    return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`} title={file.title} />;
  if (mime.startsWith("text/"))
    return <iframe src={fileUrl} title={file.title} style={{ background: "white" }} />;

  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <span style={{ fontSize: 72 }}>{fileTypeIcon(mime)}</span>
      <div style={{ marginTop: 14, fontSize: 13, color: "var(--gray-500)", fontWeight: 600 }}>No preview available for this file type</div>
      <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 6 }}>{mime || "Unknown type"}</div>
      <a href={fileUrl} target="_blank" rel="noreferrer" className="fl-btn fl-btn-blue-outline fl-btn-sm" style={{ marginTop: 14 }}>🔗 Open File</a>
    </div>
  );
}

/* ════════════════════════════════════════════
   HERO
════════════════════════════════════════════ */
function NepalLifeHero() {
  return (
    <div className="fl-hero-wrap">
      <div className="fl-hero-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fl-tag">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: NL_BLUE2, boxShadow: "0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · Document & File Library
          </div>
          <h2 className="fl-title">
            <span className="blue">NEPAL</span><span className="red">LIFE</span>{" "}
            <span style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>File Library</span>
          </h2>
          <div className="fl-divider" />
          <p className="fl-sub">
            Securely upload, organize, search, view, download, and manage letters, memos,
            PDFs, images, and office documents — filtered by branch and file type.
          </p>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="fl-logo" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DETAIL MODAL
════════════════════════════════════════════ */
function FileDetailModal({ file, onClose, getFileUrl, getDownloadUrl, isAdmin, onDelete }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!file) return null;
  const fileUrl = getFileUrl(file.file_path);
  const fmtDate = v => { if (!v) return "—"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString(); };

  const fields = [
    ["File ID",       `#${file.id}`],
    ["Title",         file.title || "—"],
    ["Category",      file.category || "—"],
    ["Branch",        file.branch ? `🏢 ${file.branch}` : "—"],
    ["Original Name", file.original_name || "—"],
    ["MIME Type",     file.mime_type || "—"],
    ["Uploaded",      fmtDate(file.created_at)],
  ];

  return (
    <div className="fl-preview-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fl-preview-panel">
        <div className="fl-preview-header">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6, fontFamily: "Outfit,sans-serif" }}>
                File Preview · #{file.id}
              </div>
              <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: "clamp(1rem,3vw,1.4rem)", color: "white", letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.25 }}>
                {file.title || file.original_name || "Untitled"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
                <span className={catBadge(file.category)} style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
                  🗂 {file.category || "other"}
                </span>
                <span style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                  {fileTypeIcon(file.mime_type)} {FILE_TYPE_GROUPS.find(g => matchTypeGroup(file.mime_type, g.value))?.label || "Other"}
                </span>
                {file.branch && (
                  <span style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
                    🏢 {file.branch}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <a href={getDownloadUrl(file.id)} className="fl-btn fl-btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)" }}>⬇ Download</a>
              <button onClick={onClose} className="fl-btn fl-btn-sm" style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}>✕ Close</button>
            </div>
          </div>
        </div>

        <div className="fl-preview-body">
          <div className="fl-preview-zone">
            <FilePreview file={file} fileUrl={fileUrl} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18, padding: "12px 16px", background: "white", borderRadius: 12, border: "1.5px solid var(--gray-200)", boxShadow: "var(--shadow-sm)" }}>
            {[
              { icon: "🏢", label: "Branch",   value: file.branch || "—" },
              { icon: "🗂",  label: "Category", value: file.category || "—" },
              { icon: "📄",  label: "Type",     value: FILE_TYPE_GROUPS.find(g => matchTypeGroup(file.mime_type, g.value))?.label || "Other" },
              { icon: "📅",  label: "Uploaded", value: fmtDate(file.created_at) },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", minWidth: 120, padding: "8px 14px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 10, flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3, fontFamily: "Outfit,sans-serif" }}>{icon} {label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: value === "—" ? "var(--gray-300)" : "var(--gray-900)", textTransform: "capitalize" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            <div className="fl-detail-card">
              <div className="fl-detail-card-header" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", borderBottom: "1.5px solid #bfdbfe" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📂</div>
                <div>
                  <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#1e3a8a" }}>File Details</div>
                  <div style={{ fontSize: 11, color: "#60a5fa" }}>Complete file metadata</div>
                </div>
              </div>
              <div className="fl-detail-card-body">
                {fields.map(([label, value]) => (
                  <div key={label} className="fl-detail-row">
                    <div className="fl-detail-label">{label}</div>
                    <div className={`fl-detail-value${value === "—" ? " na" : ""}`} style={{ textTransform: label === "Category" ? "capitalize" : "none" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {file.description && (
              <div className="fl-detail-card">
                <div className="fl-detail-card-header" style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", borderBottom: "1.5px solid var(--gray-200)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📝</div>
                  <div>
                    <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#0f172a" }}>Description</div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Notes about this file</div>
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontSize: 13.5, color: "var(--gray-800)", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: "14px 16px" }}>
                    {file.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => { onClose(); onDelete(file.id); }} className="fl-btn fl-btn-red-outline fl-btn-sm">🗑 Delete File</button>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 11, color: "var(--gray-400)", textAlign: "center" }}>
            Press <kbd style={{ background: "var(--gray-100)", border: "1px solid var(--gray-300)", borderRadius: 5, padding: "1px 6px", fontSize: 10, fontFamily: "monospace" }}>ESC</kbd> or click outside to close
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function FileLibraryPage() {
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();

  const userRole = isAdmin ? "admin" : isSubAdmin ? "sub-admin" : (user?.role || "user").toLowerCase();

  const [files,          setFiles]          = useState([]);
  const [apiBranches,    setApiBranches]    = useState([]);      // ALL branches from API
  const [branchesLoading,setBranchesLoading]= useState(false);   // branch fetch state
  const [loading,        setLoading]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [message,        setMessage]        = useState("");
  const [error,          setError]          = useState("");
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [viewFile,       setViewFile]       = useState(null);
  const [search,         setSearch]         = useState("");
  const [filterBranch,   setFilterBranch]   = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterCat,      setFilterCat]      = useState("");
  const [menuOpen,       setMenuOpen]       = useState(true);
  const [winW,           setWinW]           = useState(window.innerWidth);
  const [showPanel,      setShowPanel]      = useState("hero");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [dragOver,       setDragOver]       = useState(false);
  const [form, setForm] = useState({ title: "", category: "", branch: "", description: "" });

  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const swWidth = () => {
    if (winW < 640)  return menuOpen ? "85vw" : "0";
    if (winW < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const togglePanel = panel => setShowPanel(prev => prev === panel ? "" : panel);
  const categories = ["memo", "letter", "document", "image", "report", "pdf", "other"];

  /* ══════════════════════════════════
     BRANCH FETCH — tries multiple
     endpoints, returns all branch names
  ══════════════════════════════════ */
  const fetchApiBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      // 1) try /api/branches/all (no auth needed typically)
      let list = [];
      try {
        const res = await fetch(`${API_BASE}/api/branches/all`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          list = json?.data || json || [];
        }
      } catch { /* fall through */ }

      // 2) fallback to paginated endpoint
      if (!list.length) {
        const res = await fetch(`${API_BASE}/api/branches?limit=500&page=1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          list = json?.data || json || [];
        }
      }

      // Normalize to sorted unique name strings
      const names = [
        ...new Set(
          (Array.isArray(list) ? list : [])
            .map(b => String(b?.name || b || "").trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));

      setApiBranches(names);
    } catch {
      setApiBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, [token]);

  /* ── fetch files ── */
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API_BASE}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch files");
      setFiles(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch files");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchFiles(); fetchApiBranches(); }, [fetchFiles, fetchApiBranches]);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let list = files;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(f =>
      [f.id, f.title, f.original_name, f.category, f.mime_type, f.description, f.branch]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
    if (filterBranch) list = list.filter(f => (f.branch || "") === filterBranch);
    if (filterType)   list = list.filter(f => matchTypeGroup(f.mime_type, filterType));
    if (filterCat)    list = list.filter(f => (f.category || "").toLowerCase() === filterCat);
    return list;
  }, [files, search, filterBranch, filterType, filterCat]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:    files.length,
    pdfs:     files.filter(f => matchTypeGroup(f.mime_type, "pdf")).length,
    images:   files.filter(f => matchTypeGroup(f.mime_type, "image")).length,
    docs:     files.filter(f => matchTypeGroup(f.mime_type, "word")).length,
    branches: new Set(files.map(f => f.branch).filter(Boolean)).size,
    other:    files.filter(f => matchTypeGroup(f.mime_type, "other")).length,
  }), [files]);

  /* ── file count per branch (for filter dropdown labels) ── */
  const branchFileCounts = useMemo(() => {
    const m = {};
    for (const f of files) {
      if (f.branch) m[f.branch] = (m[f.branch] || 0) + 1;
    }
    return m;
  }, [files]);

  const activeFiltersCount = [search, filterBranch, filterType, filterCat].filter(Boolean).length;
  const hasFilters = activeFiltersCount > 0;
  const clearFilters = () => { setSearch(""); setFilterBranch(""); setFilterType(""); setFilterCat(""); };

  const handleInput = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };

  const closeModal = () => {
    setModalOpen(false); setSelectedFile(null);
    setForm({ title: "", category: "", branch: "", description: "" });
    const inp = document.getElementById("fileInput");
    if (inp) inp.value = "";
    setError("");
  };

  /* ── Drag & drop handlers ── */
  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setMessage(""); setError("");
    if (!selectedFile) { setError("Please choose a file first."); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("branch", form.branch);
      fd.append("description", form.description);
      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
      setMessage("File uploaded successfully.");
      closeModal(); fetchFiles(); fetchApiBranches();
    } catch (err) { setError(err.message || "Upload failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!isAdmin) { setError("Only admins can delete files."); return; }
    if (!window.confirm("Delete this file?")) return;
    try {
      setMessage(""); setError("");
      const res = await fetch(`${API_BASE}/api/files/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setMessage("File deleted."); fetchFiles();
    } catch (err) { setError(err.message || "Delete failed"); }
  };

  const fmtDate    = v => { if (!v) return "—"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString(); };
  const getFileUrl = fp => `${API_BASE}${fp}`;
  const getDownUrl = id => `${API_BASE}/api/files/download/${id}`;

  const roleBadge = ({
    admin:       { background: "linear-gradient(135deg,#dc2626,#991b1b)", color: "white" },
    "sub-admin": { background: "linear-gradient(135deg,#d97706,#92400e)", color: "white" },
    user:        { background: "var(--gray-100)", color: "var(--gray-700)" },
  }[userRole] || {});

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
    <>
    <SplitSidebarLayout
                navItems={navItems}
                user={user}
              >
    <div className="fl-root">
      <style>{FONTS}{PAGE_STYLES}</style>
      <div className="fl-layout">
        {/* ═══ MAIN ═══ */}
        <main className="fl-main">
          {/* ── Topbar ── */}
          <div className="fl-topbar">
            <div className="fl-topbar-left">
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", fontFamily: "Outfit,sans-serif" }}>File Library</div>
              {branchesLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--gray-400)" }}>
                  <div className="fl-spinner" style={{ width: 12, height: 12 }} />
                  Loading branches…
                </div>
              )}
            </div>
            <div className="fl-topbar-right">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, fontFamily: "Outfit,sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1.5px solid var(--gray-200)", ...roleBadge }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.6 }} />{userRole}
              </div>
              <button className="fl-btn fl-btn-blue-outline fl-btn-sm" onClick={() => { fetchFiles(); fetchApiBranches(); }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
              <button className="fl-btn fl-btn-success fl-btn-sm" onClick={() => setModalOpen(true)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Upload File
              </button>
            </div>
          </div>

          {/* ── Panel Toggle Bar ── */}
          <div className="fl-panel-toggle-bar">
            <button className={`fl-toggle-pill${showPanel === "hero" ? " active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ <span>Overview</span>
            </button>
            <button className={`fl-toggle-pill${showPanel === "filters" ? " active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 <span>Filters</span>
              {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
            </button>
            <button className={`fl-toggle-pill${showPanel === "stats" ? " active" : ""}`} onClick={() => togglePanel("stats")}>
              📊 <span>Stats</span>
            </button>

            {/* Active filter chips */}
            <div className="fl-active-filters">
              {filterBranch && <span className="fl-filter-chip">🏢 {filterBranch.length > 16 ? filterBranch.slice(0, 16) + "…" : filterBranch}<button onClick={() => setFilterBranch("")}>×</button></span>}
              {filterType   && <span className="fl-filter-chip">📄 {FILE_TYPE_GROUPS.find(t => t.value === filterType)?.label}<button onClick={() => setFilterType("")}>×</button></span>}
              {filterCat    && <span className="fl-filter-chip">🗂 {filterCat}<button onClick={() => setFilterCat("")}>×</button></span>}
              {search.trim()&& <span className="fl-filter-chip">🔎 "{search.length > 14 ? search.slice(0, 14) + "…" : search}"<button onClick={() => setSearch("")}>×</button></span>}
              {hasFilters && <button className="fl-clear-all" onClick={clearFilters}>Clear all</button>}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="fl-badge fl-badge-blue" style={{ fontSize: 11 }}>{filtered.length} / {files.length}</span>
              <span className="fl-badge fl-badge-gray" style={{ fontSize: 11, textTransform: "uppercase" }}>{userRole}</span>
            </div>
          </div>

          {/* ── Collapsible: Hero ── */}
          <div className={`fl-collapsible-panel${showPanel === "hero" ? " open" : ""}`}>
            <div className="fl-filter-card" style={{ margin: "2px 2px 0" }}>
              <NepalLifeHero />
            </div>
          </div>

          {/* ── Collapsible: Filters ── */}
          <div className={`fl-collapsible-panel${showPanel === "filters" ? " open" : ""}`}>
            <div className="fl-filter-card1" style={{ margin: "2px 2px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, alignItems: "end" }}>
                <div style={{ gridColumn: "span 2", minWidth: 0 }}>
                  <label className="fl-label">🔎 Search Files</label>
                  <div className="fl-search-wrap">
                    <input type="text" placeholder="Title, file name, branch, category…" className="fl-input" value={search} onChange={e => setSearch(e.target.value)} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>

                {/* ── Branch filter: uses ALL api branches, shows file count per branch ── */}
                <div>
                  <label className="fl-label">
                    🏢 Branch
                    {apiBranches.length > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-400)", textTransform: "none", letterSpacing: 0 }}>
                        ({apiBranches.length} available)
                      </span>
                    )}
                  </label>
                  <BranchSelect
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                    branches={apiBranches}
                    loading={branchesLoading}
                    placeholder="All Branches"
                    showFileCounts
                    fileCounts={branchFileCounts}
                  />
                </div>

                <div>
                  <label className="fl-label">📄 File Type</label>
                  <select className="fl-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {FILE_TYPE_GROUPS.map(tg => <option key={tg.value} value={tg.value}>{tg.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl-label">🗂 Category</label>
                  <select className="fl-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ textTransform: "capitalize" }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat} style={{ textTransform: "capitalize" }}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Collapsible: Stats ── */}
          <div className={`fl-collapsible-panel${showPanel === "stats" ? " open" : ""}`}>
            <div className="fl-filter-card" style={{ margin: "2px 2px 0" }}>
              <div className="fl-stats-grid">
                {[
                  { label: "Total Files",  value: stats.total,    color: "var(--gray-900)" },
                  { label: "PDFs",         value: stats.pdfs,     color: NL_RED },
                  { label: "Images",       value: stats.images,   color: "var(--green-700)" },
                  { label: "Word Docs",    value: stats.docs,     color: "var(--blue-700)" },
                  { label: "Branches",     value: stats.branches, color: "var(--violet-700)" },
                  { label: "Other Types",  value: stats.other,    color: "var(--gray-500)" },
                ].map((s, i) => (
                  <div className="fl-stat-card" key={i}>
                    <div className="fl-stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="fl-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="fl-content">
            {message && (
              <div className="fl-alert fl-alert-success" style={{ margin: "10px 2px 0" }}>
                ✓ {message}
                <button onClick={() => setMessage("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 800 }}>✕</button>
              </div>
            )}
            {error && (
              <div className="fl-alert fl-alert-error" style={{ margin: "10px 2px 0" }}>
                ✕ {error}
                <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 800 }}>✕</button>
              </div>
            )}

            {/* ── Table ── */}
            <div className="fl-table-card" style={{ margin: "2px", overflowX: "auto" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: loading ? "var(--amber-500)" : "var(--green-500)", boxShadow: `0 0 8px ${loading ? "rgba(245,158,11,0.6)" : "rgba(34,197,94,0.6)"}` }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", fontFamily: "Outfit,sans-serif" }}>
                  {loading ? "Loading…" : `${filtered.length} of ${files.length} files`}
                </span>
              </div>

              {loading ? (
                <div className="fl-empty"><Spinner size={36} /><p style={{ color: "var(--gray-500)", fontSize: 14, margin: 0 }}>Loading files…</p></div>
              ) : filtered.length === 0 ? (
                <div className="fl-empty">
                  <svg width="56" height="56" fill="none" stroke="var(--gray-200)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  <p style={{ color: "var(--gray-700)", fontWeight: 700, fontSize: 15, margin: 0, fontFamily: "Outfit,sans-serif" }}>No files found</p>
                  <p style={{ color: "var(--gray-400)", fontSize: 12, margin: 0 }}>
                    {hasFilters ? "Try adjusting your filters" : "Upload a new file to get started"}
                  </p>
                  {hasFilters
                    ? <button className="fl-btn fl-btn-white" onClick={clearFilters}>Clear Filters</button>
                    : <button className="fl-btn fl-btn-success" onClick={() => setModalOpen(true)}>+ Upload First File</button>}
                </div>
              ) : (
                <table className="fl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Branch</th>
                      <th>Original Name</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>View</th>
                      <th>{isAdmin ? "Delete" : "Access"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(file => (
                      <tr key={file.id} onClick={() => setViewFile(file)}>
                        <td><span className="fl-badge fl-badge-blue">#{file.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>{file.title || "—"}</div>
                          {file.description && (
                            <div style={{ color: "var(--gray-500)", fontSize: 12, marginTop: 3, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {file.description}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{fmtDate(file.created_at)}</div>
                        </td>
                        <td>
                          {file.branch
                            ? <span className="fl-badge fl-badge-violet">🏢 {file.branch}</span>
                            : <span style={{ color: "var(--gray-300)", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
                          {fileTypeIcon(file.mime_type)} {file.original_name || "—"}
                        </td>
                        <td><span className={catBadge(file.category)} style={{ textTransform: "capitalize" }}>{file.category || "other"}</span></td>
                        <td style={{ fontSize: 11.5, color: "var(--gray-500)" }}>
                          <span className="fl-badge fl-badge-gray">
                            {FILE_TYPE_GROUPS.find(g => matchTypeGroup(file.mime_type, g.value))?.label || "Other"}
                          </span>
                        </td>
                        <td>
                          <button className="fl-btn fl-btn-blue-outline fl-btn-sm" onClick={e => { e.stopPropagation(); setViewFile(file); }}>
                            👁 View →
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <a href={getDownUrl(file.id)} className="fl-btn fl-btn-white fl-btn-sm" onClick={e => e.stopPropagation()}>⬇</a>
                            {isAdmin
                              ? <button className="fl-btn fl-btn-red-outline fl-btn-sm" onClick={e => { e.stopPropagation(); handleDelete(file.id); }}>🗑</button>
                              : <span title="Only admins can delete" style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: "var(--radius)", background: "var(--gray-100)", color: "var(--gray-400)", fontSize: 12, fontWeight: 600, cursor: "not-allowed", border: "1.5px solid var(--gray-200)" }}>🔒</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      {viewFile && (
        <FileDetailModal
          file={viewFile}
          onClose={() => setViewFile(null)}
          getFileUrl={getFileUrl}
          getDownloadUrl={getDownUrl}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
      )}

      {/* ═══ UPLOAD MODAL ═══ */}
      {modalOpen && (
        <div className="fl-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="fl-modal-panel">
            {/* Modal header */}
            <div className="fl-modal-header">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontFamily: "Outfit,sans-serif" }}>Upload New Document</div>
                  <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem,3vw,1.5rem)", color: "white", letterSpacing: "-0.02em", marginBottom: 8 }}>Add File to Library</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Upload letters, memos, PDFs, images, and office documents</div>
                </div>
                <button className="fl-btn fl-btn-sm" onClick={closeModal} style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}>✕ Close</button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="fl-modal-body">
                {error && <div className="fl-alert fl-alert-error">{error}</div>}

                {/* ── Drag & Drop File Block ── */}
                <div className="fl-form-block">
                  <div className="fl-form-block-header" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📁</div>
                    <div>
                      <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#1e3a8a" }}>Choose File</div>
                      <div style={{ fontSize: 11, color: "#60a5fa" }}>Drag & drop or click to browse</div>
                    </div>
                  </div>
                  <div className="fl-form-block-body">
                    {!selectedFile ? (
                      <div
                        className={`fl-dropzone${dragOver ? " drag-over" : ""}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <input
                          id="fileInput"
                          type="file"
                          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <span className="fl-dropzone-icon">📂</span>
                        <div className="fl-dropzone-text">
                          {dragOver ? "Drop file here!" : "Drag & drop your file here"}
                        </div>
                        <div className="fl-dropzone-sub">or click to browse — PDF, Word, Excel, Image, Text</div>
                      </div>
                    ) : (
                      <div className="fl-file-selected">
                        <span className="fl-file-selected-icon">{fileTypeIcon(selectedFile.type)}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="fl-file-selected-name">{selectedFile.name}</div>
                          <div className="fl-file-selected-size">
                            {selectedFile.size < 1024 * 1024
                              ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                              : `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                            {" · "}{selectedFile.type || "Unknown type"}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="fl-file-selected-clear"
                          onClick={() => { setSelectedFile(null); const inp = document.getElementById("fileInput"); if (inp) inp.value = ""; }}
                          title="Remove file"
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Title & Category block ── */}
                <div className="fl-form-block">
                  <div className="fl-form-block-header" style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#16a34a,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>✏️</div>
                    <div>
                      <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#14532d" }}>File Details</div>
                      <div style={{ fontSize: 11, color: "#86efac" }}>Title and category</div>
                    </div>
                  </div>
                  <div className="fl-form-block-body">
                    <div className="fl-form-grid-2">
                      <div>
                        <label className="fl-label">✏️ Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleInput} placeholder="Enter document title" className="fl-input" />
                      </div>
                      <div>
                        <label className="fl-label">🗂 Category</label>
                        <select name="category" value={form.category} onChange={handleInput} className="fl-select">
                          <option value="">Select category</option>
                          {categories.map(c => <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Branch block: uses ALL api branches ── */}
                <div className="fl-form-block">
                  <div className="fl-form-block-header" style={{ background: "linear-gradient(135deg,#fef2f2,#fee2e2)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#ef4444,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#7f1d1d" }}>Branch Assignment</div>
                      <div style={{ fontSize: 11, color: "#fca5a5" }}>
                        {branchesLoading
                          ? "Loading branches from API…"
                          : apiBranches.length > 0
                            ? `${apiBranches.length} branches available`
                            : "No branches found"}
                      </div>
                    </div>
                    {branchesLoading && <div className="fl-spinner" style={{ width: 16, height: 16, borderTopColor: "#ef4444" }} />}
                  </div>
                  <div className="fl-form-block-body">
                    <div>
                      <label className="fl-label">🏢 Branch</label>
                      <BranchSelect
                        value={form.branch}
                        onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                        branches={apiBranches}
                        loading={branchesLoading}
                        placeholder="Select branch"
                        className="fl-select"
                      />
                      {form.branch && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "var(--blue-700)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                          ✓ Assigned to: <strong>{form.branch}</strong>
                        </div>
                      )}
                    </div>
                    {/* Retry if no branches loaded */}
                    {!branchesLoading && apiBranches.length === 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--amber-50)", border: "1.5px solid var(--amber-100)", borderRadius: "var(--radius)" }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span style={{ fontSize: 12, color: "var(--amber-600)", flex: 1 }}>Could not load branches.</span>
                        <button type="button" className="fl-btn fl-btn-sm" style={{ background: "var(--amber-500)", color: "white", fontSize: 11 }} onClick={fetchApiBranches}>
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Description block ── */}
                <div className="fl-form-block">
                  <div className="fl-form-block-header" style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📝</div>
                    <div>
                      <div style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 13, color: "#0f172a" }}>Description</div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Optional notes about this file</div>
                    </div>
                  </div>
                  <div className="fl-form-block-body">
                    <textarea name="description" value={form.description} onChange={handleInput} rows={3} placeholder="Enter a description for this file…" className="fl-textarea" />
                  </div>
                </div>
              </div>

              <div className="fl-modal-footer">
                <button type="button" className="fl-btn fl-btn-white" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={submitting || !selectedFile} className="fl-btn" style={{ background: NL_GRADIENT, color: "white", boxShadow: "0 2px 12px rgba(11,92,171,0.3)" }}>
                  {submitting
                    ? <><div className="fl-spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />Uploading…</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>Upload File</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </SplitSidebarLayout>
    <Footer />
    </>
  );
}