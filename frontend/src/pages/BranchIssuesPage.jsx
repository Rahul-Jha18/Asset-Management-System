import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import IssueCreateForm from "../components/branchIssues/IssueCreateForm";
import IssueTable from "../components/branchIssues/IssueTable";
import IssueFilterBar from "../components/branchIssues/IssueFilterBar";
import MountainImg from "../assets/nlic-mountain-bg.png";
import Logo from "../assets/nepallife.png";
import {
  listBranchIssues,
  getIssueCategories,
  getIssueCorpUsers,
} from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  /* signature palette — indigo/violet brand over airy neutrals */
  --it-blue:#4F46E5;
  --it-blue-dark:#3730A3;
  --it-violet:#7C3AED;
  --it-brand-grad:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);
  --it-red:#E11D48;
  --it-green:#10B981;
  --it-amber:#F59E0B;

  --it-bg:#F4F5FB;
  --it-card:#FFFFFF;
  --it-soft:#F1F2FA;
  --it-soft2:#F8F8FD;
  --it-text:#161328;
  --it-soft-text:#3D3A57;
  --it-muted:#6B6885;
  --it-faint:#9C99B4;
  --it-line:#E7E7F3;
  --it-line-dark:#D6D5EA;

  --it-shadow-sm:0 1px 2px rgba(30,20,70,.05);
  --it-shadow-md:0 10px 22px rgba(45,27,105,.10);
  --it-shadow:0 1px 3px rgba(30,20,70,.05),0 12px 28px rgba(45,27,105,.07);
  --it-shadow-lg:0 20px 46px rgba(45,27,105,.16);
  --it-radius:16px;
  --it-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --it-display:'Sora','Inter',sans-serif;
}

@keyframes it-fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes it-pop-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes it-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes it-badge-heartbeat{0%{transform:scale(1)}14%{transform:scale(1.2)}28%{transform:scale(1)}42%{transform:scale(1.14)}70%{transform:scale(1)}100%{transform:scale(1)}}
@keyframes it-badge-blink{0%,100%{box-shadow:0 6px 14px rgba(225,29,72,.30),0 0 0 0 rgba(225,29,72,.4)}50%{box-shadow:0 6px 14px rgba(225,29,72,.22),0 0 0 7px rgba(225,29,72,0)}}
@keyframes it-spin{to{transform:rotate(360deg)}}

.it-page{
  font-family:var(--it-font);
  background:
    radial-gradient(880px 460px at 92% -8%, rgba(124,58,237,.10), transparent 60%),
    radial-gradient(760px 420px at -6% 14%, rgba(79,70,229,.09), transparent 55%),
    var(--it-bg);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow-y:auto;
  overflow-x:hidden;
  color:var(--it-text);
  padding:20px 20px 32px;
  scrollbar-width:thin;
  scrollbar-color:#C9C7E4 transparent;
}

.it-page::-webkit-scrollbar{width:8px}
.it-page::-webkit-scrollbar-track{background:transparent}
.it-page::-webkit-scrollbar-thumb{background:#C9C7E4;border-radius:999px}

.it-page-inner{max-width:1400px;margin:0 auto}

/* ── Header ─────────────────────────────────────────────── */

.it-head{
  position:relative;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
  margin-bottom:18px;
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:22px;
  padding:22px 26px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
  animation:it-fade-up .35s ease both;
}

.it-head::before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:4px;
  background:var(--it-brand-grad);
}

.it-head::after{
  content:"";
  position:absolute;
  top:-70px;
  right:-70px;
  width:220px;
  height:220px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(124,58,237,.14),transparent 70%);
}

.it-head::before,
.it-head::after{
  pointer-events:none;
}

.it-head > *{
  position:relative;
  z-index:1;
}

.it-actions{
  position:relative;
  z-index:2;
}


.it-eyebrow{
  font-family:var(--it-display);
  font-size:11px;
  letter-spacing:.14em;
  text-transform:uppercase;
  font-weight:700;
  color:var(--it-blue);
  display:flex;
  align-items:center;
  gap:8px;
}

.it-eyebrow::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  background:var(--it-brand-grad);
}

.it-title{
  font-family:var(--it-display);
  font-size:clamp(1.5rem,3vw,2.15rem);
  line-height:1.08;
  margin:8px 0 0;
  font-weight:800;
  letter-spacing:-.03em;
  color:#12102A;
}

.it-desc{
  max-width:680px;
  margin:9px 0 0;
  color:var(--it-muted);
  font-size:13.5px;
  line-height:1.65;
}

.it-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.it-btn{
  border:none;
  border-radius:12px;
  padding:10px 16px;
  font-family:var(--it-font);
  font-weight:700;
  font-size:13px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:transform .16s ease,box-shadow .16s ease,background .16s ease;
  white-space:nowrap;
}

.it-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:var(--it-shadow-md)}
.it-btn:active:not(:disabled){transform:translateY(0)}
.it-btn:disabled{opacity:.55;cursor:not-allowed}

.it-btn-primary{background:var(--it-brand-grad);color:#fff;box-shadow:0 10px 22px rgba(79,70,229,.28)}
.it-btn-danger{background:var(--it-red);color:white}
.it-btn-amber{background:var(--it-amber);color:white}

.it-btn-soft{
  background:#FFFFFF;
  color:var(--it-soft-text);
  border:1px solid var(--it-line);
  box-shadow:var(--it-shadow-sm);
}

.it-btn-soft:hover{background:var(--it-soft2);border-color:var(--it-line-dark)}

.it-btn-analysis{
  background:#FFFFFF;
  color:var(--it-blue);
  border:1px solid #D7D9FB;
  box-shadow:var(--it-shadow-sm);
}

.it-btn-analysis:hover{
  background:#EEF0FE;
  border-color:#C7CBFA;
}


/* ── KPI cards ──────────────────────────────────────────── */

.it-kpis{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:13px;
  margin-bottom:16px;
}

.it-kpi{
  all:unset;
  box-sizing:border-box;
  cursor:pointer;
  position:relative;
  overflow:visible;
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  padding:14px;
  min-height:104px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
  animation:it-fade-up .4s ease both;
}

.it-kpi:hover{
  transform:translateY(-3px);
  border-color:var(--it-line-dark);
  box-shadow:var(--it-shadow-md);
}

.it-kpi-active{
  border-color:transparent;
  background:
    linear-gradient(var(--it-card),var(--it-card)) padding-box,
    var(--it-brand-grad) border-box;
  border:1.5px solid transparent;
  box-shadow:0 14px 30px rgba(79,70,229,.20);
}

.it-kpi-main{min-width:0;flex:1}
.it-kpi-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}

.it-kpi-icon{
  width:36px;
  height:36px;
  border-radius:11px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--tone-soft,#EEF0FE);
  color:var(--tone,#4F46E5);
  flex-shrink:0;
}

.it-kpi-icon-glyph{width:16px;height:16px;border-radius:5px;background:currentColor;opacity:.85}
.it-kpi-icon-glyph.ring{background:transparent;border:2.5px solid currentColor;border-radius:50%}
.it-kpi-icon-glyph.bell{clip-path:polygon(50% 0%,90% 75%,100% 90%,0% 90%,10% 75%)}
.it-kpi-icon-glyph.folder{clip-path:polygon(0 15%,35% 15%,45% 28%,100% 28%,100% 88%,0 88%)}
.it-kpi-icon-glyph.clock{border-radius:50%;background:transparent;border:2.5px solid currentColor;position:relative}
.it-kpi-icon-glyph.check{clip-path:polygon(20% 45%,40% 65%,80% 15%,90% 25%,40% 85%,10% 55%)}
.it-kpi-icon-glyph.bolt{clip-path:polygon(55% 0%,10% 60%,45% 60%,35% 100%,90% 35%,50% 35%)}

.it-kpi small{
  font-family:var(--it-display);
  text-transform:uppercase;
  letter-spacing:.06em;
  font-size:10px;
  font-weight:700;
  color:var(--it-muted);
  display:block;
}

.it-kpi strong{
  display:block;
  font-family:var(--it-display);
  font-size:1.75rem;
  line-height:1;
  font-weight:800;
  margin-top:2px;
  color:#171532;
}

.it-kpi span{
  display:block;
  margin-top:9px;
  font-size:11px;
  font-weight:600;
  color:var(--it-muted);
}

.it-kpi-active span{color:var(--it-blue);font-weight:700}

.it-kpi-notify{
  position:absolute;
  top:-8px;
  right:-8px;
  min-width:24px;
  height:24px;
  padding:0 7px;
  border-radius:999px;
  background:var(--it-red);
  color:#FFFFFF;
  border:2px solid #FFFFFF;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:800;
  box-shadow:0 6px 14px rgba(225,29,72,.28);
  animation:it-badge-heartbeat 1.5s ease-in-out infinite,it-badge-blink 1.5s ease-in-out infinite;
  transform-origin:center;
}

/* ── Type switch ────────────────────────────────────────── */

.it-type-switch-card{
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  padding:14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  flex-wrap:wrap;
  margin-bottom:13px;
}

.it-type-switch-info small{
  display:block;
  color:var(--it-muted);
  font-size:10px;
  letter-spacing:.10em;
  text-transform:uppercase;
  font-weight:700;
  margin-bottom:5px;
  font-family:var(--it-display);
}

.it-type-switch-info strong{
  display:block;
  color:#171532;
  font-size:15px;
  font-weight:700;
  letter-spacing:-.01em;
  font-family:var(--it-display);
}

.it-type-switch-info span{
  display:block;
  margin-top:3px;
  color:var(--it-muted);
  font-size:12px;
  line-height:1.45;
}

.it-type-toggle{display:flex;gap:9px;flex-wrap:wrap}

.it-type-option{
  border:1px solid var(--it-line);
  background:#FFFFFF;
  color:var(--it-soft-text);
  border-radius:15px;
  padding:11px 13px;
  font-family:var(--it-font);
  cursor:pointer;
  min-width:160px;
  display:flex;
  align-items:center;
  gap:10px;
  text-align:left;
  transition:.18s ease;
}

.it-type-option:hover{background:var(--it-soft2);border-color:var(--it-line-dark);transform:translateY(-1px)}

.it-type-option.active{
  background:#EEF0FE;
  border-color:#C7CBFA;
  box-shadow:0 8px 18px rgba(79,70,229,.14);
}

.it-type-option.customer.active{
  background:#FFF3EA;
  border-color:#FBD2A9;
  box-shadow:0 8px 18px rgba(217,119,6,.12);
}

.it-type-option-icon{
  width:34px;
  height:34px;
  border-radius:12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:var(--it-soft);
  flex-shrink:0;
  position:relative;
}

.it-type-option.active .it-type-option-icon{background:var(--it-brand-grad)}
.it-type-option.customer.active .it-type-option-icon{background:linear-gradient(135deg,#F59E0B,#EA580C)}

.it-icon-employee,.it-icon-customer{position:relative;width:16px;height:16px}
.it-icon-employee::before,.it-icon-employee::after{content:"";position:absolute;border-radius:50%;background:#8B87A8}
.it-icon-employee::before{width:7px;height:7px;top:0;left:1px}
.it-icon-employee::after{width:12px;height:7px;bottom:0;left:-1px;border-radius:6px 6px 0 0}
.it-type-option.active .it-icon-employee::before,.it-type-option.active .it-icon-employee::after{background:#fff}
.it-icon-customer{border-radius:50%}
.it-icon-customer::before{content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:#8B87A8;top:0;left:4.5px}
.it-icon-customer::after{content:"";position:absolute;width:14px;height:8px;border-radius:7px 7px 0 0;background:#8B87A8;bottom:0;left:1px}
.it-type-option.customer.active .it-icon-customer::before,.it-type-option.customer.active .it-icon-customer::after{background:#fff}

.it-type-option strong{display:block;color:#171532;font-size:12.5px;font-weight:750}
.it-type-option small{display:block;color:var(--it-muted);font-size:10.5px;margin-top:2px}

/* ── Filter bar ─────────────────────────────────────────── */

.it-filter-card{
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:16px;
  box-shadow:var(--it-shadow-sm);
  padding:12px;
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:12px;
}

.it-filter-search{
  height:41px;
  min-width:250px;
  flex:1;
  display:flex;
  align-items:center;
  gap:9px;
  background:var(--it-soft2);
  border:1px solid var(--it-line);
  border-radius:12px;
  padding:0 13px;
  color:var(--it-faint);
  transition:.16s ease;
}

.it-filter-search input{
  border:none;
  outline:none;
  background:transparent;
  width:100%;
  font-family:var(--it-font);
  color:var(--it-text);
  font-size:13.5px;
}

.it-filter-select{
  height:41px;
  min-width:150px;
  border:1px solid var(--it-line);
  border-radius:12px;
  background:var(--it-soft2);
  padding:0 12px;
  font-family:var(--it-font);
  color:var(--it-soft-text);
  outline:none;
  transition:.16s ease;
}

.it-filter-select:focus,.it-filter-search:focus-within{
  border-color:var(--it-blue);
  background:#FFFFFF;
  box-shadow:0 0 0 4px rgba(79,70,229,.10);
}

.it-clear-btn{
  border:none;
  background:#FEF1F3;
  color:var(--it-red);
  border-radius:11px;
  padding:10px 13px;
  font-family:var(--it-font);
  font-weight:700;
  cursor:pointer;
  transition:.15s ease;
}
.it-clear-btn:hover{background:#FDE3E7}

.it-count-pill{
  margin-left:auto;
  background:#EEF0FE;
  color:var(--it-blue);
  border:1px solid #D7D9FB;
  border-radius:11px;
  padding:8px 12px;
  font-family:var(--it-font);
  font-weight:700;
  font-size:12px;
}

.it-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin:-2px 0 14px}
.it-chip{
  display:inline-flex;
  align-items:center;
  gap:7px;
  background:#FFFFFF;
  color:var(--it-soft-text);
  border:1px solid var(--it-line);
  border-radius:999px;
  padding:6px 12px;
  font-family:var(--it-font);
  font-size:12px;
  font-weight:650;
  animation:it-pop-in .18s ease both;
}
.it-chip button{
  width:17px;
  height:17px;
  border:none;
  border-radius:50%;
  background:var(--it-soft);
  color:var(--it-soft-text);
  cursor:pointer;
  font-weight:900;
}
.it-chip button:hover{background:#DEDCF7}

/* ── Create issue panel ─────────────────────────────────── */

.it-create-panel{
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:20px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
  margin-bottom:16px;
}

.it-create-panel-head{
  padding:17px 22px;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-create-panel-head small{
  display:block;
  font-family:var(--it-display);
  text-transform:uppercase;
  letter-spacing:.12em;
  color:var(--it-blue);
  font-weight:700;
  font-size:10px;
  margin-bottom:4px;
}

.it-create-panel-head h2{
  margin:0;
  color:#12102A;
  font-family:var(--it-display);
  font-size:1.2rem;
  letter-spacing:-.02em;
  font-weight:750;
}

.it-create-panel-body{padding:22px}
.it-create-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px}
.it-create-guide{background:var(--it-soft2);border:1px solid var(--it-line);border-radius:16px;padding:16px;align-self:start}
.it-guide-block{padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--it-line)}
.it-guide-block:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.it-guide-block h4{margin:0 0 8px;font-family:var(--it-display);font-size:13px;color:#171532;font-weight:700}
.it-guide-block p,.it-guide-block li{font-size:12px;line-height:1.6;color:var(--it-muted);margin:0 0 6px}
.it-guide-block ul{padding-left:18px;margin:0}

.it-create-form{min-width:0}
.it-form-section-title{display:flex;align-items:center;gap:10px;font-family:var(--it-display);font-weight:750;font-size:15px;margin-bottom:16px;color:#171532}
.it-section-icon{width:32px;height:32px;border-radius:11px;background:var(--it-brand-grad);display:inline-flex;position:relative}
.it-section-icon::before{content:"";position:absolute;inset:9px;border:2px solid #fff;border-radius:3px}
.it-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.it-form-field{display:flex;flex-direction:column;gap:7px}
.it-form-field label{font-family:var(--it-display);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--it-soft-text)}
.it-form-field label span{color:var(--it-red)}
.it-form-field input,.it-form-field select,.it-form-field textarea{
  width:100%;
  border:1px solid var(--it-line-dark);
  background:#FFFFFF;
  border-radius:12px;
  padding:11px 13px;
  font-family:var(--it-font);
  font-size:13.5px;
  outline:none;
  color:var(--it-text);
  transition:.16s ease;
}
.it-form-field textarea{resize:vertical}
.it-form-field input:focus,.it-form-field select:focus,.it-form-field textarea:focus{border-color:var(--it-blue);box-shadow:0 0 0 4px rgba(79,70,229,.10)}
.it-form-field input:disabled{opacity:.65;cursor:not-allowed;background:var(--it-soft2)}
.it-form-field small{font-size:11px;color:var(--it-faint)}
.it-form-wide{grid-column:1/-1}
.it-dropzone{border:2px dashed var(--it-line-dark);background:var(--it-soft2);border-radius:16px;padding:24px;text-align:center;cursor:pointer;display:flex;flex-direction:column;gap:7px;align-items:center;justify-content:center;color:var(--it-blue);transition:.16s ease}
.it-dropzone:hover{border-color:#B7BBF8;background:#F1F1FE}
.it-drop-icon{width:38px;height:38px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:var(--it-shadow-sm);position:relative}
.it-drop-icon::before{content:"";position:absolute;width:2px;height:14px;background:var(--it-blue);border-radius:2px}
.it-drop-icon::after{content:"";position:absolute;width:14px;height:2px;background:var(--it-blue);border-radius:2px}
.it-selected-files{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.it-selected-files-head{display:flex;justify-content:space-between;color:var(--it-muted);font-size:12px}
.it-selected-file{display:flex;align-items:center;gap:11px;background:var(--it-soft2);border:1px solid var(--it-line);border-radius:13px;padding:10px 12px;animation:it-pop-in .16s ease both}
.it-file-icon{width:30px;height:30px;border-radius:9px;background:#EEF0FE;flex-shrink:0;position:relative}
.it-file-icon::before{content:"";position:absolute;inset:7px;border:2px solid var(--it-blue);border-radius:3px}
.it-selected-file div{min-width:0;flex:1}
.it-selected-file strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-selected-file small{font-size:11px;color:var(--it-faint)}
.it-selected-file button{border:none;background:transparent;font-size:18px;cursor:pointer;color:var(--it-muted)}
.it-form-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:20px;padding-top:17px;border-top:1px solid var(--it-line)}
.it-private-note{font-size:12px;color:var(--it-muted);display:flex;align-items:center;gap:7px}
.it-icon-lock{width:11px;height:11px;border:2px solid var(--it-muted);border-radius:2px;position:relative;flex-shrink:0}
.it-icon-lock::before{content:"";position:absolute;width:6px;height:6px;border:2px solid var(--it-muted);border-bottom:none;border-radius:4px 4px 0 0;top:-6px;left:1px}
.it-form-actions{display:flex;gap:8px;flex-wrap:wrap}

/* ── Table ──────────────────────────────────────────────── */

.it-table-card{
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  overflow:hidden;
}

.it-basket-shell{
  background:var(--it-card);
  border:1px solid var(--it-line);
  border-radius:20px;
  box-shadow:var(--it-shadow-sm);
  overflow:hidden;
  animation:it-fade-up .4s ease both;
}

.it-basket-shell-head{
  padding:18px 22px;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-basket-shell-head small{
  display:block;
  color:var(--it-blue);
  font-size:10px;
  letter-spacing:.12em;
  text-transform:uppercase;
  font-weight:700;
  margin-bottom:6px;
  font-family:var(--it-display);
}

.it-basket-shell-head h3{
  margin:0;
  font-size:17px;
  font-weight:750;
  color:#171532;
  letter-spacing:-.02em;
  font-family:var(--it-display);
}

.it-basket-shell-head p{
  margin:6px 0 0;
  color:var(--it-muted);
  font-size:12.5px;
}

.it-basket-shell-pill{
  background:#EEF0FE;
  color:var(--it-blue);
  border:1px solid #D7D9FB;
  border-radius:999px;
  padding:7px 12px;
  font-weight:700;
  font-size:12px;
  white-space:nowrap;
}

.it-basket-list{
  padding:13px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.it-basket-row{
  border-radius:15px;
  border:1px solid var(--it-line);
  background:var(--it-soft2);
  overflow:hidden;
  transition:.18s ease;
}

.it-basket-row:hover{
  box-shadow:0 10px 22px rgba(45,27,105,.08);
  transform:translateY(-1px);
}

.it-basket-row-open{box-shadow:0 12px 26px rgba(45,27,105,.10)}

.it-basket-button{
  width:100%;
  border:none;
  background:transparent;
  padding:14px 15px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  cursor:pointer;
  text-align:left;
  font-family:var(--it-font);
}

.it-basket-left{min-width:0;display:flex;align-items:center;gap:11px}

.it-basket-dot2{
  width:12px;
  height:12px;
  border-radius:999px;
  border:3px solid #FFFFFF;
  flex-shrink:0;
  box-shadow:0 0 0 1px rgba(20,10,55,.08);
}

.it-basket-title{display:flex;align-items:center;gap:8px;min-width:0}

.it-basket-title strong{
  font-size:12.5px;
  font-weight:800;
  letter-spacing:.05em;
  text-transform:uppercase;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  font-family:var(--it-display);
}

.it-basket-sub{display:block;margin-top:3px;color:var(--it-muted);font-size:11.5px;font-weight:550}

.it-basket-right{display:flex;align-items:center;gap:10px;flex-shrink:0}

.it-basket-count-badge{
  min-width:26px;
  height:26px;
  padding:0 9px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:#FFFFFF;
  font-size:11.5px;
  font-weight:800;
}

.it-basket-new-badge{
  min-width:26px;
  height:26px;
  padding:0 9px;
  border-radius:999px;
  background:var(--it-red);
  color:#FFFFFF;
  border:2px solid #FFFFFF;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:11.5px;
  font-weight:800;
  animation:it-badge-heartbeat 1.5s ease-in-out infinite,it-badge-blink 1.5s ease-in-out infinite;
  transform-origin:center;
  box-shadow:0 6px 14px rgba(225,29,72,.28);
}

.it-basket-arrow{
  width:26px;
  height:26px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#FFFFFF;
  border:1px solid var(--it-line-dark);
  position:relative;
  transition:.2s ease;
}
.it-basket-arrow::before{
  content:"";
  width:7px;
  height:7px;
  border-right:2px solid var(--it-soft-text);
  border-bottom:2px solid var(--it-soft-text);
  transform:rotate(45deg);
  margin-top:-3px;
}
.it-basket-row-open .it-basket-arrow{transform:rotate(180deg);background:var(--it-brand-grad);border-color:transparent}
.it-basket-row-open .it-basket-arrow::before{border-color:#fff}

.it-basket-panel{border-top:1px solid var(--it-line);background:#FFFFFF;padding:11px;animation:it-fade-up .25s ease both}
.it-basket-panel .it-table-card{border:none;border-radius:13px;box-shadow:none}

.it-basket-green{background:#E7FBF3;border-color:#B7F0DA}
.it-basket-green .it-basket-dot2,.it-basket-green .it-basket-count-badge{background:#10B981}
.it-basket-green .it-basket-title strong{color:#047857}

.it-basket-blue{background:#EEF0FE;border-color:#D2D6FA}
.it-basket-blue .it-basket-dot2,.it-basket-blue .it-basket-count-badge{background:#4F46E5}
.it-basket-blue .it-basket-title strong{color:#4338CA}

.it-basket-amber{background:#FFF6E7;border-color:#FBE1AE}
.it-basket-amber .it-basket-dot2,.it-basket-amber .it-basket-count-badge{background:#F59E0B}
.it-basket-amber .it-basket-title strong{color:#B45309}

.it-basket-slate{background:#F2F2F9;border-color:#DEDDF0}
.it-basket-slate .it-basket-dot2,.it-basket-slate .it-basket-count-badge{background:#6B6885}
.it-basket-slate .it-basket-title strong{color:#3D3A57}

.it-basket-red{background:#FDECEF;border-color:#F8C4CE}
.it-basket-red .it-basket-dot2,.it-basket-red .it-basket-count-badge{background:#E11D48}
.it-basket-red .it-basket-title strong{color:#BE123C}

.it-basket-purple{background:#F4EEFE;border-color:#DECBFB}
.it-basket-purple .it-basket-dot2,.it-basket-purple .it-basket-count-badge{background:#7C3AED}
.it-basket-purple .it-basket-title strong{color:#6D28D9}

.it-table-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.it-table-role-pill{background:var(--it-soft2);color:var(--it-soft-text);border:1px solid var(--it-line);border-radius:999px;padding:7px 11px;font-family:var(--it-font);font-weight:700;font-size:11px}
.it-table-scroll{overflow-x:auto}
.it-table{width:100%;border-collapse:collapse;min-width:1020px}
.it-table th{color:var(--it-muted);text-align:left;font-family:var(--it-display);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:12px 15px;background:var(--it-soft2);border-bottom:1px solid var(--it-line)}
.it-table tbody tr{cursor:pointer;transition:.14s ease}
.it-table tbody tr:hover td{background:#F8F8FE}
.it-table td{padding:13px 15px;border-bottom:1px solid #F0F0F8;background:#FFFFFF;color:var(--it-soft-text);font-size:13px;vertical-align:middle;transition:.14s ease}
.it-table tbody tr:last-child td{border-bottom:none}
.it-ticket{font-family:var(--it-font);background:#EEF0FE;color:var(--it-blue);border:1px solid #D7D9FB;border-radius:9px;padding:5px 10px;font-weight:800;font-size:12px;white-space:nowrap}
.it-title-cell{font-weight:750;color:#171532;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-desc-cell{font-size:11.5px;color:var(--it-faint);max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
.it-category-cell{display:inline-flex;align-items:center;gap:6px;background:var(--it-soft2);border:1px solid var(--it-line);border-radius:9px;padding:5px 9px;font-family:var(--it-font);font-weight:650;font-size:11.5px;color:var(--it-soft-text);white-space:nowrap}

.it-priority-dot{width:6px;height:6px;border-radius:999px;flex-shrink:0}
.it-status,.it-priority{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 11px;font-family:var(--it-font);font-weight:750;font-size:11px;white-space:nowrap}
.it-status-dot{width:6px;height:6px;border-radius:50%}
.it-status-open{background:#E7FBF3;color:#047857;border:1px solid #B7F0DA}.it-status-open .it-status-dot{background:#10B981}
.it-status-review{background:#FFF6E7;color:#B45309;border:1px solid #FBE1AE}.it-status-review .it-status-dot{background:#F59E0B}
.it-status-closed{background:#F2F2F9;color:#3D3A57;border:1px solid #DEDDF0}.it-status-closed .it-status-dot{background:#6B6885}
.it-priority-low{background:#F2F2F9;color:#3D3A57;border:1px solid #DEDDF0}.it-priority-low .it-priority-dot{background:#6B6885}
.it-priority-medium{background:#EEF0FE;color:#4338CA;border:1px solid #D2D6FA}.it-priority-medium .it-priority-dot{background:#4F46E5}
.it-priority-high{background:#FFF6E7;color:#B45309;border:1px solid #FBE1AE}.it-priority-high .it-priority-dot{background:#F59E0B}
.it-priority-critical{background:#FDECEF;color:#BE123C;border:1px solid #F8C4CE}.it-priority-critical .it-priority-dot{background:#E11D48;animation:it-badge-blink 1.6s ease-in-out infinite}

.it-reporter{display:flex;align-items:center;gap:9px}
.it-avatar{width:31px;height:31px;border-radius:10px;background:linear-gradient(135deg,#E7E7F8,#F1EEFC);display:flex;align-items:center;justify-content:center;color:var(--it-blue-dark);font-family:var(--it-display);font-weight:800;font-size:11px;flex-shrink:0}
.it-reporter strong{display:block;font-size:12px;color:#171532}
.it-reporter small{display:block;color:var(--it-faint);font-size:10.5px}
.it-row-actions{display:flex;gap:7px;justify-content:flex-end}
.it-table-view,.it-table-delete{border:none;border-radius:10px;padding:7px 12px;font-family:var(--it-font);font-weight:700;font-size:11px;cursor:pointer;transition:.15s ease}
.it-table-view{background:var(--it-brand-grad);color:white}
.it-table-view:hover{filter:brightness(1.06)}
.it-table-delete{background:#FDECEF;color:var(--it-red);border:1px solid #F8C4CE}
.it-table-delete:hover{background:#FBDDE3}
.it-table-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:13px 20px;color:var(--it-muted);font-size:12px;background:var(--it-soft2);border-top:1px solid var(--it-line)}
.it-pagination{display:flex;gap:5px}
.it-pagination button{width:32px;height:32px;border-radius:10px;border:1px solid var(--it-line-dark);background:#FFFFFF;cursor:pointer;font-family:var(--it-font);font-weight:800;transition:.15s ease}
.it-pagination button:hover:not(:disabled){background:var(--it-soft2)}
.it-pagination button.active{background:var(--it-brand-grad);color:white;border-color:transparent}
.it-pagination button:disabled{opacity:.45;cursor:not-allowed}

.it-type-table-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 10px;font-size:10.5px;font-weight:800;border:1px solid #D7D9FB;background:#EEF0FE;color:var(--it-blue);white-space:nowrap}
.it-type-table-badge.customer{border-color:#FBE1AE;background:#FFF6E7;color:#B45309}
.it-type-table-badge.employee{border-color:#D7D9FB;background:#EEF0FE;color:var(--it-blue)}

.it-empty-state{padding:66px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--it-muted)}
.it-empty-icon{width:56px;height:56px;border-radius:18px;background:var(--it-soft2);border:1px solid var(--it-line);position:relative}
.it-empty-icon-inbox::before{content:"";position:absolute;inset:16px;border:2px solid var(--it-faint);border-radius:4px}
.it-empty-icon-basket::before{content:"";position:absolute;left:14px;right:14px;bottom:14px;top:22px;border:2px solid var(--it-faint);border-radius:0 0 8px 8px;border-top:none}
.it-empty-icon-basket::after{content:"";position:absolute;left:12px;right:12px;top:20px;height:2px;background:var(--it-faint)}
.it-empty-state strong{color:var(--it-soft-text);font-family:var(--it-display);font-weight:700}
.it-spinner{width:38px;height:38px;border-radius:50%;border:3px solid var(--it-line);border-top-color:var(--it-blue);animation:it-spin .8s linear infinite}

@media(max-width:1250px){.it-kpis{grid-template-columns:repeat(3,1fr)}}
@media(max-width:1150px){.it-create-layout{grid-template-columns:1fr}}
@media(max-width:760px){
  .it-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:14px 12px}
  .it-head{padding:18px}
  .it-kpis{grid-template-columns:repeat(2,1fr)}
  .it-filter-card{align-items:stretch}
  .it-type-switch-card{align-items:stretch;flex-direction:column}
  .it-type-toggle{width:100%}
  .it-type-option{flex:1 1 100%}
  .it-user-picker-head{display:none}
  .it-user-picker-row{grid-template-columns:1fr}
  .it-user-picker-email{white-space:normal}
  .it-user-picker-select{justify-self:start}
  .it-filter-search,.it-filter-select,.it-count-pill{width:100%;min-width:0;margin-left:0}
  .it-form-grid{grid-template-columns:1fr}
  .it-form-wide{grid-column:auto}
  .it-create-panel-body{padding:16px}
  .it-table{min-width:920px}
}
@media(max-width:480px){
  .it-kpis{grid-template-columns:1fr}
  .it-actions,.it-form-actions{width:100%}
  .it-btn{width:100%}
  .it-create-panel-head{align-items:flex-start;flex-direction:column}
}

/* ── Issue type radio + user picker (create form) ──────── */

.it-type-radio-panel{border:1px solid var(--it-line);border-radius:17px;background:var(--it-soft2);padding:14px;margin-bottom:17px}
.it-type-radio-label{display:block;font-family:var(--it-display);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--it-soft-text);margin-bottom:10px}
.it-type-radio-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.it-type-radio-card{border:1px solid var(--it-line);background:#FFFFFF;border-radius:15px;padding:13px;display:flex;gap:12px;align-items:flex-start;text-align:left;cursor:pointer;font-family:var(--it-font);transition:.18s ease}
.it-type-radio-card:hover{border-color:var(--it-line-dark);box-shadow:0 8px 18px rgba(45,27,105,.06);transform:translateY(-1px)}
.it-type-radio-card.active{background:#EEF0FE;border-color:#C7CBFA;box-shadow:0 8px 18px rgba(79,70,229,.14)}
.it-type-radio-card.active .it-type-radio-icon{background:var(--it-brand-grad)}
.it-type-radio-card.active .it-type-radio-icon.customer{background:linear-gradient(135deg,#F59E0B,#EA580C)}
.it-type-radio-icon{width:36px;height:36px;border-radius:12px;background:var(--it-soft);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.it-type-radio-card strong{display:block;color:#171532;font-size:13px;font-weight:750}
.it-type-radio-card small{display:block;color:var(--it-muted);font-size:11px;line-height:1.45;margin-top:3px}

.it-user-picker{border:1px solid var(--it-line);border-radius:15px;overflow:hidden;background:#FFFFFF}
.it-user-picker-search{height:43px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--it-line);padding:0 13px;color:var(--it-faint)}
.it-icon-search{width:14px;height:14px;border:2px solid var(--it-faint);border-radius:50%;position:relative;flex-shrink:0}
.it-icon-search::after{content:"";position:absolute;width:6px;height:2px;background:var(--it-faint);bottom:-4px;right:-4px;transform:rotate(45deg);border-radius:2px}
.it-user-picker-search input{border:none;outline:none;width:100%;background:transparent;font-family:var(--it-font);font-size:13px;color:var(--it-text)}
.it-user-picker-search:focus-within{box-shadow:0 0 0 4px rgba(79,70,229,.10) inset}
.it-user-picker-table{max-height:230px;overflow:auto}
.it-user-picker-head,.it-user-picker-row{display:grid;grid-template-columns:minmax(170px,1.2fr) minmax(180px,1fr) 92px;gap:10px;align-items:center}
.it-user-picker-head{position:sticky;top:0;z-index:1;background:var(--it-soft2);border-bottom:1px solid var(--it-line);padding:9px 13px;color:var(--it-muted);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-family:var(--it-display)}
.it-user-picker-row{width:100%;border:none;border-bottom:1px solid #F0F0F8;background:#FFFFFF;padding:10px 13px;text-align:left;cursor:pointer;font-family:var(--it-font);transition:.14s ease}
.it-user-picker-row:hover{background:var(--it-soft2)}
.it-user-picker-row.active{background:#EEF0FE}
.it-user-picker-row strong{display:block;color:#171532;font-size:12.5px;font-weight:750}
.it-user-picker-row small{display:block;color:var(--it-muted);font-size:10.5px;margin-top:2px}
.it-user-picker-email{color:var(--it-muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.it-user-picker-select{justify-self:end;border-radius:999px;background:var(--it-soft);color:var(--it-soft-text);padding:5px 9px;font-size:10.5px;font-weight:750}
.it-user-picker-row.active .it-user-picker-select{background:var(--it-brand-grad);color:#FFFFFF}
.it-user-picker-empty{padding:20px;text-align:center;color:var(--it-faint);font-size:13px}
.it-user-selected{display:flex;gap:10px;align-items:center;background:#E7FBF3;border-top:1px solid #B7F0DA;padding:11px 13px;color:#047857}
.it-icon-check{width:25px;height:25px;border-radius:999px;background:#10B981;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
.it-icon-check::before{content:"";position:absolute;width:9px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg);top:8px;left:8px}
.it-user-selected strong{display:block;color:#065F46;font-size:12.5px}
.it-user-selected small{display:block;color:#10B981;font-size:11px;margin-top:2px}

/* ── Full-page create issue overlay ─────────────────────── */
.it-create-overlay{
  position:fixed;
  inset:0;
  z-index:9999;
  width:100%;
  min-height:100dvh;
  padding:14px;
  background:rgba(18,10,45,.46);
  backdrop-filter:blur(9px);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  overflow:auto;
  animation:it-overlay-fade .16s ease both;
}

.it-create-overlay .it-create-panel{
  width:min(1480px,100%);
  height:calc(100dvh - 28px);
  max-height:calc(100dvh - 28px);
  margin:0;
  display:flex;
  flex-direction:column;
  border-radius:20px;
  border:1px solid var(--it-line);
  background:#FFFFFF;
  box-shadow:0 32px 90px rgba(20,10,55,.35);
  overflow:hidden;
  animation:it-overlay-slide .2s ease both;
}

.it-create-overlay .it-create-panel-head{flex:0 0 auto;position:sticky;top:0;z-index:3;background:#FFFFFF;border-bottom:1px solid var(--it-line)}
.it-create-overlay .it-create-panel-body{padding:12px;flex:1 1 auto;min-height:0;overflow:auto;background:var(--it-bg)}
.it-create-overlay .it-create-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;min-height:0}
.it-create-overlay .it-create-guide{background:#FFFFFF;border:1px solid var(--it-line);border-radius:16px;padding:16px;align-self:start;position:sticky;top:10px;max-height:calc(100dvh - 118px);overflow:auto}
.it-create-overlay .it-create-form{min-width:0;background:#FFFFFF;border:1px solid var(--it-line);border-radius:18px;padding:16px}

@keyframes it-overlay-fade{from{opacity:0}to{opacity:1}}
@keyframes it-overlay-slide{from{opacity:0;transform:translateY(14px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}

@media(max-width:1150px){
  .it-create-overlay .it-create-layout{grid-template-columns:1fr}
  .it-create-overlay .it-create-guide{position:static;max-height:none}
}

@media(max-width:760px){
  .it-create-overlay{padding:8px}
  .it-create-overlay .it-create-panel{width:100%;height:calc(100dvh - 16px);max-height:calc(100dvh - 16px);border-radius:16px}
  .it-create-overlay .it-create-panel-body{padding:8px}
  .it-create-overlay .it-create-form{padding:12px}
  .it-create-overlay .it-form-grid{grid-template-columns:1fr}
  .it-create-overlay .it-form-wide{grid-column:auto}
}

@media(max-width:480px){
  .it-create-overlay{padding:0}
  .it-create-overlay .it-create-panel{height:100dvh;max-height:100dvh;border-radius:0;border-left:none;border-right:none}
  .it-create-overlay .it-create-panel-head{padding:14px 15px}
  .it-create-overlay .it-form-actions,.it-create-overlay .it-form-actions .it-btn{width:100%}
}


/* ─────────────────────────────────────────────────────────────
   NLIC RED + BLUE REAL UI THEME
   Visual-only overrides. Existing API/data behavior is unchanged.
───────────────────────────────────────────────────────────── */

:root{
  --it-blue:#0057D9;
  --it-blue-dark:#003B8E;
  --it-blue2:#0047B3;
  --it-blue3:#2F7BFF;
  --it-violet:#0B5BD3;
  --it-red:#E31B3F;
  --it-red-dark:#B5122E;
  --it-green:#00A676;
  --it-amber:#F59E0B;
  --it-brand-grad:linear-gradient(135deg,#0057D9 0%,#0047B3 45%,#E31B3F 100%);
  --it-bg:#F5F8FF;
  --it-card:#FFFFFF;
  --it-soft:#F1F6FF;
  --it-soft2:#F8FBFF;
  --it-text:#071A44;
  --it-soft-text:#23375F;
  --it-muted:#66789E;
  --it-faint:#96A4BF;
  --it-line:#DDE7FA;
  --it-line-dark:#C6D5F3;
  --it-shadow-sm:0 4px 14px rgba(0,57,145,.06);
  --it-shadow-md:0 16px 32px rgba(0,74,173,.14);
  --it-shadow:0 8px 28px rgba(0,57,145,.08);
  --it-shadow-lg:0 26px 70px rgba(0,57,145,.18);
  --nlic-mountain-bg:url("${MountainImg}");;
}

.it-page{
  background:
    radial-gradient(900px 520px at 96% -10%,rgba(227,27,63,.13),transparent 58%),
    radial-gradient(760px 440px at -8% 4%,rgba(0,87,217,.15),transparent 58%),
    linear-gradient(180deg,#F8FBFF 0%,#F2F6FF 48%,#EEF4FF 100%);
  padding:22px;
}

.it-page-inner{
  max-width:1540px;
}

.it-head{
  min-height:178px;
  align-items:flex-start;
  padding:26px 30px 28px;
  border-radius:24px;
  border:1px solid rgba(170,194,235,.72);
  background:
    linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.88) 47%,rgba(255,255,255,.70) 100%),
    var(--nlic-mountain-bg) center 42%/cover no-repeat;
  box-shadow:0 20px 55px rgba(0,57,145,.14);
  margin-bottom:22px;
}

.it-head::before{
  inset:auto auto 0 0;
  width:48%;
  height:92px;
  background:linear-gradient(135deg,rgba(0,87,217,.72),rgba(47,123,255,.20),transparent 70%);
  clip-path:polygon(0 32%,100% 100%,0 100%);
  opacity:.95;
}

.it-head::after{
  top:auto;
  right:-90px;
  bottom:-92px;
  width:620px;
  height:210px;
  border-radius:50%;
  background:
    linear-gradient(135deg,transparent 8%,rgba(227,27,63,.70) 40%,rgba(255,255,255,.75) 52%,rgba(0,87,217,.72) 68%,rgba(0,59,142,.92) 100%);
  opacity:.48;
  filter:blur(.2px);
}

.it-head-content{
  min-width:0;
  max-width:800px;
}

.it-brandline,
.it-mini-brand{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:14px;
}

.it-logo-emblem{
  width:46px;
  height:46px;
  border-radius:16px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#0057D9,#FFFFFF 48%,#E31B3F);
  color:#073B8E;
  font-family:var(--it-display);
  font-size:12px;
  font-weight:900;
  letter-spacing:.08em;
  box-shadow:0 10px 22px rgba(0,87,217,.20);
  border:1px solid rgba(255,255,255,.72);
}

.it-logo-word{
  display:flex;
  flex-direction:column;
  font-family:var(--it-display);
  color:#0057D9;
  font-weight:900;
  border-radius:12px;
  border:1px solid rgba(0, 87, 217, 0.27);
  padding:6px 12px;
  line-height:1;
  font-size:22px;
  letter-spacing:-.03em;
}
  .it-logo-word img{
    width:100%;
    max-width:160px;
    max-height:50px;
  }

.it-logo-word b{
  color:#E31B3F;
  font-weight:900;
}

.it-logo-word small{
  margin-top:4px;
  font-size:8.5px;
  letter-spacing:.13em;
  color:#253B66;
  font-weight:800;
}

.it-eyebrow{
  color:#0057D9;
  font-size:10.5px;
  letter-spacing:.18em;
}

.it-eyebrow::before{
  background:#E31B3F;
  box-shadow:0 0 0 6px rgba(227,27,63,.12);
}

.it-title{
  font-size:clamp(2.2rem,4vw,3.15rem);
  color:#071A44;
  letter-spacing:-.05em;
}

.it-desc{
  font-size:15px;
  color:#33476F;
  max-width:820px;
}

.it-actions{
  gap:12px;
}

.it-btn{
  border-radius:13px;
  padding:11px 18px;
  box-shadow:0 8px 18px rgba(0,57,145,.08);
}

.it-btn-primary{
  background:linear-gradient(135deg,#0057D9 0%,#0047B3 62%,#002E80 100%);
  box-shadow:0 16px 30px rgba(0,87,217,.26);
}

.it-btn-danger,
.it-btn-amber{
  background:linear-gradient(135deg,#E31B3F,#B5122E);
  color:#fff;
}

.it-btn-analysis{
  background:#FFFFFF;
  color:#0057D9;
  border:1px solid #BFD1F5;
}

.it-btn-soft{
  color:#0B3274;
  border:1px solid #D5E1F8;
}

.it-kpis{
  grid-template-columns:repeat(6,minmax(150px,1fr));
  gap:14px;
  margin-bottom:18px;
}

.it-kpi{
  min-height:128px;
  border-radius:20px;
  border:1px solid #DDE7FA;
  padding:18px;
  background:
    linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,255,255,.92)),
    linear-gradient(135deg,rgba(0,87,217,.05),rgba(227,27,63,.04));
  box-shadow:0 10px 26px rgba(0,57,145,.08);
}

.it-kpi:hover{
  box-shadow:0 18px 38px rgba(0,57,145,.16);
  transform:translateY(-4px);
}

.it-kpi-active{
  box-shadow:0 18px 40px rgba(0,87,217,.22);
}

.it-kpi-icon{
  width:56px;
  height:56px;
  border-radius:18px;
  background:var(--tone-soft,#EAF2FF);
}

.it-kpi strong{
  font-size:2rem;
}

.it-kpi small{
  color:#33476F;
}

.it-kpi-notify{
  background:#E31B3F;
  box-shadow:0 9px 20px rgba(227,27,63,.32);
}

.it-type-switch-card{
  border-radius:21px;
  padding:20px 22px;
  background:
    linear-gradient(#FFFFFF,#FFFFFF) padding-box,
    linear-gradient(135deg,rgba(0,87,217,.22),rgba(227,27,63,.18)) border-box;
  border:1px solid transparent;
  box-shadow:0 10px 28px rgba(0,57,145,.08);
}

.it-type-switch-info strong{
  font-size:17px;
  color:#071A44;
}

.it-type-option{
  min-width:185px;
  border-radius:17px;
  padding:14px 16px;
}

.it-type-option.active{
  background:linear-gradient(135deg,#0057D9,#0047B3);
  border-color:transparent;
  color:#fff;
  box-shadow:0 16px 32px rgba(0,87,217,.24);
}

.it-type-option.customer.active{
  background:linear-gradient(135deg,#E31B3F,#B5122E);
  border-color:transparent;
  box-shadow:0 16px 32px rgba(227,27,63,.20);
}

.it-type-option.active strong,
.it-type-option.active small{
  color:#fff;
}

.it-filter-card{
  border-radius:20px;
  padding:16px;
  background:#FFFFFF;
  box-shadow:0 12px 30px rgba(0,57,145,.08);
  border-color:#DDE7FA;
}

.it-filter-search,
.it-filter-select{
  height:48px;
  border-radius:14px;
  background:#F8FBFF;
}

.it-filter-search:focus-within,
.it-filter-select:focus{
  border-color:#0057D9;
  box-shadow:0 0 0 4px rgba(0,87,217,.10);
}

.it-count-pill{
  background:#EAF2FF;
  color:#0057D9;
  border-color:#C8D9F7;
}

.it-create-overlay{
  position:fixed;
  inset:0;
  z-index:999;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  background:rgba(7,26,68,.50);
  backdrop-filter:blur(10px);
  padding:18px;
  overflow:auto;
  animation:it-pop-in .18s ease both;
}

.it-create-panel{
  width:min(1540px,100%);
  border-radius:24px;
  box-shadow:0 30px 90px rgba(7,26,68,.30);
  border:1px solid rgba(191,209,245,.90);
}

.it-create-panel-head{
  position:relative;
  min-height:96px;
  padding:22px 26px;
  background:
    linear-gradient(90deg,rgba(255,255,255,.98),rgba(255,255,255,.72)),
    var(--nlic-mountain-bg) center 46%/cover no-repeat;
  overflow:hidden;
}

.it-create-panel-head::after{
  content:"";
  position:absolute;
  right:-76px;
  bottom:-82px;
  width:360px;
  height:150px;
  border-radius:50%;
  background:linear-gradient(135deg,transparent,rgba(227,27,63,.68),rgba(0,87,217,.72));
  opacity:.42;
  pointer-events:none;
}

.it-create-panel-head > *{
  position:relative;
  z-index:1;
}

.it-create-panel-body{
  padding:24px;
  background:#F8FBFF;
}

.it-create-layout{
  grid-template-columns:minmax(0,1fr) 360px;
  align-items:start;
}

.it-create-guide{
  border-radius:20px;
  background:
    linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,255,255,.90)),
    var(--nlic-mountain-bg) center/cover no-repeat;
  min-height:420px;
  overflow:hidden;
  position:relative;
}

.it-create-guide::after{
  content:"";
  position:absolute;
  right:-70px;
  bottom:-82px;
  width:300px;
  height:170px;
  border-radius:50%;
  background:linear-gradient(135deg,rgba(227,27,63,.42),rgba(0,87,217,.58));
  opacity:.42;
  pointer-events:none;
}

.it-guide-block{
  position:relative;
  z-index:1;
}

.it-form-section-title{
  color:#0057D9;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.it-form-section-title.it-form-step{
  margin-top:22px;
  padding-top:18px;
  border-top:1px solid #DDE7FA;
}

.it-section-icon{
  background:linear-gradient(135deg,#0057D9,#0047B3);
  color:#fff;
  align-items:center;
  justify-content:center;
  font-size:13px;
  font-weight:900;
}

.it-section-icon::before{
  display:none;
}

.it-type-radio-panel,
.it-user-picker,
.it-form-field input,
.it-form-field select,
.it-form-field textarea{
  border-color:#C9D8F3;
  background:#FFFFFF;
}

.it-type-radio-panel{
  padding:16px;
  border-radius:18px;
  background:#F8FBFF;
  border:1px solid #DDE7FA;
  margin-bottom:18px;
}

.it-type-radio-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}

.it-type-radio-card{
  border-radius:18px;
  border:1px solid #DDE7FA;
  background:#fff;
  padding:18px 20px;
  box-shadow:0 8px 18px rgba(0,57,145,.05);
}

.it-type-radio-card.active{
  border-color:#0057D9;
  background:
    linear-gradient(135deg,rgba(0,87,217,.10),rgba(255,255,255,.94)),
    linear-gradient(135deg,#fff,#fff);
  box-shadow:0 16px 32px rgba(0,87,217,.14);
}

.it-type-radio-card.active:nth-child(2){
  border-color:#E31B3F;
  background:linear-gradient(135deg,rgba(227,27,63,.10),rgba(255,255,255,.94));
}

.it-type-radio-icon{
  width:54px;
  height:54px;
  border-radius:18px;
  background:#EAF2FF;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:#0057D9;
}

.it-type-radio-icon.customer{
  background:#FDECEF;
  color:#E31B3F;
}

.it-user-picker{
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 8px 20px rgba(0,57,145,.05);
}

.it-user-picker-search{
  min-height:48px;
  background:#FFFFFF;
}

.it-user-picker-row{
  transition:.14s ease;
}

.it-user-picker-row:hover,
.it-user-picker-row.active{
  background:#EEF5FF;
}

.it-user-picker-select{
  background:#EAF2FF;
  color:#0057D9;
  border-radius:999px;
  padding:5px 10px;
  font-size:11px;
  font-weight:800;
}

.it-user-picker-row.active .it-user-picker-select{
  background:#0057D9;
  color:#fff;
}

.it-dropzone,
.it-attach-drop{
  border-radius:20px;
  border-color:#BFD1F5;
  background:linear-gradient(180deg,#FFFFFF,#F6FAFF);
}

.it-dropzone:hover,
.it-attach-drop:hover{
  border-color:#0057D9;
  background:#EEF5FF;
}

.it-basket-shell{
  border-radius:22px;
  box-shadow:0 16px 40px rgba(0,57,145,.10);
  border-color:#DDE7FA;
}

.it-basket-shell-head{
  padding:20px 24px;
  background:#FFFFFF;
}

.it-basket-shell-head small{
  color:#0057D9;
}

.it-basket-list{
  padding:16px;
  gap:12px;
}

.it-basket-row{
  border-radius:17px;
  background:#FFFFFF;
  box-shadow:0 5px 16px rgba(0,57,145,.04);
}

.it-basket-row:hover{
  transform:translateY(-2px);
  box-shadow:0 14px 32px rgba(0,57,145,.12);
}

.it-basket-red{background:linear-gradient(90deg,#FFF5F7,#FFFFFF);border-color:#F8B8C5}
.it-basket-green{background:linear-gradient(90deg,#F2FFF9,#FFFFFF);border-color:#B8F0DC}
.it-basket-blue{background:linear-gradient(90deg,#F1F7FF,#FFFFFF);border-color:#BFD1F5}
.it-basket-slate{background:linear-gradient(90deg,#F7F9FC,#FFFFFF);border-color:#DDE7FA}
.it-basket-amber{background:linear-gradient(90deg,#FFF8EC,#FFFFFF);border-color:#FBD9A4}

.it-basket-dot2{
  width:42px;
  height:42px;
  border-radius:15px;
  border:0;
  box-shadow:0 8px 18px rgba(0,57,145,.08);
  background:#EAF2FF;
  position:relative;
}

.it-basket-dot2::after{
  content:"";
  position:absolute;
  inset:12px;
  border-radius:50%;
  background:#0057D9;
}

.it-basket-red .it-basket-dot2{background:#FDECEF}.it-basket-red .it-basket-dot2::after{background:#E31B3F}
.it-basket-green .it-basket-dot2{background:#E7FBF3}.it-basket-green .it-basket-dot2::after{background:#00A676}
.it-basket-amber .it-basket-dot2{background:#FFF3DF}.it-basket-amber .it-basket-dot2::after{background:#F59E0B}
.it-basket-slate .it-basket-dot2::after{background:#64748B}

.it-basket-title strong{
  font-size:13.5px;
}

.it-basket-count-badge,
.it-basket-new-badge{
  min-width:30px;
  height:30px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  font-size:12px;
}

.it-basket-new-badge{
  background:#E31B3F;
  color:white;
}

.it-basket-count-badge{
  background:#0057D9;
  color:white;
}

.it-basket-arrow{
  width:40px;
  height:40px;
  border-radius:999px;
  background:#FFFFFF;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 8px 18px rgba(0,57,145,.10);
}

.it-table{
  border-collapse:separate;
  border-spacing:0;
}

.it-table th{
  background:#F3F7FF;
  color:#23375F;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.05em;
}

.it-table tbody tr{
  transition:.14s ease;
}

.it-table tbody tr:hover{
  background:#EEF5FF;
}

.it-ticket{
  color:#0057D9;
  font-weight:900;
}

.it-table-view{
  background:#EAF2FF;
  color:#0057D9;
}

.it-table-delete{
  background:#FDECEF;
  color:#E31B3F;
}

.it-priority-medium{
  background:#EAF2FF!important;
  color:#0057D9!important;
  border-color:#C9D8F3!important;
}
.it-priority-high{
  background:#FFF3DF!important;
  color:#C26A00!important;
  border-color:#FBD9A4!important;
}
.it-priority-critical{
  background:#FDECEF!important;
  color:#E31B3F!important;
  border-color:#F5B8C6!important;
}
.it-status-open{
  background:#E7FBF3!important;
  color:#008B63!important;
  border-color:#B8F0DC!important;
}
.it-status-review{
  background:#EAF2FF!important;
  color:#0057D9!important;
  border-color:#C9D8F3!important;
}
.it-status-closed{
  background:#F2F4F8!important;
  color:#475569!important;
  border-color:#D7DEE9!important;
}

@media(max-width:1200px){
  .it-kpis{grid-template-columns:repeat(3,1fr)}
  .it-create-layout{grid-template-columns:1fr}
}

@media(max-width:760px){
  .it-page{padding:14px}
  .it-head{min-height:auto;padding:22px}
  .it-kpis{grid-template-columns:repeat(2,1fr)}
  .it-type-radio-row{grid-template-columns:1fr}
}

@media(max-width:520px){
  .it-kpis{grid-template-columns:1fr}
  .it-type-option{min-width:100%}
}


/* Extra small-component controls */
.it-filter-search kbd{
  border:1px solid #DDE7FA;
  background:#FFFFFF;
  color:#66789E;
  border-radius:8px;
  padding:3px 7px;
  font-size:11px;
  font-family:var(--it-font);
  box-shadow:0 2px 5px rgba(0,57,145,.05);
}

.it-filter-action{
  height:48px;
  border:1px solid #BFD1F5;
  border-radius:14px;
  background:#FFFFFF;
  color:#0057D9;
  font-family:var(--it-font);
  font-weight:800;
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:0 14px;
  cursor:pointer;
  transition:.16s ease;
}

.it-filter-action:hover{
  background:#EAF2FF;
}

.it-filter-action span{
  min-width:22px;
  height:22px;
  padding:0 6px;
  border-radius:999px;
  background:#0057D9;
  color:#fff;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
}

.it-activity-dot{
  display:inline-flex;
  align-items:center;
  justify-content:center;
}

.it-activity-dot-icon{
  display:none;
  color:#fff;
  font-size:8px;
  line-height:1;
}

.it-activity-mini:hover .it-activity-dot-icon{
  display:inline;
}
`;

const CUSTOMER_ISSUE_CATEGORIES = [
  "Issue",
  "Service Request",
  "Complaint",
  "Grievance",
];

const ISSUE_TYPE_FILTERS = [
  { key: "all", label: "All Issues", hint: "Status baskets" },
  { key: "Employee", label: "Employee Issue", hint: "Internal categories" },
  { key: "Customer", label: "Customer Issue", hint: "Customer categories" },
];

const normalizeIssueType = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const getIssueType = (issue) => {
  const raw =
    issue?.issue_type ??
    issue?.issueType ??
    issue?.type ??
    issue?.issueCategoryType ??
    issue?.issue_category_type ??
    "Employee";

  const normalized = normalizeIssueType(raw);

  if (normalized === "customer" || normalized === "customerissue") {
    return "Customer";
  }

  return "Employee";
};

const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const NAV_ICONS = {
  dashboard: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  branches: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  analysis: "M3 3v18h18M7 16l3.5-4 3 3L19 8M7 8h.01M7 12h.01",
  issue: "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  users: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21C6.6 21 4.688 20.533 3 19.702a4.125 4.125 0 0 1 7.533-2.493M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
};

const getIssueTrackerNavItems = (user, newReportCount = 0) => {
  const role = String(user?.role?.name || user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const canRequests = ["admin", "subadmin", "support", "corpuser", "corp_user"].includes(role);

  return [
    { label: "Analytics", path: "/assetdashboard", icon: makeIcon(NAV_ICONS.dashboard) },
    { label: "Branches", path: "/branches", icon: makeIcon(NAV_ICONS.branches) },
    { label: "Asset Master", path: "/branch-assets-report", icon: makeIcon(NAV_ICONS.assets) },
    {
      label: newReportCount > 0 ? `Issue Tracker (${newReportCount})` : "Issue Tracker",
      path: "/branch-issues",
      icon: makeIcon(NAV_ICONS.issue),
      badge: newReportCount,
      count: newReportCount,
      notificationCount: newReportCount,
    },
    { label: "Requests", path: "/requests", icon: makeIcon(NAV_ICONS.requests), show: canRequests },
    { label: "Users", path: "/admin/users", icon: makeIcon(NAV_ICONS.users), show: isAdmin },
  ].filter((item) => item.show !== false);
};

export default function BranchIssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role?.name || user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const isAssignedInboxUser = !isAdmin;
  const canAct = !isAdmin;
  const canDelete = isAdmin; // delete is admin-only

  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [corpUsers, setCorpUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");
  const [categoryF, setCategoryF] = useState("");
  const [issueTypeF, setIssueTypeF] = useState("all");
  const [page, setPage] = useState(1);

  // Stat-card filter — "all" | "new" | "Open" | "UnderReview" | "Closed" | "high"
  const [activeStat, setActiveStat] = useState("");

  const rowsPerPage = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (statusF) params.status = statusF;
      if (priorityF) params.priority = priorityF;
      if (issueTypeF && issueTypeF !== "all") params.issue_type = issueTypeF;

      if (categoryF) {
        if (String(categoryF).startsWith("customer:")) {
          params.customer_category_name = String(categoryF).replace("customer:", "");
        } else {
          params.category_id = categoryF;
        }
      }

      if (search) params.search = search;

      const res = await listBranchIssues(params);
      setIssues(Array.isArray(res?.data) ? res.data : []);
      setPage(1);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [search, statusF, priorityF, categoryF, issueTypeF]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getIssueCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]));

    getIssueCorpUsers()
      .then((res) => setCorpUsers(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCorpUsers([]));
  }, []);

  const typeFilteredIssues = useMemo(() => {
    if (!issueTypeF || issueTypeF === "all") return issues;

    return issues.filter((issue) => getIssueType(issue) === issueTypeF);
  }, [issues, issueTypeF]);

  const categoriesForCurrentType = useMemo(() => {
    if (issueTypeF === "Customer") {
      return CUSTOMER_ISSUE_CATEGORIES.map((name) => ({
        id: `customer:${name}`,
        name,
      }));
    }

    return categories;
  }, [categories, issueTypeF]);

  const selectedCategoryLabel = useMemo(() => {
    if (!categoryF) return "";

    return (
      categoriesForCurrentType.find((item) => String(item.id) === String(categoryF))
        ?.name || "Selected"
    );
  }, [categoryF, categoriesForCurrentType]);

  const stats = useMemo(() => {
    const total = typeFilteredIssues.length;
    const open = typeFilteredIssues.filter((issue) => issue.status === "Open").length;
    const underReview = typeFilteredIssues.filter((issue) => issue.status === "UnderReview").length;
    const closed = typeFilteredIssues.filter((issue) => issue.status === "Closed").length;
    const high = typeFilteredIssues.filter((issue) => ["High", "Critical"].includes(issue.priority)).length;

    // New Report = open issue assigned to the logged-in user.
    // Admin sees all open reports as new because admin has full visibility.
    const newReports = typeFilteredIssues.filter((issue) => {
      const isOpen = issue.status === "Open";
      if (!isOpen) return false;

      if (isAssignedInboxUser) {
        return String(issue.assigned_to_user_id || "") === String(user?.id || "");
      }

      return true;
    }).length;

    return { total, newReports, open, underReview, closed, high };
  }, [typeFilteredIssues, isAssignedInboxUser, user?.id]);

  const newReportCount = stats.newReports || 0;
  const navItems = useMemo(
    () => getIssueTrackerNavItems(user, newReportCount),
    [user, newReportCount]
  );

  const filteredByStat = useMemo(() => {
    if (activeStat === "all") return typeFilteredIssues;

    if (activeStat === "new") {
      return typeFilteredIssues.filter((issue) => {
        const isOpen = issue.status === "Open";
        if (!isOpen) return false;

        if (isAssignedInboxUser) {
          return String(issue.assigned_to_user_id || "") === String(user?.id || "");
        }

        return true;
      });
    }

    if (activeStat === "high") {
      return typeFilteredIssues.filter((i) => ["High", "Critical"].includes(i.priority));
    }

    return typeFilteredIssues.filter((i) => i.status === activeStat);
  }, [typeFilteredIssues, activeStat, isAssignedInboxUser, user?.id]);

  useEffect(() => {
    setPage(1);
  }, [activeStat]);

  const activeFilters = [search, statusF, priorityF, categoryF, issueTypeF !== "all" ? issueTypeF : ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setStatusF("");
    setPriorityF("");
    setCategoryF("");
    setIssueTypeF("all");
  };

  const chips = [
    search && { key: "search", label: `Search: ${search}`, onRemove: () => setSearch("") },
    issueTypeF !== "all" && {
      key: "issue-type",
      label: `Issue Type: ${issueTypeF}`,
      onRemove: () => {
        setIssueTypeF("all");
        setCategoryF("");
      },
    },
    statusF && { key: "status", label: `Status: ${statusF === "UnderReview" ? "Under Review" : statusF}`, onRemove: () => setStatusF("") },
    priorityF && { key: "priority", label: `Priority: ${priorityF}`, onRemove: () => setPriorityF("") },
    categoryF && {
      key: "category",
      label: `Category: ${selectedCategoryLabel}`,
      onRemove: () => setCategoryF(""),
    },
  ].filter(Boolean);

  const basketMeta = useMemo(() => {
    const map = {
      all: {
        title: "All Issues Basket",
        description: "Complete list of visible reports.",
        tone: "blue",
      },
      new: {
        title: "New Report Basket",
        description: isAssignedInboxUser
          ? "New open reports assigned to you."
          : "New open reports available in this view.",
        tone: "red",
      },
      Open: {
        title: "Open Basket",
        description: "Reports waiting for action.",
        tone: "green",
      },
      UnderReview: {
        title: "Under Review Basket",
        description: "Reports currently being checked or processed.",
        tone: "amber",
      },
      Closed: {
        title: "Closed Basket",
        description: "Resolved and closed reports.",
        tone: "slate",
      },
      high: {
        title: "High / Critical Basket",
        description: "Priority reports that need faster attention.",
        tone: "red",
      },
    };

    return map[activeStat] || map.all;
  }, [activeStat, isAssignedInboxUser]);

  const kpis = [
    {
      key: "all",
      label: "Total Issues",
      value: stats.total,
      icon: "folder",
      color: "#4F46E5",
      colorSoft: "#EEF0FE",
      hint: "All visible reports",
    },
    {
      key: "new",
      label: "New Report",
      value: stats.newReports,
      icon: "bell",
      color: "#E11D48",
      colorSoft: "#FDECEF",
      hint: isAssignedInboxUser ? "New assigned reports" : "New open reports",
      notify: stats.newReports,
    },
    {
      key: "Open",
      label: "Open",
      value: stats.open,
      icon: "ring",
      color: "#10B981",
      colorSoft: "#E7FBF3",
      hint: "Waiting for action",
    },
    {
      key: "UnderReview",
      label: "Under Review",
      value: stats.underReview,
      icon: "clock",
      color: "#F59E0B",
      colorSoft: "#FFF6E7",
      hint: "Currently reviewing",
    },
    {
      key: "Closed",
      label: "Closed",
      value: stats.closed,
      icon: "check",
      color: "#6B6885",
      colorSoft: "#F2F2F9",
      hint: "Resolved reports",
    },
    {
      key: "high",
      label: "High / Critical",
      value: stats.high,
      icon: "bolt",
      color: "#E11D48",
      colorSoft: "#FDECEF",
      hint: "Priority attention",
    },
  ];

  return (
    <>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="it-page">
          <style>{FONTS}{CSS}</style>

          <div className="it-page-inner">
            <div className="it-head">
              <div className="it-head-content">
                <div className="it-brandline">
                  <span className="it-logo-word"><img src={Logo} alt="Nepal Life Logo" /></span>
                </div>
                <div className="it-eyebrow">Nepal Life Issue Management</div>
                <h1 className="it-title">Issue Tracker</h1>
                <p className="it-desc">
                  View submitted reports, track assigned work, and manage issue progress.
                </p>
              </div>

              <div className="it-actions">
                <button type="button" className="it-btn it-btn-soft" onClick={load} disabled={loading}>
                  ↻ Refresh
                </button>
                <button
                  type="button"
                  className="it-btn it-btn-analysis"
                  onClick={() => navigate("/branch-issues/analysis")}
                >
                  📊 Analysis Dashboard
                </button>

                <button
                  type="button"
                  className={`it-btn ${showCreate ? "it-btn-amber" : "it-btn-primary"}`}
                  onClick={() => setShowCreate((value) => !value)}
                >
                  {showCreate ? "Close Form" : "+ Report Issue"}
                </button>
              </div>
            </div>

            <div className="it-kpis">
              {kpis.map((kpi) => (
                <button
                  type="button"
                  className={`it-kpi ${activeStat === kpi.key ? "it-kpi-active" : ""}`}
                  key={kpi.key}
                  onClick={() => setActiveStat(activeStat === kpi.key ? "all" : kpi.key)}
                >
                  {Number(kpi.notify || 0) > 0 && (
                    <div className="it-kpi-notify">{Number(kpi.notify).toLocaleString()}</div>
                  )}

                  <div className="it-kpi-main">
                    <div className="it-kpi-top">
                      <small>{kpi.label}</small>
                      <div
                        className="it-kpi-icon"
                        style={{ "--tone": kpi.color, "--tone-soft": kpi.colorSoft }}
                      >
                        <span className={`it-kpi-icon-glyph ${kpi.icon}`} />
                      </div>
                    </div>

                    <strong style={{ color: kpi.color }}>
                      {Number(kpi.value || 0).toLocaleString()}
                    </strong>

                    <span>{activeStat === kpi.key ? "Showing this view" : kpi.hint}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="it-type-switch-card">
              <div className="it-type-switch-info">
                <small>Issue Type View</small>
                <strong>Choose issue type before opening category baskets</strong>
                <span>
                  Employee shows existing categories. Customer shows customer-related categories.
                </span>
              </div>

              <div className="it-type-toggle" role="radiogroup" aria-label="Issue type filter">
                {ISSUE_TYPE_FILTERS.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`it-type-option ${
                      item.key === "Customer" ? "customer" : ""
                    } ${issueTypeF === item.key ? "active" : ""}`}
                    onClick={() => {
                      setIssueTypeF(item.key);
                      setCategoryF("");
                      setActiveStat("all");
                      setPage(1);
                    }}
                  >
                    <span className="it-type-option-icon">
                      <span className={item.key === "Customer" ? "it-icon-customer" : "it-icon-employee"} />
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <IssueFilterBar
              search={search}
              onSearch={setSearch}
              statusF={statusF}
              onStatus={setStatusF}
              priorityF={priorityF}
              onPriority={setPriorityF}
              categoryF={categoryF}
              onCategory={setCategoryF}
              categories={categoriesForCurrentType}
              onClear={clearFilters}
              activeFilters={activeFilters}
              total={filteredByStat.length}
            />

            {chips.length > 0 && (
              <div className="it-chip-row">
                {chips.map((chip) => (
                  <span className="it-chip" key={chip.key}>
                    {chip.label}
                    <button onClick={chip.onRemove}>×</button>
                  </span>
                ))}
              </div>
            )}

            {showCreate && (
              <div
                className="it-create-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="issue-create-title"
              >
                <div className="it-create-panel">
                <div className="it-create-panel-head">
                  <div>
                    <div className="it-mini-brand">
                      <span className="it-logo-word"><img src={Logo} alt="Nepal Life Logo" /></span>
                    </div>
                    <small>Report a Problem</small>
                    <h2 id="issue-create-title">New Issue Report</h2>
                  </div>
                  <button type="button" className="it-btn it-btn-soft" onClick={() => setShowCreate(false)}>
                    Close
                  </button>
                </div>

                <div className="it-create-panel-body">
                  <div className="it-create-layout">
                    <IssueCreateForm
                      user={user}
                      categories={categories}
                      customerCategories={CUSTOMER_ISSUE_CATEGORIES}
                      corpUsers={corpUsers}
                      onCancel={() => setShowCreate(false)}
                      onSuccess={() => {
                        setShowCreate(false);
                        load();
                      }}
                    />

                    <aside className="it-create-guide">
                      <div className="it-guide-block">
                        <h4>Reporting Guidelines</h4>
                        <ul>
                          <li>Use a clear and descriptive title.</li>
                          <li>Include steps to reproduce the issue.</li>
                          <li>Attach screenshots, logs, or documents if useful.</li>
                          <li>Explain the expected outcome.</li>
                        </ul>
                      </div>

                      <div className="it-guide-block">
                        <h4>SLA & Response</h4>
                        <p><strong style={{ color: "#E11D48" }}>High / Critical</strong> — urgent handling</p>
                        <p><strong style={{ color: "#F59E0B" }}>Medium</strong> — normal business impact</p>
                        <p><strong style={{ color: "#10B981" }}>Low</strong> — minor inconvenience</p>
                      </div>

                      <div className="it-guide-block">
                        <h4>Issue Tips</h4>
                        <p>Check if a similar issue already exists before submitting a new one.</p>
                        <p>Update the issue conversation when more information is available.</p>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
            )}

            <IssueTable
              issues={typeFilteredIssues}
              loading={loading}
              canAct={canAct}
              canDelete={canDelete}
              currentUser={user}
              activeBasket={activeStat}
              issueTypeFilter={issueTypeF}
              categoryBaskets={categoriesForCurrentType}
              activeCategoryKey={categoryF}
              onCategoryBasketChange={(nextCategory) => {
                setCategoryF(nextCategory);
                setActiveStat("all");
                setPage(1);
              }}
              basketTitle={basketMeta.title}
              basketDescription={basketMeta.description}
              basketTone={basketMeta.tone}
              basketCount={filteredByStat.length}
              newReportCount={newReportCount}
              isCorpUser={isAssignedInboxUser}
              onBasketChange={setActiveStat}
              onRowClick={(issueId) => navigate(`/branch-issues/${issueId}`)}
              onRefresh={load}
              page={page}
              onPageChange={setPage}
              rowsPerPage={rowsPerPage}
            />
          </div>
        </div>
      </SplitSidebarLayout>
      <Footer />
    </>
  );
}