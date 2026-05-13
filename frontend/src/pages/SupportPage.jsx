import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";
import SupportTicketForm from "../components/support/SupportTicketForm";
import SupportTicketDetailModal from "../components/support/SupportTicketDetailModal";
import { getAllSupportTickets, getMySupportTickets } from "../services/supportApi";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
/* ──────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────── */
const NL_BLUE = "#0B5CAB";
const NL_BLUE2 = "#1474F3";
const NL_RED = "#f31225ef";
const NL_GRADIENT = `linear-gradient(135deg,${NL_BLUE} 0%,${NL_BLUE2} 55%,${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg,${NL_BLUE} 70%,${NL_RED} 30%)`;

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

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --nl-blue:${NL_BLUE}; --nl-blue2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
  --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe; --blue-300:#93c5fd;
  --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8;
  --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
  --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
  --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
  --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
  --purple-50:#f5f3ff; --purple-100:#ede9fe; --purple-600:#7c3aed; --purple-700:#6d28d9;
  --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb; --gray-300:#d1d5db;
  --gray-400:#9ca3af; --gray-500:#6b7280; --gray-600:#4b5563;
  --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827; --white:#fff;
  --shadow-sm:0 1px 2px rgba(0,0,0,.05);
  --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.05);
  --shadow-md:0 4px 6px rgba(0,0,0,.06),0 10px 24px rgba(0,0,0,.08);
  --shadow-lg:0 8px 16px rgba(0,0,0,.08),0 24px 48px rgba(0,0,0,.1);
  --radius:10px; --radius-lg:14px; --radius-xl:18px;
}

@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

.sp2-root{font-family:'DM Sans',sans-serif;background:var(--gray-50);max-height:90vh;color:var(--gray-900)}
.sp2-layout{display:flex;max-height:100vh}
.sp2-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.sp2-content{flex:1;overflow-y:auto;padding:0 4px}

.sp2-sidebar{
  background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
  border-right:1px solid rgba(59,130,246,.13);
  box-shadow:5px 0 30px rgba(0,0,0,.25);
  position:relative;overflow:hidden;flex-shrink:0;
  transition:width .3s cubic-bezier(.4,0,.2,1);
}
.sp2-sidebar::before{content:'';position:absolute;top:-70px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.18) 0%,transparent 70%);pointer-events:none}
.sp2-sidebar::after{content:'';position:absolute;bottom:-50px;left:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.12) 0%,transparent 70%);pointer-events:none}
.sp2-sidebar-inner{height:100%;display:flex;flex-direction:column;padding:26px 20px;min-width:220px;position:relative;z-index:1}
.sp2-nav-item{
  display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:13px;
  background:transparent;border:1.5px solid transparent;
  color:rgba(255,255,255,.52);font-size:13.5px;font-weight:500;cursor:pointer;
  text-align:left;width:100%;transition:all .22s cubic-bezier(.4,0,.2,1);
  font-family:'DM Sans',sans-serif;letter-spacing:.01em;
}
.sp2-nav-item:hover{background:linear-gradient(135deg,rgba(59,130,246,.16),rgba(34,197,94,.08));border-color:rgba(59,130,246,.28);color:#93c5fd;transform:translateX(5px)}
.sp2-nav-icon{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.07);display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:background .2s}
.sp2-nav-item:hover .sp2-nav-icon{background:rgba(59,130,246,.2)}
.sp2-mobile-overlay{position:fixed;inset:0;z-index:49;background:rgba(17,24,39,.4)}

.sp2-topbar{
  background:var(--white);border-bottom:1px solid var(--gray-100);
  padding:6px 12px;display:flex;align-items:center;justify-content:space-between;
  gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:30;
  box-shadow:0 1px 4px rgba(0,0,0,.06);
}
.sp2-topbar-left,.sp2-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

.sp2-panel-toggle-bar{
  background:white;border-bottom:1px solid var(--gray-100);
  padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  position:sticky;top:49px;z-index:25;box-shadow:0 1px 3px rgba(0,0,0,.04);
}
.sp2-toggle-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;
  border:1.5px solid var(--gray-200);background:var(--gray-50);
  color:var(--gray-600);cursor:pointer;transition:all .18s ease;
  font-family:'Outfit',sans-serif;position:relative;
}
.sp2-toggle-pill:hover{border-color:var(--blue-300);color:var(--blue-700);background:var(--blue-50)}
.sp2-toggle-pill.active{background:${NL_GRADIENT};color:white;border-color:transparent;box-shadow:0 2px 10px rgba(11,92,171,.3)}
.sp2-toggle-pill .pill-badge{
  position:absolute;top:-6px;right:-6px;width:16px;height:16px;border-radius:50%;
  background:var(--red-500);color:white;font-size:9px;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  font-family:'Outfit',sans-serif;border:2px solid white;
}

.sp2-active-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0}
.sp2-filter-chip{
  display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;
  font-size:11px;font-weight:700;background:rgba(11,92,171,.08);
  border:1px solid rgba(11,92,171,.2);color:var(--blue-700);font-family:'Outfit',sans-serif;
}
.sp2-filter-chip button{
  width:14px;height:14px;border-radius:50%;border:none;background:rgba(11,92,171,.15);
  color:var(--blue-700);cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:900;padding:0;line-height:1;
}
.sp2-filter-chip button:hover{background:var(--red-500);color:white}
.sp2-clear-all{
  font-size:11px;font-weight:700;color:var(--red-600);cursor:pointer;
  background:none;border:none;padding:2px 6px;border-radius:6px;
  font-family:'Outfit',sans-serif;
}
.sp2-clear-all:hover{background:var(--red-50)}

.sp2-collapsible-panel{
  overflow:hidden;transition:max-height .38s cubic-bezier(.4,0,.2,1),opacity .3s ease;
  max-height:0;opacity:0;
}
.sp2-collapsible-panel.open{max-height:700px;opacity:1}

.sp2-hero-wrap{
  background:linear-gradient(135deg,rgba(11,92,171,.10) 0%,rgba(255,255,255,.72) 45%,rgba(225,29,46,.06) 100%);
  box-shadow:0 18px 60px rgba(2,32,53,.14);overflow:hidden;position:relative;
}
.sp2-hero-wrap::before{
  content:'';position:absolute;inset:-2px;
  background:
    radial-gradient(ellipse at 15% 30%,rgba(20,116,243,.22) 0%,transparent 55%),
    radial-gradient(ellipse at 85% 20%,rgba(225,29,46,.14) 0%,transparent 55%),
    radial-gradient(ellipse at 70% 85%,rgba(11,92,171,.12) 0%,transparent 60%);
  pointer-events:none;
}
.sp2-hero-inner{position:relative;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
.sp2-hero-logo{width:90px;max-width:26vw;height:auto;display:block;filter:drop-shadow(0 8px 18px rgba(2,32,53,.22));animation:floaty 4.5s ease-in-out infinite}
.sp2-hero-tag{
  display:inline-flex;align-items:center;gap:8px;background:rgba(11,92,171,.10);
  border:1px solid rgba(11,92,171,.20);color:rgba(11,92,171,.90);border-radius:999px;
  padding:5px 12px;font-size:10px;font-weight:900;letter-spacing:.08em;
  text-transform:uppercase;margin-bottom:10px;font-family:'Outfit',sans-serif;
}
.sp2-hero-dot{width:7px;height:7px;border-radius:50%;background:${NL_BLUE2};box-shadow:0 0 8px rgba(20,116,243,.65)}
.sp2-hero-title{font-family:Syne,sans-serif;font-weight:900;font-size:clamp(1.1rem,2vw,1.55rem);letter-spacing:-.03em;margin:0;color:var(--nl-ink);line-height:1.1}
.sp2-hero-title .blue{color:${NL_BLUE}} .sp2-hero-title .red{color:${NL_RED}}
.sp2-hero-divider{width:46px;height:3px;border-radius:999px;background:linear-gradient(90deg,${NL_BLUE},${NL_RED});margin-top:8px}
.sp2-hero-sub{margin-top:6px;font-size:12px;color:rgba(15,23,42,.62);line-height:1.5;max-width:600px}

.sp2-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:0}
.sp2-stat-card{
  background:white;border-radius:var(--radius-lg);border:1.5px solid var(--gray-200);
  padding:14px 16px;box-shadow:var(--shadow-sm);transition:all .18s ease;
}
.sp2-stat-card:hover{border-color:var(--blue-200);box-shadow:var(--shadow);transform:translateY(-2px)}
.sp2-stat-label{font-size:10.5px;font-weight:800;color:var(--gray-500);text-transform:uppercase;letter-spacing:.08em;font-family:'Outfit',sans-serif}
.sp2-stat-value{margin-top:6px;font-size:1.65rem;font-weight:900;font-family:Syne,sans-serif;color:var(--gray-900);line-height:1}
.sp2-stat-sub{font-size:10.5px;color:var(--gray-400);margin-top:4px;font-weight:500}

.sp2-filter-card{background:white;border-radius:10px;padding:18px 16px;box-shadow:var(--shadow)}

.sp2-btn{
  display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius);
  font-weight:600;font-size:13px;border:none;cursor:pointer;transition:all .18s ease;
  white-space:nowrap;font-family:'Outfit',sans-serif;letter-spacing:.01em;line-height:1;
}
.sp2-btn:disabled{opacity:.5;cursor:not-allowed}
.sp2-btn:hover:not(:disabled){transform:translateY(-1px)}
.sp2-btn-primary{background:var(--blue-600);color:white;box-shadow:0 2px 8px rgba(37,99,235,.25)}
.sp2-btn-primary:hover:not(:disabled){background:var(--blue-700)}
.sp2-btn-success{background:var(--green-600);color:white;box-shadow:0 2px 8px rgba(22,163,74,.25)}
.sp2-btn-success:hover:not(:disabled){background:var(--green-700)}
.sp2-btn-white{background:white;border:1.5px solid var(--gray-200);color:var(--gray-700);box-shadow:var(--shadow-sm)}
.sp2-btn-white:hover:not(:disabled){border-color:var(--blue-300);color:var(--blue-700);background:var(--blue-50)}
.sp2-btn-blue-outline{background:var(--blue-50);border:1.5px solid var(--blue-200);color:var(--blue-700)}
.sp2-btn-blue-outline:hover:not(:disabled){background:var(--blue-100)}
.sp2-btn-amber{background:var(--amber-500);color:white}
.sp2-btn-amber:hover:not(:disabled){background:var(--amber-600)}
.sp2-btn-sm{padding:6px 12px;font-size:12px}
.sp2-btn-icon{width:34px;height:34px;padding:0;justify-content:center;border-radius:var(--radius)}
.sp2-btn-label{display:inline}
@media(max-width:480px){.sp2-btn-label{display:none}}

.sp2-input,.sp2-select,.sp2-textarea{
  width:100%;background:rgba(55,65,82,.07);border:1.5px solid var(--gray-300);
  border-radius:var(--radius);padding:9px 13px;color:var(--gray-900);
  font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:all .18s ease;
}
.sp2-input:focus,.sp2-select:focus,.sp2-textarea:focus{border-color:var(--blue-500);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
.sp2-input::placeholder,.sp2-textarea::placeholder{color:var(--gray-400)}
.sp2-select{
  cursor:pointer;appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:calc(100% - 12px) center;padding-right:34px;
  background-color:rgba(55,65,82,.07);
}
.sp2-label{font-size:11.5px;font-weight:700;color:var(--gray-600);margin-bottom:6px;display:block;font-family:'Outfit',sans-serif;letter-spacing:.03em;text-transform:uppercase}
.sp2-search-wrap{position:relative}
.sp2-search-wrap input{padding-right:38px}
.sp2-search-wrap .icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);pointer-events:none}

.sp2-table-card{
  background:white;border-radius:var(--radius);border:1.5px solid var(--gray-200);
  box-shadow:var(--shadow);overflow:hidden;animation:fadeUp .35s ease both;margin-bottom:20px;margin-top:1px;
}
.sp2-table{width:100%;border-collapse:collapse}
.sp2-table thead th{
  padding:12px 16px;text-align:left;font-size:10.5px;font-weight:700;
  color:rgba(255,255,255,.94);text-transform:uppercase;letter-spacing:.09em;
  white-space:nowrap;font-family:'Outfit',sans-serif;
  background:${NL_BLUE};border-right:.5px solid rgba(255,255,255,.15);
}
.sp2-table thead th:last-child{background:${NL_RED}}
.sp2-table th,.sp2-table td{border-right:.5px solid rgba(0,0,0,.08);border-bottom:1px solid #e2e8f0}
.sp2-table tbody tr{border-bottom:1px solid var(--gray-100);transition:background .12s;cursor:pointer}
.sp2-table tbody tr:last-child{border-bottom:none}
.sp2-table tbody tr:hover{background:var(--blue-50)}
.sp2-table tbody td{padding:13px 16px;font-size:13px;color:var(--gray-700)}

.sp2-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;line-height:1}
.sp2-badge-blue{background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-200)}
.sp2-badge-green{background:var(--green-50);color:var(--green-700);border:1px solid var(--green-200)}
.sp2-badge-gray{background:var(--gray-100);color:var(--gray-600);border:1px solid var(--gray-200)}
.sp2-badge-amber{background:var(--amber-50);color:var(--amber-600);border:1px solid var(--amber-100)}
.sp2-badge-red{background:var(--red-50);color:var(--red-600);border:1px solid var(--red-100)}
.sp2-badge-purple{background:var(--purple-50);color:var(--purple-600);border:1px solid var(--purple-100)}

.sp2-status{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;border:1.5px solid}
.sp2-status::before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor}
.sp2-status-open{color:var(--green-700);border-color:var(--green-200);background:var(--green-50)}
.sp2-status-progress{color:var(--amber-600);border-color:var(--amber-100);background:var(--amber-50)}
.sp2-status-resolved{color:var(--blue-700);border-color:var(--blue-200);background:var(--blue-50)}
.sp2-status-closed{color:var(--gray-600);border-color:var(--gray-200);background:var(--gray-100)}
.sp2-status-forwarded{color:var(--purple-600);border-color:var(--purple-100);background:var(--purple-50)}

.sp2-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center}
.sp2-spinner{border-radius:50%;border:2.5px solid var(--gray-200);border-top-color:var(--blue-500);animation:spin .7s linear infinite}

.sp2-form-card{
  background:white;border-radius:var(--radius-xl);border:1.5px solid var(--gray-200);
  box-shadow:var(--shadow-md);overflow:hidden;animation:fadeUp .35s ease both;margin-bottom:16px;
}
.sp2-form-card-header{
  padding:16px 20px;
  background:${NL_GRADIENT_90};
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--gray-300);border-radius:999px}
::-webkit-scrollbar-thumb:hover{background:var(--gray-400)}

@media(max-width:1024px){
  .sp2-sidebar{position:fixed!important;top:0;left:0;height:100vh;z-index:300}
  .sp2-content{padding:3px}
}
@media(max-width:768px){
  .sp2-table thead th,.sp2-table tbody td{padding:10px 12px;font-size:12px}
  .sp2-hero-inner{flex-direction:column;text-align:center}
  .sp2-hero-divider{margin:8px auto 0}
  .sp2-stats-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:640px){
  .sp2-topbar{padding:8px 10px}
  .sp2-content{padding:1px}
  .sp2-btn{font-size:12px}
  .sp2-stats-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){
  .sp2-stats-grid{grid-template-columns:1fr 1fr}
}
`;

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

function Spinner({ size = 28 }) {
  return <div className="sp2-spinner" style={{ width: size, height: size }} />;
}

function StatusBadge({ status }) {
  const map = {
    Open: "sp2-status sp2-status-open",
    "In Progress": "sp2-status sp2-status-progress",
    Resolved: "sp2-status sp2-status-resolved",
    Closed: "sp2-status sp2-status-closed",
    Forwarded: "sp2-status sp2-status-forwarded",
  };
  return <span className={map[status] || "sp2-status sp2-status-closed"}>{status || "Open"}</span>;
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: "sp2-badge sp2-badge-red",
    High: "sp2-badge sp2-badge-amber",
    Medium: "sp2-badge sp2-badge-blue",
    Low: "sp2-badge sp2-badge-gray",
  };
  return <span className={map[priority] || "sp2-badge sp2-badge-blue"}>{priority || "Medium"}</span>;
}

function AssignedRoleBadge({ role }) {
  const normalized = String(role || "").toLowerCase();
  const map = {
    admin: "sp2-badge sp2-badge-red",
    subadmin: "sp2-badge sp2-badge-purple",
    support: "sp2-badge sp2-badge-green",
  };
  return <span className={map[normalized] || "sp2-badge sp2-badge-gray"}>{normalized || "subadmin"}</span>;
}

function SupportHero() {
  return (
    <div className="sp2-hero-wrap">
      <div className="sp2-hero-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sp2-hero-tag">
            <span className="sp2-hero-dot" />
            Nepal Life · Support Desk
          </div>
          <h1 className="sp2-hero-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
              Help &amp; Support
            </span>
            <br />
            <span style={{ fontSize: 13, color: "rgba(15,23,42,0.48)", fontWeight: 700 }}>
              "किनकी जीवन अमूल्य छ"
            </span>
          </h1>
          <div className="sp2-hero-divider" />
          <p className="sp2-hero-sub">
            Submit support tickets, track progress, manage replies, and route requests through
            branch sub-admin first before escalation to admin.
          </p>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="sp2-hero-logo" />
      </div>
    </div>
  );
}
export default function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = String(user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const isSubAdmin = role === "subadmin";
  const isSupport = role === "support";
  const isStaff = isAdmin || isSubAdmin || isSupport;
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : isSupport ? "SUPPORT" : "USER";

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPanel, setShowPanel] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

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

  const togglePanel = (panel) => setShowPanel((p) => (p === panel ? "" : panel));

  const navItems = [
    { label: "Analytics",      path: "/assetdashboard",       icon: makeIcon(D.graph) },
    { label: "Branches",       path: "/branches",             icon: makeIcon(D.branch) },
    { label: "Asset Master",   path: "/branch-assets-report", icon: makeIcon(D.assets) },
    { label: "Requests",       path: "/requests",             icon: makeIcon(D.requests), show: isAdmin || isSubAdmin },
    { label: "Users",          path: "/admin/users",          icon: makeIcon(D.users),    show: isAdmin },
    { label: "Asset Tracking", path: "/asset-tracking",       icon: makeIcon(D.radar) },
    { label: "Help & Support", path: "/support",              icon: makeIcon(D.help) },
  ].filter(i => i.show !== false);

  const loadTickets = useCallback(async () => {
    try {
      setTicketLoading(true);
      const res = isStaff ? await getAllSupportTickets() : await getMySupportTickets();

      const payload = res?.data?.data ?? res?.data ?? [];
      setTickets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load tickets");
    } finally {
      setTicketLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const activeFiltersCount = [search, statusFilter, priorityFilter].filter(Boolean).length;

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase().trim();

    return tickets.filter((t) => {
      const blob = [
        t.id,
        t.name,
        t.email,
        t.subject,
        t.message,
        t.branch_name,
        t.asset_id,
        t.asset_label,
        t.status,
        t.priority,
        t.assigned_to_role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !blob.includes(q)) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      inProgress: tickets.filter((t) => t.status === "In Progress").length,
      forwarded: tickets.filter((t) => t.status === "Forwarded").length,
      resolved: tickets.filter((t) => t.status === "Resolved").length,
      closed: tickets.filter((t) => t.status === "Closed").length,
    }),
    [tickets]
  );

  return (
    <>
    <SplitSidebarLayout
        navItems={navItems}
        user={user}
      >
    <div className="sp2-root">
      <style>{FONTS}{CSS}</style>
      <div className="sp2-layout">
        <main className="sp2-main">
          <div className="sp2-topbar">
            <div className="sp2-topbar-left">
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", fontFamily: "Outfit,sans-serif" }}>
                Help &amp; Support
              </div>
            </div>

            <div className="sp2-topbar-right">
              {!isStaff && (
                <button
                  className={`sp2-btn sp2-btn-sm ${showForm ? "sp2-btn-amber" : "sp2-btn-success"}`}
                  onClick={() => setShowForm(!showForm)}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}
                    />
                  </svg>
                  <span className="sp2-btn-label">{showForm ? "Hide Form" : "New Ticket"}</span>
                </button>
              )}

              <button className="sp2-btn sp2-btn-blue-outline sp2-btn-sm" onClick={loadTickets} disabled={ticketLoading}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="sp2-btn-label">Refresh</span>
              </button>
            </div>
          </div>

          <div className="sp2-panel-toggle-bar">
            <button className={`sp2-toggle-pill ${showPanel === "hero" ? "active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ <span>Overview</span>
            </button>

            <button
              className={`sp2-toggle-pill ${showPanel === "filters" ? "active" : ""}`}
              onClick={() => togglePanel("filters")}
            >
              🔍 <span>Filters</span>
              {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
            </button>

            <div className="sp2-active-filters">
              {search && (
                <span className="sp2-filter-chip">
                  🔎 "{search.length > 14 ? search.slice(0, 14) + "…" : search}"
                  <button onClick={() => setSearch("")} title="Clear">×</button>
                </span>
              )}
              {statusFilter && (
                <span className="sp2-filter-chip">
                  ● {statusFilter}
                  <button onClick={() => setStatusFilter("")} title="Clear">×</button>
                </span>
              )}
              {priorityFilter && (
                <span className="sp2-filter-chip">
                  ⚡ {priorityFilter}
                  <button onClick={() => setPriorityFilter("")} title="Clear">×</button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  className="sp2-clear-all"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setPriorityFilter("");
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="sp2-badge sp2-badge-blue" style={{ fontSize: 11 }}>
                {filteredTickets.length} / {tickets.length}
              </span>
              <span className="sp2-badge sp2-badge-gray" style={{ fontSize: 11 }}>
                {roleLabel}
              </span>
            </div>
          </div>

          <div className={`sp2-collapsible-panel ${showPanel === "hero" ? "open" : ""}`}>
            <div className="sp2-filter-card" style={{ margin: "2px 2px 0" }}>
              <SupportHero />
            </div>
          </div>

          <div className={`sp2-collapsible-panel ${showPanel === "filters" ? "open" : ""}`}>
            <div className="sp2-filter-card" style={{ margin: "2px 2px 0" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                  gap: 14,
                  alignItems: "end",
                }}
              >
                <div style={{ gridColumn: "span 2", minWidth: 0 }}>
                  <label className="sp2-label">Search</label>
                  <div className="sp2-search-wrap">
                    <input
                      type="text"
                      className="sp2-input"
                      placeholder="Ticket, asset, branch, subject, email, assignment…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="sp2-label">Status</label>
                  <select className="sp2-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    {["Open", "In Progress", "Forwarded", "Resolved", "Closed"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="sp2-label">Priority</label>
                  <select className="sp2-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">All Priority</option>
                    {["Low", "Medium", "High", "Critical"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="sp2-content">
            <div style={{ padding: "14px 2px 0" }}>
              <div className="sp2-stats-grid">
                {[
                  { label: "Total Tickets", value: stats.total, sub: "all submitted", color: "var(--blue-600)" },
                  { label: "Open", value: stats.open, sub: "awaiting subadmin", color: "var(--green-600)" },
                  { label: "In Progress", value: stats.inProgress, sub: "being handled", color: "var(--amber-600)" },
                  { label: "Forwarded", value: stats.forwarded, sub: "sent to admin", color: "var(--purple-600)" },
                  { label: "Resolved", value: stats.resolved, sub: "completed", color: "var(--blue-700)" },
                  { label: "Closed", value: stats.closed, sub: "archived", color: "var(--gray-500)" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="sp2-stat-card">
                    <div className="sp2-stat-label">{label}</div>
                    <div className="sp2-stat-value" style={{ color }}>{value}</div>
                    <div className="sp2-stat-sub">{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {!isStaff && showForm && (
              <div style={{ padding: "14px 2px 0" }}>
                <div className="sp2-form-card">
                  <div className="sp2-form-card-header">
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "rgba(255,255,255,.6)",
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                          fontFamily: "Outfit,sans-serif",
                          marginBottom: 4,
                        }}
                      >
                        Submit Request
                      </div>
                      <div
                        style={{
                          fontFamily: "Syne,sans-serif",
                          fontWeight: 800,
                          fontSize: "clamp(1rem,2.5vw,1.2rem)",
                          color: "white",
                          letterSpacing: "-.02em",
                        }}
                      >
                        New Support Ticket
                      </div>
                    </div>

                    <button
                      className="sp2-btn sp2-btn-sm"
                      style={{
                        background: "rgba(255,255,255,.15)",
                        border: "1.5px solid rgba(255,255,255,.25)",
                        color: "white",
                      }}
                      onClick={() => setShowForm(false)}
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div style={{ padding: "20px 20px 24px" }}>
                    <SupportTicketForm
                      user={user}
                      onSuccess={() => {
                        loadTickets();
                        setShowForm(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: "14px 2px 0" }}>
              <div className="sp2-table-card">
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--gray-200)",
                    background: "linear-gradient(to right,#f8fafc,#faf5ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "Outfit,sans-serif" }}>
                      {isStaff ? "Support Tickets" : "My Support Tickets"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 3 }}>
                      {isAdmin || isSupport
                        ? "You can view all tickets. Actions require subadmin forwarding."
                        : isSubAdmin
                        ? "Manage your branch tickets and forward to admin when needed."
                        : "Track your submitted requests and replies."}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {filteredTickets.length > 0 && (
                      <span className="sp2-badge sp2-badge-blue">
                        {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {ticketLoading ? (
                  <div className="sp2-empty">
                    <Spinner size={40} />
                    <p style={{ color: "var(--gray-500)", margin: 0 }}>Loading tickets…</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="sp2-empty">
                    <div style={{ fontSize: 46 }}>📭</div>
                    <p style={{ fontWeight: 700, margin: 0, fontFamily: "Outfit,sans-serif" }}>
                      {tickets.length === 0 ? "No tickets yet" : "No matching tickets"}
                    </p>
                    <p style={{ color: "var(--gray-500)", margin: 0, fontSize: 13 }}>
                      {tickets.length === 0
                        ? "Your submitted tickets will appear here."
                        : "Try adjusting your search or filters."}
                    </p>
                    {!isStaff && tickets.length === 0 && (
                      <button className="sp2-btn sp2-btn-success" onClick={() => setShowForm(true)}>
                        + Submit First Ticket
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="sp2-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Branch</th>
                          <th>Asset</th>
                          <th>Subject</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((t) => (
                          <tr key={t.id} onClick={() => setSelectedTicketId(t.id)}>
                            <td>
                              <span className="sp2-badge sp2-badge-blue" style={{ minWidth: 36, justifyContent: "center" }}>
                                #{t.id}
                              </span>
                            </td>

                            <td style={{ fontWeight: 600 }}>{t.branch_name || "—"}</td>

                            <td>
                              <span
                                title={t.asset_label || ""}
                                style={{
                                  color: "var(--gray-600)",
                                  fontFamily: "'Courier New',monospace",
                                  fontSize: 12,
                                  background: "var(--gray-50)",
                                  border: "1px solid var(--gray-200)",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                }}
                              >
                                {t.asset_id || "—"}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--gray-900)",
                                  maxWidth: 220,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.subject}
                              </div>
                              {t.name && (
                                <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                                  by {t.name}
                                </div>
                              )}
                            </td>

                            <td>
                              <PriorityBadge priority={t.priority} />
                            </td>

                            <td>
                              <StatusBadge status={t.status} />
                            </td>

                            <td>
                              <AssignedRoleBadge role={t.assigned_to_role} />
                            </td>

                            <td>
                              <button
                                className="sp2-btn sp2-btn-primary sp2-btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicketId(t.id);
                                }}
                              >
                                View →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <SupportTicketDetailModal
        isOpen={!!selectedTicketId}
        ticketId={selectedTicketId}
        user={user}
        onClose={() => setSelectedTicketId(null)}
        onChanged={loadTickets}
      />

    </div>
    </SplitSidebarLayout>
    <Footer />
    </>
  );
}