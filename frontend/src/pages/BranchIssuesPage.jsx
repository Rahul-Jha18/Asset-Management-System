import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import IssueCreateForm from "../components/branchIssues/IssueCreateForm";
import IssueTable from "../components/branchIssues/IssueTable";
import IssueFilterBar from "../components/branchIssues/IssueFilterBar";
import {
  listBranchIssues,
  getIssueCategories,
  getIssueCorpUsers,
} from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --it-blue:#1D4ED8;
  --it-blue-dark:#1E40AF;
  --it-red:#DC2626;
  --it-green:#16A34A;
  --it-amber:#D97706;

  --it-bg:#F8FAFC;
  --it-card:#FFFFFF;
  --it-soft:#F1F5F9;
  --it-soft2:#F8FAFC;
  --it-text:#0F172A;
  --it-soft-text:#334155;
  --it-muted:#64748B;
  --it-faint:#94A3B8;
  --it-line:#E2E8F0;
  --it-line-dark:#CBD5E1;

  --it-shadow-sm:0 1px 2px rgba(15,23,42,.05);
  --it-shadow-md: 0 8px 14px rgba(3, 3, 3, 0.28);
  --it-shadow:0 1px 3px rgba(15,23,42,.06),0 8px 20px rgba(15,23,42,.05);
  --it-shadow-lg:0 10px 28px rgba(15,23,42,.10);
  --it-radius:14px;
  --it-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}

.it-page{
  font-family:var(--it-font);
  background:var(--it-bg);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow-y:auto;
  overflow-x:hidden;
  color:var(--it-text);
  padding:18px 18px 30px;
  scrollbar-width:thin;
  scrollbar-color:#CBD5E1 transparent;
}

.it-page::-webkit-scrollbar{width:8px}
.it-page::-webkit-scrollbar-track{background:transparent}
.it-page::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:999px}

.it-page-inner{max-width:1380px;margin:0 auto}

.it-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
  margin-bottom:16px;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:16px;
  padding:18px 20px;
  box-shadow:var(--it-shadow-sm);
}

.it-eyebrow{
  font-family:var(--it-font);
  font-size:11px;
  letter-spacing:.08em;
  text-transform:uppercase;
  font-weight:800;
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
  background:var(--it-blue);
}

.it-title{
  font-family:var(--it-font);
  font-size:clamp(1.45rem,3vw,2.05rem);
  line-height:1.08;
  margin:6px 0 0;
  font-weight:850;
  letter-spacing:-.035em;
}

.it-desc{
  max-width:700px;
  margin:8px 0 0;
  color:var(--it-muted);
  font-size:13.5px;
  line-height:1.65;
}

.it-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.it-btn{
  border:none;
  border-radius:10px;
  padding:9px 14px;
  font-family:var(--it-font);
  font-weight:750;
  font-size:13px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:.16s ease;
  white-space:nowrap;
}

.it-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:var(--it-shadow)}
.it-btn:disabled{opacity:.55;cursor:not-allowed}

.it-btn-primary{background:var(--it-blue);color:white}
.it-btn-primary:hover{background:var(--it-blue-dark)}
.it-btn-danger{background:var(--it-red);color:white}
.it-btn-amber{background:var(--it-amber);color:white}

.it-btn-soft{
  background:#FFFFFF;
  color:#334155;
  border:1px solid var(--it-line);
  box-shadow:var(--it-shadow-sm);
}

.it-btn-soft:hover{background:#F8FAFC;border-color:#CBD5E1}

/* Simple stat cards */
.it-kpis{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:12px;
  margin-bottom:14px;
}

.it-kpi{
  all:unset;
  box-sizing:border-box;
  cursor:pointer;
  position:relative;
  overflow:visible;
  background:rgba(255, 255, 255, 0.94);
  border:1px solid var(--it-line);
  border-radius:16px;
  box-shadow:var(--it-shadow-md);
  padding:10px;
  min-height:100px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  transition:.18s ease;
}

.it-kpi:hover{
  transform:translateY(-2px);
  background:rgba(202, 237, 248, 0.29);
  border-color:#CBD5E1;
  box-shadow:var(--it-shadow-lg);
}

.it-kpi-active{
  background: rgba(98, 248, 178, 0.13);
  border-color: rgba(22, 238, 137, 0.37);
  box-shadow:0 10px 28px rgba(29, 216, 129, 0.34),var(--it-shadow-lg);
}

.it-kpi-main{min-width:0;flex:1}
.it-kpi-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}

.it-kpi-icon{
  width:34px;
  height:34px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:16px;
  background:#F1F5F9;
  color:#475569;
  flex-shrink:0;
}

.it-kpi small{
  font-family:var(--it-font);
  text-transform:uppercase;
  letter-spacing:.06em;
  font-size:10px;
  font-weight:800;
  color:#64748B;
  display:block;
}

.it-kpi strong{
  display:block;
  font-family:var(--it-font);
  font-size:1.75rem;
  line-height:1;
  font-weight:850;
  margin-top:2px;
  color:#0F172A;
}

.it-kpi span{
  display:block;
  margin-top:8px;
  font-size:11px;
  font-weight:650;
  color:#64748B;
}

.it-kpi-active span{color:var(--it-blue);font-weight:800}

.it-kpi-notify{
  position:absolute;
  top:-8px;
  right:-8px;
  min-width:24px;
  height:24px;
  padding:0 7px;
  border-radius:999px;
  background:#DC2626;
  color:#FFFFFF;
  border:2px solid #FFFFFF;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:850;
  box-shadow:0 6px 14px rgba(220,38,38,.28);
  animation:it-badge-heartbeat 1.35s ease-in-out infinite,it-badge-blink 1.35s ease-in-out infinite;
  transform-origin:center;
}

@keyframes it-badge-heartbeat{
  0%{transform:scale(1)}
  14%{transform:scale(1.22)}
  28%{transform:scale(1)}
  42%{transform:scale(1.16)}
  70%{transform:scale(1)}
  100%{transform:scale(1)}
}

@keyframes it-badge-blink{
  0%,100%{opacity:1;box-shadow:0 6px 14px rgba(220,38,38,.28),0 0 0 0 rgba(220,38,38,.42)}
  50%{opacity:.72;box-shadow:0 6px 14px rgba(220,38,38,.22),0 0 0 8px rgba(220,38,38,0)}
}

.it-filter-card{
  background:#FFFFFF;
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
  height:40px;
  min-width:250px;
  flex:1;
  display:flex;
  align-items:center;
  gap:9px;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:11px;
  padding:0 12px;
  color:#94A3B8;
}

.it-filter-search input{
  border:none;
  outline:none;
  background:transparent;
  width:100%;
  font-family:var(--it-font);
  color:#0F172A;
  font-size:13.5px;
}

.it-filter-select{
  height:40px;
  min-width:150px;
  border:1px solid var(--it-line);
  border-radius:11px;
  background:#FFFFFF;
  padding:0 12px;
  font-family:var(--it-font);
  color:#334155;
  outline:none;
}

.it-filter-select:focus,.it-filter-search:focus-within{
  border-color:var(--it-blue);
  box-shadow:0 0 0 3px rgba(29,78,216,.10);
}

.it-clear-btn{
  border:none;
  background:#FEF2F2;
  color:#DC2626;
  border-radius:10px;
  padding:9px 12px;
  font-family:var(--it-font);
  font-weight:750;
  cursor:pointer;
}

.it-count-pill{
  margin-left:auto;
  background:#EFF6FF;
  color:#1D4ED8;
  border:1px solid #BFDBFE;
  border-radius:10px;
  padding:7px 11px;
  font-family:var(--it-font);
  font-weight:750;
  font-size:12px;
}

.it-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin:-2px 0 14px}
.it-chip{
  display:inline-flex;
  align-items:center;
  gap:7px;
  background:#FFFFFF;
  color:#334155;
  border:1px solid var(--it-line);
  border-radius:999px;
  padding:6px 11px;
  font-family:var(--it-font);
  font-size:12px;
  font-weight:700;
}
.it-chip button{
  width:17px;
  height:17px;
  border:none;
  border-radius:50%;
  background:#E2E8F0;
  color:#334155;
  cursor:pointer;
  font-weight:900;
}

.it-create-panel{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
  margin-bottom:16px;
}

.it-create-panel-head{
  padding:16px 20px;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-create-panel-head small{
  display:block;
  font-family:var(--it-font);
  text-transform:uppercase;
  letter-spacing:.10em;
  color:#64748B;
  font-weight:800;
  font-size:10px;
  margin-bottom:3px;
}

.it-create-panel-head h2{
  margin:0;
  color:#0F172A;
  font-family:var(--it-font);
  font-size:1.18rem;
  letter-spacing:-.02em;
}

.it-create-panel-body{padding:20px}
.it-create-layout{display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:20px}
.it-create-guide{background:#F8FAFC;border:1px solid var(--it-line);border-radius:16px;padding:15px;align-self:start}
.it-guide-block{padding-bottom:13px;margin-bottom:13px;border-bottom:1px solid var(--it-line)}
.it-guide-block:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.it-guide-block h4{margin:0 0 8px;font-family:var(--it-font);font-size:13px;color:#0F172A}
.it-guide-block p,.it-guide-block li{font-size:12px;line-height:1.58;color:#64748B;margin:0 0 6px}
.it-guide-block ul{padding-left:18px;margin:0}

.it-create-form{min-width:0}
.it-form-section-title{display:flex;align-items:center;gap:8px;font-family:var(--it-font);font-weight:800;font-size:15px;margin-bottom:16px}
.it-section-icon{width:30px;height:30px;border-radius:10px;background:#EFF6FF;color:#1D4ED8;display:inline-flex;align-items:center;justify-content:center}
.it-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.it-form-field{display:flex;flex-direction:column;gap:7px}
.it-form-field label{font-family:var(--it-font);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#475569}
.it-form-field label span{color:var(--it-red)}
.it-form-field input,.it-form-field select,.it-form-field textarea{
  width:100%;
  border:1px solid #CBD5E1;
  background:#FFFFFF;
  border-radius:11px;
  padding:11px 13px;
  font-family:var(--it-font);
  font-size:13.5px;
  outline:none;
  color:#0F172A;
  transition:.16s ease;
}
.it-form-field textarea{resize:vertical}
.it-form-field input:focus,.it-form-field select:focus,.it-form-field textarea:focus{border-color:var(--it-blue);box-shadow:0 0 0 3px rgba(29,78,216,.10)}
.it-form-field input:disabled{opacity:.65;cursor:not-allowed;background:#F8FAFC}
.it-form-field small{font-size:11px;color:#94A3B8}
.it-form-wide{grid-column:1/-1}
.it-dropzone{border:2px dashed #CBD5E1;background:#F8FAFC;border-radius:14px;padding:22px;text-align:center;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center;color:#1D4ED8}
.it-dropzone:hover{border-color:#93C5FD;background:#EFF6FF}
.it-drop-icon{width:36px;height:36px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:var(--it-shadow-sm)}
.it-selected-files{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.it-selected-files-head{display:flex;justify-content:space-between;color:#64748B;font-size:12px}
.it-selected-file{display:flex;align-items:center;gap:10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:10px 12px}
.it-selected-file div{min-width:0;flex:1}
.it-selected-file strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-selected-file small{font-size:11px;color:#94A3B8}
.it-selected-file button{border:none;background:transparent;font-size:18px;cursor:pointer;color:#64748B}
.it-form-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--it-line)}
.it-private-note{font-size:12px;color:#64748B}
.it-form-actions{display:flex;gap:8px;flex-wrap:wrap}

/* Simple professional table */
.it-table-card{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  overflow:hidden;
}

.it-basket-shell{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  overflow:hidden;
}

.it-basket-shell-head{
  padding:16px 20px;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-basket-shell-head small{
  display:block;
  color:#64748B;
  font-size:10px;
  letter-spacing:.10em;
  text-transform:uppercase;
  font-weight:850;
  margin-bottom:6px;
}

.it-basket-shell-head h3{
  margin:0;
  font-size:17px;
  font-weight:850;
  color:#0F172A;
  letter-spacing:-.02em;
}

.it-basket-shell-head p{
  margin:6px 0 0;
  color:#64748B;
  font-size:12.5px;
}

.it-basket-shell-pill{
  background:#EFF6FF;
  color:#1D4ED8;
  border:1px solid #BFDBFE;
  border-radius:999px;
  padding:7px 11px;
  font-weight:800;
  font-size:12px;
  white-space:nowrap;
}

.it-basket-list{
  padding:12px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.it-basket-row{
  border-radius:14px;
  border:1px solid #E2E8F0;
  background:#F8FAFC;
  overflow:hidden;
  transition:.18s ease;
}

.it-basket-row:hover{
  box-shadow:0 10px 22px rgba(15,23,42,.08);
  transform:translateY(-1px);
}

.it-basket-row-open{
  box-shadow:0 10px 26px rgba(15,23,42,.08);
}

.it-basket-button{
  width:100%;
  border:none;
  background:transparent;
  padding:13px 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  cursor:pointer;
  text-align:left;
  font-family:var(--it-font);
}

.it-basket-left{
  min-width:0;
  display:flex;
  align-items:center;
  gap:10px;
}

.it-basket-dot2{
  width:12px;
  height:12px;
  border-radius:999px;
  border:3px solid #FFFFFF;
  flex-shrink:0;
  box-shadow:0 0 0 1px rgba(15,23,42,.08);
}

.it-basket-title{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
}

.it-basket-title strong{
  font-size:13px;
  font-weight:900;
  letter-spacing:.06em;
  text-transform:uppercase;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.it-basket-sub{
  display:block;
  margin-top:3px;
  color:#64748B;
  font-size:11.5px;
  font-weight:650;
}

.it-basket-right{
  display:flex;
  align-items:center;
  gap:9px;
  flex-shrink:0;
}

.it-basket-count-badge{
  min-width:24px;
  height:24px;
  padding:0 8px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:#FFFFFF;
  font-size:11px;
  font-weight:900;
}

.it-basket-new-badge{
  min-width:24px;
  height:24px;
  padding:0 8px;
  border-radius:999px;
  background:#DC2626;
  color:#FFFFFF;
  border:2px solid #FFFFFF;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:900;
  animation:it-badge-heartbeat 1.35s ease-in-out infinite,it-badge-blink 1.35s ease-in-out infinite;
  transform-origin:center;
  box-shadow:0 6px 14px rgba(220,38,38,.28);
}

.it-basket-arrow{
  width:24px;
  height:24px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background: #f74747;
  border:1px solid #cc1212;
  color: #ffffff;
  transition:.18s ease;
}

.it-basket-row-open .it-basket-arrow{
  transform:rotate(180deg);
}

.it-basket-panel{
  border-top:1px solid rgba(226,232,240,.78);
  background:#FFFFFF;
  padding:10px;
}

.it-basket-panel .it-table-card{
  border:none;
  border-radius:12px;
  box-shadow:none;
}

.it-basket-green{background:#DCFCE7;border-color:#86EFAC}
.it-basket-green .it-basket-dot2,.it-basket-green .it-basket-count-badge{background:#16A34A}
.it-basket-green .it-basket-title strong{color:#047857}

.it-basket-blue{background:#DBEAFE;border-color:#93C5FD}
.it-basket-blue .it-basket-dot2,.it-basket-blue .it-basket-count-badge{background:#2563EB}
.it-basket-blue .it-basket-title strong{color:#1D4ED8}

.it-basket-amber{background:#FEF3C7;border-color:#FDBA74}
.it-basket-amber .it-basket-dot2,.it-basket-amber .it-basket-count-badge{background:#EA580C}
.it-basket-amber .it-basket-title strong{color:#C2410C}

.it-basket-slate{background:#F1F5F9;border-color:#CBD5E1}
.it-basket-slate .it-basket-dot2,.it-basket-slate .it-basket-count-badge{background:#64748B}
.it-basket-slate .it-basket-title strong{color:#334155}

.it-basket-red{background:#FEE2E2;border-color:#FCA5A5}
.it-basket-red .it-basket-dot2,.it-basket-red .it-basket-count-badge{background:#DC2626}
.it-basket-red .it-basket-title strong{color:#B91C1C}

.it-basket-purple{background:#F3E8FF;border-color:#D8B4FE}
.it-basket-purple .it-basket-dot2,.it-basket-purple .it-basket-count-badge{background:#7E22CE}
.it-basket-purple .it-basket-title strong{color:#6B21A8}

.it-table-head{
  padding:16px 20px;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:center;
}

.it-table-head h3{margin:0;font-family:var(--it-font);font-size:17px;letter-spacing:-.02em}
.it-table-head p{margin:5px 0 0;color:#64748B;font-size:12.5px}
.it-table-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.it-table-role-pill{background:#F8FAFC;color:#475569;border:1px solid #E2E8F0;border-radius:999px;padding:6px 10px;font-family:var(--it-font);font-weight:750;font-size:11px}
.it-table-scroll{overflow-x:auto}
.it-table{width:100%;border-collapse:collapse;min-width:1020px}
.it-table th{color:#64748B;text-align:left;font-family:var(--it-font);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:11px 14px;background:#F8FAFC;border-bottom:1px solid #E2E8F0}
.it-table tbody tr{cursor:pointer;transition:.16s ease}
.it-table tbody tr:hover td{background:#F8FAFC}
.it-table td{padding:13px 14px;border-bottom:1px solid #EEF2F7;background:#FFFFFF;color:#334155;font-size:13px;vertical-align:middle;transition:.16s ease}
.it-table tbody tr:last-child td{border-bottom:none}
.it-ticket{font-family:var(--it-font);background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:8px;padding:5px 9px;font-weight:800;font-size:12px;white-space:nowrap}
.it-title-cell{font-weight:800;color:#0F172A;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-desc-cell{font-size:11.5px;color:#94A3B8;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
.it-category-cell{display:inline-flex;align-items:center;gap:6px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:5px 8px;font-family:var(--it-font);font-weight:750;font-size:11.5px;color:#475569;white-space:nowrap}
.it-status,.it-priority{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 10px;font-family:var(--it-font);font-weight:800;font-size:11px;white-space:nowrap}
.it-status-dot{width:6px;height:6px;border-radius:50%}
.it-status-open{background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0}.it-status-open .it-status-dot{background:#16A34A}
.it-status-review{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}.it-status-review .it-status-dot{background:#F59E0B}
.it-status-closed{background:#F1F5F9;color:#475569;border:1px solid #CBD5E1}.it-status-closed .it-status-dot{background:#64748B}
.it-priority-low{background:#F1F5F9;color:#475569;border:1px solid #CBD5E1}
.it-priority-medium{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE}
.it-priority-high{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}
.it-priority-critical{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
.it-reporter{display:flex;align-items:center;gap:9px}
.it-avatar{width:30px;height:30px;border-radius:10px;background:#E2E8F0;display:flex;align-items:center;justify-content:center;color:#334155;font-family:var(--it-font);font-weight:800;font-size:11px;flex-shrink:0}
.it-reporter strong{display:block;font-size:12px;color:#0F172A}
.it-reporter small{display:block;color:#94A3B8;font-size:10.5px}
.it-row-actions{display:flex;gap:7px;justify-content:flex-end}
.it-table-view,.it-table-delete{border:none;border-radius:9px;padding:7px 11px;font-family:var(--it-font);font-weight:750;font-size:11px;cursor:pointer}
.it-table-view{background:#1D4ED8;color:white}
.it-table-delete{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
.it-table-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:13px 20px;color:#64748B;font-size:12px;background:#F8FAFC;border-top:1px solid var(--it-line)}
.it-pagination{display:flex;gap:5px}
.it-pagination button{width:32px;height:32px;border-radius:9px;border:1px solid #CBD5E1;background:#FFFFFF;cursor:pointer;font-family:var(--it-font);font-weight:800}
.it-pagination button.active{background:var(--it-blue);color:white;border-color:var(--it-blue)}
.it-pagination button:disabled{opacity:.45;cursor:not-allowed}
.it-empty-state{padding:64px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:9px;color:#64748B}
.it-empty-icon{font-size:44px}.it-empty-state strong{color:#334155;font-family:var(--it-font)}
.it-spinner{width:38px;height:38px;border-radius:50%;border:3px solid #E2E8F0;border-top-color:var(--it-blue);animation:it-spin .8s linear infinite}
@keyframes it-spin{to{transform:rotate(360deg)}}

/* Activity */
.it-activity-compact{display:flex;flex-direction:column;gap:6px;max-height:230px;overflow-y:auto;padding-right:4px}
.it-activity-compact::-webkit-scrollbar{width:5px}
.it-activity-compact::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:999px}
.it-activity-mini{display:flex;gap:9px;padding:8px 9px;border-radius:11px;background:#F8FAFC;border:1px solid #E2E8F0}
.it-activity-dot{width:9px;height:9px;border-radius:50%;border:2px solid;margin-top:5px;flex-shrink:0}
.it-activity-mini-body{min-width:0;flex:1}
.it-activity-mini-line{display:flex;align-items:center;justify-content:space-between;gap:8px}
.it-activity-mini-line strong{font-size:11.5px;font-weight:800;color:#0F172A;line-height:1.25}
.it-activity-mini-line small{font-size:10px;color:#94A3B8;white-space:nowrap}
.it-activity-mini p{margin:2px 0 0;font-size:10.5px;color:#64748B;line-height:1.35}


.it-type-switch-card{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:18px;
  box-shadow:var(--it-shadow-sm);
  padding:12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom:12px;
}

.it-type-switch-info small{
  display:block;
  color:#64748B;
  font-size:10px;
  letter-spacing:.10em;
  text-transform:uppercase;
  font-weight:850;
  margin-bottom:4px;
}

.it-type-switch-info strong{
  display:block;
  color:#0F172A;
  font-size:15px;
  font-weight:850;
  letter-spacing:-.02em;
}

.it-type-switch-info span{
  display:block;
  margin-top:3px;
  color:#64748B;
  font-size:12px;
  line-height:1.45;
}

.it-type-toggle{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.it-type-option{
  border:1px solid #E2E8F0;
  background:#FFFFFF;
  color:#334155;
  border-radius:14px;
  padding:10px 12px;
  font-family:var(--it-font);
  cursor:pointer;
  min-width:150px;
  display:flex;
  align-items:center;
  gap:9px;
  text-align:left;
  transition:.18s ease;
}

.it-type-option:hover{
  background:#F8FAFC;
  border-color:#CBD5E1;
  transform:translateY(-1px);
}

.it-type-option.active{
  background:#EFF6FF;
  border-color:#93C5FD;
  box-shadow:0 8px 18px rgba(29,78,216,.12);
}

.it-type-option.customer.active{
  background:#FFF7ED;
  border-color:#FDBA74;
  box-shadow:0 8px 18px rgba(217,119,6,.12);
}

.it-type-option-icon{
  width:32px;
  height:32px;
  border-radius:11px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#F1F5F9;
  flex-shrink:0;
}

.it-type-option.active .it-type-option-icon{
  background:#1D4ED8;
  color:#FFFFFF;
}

.it-type-option.customer.active .it-type-option-icon{
  background:#EA580C;
  color:#FFFFFF;
}

.it-type-option strong{
  display:block;
  color:#0F172A;
  font-size:12.5px;
  font-weight:850;
}

.it-type-option small{
  display:block;
  color:#64748B;
  font-size:10.5px;
  margin-top:2px;
}

.it-type-table-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  padding:5px 9px;
  font-size:10.5px;
  font-weight:850;
  border:1px solid #BFDBFE;
  background:#EFF6FF;
  color:#1D4ED8;
  white-space:nowrap;
}

.it-type-table-badge.customer{
  border-color:#FED7AA;
  background:#FFF7ED;
  color:#C2410C;
}

.it-type-table-badge.employee{
  border-color:#BFDBFE;
  background:#EFF6FF;
  color:#1D4ED8;
}

.it-type-radio-panel{
  border:1px solid var(--it-line);
  border-radius:16px;
  background:#F8FAFC;
  padding:13px;
  margin-bottom:16px;
}

.it-type-radio-label{
  display:block;
  font-family:var(--it-font);
  font-size:11px;
  font-weight:850;
  text-transform:uppercase;
  letter-spacing:.06em;
  color:#475569;
  margin-bottom:10px;
}

.it-type-radio-row{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}

.it-type-radio-card{
  border:1px solid #E2E8F0;
  background:#FFFFFF;
  border-radius:14px;
  padding:12px;
  display:flex;
  gap:11px;
  align-items:flex-start;
  text-align:left;
  cursor:pointer;
  font-family:var(--it-font);
  transition:.18s ease;
}

.it-type-radio-card:hover{
  border-color:#CBD5E1;
  box-shadow:0 8px 18px rgba(15,23,42,.06);
  transform:translateY(-1px);
}

.it-type-radio-card.active{
  background:#EFF6FF;
  border-color:#93C5FD;
  box-shadow:0 8px 18px rgba(29,78,216,.12);
}

.it-type-radio-card.active .it-type-radio-icon{
  background:#1D4ED8;
  color:#FFFFFF;
}

.it-type-radio-card.active .it-type-radio-icon.customer{
  background:#EA580C;
}

.it-type-radio-icon{
  width:34px;
  height:34px;
  border-radius:12px;
  background:#F1F5F9;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.it-type-radio-card strong{
  display:block;
  color:#0F172A;
  font-size:13px;
  font-weight:850;
}

.it-type-radio-card small{
  display:block;
  color:#64748B;
  font-size:11px;
  line-height:1.45;
  margin-top:3px;
}

.it-user-picker{
  border:1px solid #E2E8F0;
  border-radius:14px;
  overflow:hidden;
  background:#FFFFFF;
}

.it-user-picker-search{
  height:42px;
  display:flex;
  align-items:center;
  gap:9px;
  border-bottom:1px solid #E2E8F0;
  padding:0 12px;
  color:#94A3B8;
}

.it-user-picker-search input{
  border:none;
  outline:none;
  width:100%;
  background:transparent;
  font-family:var(--it-font);
  font-size:13px;
  color:#0F172A;
}

.it-user-picker-search:focus-within{
  box-shadow:0 0 0 3px rgba(29,78,216,.10) inset;
}

.it-user-picker-table{
  max-height:230px;
  overflow:auto;
}

.it-user-picker-head,
.it-user-picker-row{
  display:grid;
  grid-template-columns:minmax(170px,1.2fr) minmax(180px,1fr) 92px;
  gap:10px;
  align-items:center;
}

.it-user-picker-head{
  position:sticky;
  top:0;
  z-index:1;
  background:#F8FAFC;
  border-bottom:1px solid #E2E8F0;
  padding:9px 12px;
  color:#64748B;
  font-size:10px;
  font-weight:850;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.it-user-picker-row{
  width:100%;
  border:none;
  border-bottom:1px solid #EEF2F7;
  background:#FFFFFF;
  padding:10px 12px;
  text-align:left;
  cursor:pointer;
  font-family:var(--it-font);
}

.it-user-picker-row:hover{
  background:#F8FAFC;
}

.it-user-picker-row.active{
  background:#EFF6FF;
}

.it-user-picker-row strong{
  display:block;
  color:#0F172A;
  font-size:12.5px;
  font-weight:850;
}

.it-user-picker-row small{
  display:block;
  color:#64748B;
  font-size:10.5px;
  margin-top:2px;
}

.it-user-picker-email{
  color:#64748B;
  font-size:12px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.it-user-picker-select{
  justify-self:end;
  border-radius:999px;
  background:#F1F5F9;
  color:#475569;
  padding:5px 8px;
  font-size:10.5px;
  font-weight:850;
}

.it-user-picker-row.active .it-user-picker-select{
  background:#1D4ED8;
  color:#FFFFFF;
}

.it-user-picker-empty{
  padding:20px;
  text-align:center;
  color:#94A3B8;
  font-size:13px;
}

.it-user-selected{
  display:flex;
  gap:9px;
  align-items:center;
  background:#F0FDF4;
  border-top:1px solid #BBF7D0;
  padding:10px 12px;
  color:#15803D;
}

.it-user-selected span{
  width:24px;
  height:24px;
  border-radius:999px;
  background:#16A34A;
  color:#FFFFFF;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  flex-shrink:0;
}

.it-user-selected strong{
  display:block;
  color:#14532D;
  font-size:12.5px;
}

.it-user-selected small{
  display:block;
  color:#16A34A;
  font-size:11px;
  margin-top:2px;
}



/* Full-page create issue overlay */
.it-create-overlay{
  position:fixed;
  inset:0;
  z-index:9999;
  width:100%;
  min-height:100dvh;
  padding:12px;
  background:rgba(15,23,42,.42);
  backdrop-filter:blur(8px);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  overflow:auto;
  animation:it-overlay-fade .16s ease both;
}

.it-create-overlay .it-create-panel{
  width:min(1480px,100%);
  height:calc(100dvh - 24px);
  max-height:calc(100dvh - 24px);
  margin:0;
  display:flex;
  flex-direction:column;
  border-radius:18px;
  border:1px solid rgba(226,232,240,.95);
  background:#FFFFFF;
  box-shadow:0 28px 80px rgba(15,23,42,.32);
  overflow:hidden;
  animation:it-overlay-slide .2s ease both;
}

.it-create-overlay .it-create-panel-head{
  flex:0 0 auto;
  position:sticky;
  top:0;
  z-index:3;
  background:#FFFFFF;
  border-bottom:1px solid var(--it-line);
}

.it-create-overlay .it-create-panel-body{
  padding:10px;
  flex:1 1 auto;
  min-height:0;
  overflow:auto;
  background:#F8FAFC;
}

.it-create-overlay .it-create-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr) 315px;
  gap:20px;
  min-height:0;
}

.it-create-overlay .it-create-guide{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:16px;
  padding:15px;
  align-self:start;
  position:sticky;
  top:10px;
  max-height:calc(100dvh - 118px);
  overflow:auto;
}

.it-create-overlay .it-guide-block{
  padding-bottom:13px;
  margin-bottom:13px;
  border-bottom:1px solid var(--it-line);
}

.it-create-overlay .it-guide-block:last-child{
  border-bottom:none;
  margin-bottom:0;
  padding-bottom:0;
}

.it-create-overlay .it-guide-block h4{
  margin:0 0 8px;
  font-family:var(--it-font);
  font-size:13px;
  color:#0F172A;
}

.it-create-overlay .it-guide-block p,
.it-create-overlay .it-guide-block li{
  font-size:12px;
  line-height:1.58;
  color:#64748B;
  margin:0 0 6px;
}

.it-create-overlay .it-guide-block ul{
  padding-left:18px;
  margin:0;
}

.it-create-overlay .it-create-form{
  min-width:0;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:16px;
  padding:14px;
}

.it-create-overlay .it-form-section-title{
  display:flex;
  align-items:center;
  gap:8px;
  font-family:var(--it-font);
  font-weight:800;
  font-size:15px;
  margin-bottom:16px;
}

.it-create-overlay .it-section-icon{
  width:30px;
  height:30px;
  border-radius:10px;
  background:#EFF6FF;
  color:#1D4ED8;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}

.it-create-overlay .it-form-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}

.it-create-overlay .it-form-field{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.it-create-overlay .it-form-field label{
  font-family:var(--it-font);
  font-size:11px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.05em;
  color:#475569;
}

.it-create-overlay .it-form-field label span{
  color:var(--it-red);
}

.it-create-overlay .it-form-field input,
.it-create-overlay .it-form-field select,
.it-create-overlay .it-form-field textarea{
  width:100%;
  border:1px solid #CBD5E1;
  background:#FFFFFF;
  border-radius:11px;
  padding:11px 13px;
  font-family:var(--it-font);
  font-size:13.5px;
  outline:none;
  color:#0F172A;
  transition:.16s ease;
}

.it-create-overlay .it-form-field textarea{
  resize:vertical;
}

.it-create-overlay .it-form-field input:focus,
.it-create-overlay .it-form-field select:focus,
.it-create-overlay .it-form-field textarea:focus{
  border-color:var(--it-blue);
  box-shadow:0 0 0 3px rgba(29,78,216,.10);
}

.it-create-overlay .it-form-field input:disabled{
  opacity:.65;
  cursor:not-allowed;
  background:#F8FAFC;
}

.it-create-overlay .it-form-field small{
  font-size:11px;
  color:#94A3B8;
}

.it-create-overlay .it-form-wide{
  grid-column:1/-1;
}

.it-create-overlay .it-dropzone{
  border:2px dashed #CBD5E1;
  background:#F8FAFC;
  border-radius:14px;
  padding:22px;
  text-align:center;
  cursor:pointer;
  display:flex;
  flex-direction:column;
  gap:6px;
  align-items:center;
  justify-content:center;
  color:#1D4ED8;
}

.it-create-overlay .it-dropzone:hover{
  border-color:#93C5FD;
  background:#EFF6FF;
}

.it-create-overlay .it-drop-icon{
  width:36px;
  height:36px;
  border-radius:50%;
  background:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  box-shadow:var(--it-shadow-sm);
}

.it-create-overlay .it-selected-files{
  margin-top:12px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.it-create-overlay .it-selected-files-head{
  display:flex;
  justify-content:space-between;
  color:#64748B;
  font-size:12px;
}

.it-create-overlay .it-selected-file{
  display:flex;
  align-items:center;
  gap:10px;
  background:#F8FAFC;
  border:1px solid #E2E8F0;
  border-radius:12px;
  padding:10px 12px;
}

.it-create-overlay .it-selected-file div{
  min-width:0;
  flex:1;
}

.it-create-overlay .it-selected-file strong{
  display:block;
  font-size:12.5px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.it-create-overlay .it-selected-file small{
  font-size:11px;
  color:#94A3B8;
}

.it-create-overlay .it-selected-file button{
  border:none;
  background:transparent;
  font-size:18px;
  cursor:pointer;
  color:#64748B;
}

.it-create-overlay .it-form-footer{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
  margin-top:18px;
  padding-top:16px;
  border-top:1px solid var(--it-line);
}

.it-create-overlay .it-private-note{
  font-size:12px;
  color:#64748B;
}

.it-create-overlay .it-form-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

@keyframes it-overlay-fade{
  from{opacity:0}
  to{opacity:1}
}

@keyframes it-overlay-slide{
  from{opacity:0;transform:translateY(12px) scale(.99)}
  to{opacity:1;transform:translateY(0) scale(1)}
}

@media(max-width:1150px){
  .it-create-overlay .it-create-layout{
    grid-template-columns:1fr;
  }

  .it-create-overlay .it-create-guide{
    position:static;
    max-height:none;
  }
}

@media(max-width:760px){
  .it-create-overlay{
    padding:8px;
  }

  .it-create-overlay .it-create-panel{
    width:100%;
    height:calc(100dvh - 16px);
    max-height:calc(100dvh - 16px);
    border-radius:16px;
  }

  .it-create-overlay .it-create-panel-body{
    padding:8px;
  }

  .it-create-overlay .it-create-form{
    padding:12px;
  }

  .it-create-overlay .it-form-grid{
    grid-template-columns:1fr;
  }

  .it-create-overlay .it-form-wide{
    grid-column:auto;
  }
}

@media(max-width:480px){
  .it-create-overlay{
    padding:0;
  }

  .it-create-overlay .it-create-panel{
    height:100dvh;
    max-height:100dvh;
    border-radius:0;
    border-left:none;
    border-right:none;
  }

  .it-create-overlay .it-create-panel-head{
    padding:13px 14px;
  }

  .it-create-overlay .it-form-actions,
  .it-create-overlay .it-form-actions .it-btn{
    width:100%;
  }
}

@media(max-width:1250px){.it-kpis{grid-template-columns:repeat(3,1fr)}}
@media(max-width:1150px){.it-create-layout{grid-template-columns:1fr}}
@media(max-width:760px){
  .it-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:14px 12px}
  .it-head{padding:16px}
  .it-kpis{grid-template-columns:repeat(2,1fr)}
  .it-filter-card{align-items:stretch}
  .it-type-switch-card{align-items:stretch;flex-direction:column}
  .it-type-toggle{width:100%}
  .it-type-option{flex:1 1 100%}
  .it-type-radio-row{grid-template-columns:1fr}
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
`;


const CUSTOMER_ISSUE_CATEGORIES = [
  "Policy Servicing",
  "Claim Related",
  "Premium Payment",
  "Policy Loan",
  "Maturity / Survival Benefit",
  "Agent / Service Feedback",
  "Branch Service Complaint",
  "Digital Service / Mobile App",
  "Customer KYC / Profile Update",
  "Other Customer Issue",
];

const ISSUE_TYPE_FILTERS = [
  { key: "all", label: "All Issues", icon: "▦", hint: "Status baskets" },
  { key: "Employee", label: "Employee Issue", icon: "👥", hint: "Internal categories" },
  { key: "Customer", label: "Customer Issue", icon: "👤", hint: "Customer categories" },
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
  issue: "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  support: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  expiry: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
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
  const isCorpUser = role === "corpuser";
  const canAct = isAdmin || isCorpUser;
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

    // New Report = new/open issue assigned to the logged-in Corporate User.
    // For normal branch users/admin view, it shows open reports in the current visible list.
    const newReports = typeFilteredIssues.filter((issue) => {
      const isOpen = issue.status === "Open";
      if (!isOpen) return false;

      if (isCorpUser) {
        return String(issue.assigned_to_user_id || "") === String(user?.id || "");
      }

      return true;
    }).length;

    return { total, newReports, open, underReview, closed, high };
  }, [typeFilteredIssues, isCorpUser, user?.id]);

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

        if (isCorpUser) {
          return String(issue.assigned_to_user_id || "") === String(user?.id || "");
        }

        return true;
      });
    }

    if (activeStat === "high") {
      return typeFilteredIssues.filter((i) => ["High", "Critical"].includes(i.priority));
    }

    return typeFilteredIssues.filter((i) => i.status === activeStat);
  }, [typeFilteredIssues, activeStat, isCorpUser, user?.id]);

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
        description: isCorpUser
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
  }, [activeStat, isCorpUser]);

  const kpis = [
    {
      key: "all",
      label: "Total Issues",
      value: stats.total,
      icon: "📋",
      color: "#1D4ED8",
      hint: "All visible reports",
    },
    {
      key: "new",
      label: "New Report",
      value: stats.newReports,
      icon: "🔔",
      color: "#DC2626",
      hint: isCorpUser ? "New assigned reports" : "New open reports",
      notify: stats.newReports,
    },
    {
      key: "Open",
      label: "Open",
      value: stats.open,
      icon: "📂",
      color: "#16A34A",
      hint: "Waiting for action",
    },
    {
      key: "UnderReview",
      label: "Under Review",
      value: stats.underReview,
      icon: "⏱",
      color: "#D97706",
      hint: "Currently reviewing",
    },
    {
      key: "Closed",
      label: "Closed",
      value: stats.closed,
      icon: "✓",
      color: "#64748B",
      hint: "Resolved reports",
    },
    {
      key: "high",
      label: "High / Critical",
      value: stats.high,
      icon: "!",
      color: "#DC2626",
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
              <div>
                <div className="it-eyebrow">Nepal Life Issue Management</div>
                <h1 className="it-title">Issue Tracker</h1>
                <p className="it-desc">
                  View submitted reports, track assigned work, and manage issue progress.
                </p>
              </div>

              <div className="it-actions">
                <button className="it-btn it-btn-soft" onClick={load} disabled={loading}>
                  Refresh
                </button>
                <button
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
                      <div className="it-kpi-icon" style={{ color: kpi.color }}>
                        {kpi.icon}
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
                    <span className="it-type-option-icon">{item.icon}</span>
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
                    <small>Report a Problem</small>
                    <h2 id="issue-create-title">New Issue Report</h2>
                  </div>
                  <button className="it-btn it-btn-soft" onClick={() => setShowCreate(false)}>
                    Close
                  </button>
                </div>

                <div className="it-create-panel-body">
                  <div className="it-create-layout">
                    <IssueCreateForm
                      user={user}
                      categories={categoriesForCurrentType}
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
                        <p><strong style={{ color: "#dc2626" }}>High / Critical</strong> — urgent handling</p>
                        <p><strong style={{ color: "#d97706" }}>Medium</strong> — normal business impact</p>
                        <p><strong style={{ color: "#16a34a" }}>Low</strong> — minor inconvenience</p>
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
              isCorpUser={isCorpUser}
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