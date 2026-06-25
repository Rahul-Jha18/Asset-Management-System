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
} from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --it-blue:#0B5CAB;
  --it-blue2:#1474F3;
  --it-red:#E8192C;
  --it-bg:#f4f7fb;
  --it-card:#ffffff;
  --it-text:#0f172a;
  --it-soft-text:#334155;
  --it-muted:#64748b;
  --it-faint:#94a3b8;
  --it-line:#e2e8f0;
  --it-soft:#f8fafc;
  --it-blue-soft:#eff6ff;
  --it-shadow:0 1px 3px rgba(15,23,42,.08),0 10px 26px rgba(15,23,42,.055);
  --it-shadow-lg:0 18px 48px rgba(15,23,42,.12);
  --it-radius:18px;
}
.it-page{font-family:'DM Sans',system-ui,sans-serif;background:
  radial-gradient(circle at top left, rgba(20,116,243,.10), transparent 28%),
  radial-gradient(circle at top right, rgba(232,25,44,.07), transparent 24%),
  var(--it-bg);
  height:calc(100vh - 36px);max-height:calc(100vh - 36px);overflow-y:auto;overflow-x:hidden;color:var(--it-text);padding:22px 18px 30px;scrollbar-width:thin;scrollbar-color:#bfdbfe transparent}
.it-page::-webkit-scrollbar{width:8px}
.it-page::-webkit-scrollbar-track{background:transparent}
.it-page::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:999px}
.it-page-inner{max-width:1380px;margin:0 auto}
.it-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.it-eyebrow{font-family:'Outfit',sans-serif;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:var(--it-blue);display:flex;align-items:center;gap:8px}
.it-eyebrow::before{content:"";width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,var(--it-blue2),var(--it-red));box-shadow:0 0 14px rgba(20,116,243,.55)}
.it-title{font-family:'Syne',sans-serif;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.04;margin:6px 0 0;font-weight:900;letter-spacing:-.05em}
.it-desc{max-width:690px;margin:8px 0 0;color:var(--it-muted);font-size:13.5px;line-height:1.65}
.it-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.it-btn{border:none;border-radius:12px;padding:10px 16px;font-family:'Outfit',sans-serif;font-weight:850;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:.18s ease;white-space:nowrap}
.it-btn:hover:not(:disabled){transform:translateY(-1px)}
.it-btn:disabled{opacity:.55;cursor:not-allowed}
.it-btn-primary{background:linear-gradient(135deg,var(--it-blue),var(--it-blue2));color:white;box-shadow:0 10px 18px rgba(11,92,171,.22)}
.it-btn-danger{background:linear-gradient(135deg,#dc2626,var(--it-red));color:white;box-shadow:0 10px 18px rgba(232,25,44,.20)}
.it-btn-soft{background:rgba(255,255,255,.88);color:#334155;border:1.5px solid var(--it-line);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.it-btn-amber{background:linear-gradient(135deg,#f59e0b,#d97706);color:white;box-shadow:0 10px 18px rgba(217,119,6,.18)}
.it-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px}
.it-kpi{position:relative;overflow:hidden;background:rgba(255,255,255,.92);border:1.5px solid rgba(226,232,240,.95);border-radius:20px;box-shadow:var(--it-shadow);padding:16px;display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;min-height:112px}
.it-kpi::after{content:"";position:absolute;right:-36px;top:-36px;width:92px;height:92px;border-radius:50%;background:rgba(20,116,243,.06)}
.it-kpi:hover{transform:translateY(-2px);transition:.18s ease;box-shadow:var(--it-shadow-lg)}
.it-kpi-icon{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:21px}
.it-kpi small{font-family:'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:850;color:#64748b}
.it-kpi strong{display:block;font-family:'Syne',sans-serif;font-size:1.9rem;line-height:1;font-weight:900;margin-top:5px}
.it-kpi span{display:block;margin-top:6px;font-size:11px;font-weight:750;color:#16a34a}
.it-filter-card{background:rgba(255,255,255,.95);border:1.5px solid var(--it-line);border-radius:20px;box-shadow:var(--it-shadow);padding:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.it-filter-search{height:42px;min-width:250px;flex:1;display:flex;align-items:center;gap:9px;background:#f8fafc;border:1.5px solid var(--it-line);border-radius:13px;padding:0 13px;color:#94a3b8}
.it-filter-search input{border:none;outline:none;background:transparent;width:100%;font-family:'DM Sans',sans-serif;color:#0f172a;font-size:13.5px}
.it-filter-select{height:42px;min-width:150px;border:1.5px solid var(--it-line);border-radius:13px;background:#f8fafc;padding:0 12px;font-family:'DM Sans',sans-serif;color:#334155;outline:none}
.it-clear-btn{border:none;background:#fff1f2;color:#e11d48;border-radius:11px;padding:10px 12px;font-family:'Outfit',sans-serif;font-weight:850;cursor:pointer}
.it-count-pill{margin-left:auto;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:10px;padding:7px 11px;font-family:'Outfit',sans-serif;font-weight:850;font-size:12px}
.it-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin:-2px 0 14px}
.it-chip{display:inline-flex;align-items:center;gap:7px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:6px 11px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:850}
.it-chip button{width:17px;height:17px;border:none;border-radius:50%;background:#dbeafe;color:#1d4ed8;cursor:pointer;font-weight:900}
.it-create-panel{background:white;border:1.5px solid var(--it-line);border-radius:22px;box-shadow:var(--it-shadow-lg);overflow:hidden;margin-bottom:18px}
.it-create-panel-head{padding:18px 22px;background:linear-gradient(90deg,var(--it-blue) 0%,var(--it-blue2) 72%,var(--it-red) 100%);display:flex;align-items:center;justify-content:space-between;gap:12px}
.it-create-panel-head small{display:block;font-family:'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.68);font-weight:850;font-size:10px;margin-bottom:3px}
.it-create-panel-head h2{margin:0;color:white;font-family:'Syne',sans-serif;font-size:1.25rem;letter-spacing:-.03em}
.it-create-panel-body{padding:22px}
.it-create-layout{display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:22px}
.it-create-guide{background:#f8fafc;border:1.5px solid var(--it-line);border-radius:18px;padding:16px;align-self:start}
.it-guide-block{padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--it-line)}
.it-guide-block:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.it-guide-block h4{margin:0 0 8px;font-family:'Outfit',sans-serif;font-size:13px;color:#0f172a}
.it-guide-block p,.it-guide-block li{font-size:12px;line-height:1.58;color:#64748b;margin:0 0 6px}
.it-guide-block ul{padding-left:18px;margin:0}
.it-create-form{min-width:0}
.it-form-section-title{display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;font-weight:900;font-size:15px;margin-bottom:16px}
.it-section-icon{width:30px;height:30px;border-radius:10px;background:#eff6ff;color:#1d4ed8;display:inline-flex;align-items:center;justify-content:center}
.it-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.it-form-field{display:flex;flex-direction:column;gap:7px}
.it-form-field label{font-family:'Outfit',sans-serif;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#475569}
.it-form-field label span{color:var(--it-red)}
.it-form-field input,.it-form-field select,.it-form-field textarea{width:100%;border:1.5px solid #cbd5e1;background:#f8fafc;border-radius:12px;padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;outline:none;color:#0f172a;transition:.16s ease}
.it-form-field textarea{resize:vertical}
.it-form-field input:focus,.it-form-field select:focus,.it-form-field textarea:focus{border-color:var(--it-blue2);box-shadow:0 0 0 3px rgba(20,116,243,.10)}
.it-form-field input:disabled{opacity:.65;cursor:not-allowed}
.it-form-field small{font-size:11px;color:#94a3b8}
.it-form-wide{grid-column:1/-1}
.it-dropzone{border:2px dashed #bfdbfe;background:linear-gradient(180deg,#eff6ff,#f8fbff);border-radius:16px;padding:24px;text-align:center;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center;color:#1e40af}
.it-dropzone:hover{border-color:#60a5fa;background:#eaf3ff}
.it-drop-icon{width:38px;height:38px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 4px 12px rgba(37,99,235,.12)}
.it-selected-files{margin-top:12px;display:flex;flex-direction:column;gap:8px}
.it-selected-files-head{display:flex;justify-content:space-between;color:#64748b;font-size:12px}
.it-selected-file{display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px}
.it-selected-file div{min-width:0;flex:1}
.it-selected-file strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-selected-file small{font-size:11px;color:#94a3b8}
.it-selected-file button{border:none;background:transparent;font-size:18px;cursor:pointer;color:#64748b}
.it-form-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--it-line)}
.it-private-note{font-size:12px;color:#64748b}
.it-form-actions{display:flex;gap:8px;flex-wrap:wrap}

/* Modern table */
.it-table-card{background:rgba(255,255,255,.96);border:1.5px solid var(--it-line);border-radius:24px;box-shadow:var(--it-shadow);overflow:hidden}
.it-table-head{padding:18px 22px;background:linear-gradient(135deg,#ffffff 0%,#f8fbff 54%,#fff5f6 100%);border-bottom:1px solid var(--it-line);display:flex;justify-content:space-between;gap:12px;align-items:center}
.it-table-head h3{margin:0;font-family:'Syne',sans-serif;font-size:18px;letter-spacing:-.03em}
.it-table-head p{margin:5px 0 0;color:#64748b;font-size:12.5px}
.it-table-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.it-table-role-pill{background:#f0f9ff;color:#0369a1;border:1px solid #bae6fd;border-radius:999px;padding:6px 10px;font-family:'Outfit',sans-serif;font-weight:850;font-size:11px}
.it-table-scroll{overflow-x:auto;padding:8px 10px 0}
.it-table{width:100%;border-collapse:separate;border-spacing:0 9px;min-width:1020px}
.it-table th{color:#64748b;text-align:left;font-family:'Outfit',sans-serif;font-size:10px;letter-spacing:.10em;text-transform:uppercase;padding:7px 14px;background:transparent}
.it-table tbody tr{cursor:pointer;transition:.16s ease}
.it-table tbody tr:hover td{background:#f8fbff;border-color:#bfdbfe;box-shadow:0 8px 18px rgba(37,99,235,.07)}
.it-table td{padding:14px;border-top:1.5px solid #e2e8f0;border-bottom:1.5px solid #e2e8f0;background:white;color:#334155;font-size:13px;vertical-align:middle;transition:.16s ease}
.it-table td:first-child{border-left:1.5px solid #e2e8f0;border-radius:16px 0 0 16px}
.it-table td:last-child{border-right:1.5px solid #e2e8f0;border-radius:0 16px 16px 0}
.it-ticket{font-family:'Courier New',monospace;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;padding:5px 9px;font-weight:900;font-size:12px;white-space:nowrap}
.it-title-cell{font-weight:900;color:#0f172a;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-desc-cell{font-size:11.5px;color:#94a3b8;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
.it-category-cell{display:inline-flex;align-items:center;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:5px 8px;font-family:'Outfit',sans-serif;font-weight:800;font-size:11.5px;color:#475569;white-space:nowrap}
.it-status,.it-priority{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 11px;font-family:'Outfit',sans-serif;font-weight:900;font-size:11px;white-space:nowrap}
.it-status-dot{width:6px;height:6px;border-radius:50%}
.it-status-open{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}.it-status-open .it-status-dot{background:#16a34a}
.it-status-review{background:#fffbeb;color:#d97706;border:1px solid #fde68a}.it-status-review .it-status-dot{background:#f59e0b}
.it-status-closed{background:#f1f5f9;color:#475569;border:1px solid #cbd5e1}.it-status-closed .it-status-dot{background:#64748b}
.it-priority-low{background:#f1f5f9;color:#475569;border:1px solid #cbd5e1}
.it-priority-medium{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
.it-priority-high{background:#fffbeb;color:#d97706;border:1px solid #fde68a}
.it-priority-critical{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.it-reporter{display:flex;align-items:center;gap:9px}
.it-avatar{width:32px;height:32px;border-radius:12px;background:linear-gradient(135deg,var(--it-blue2),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-family:'Outfit',sans-serif;font-weight:900;font-size:11px;flex-shrink:0;box-shadow:0 6px 14px rgba(20,116,243,.18)}
.it-reporter strong{display:block;font-size:12px;color:#0f172a}
.it-reporter small{display:block;color:#94a3b8;font-size:10.5px}
.it-row-actions{display:flex;gap:7px;justify-content:flex-end}
.it-table-view,.it-table-delete{border:none;border-radius:10px;padding:7px 11px;font-family:'Outfit',sans-serif;font-weight:850;font-size:11px;cursor:pointer}
.it-table-view{background:#2563eb;color:white}
.it-table-delete{background:#fff1f2;color:#e11d48;border:1px solid #fecdd3}
.it-table-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 22px;color:#64748b;font-size:12px;background:#fbfdff;border-top:1px solid var(--it-line)}
.it-pagination{display:flex;gap:5px}
.it-pagination button{width:34px;height:34px;border-radius:10px;border:1px solid #cbd5e1;background:white;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:900}
.it-pagination button.active{background:var(--it-blue);color:white;border-color:var(--it-blue)}
.it-pagination button:disabled{opacity:.45;cursor:not-allowed}
.it-empty-state{padding:64px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:9px;color:#64748b}
.it-empty-icon{font-size:44px}.it-empty-state strong{color:#334155;font-family:'Outfit',sans-serif}
.it-spinner{width:38px;height:38px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:var(--it-blue2);animation:it-spin .8s linear infinite}
@keyframes it-spin{to{transform:rotate(360deg)}}

/* Detail */
.it-detail-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.it-back{border:none;background:rgba(255,255,255,.72);border:1.5px solid var(--it-line);border-radius:999px;padding:9px 13px;color:var(--it-blue);font-family:'Outfit',sans-serif;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:7px}
.it-detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 430px;gap:18px}
.it-detail-stack{display:flex;flex-direction:column;gap:16px}
.it-detail-card{background:rgba(255,255,255,.96);border:1.5px solid var(--it-line);border-radius:22px;box-shadow:var(--it-shadow);overflow:hidden}
.it-detail-header{padding:20px 22px;background:linear-gradient(90deg,var(--it-blue) 0%,var(--it-blue2) 74%,var(--it-red) 100%);color:white}
.it-detail-header small{font-family:'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.68);font-weight:850;font-size:10px}
.it-detail-header h2{margin:6px 0 0;font-family:'Syne',sans-serif;letter-spacing:-.035em;font-size:1.42rem}
.it-detail-body{padding:18px}
.it-meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.it-meta{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:11px}
.it-meta small{display:block;font-family:'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-weight:900;font-size:9.5px;margin-bottom:5px}
.it-meta strong{font-size:13px;color:#334155}
.it-section-title{font-family:'Outfit',sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-size:11px;font-weight:900;margin:16px 0 10px}
.it-text-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;color:#334155;font-size:13.5px;line-height:1.68;white-space:pre-wrap}
.it-card-subhead{padding:15px 17px;background:linear-gradient(to right,#f8fafc,#f5f3ff);border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:10px}
.it-card-subhead h3{margin:0;font-family:'Outfit',sans-serif;font-size:15px}
.it-card-subhead span{font-size:12px;color:#64748b}
.it-card-pad{padding:16px}
.it-muted-empty{text-align:center;color:#94a3b8;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;font-size:13px}

/* Attachments and preview modal */
.it-attach-drop{border:2px dashed #bfdbfe;background:#eff6ff;border-radius:16px;padding:18px;text-align:center;color:#1d4ed8;cursor:pointer;margin-bottom:12px;display:flex;flex-direction:column;gap:5px}
.it-attach-drop:hover{background:#e7f1ff;border-color:#60a5fa}
.it-attach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:11px}
.it-attach-card{position:relative;display:flex;gap:11px;background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:11px;box-shadow:0 2px 10px rgba(15,23,42,.04);min-width:0}
.it-attach-card:hover{border-color:#bfdbfe;box-shadow:0 8px 18px rgba(37,99,235,.08)}
.it-attach-thumb{width:52px;height:52px;border-radius:14px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;color:#1d4ed8;font-weight:900}
.it-attach-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.it-attach-info{min-width:0;flex:1}
.it-attach-info strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0f172a}
.it-attach-info small{display:block;font-size:11px;color:#94a3b8;margin-top:3px}
.it-attach-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.it-attach-action{border:none;background:#eff6ff;color:#1d4ed8;border-radius:9px;padding:5px 8px;font-family:'Outfit',sans-serif;font-weight:850;font-size:11px;cursor:pointer;text-decoration:none}
.it-attach-action.secondary{background:#f8fafc;color:#475569;border:1px solid #e2e8f0}
.it-preview-backdrop{position:fixed;inset:0;background:rgba(2,6,23,.72);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}
.it-preview-modal{width:min(980px,96vw);max-height:92vh;background:white;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.35);overflow:hidden;display:flex;flex-direction:column}
.it-preview-head{padding:14px 18px;background:linear-gradient(90deg,var(--it-blue),var(--it-blue2));color:white;display:flex;align-items:center;justify-content:space-between;gap:12px}
.it-preview-title{min-width:0}
.it-preview-title strong{display:block;font-family:'Outfit',sans-serif;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it-preview-title small{opacity:.75;font-size:11px}
.it-preview-close{border:none;background:rgba(255,255,255,.16);color:white;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:20px}
.it-preview-body{background:#0b1120;display:flex;align-items:center;justify-content:center;min-height:280px;max-height:75vh;overflow:auto}
.it-preview-body img{max-width:100%;max-height:75vh;object-fit:contain}
.it-preview-body iframe{width:100%;height:72vh;border:none;background:white}
.it-preview-fallback{color:white;text-align:center;padding:38px}
.it-preview-fallback a{color:#93c5fd}
.it-activity-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 4px;
}

.it-activity-compact::-webkit-scrollbar {
  width: 5px;
}

.it-activity-compact::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.it-activity-mini {
  display: flex;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.it-activity-arrow {
  color: #0b5cab;
  font-weight: 900;
  font-size: 13px;
  line-height: 1.2;
  margin-top: 1px;
}

.it-activity-mini-body {
  min-width: 0;
  flex: 1;
}

.it-activity-mini-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.it-activity-mini-line strong {
  font-size: 11.5px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
}

.it-activity-mini-line small {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
}

.it-activity-mini p {
  margin: 2px 0 0;
  font-size: 10.5px;
  color: #64748b;
  line-height: 1.35;
}
/* Messages */
.it-message-thread{padding:14px;display:flex;flex-direction:column;gap:10px;max-height:430px;overflow-y:auto;background:white}
.it-message-empty{padding:38px 16px;text-align:center;color:#94a3b8;display:flex;flex-direction:column;gap:6px}.it-message-empty div{font-size:34px}.it-message-empty strong{color:#475569}
.it-message{max-width:88%;padding:11px 14px;border-radius:16px;word-break:break-word;box-shadow:0 1px 3px rgba(15,23,42,.06)}
.it-message-mine{align-self:flex-end;background:linear-gradient(180deg,#eff6ff,#eaf3ff);border:1px solid #bfdbfe;border-bottom-right-radius:6px}
.it-message-other{align-self:flex-start;background:#f8fafc;border:1px solid #e2e8f0;border-bottom-left-radius:6px}
.it-message-internal{background:#fffbeb;border-color:#fde68a}
.it-message-sending{opacity:.65}
.it-message-head{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:5px}
.it-message-head strong{font-family:'Outfit',sans-serif;font-size:11.5px}.it-message-head span{background:#e2e8f0;border-radius:6px;padding:1px 6px;font-size:10px;color:#64748b}.it-message-head em{background:#fde68a;color:#92400e;border-radius:999px;padding:1px 7px;font-style:normal;font-size:9px;font-weight:900}
.it-message p{margin:0;font-size:13px;color:#334155;line-height:1.58;white-space:pre-wrap}.it-message small{display:block;margin-top:6px;font-size:10px;color:#94a3b8;text-align:right}
.it-compose{border-top:1px solid #e2e8f0;padding:14px;display:flex;flex-direction:column;gap:9px}
.it-internal-toggle{font-size:12px;color:#64748b;display:flex;align-items:center;gap:7px;font-family:'Outfit',sans-serif;font-weight:850}
.it-compose textarea{border:1.5px solid #cbd5e1;background:#f8fafc;border-radius:14px;min-height:86px;padding:12px 13px;resize:vertical;outline:none;font-family:'DM Sans',sans-serif}
.it-compose textarea:focus{border-color:var(--it-blue2);box-shadow:0 0 0 3px rgba(20,116,243,.10)}
.it-compose-actions{display:flex;align-items:center;justify-content:space-between;gap:10px}.it-compose-actions small{color:#94a3b8}
.it-status-form{padding:16px;display:flex;flex-direction:column;gap:12px}
.it-status-form label{font-family:'Outfit',sans-serif;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#475569}
.it-status-form select,.it-status-form textarea{border:1.5px solid #cbd5e1;background:#f8fafc;border-radius:12px;padding:11px 13px;font-family:'DM Sans',sans-serif;outline:none}
.it-status-form textarea{min-height:84px;resize:vertical}

@media(max-width:1150px){.it-kpis{grid-template-columns:repeat(3,1fr)}.it-create-layout{grid-template-columns:1fr}.it-detail-layout{grid-template-columns:1fr}.it-meta-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.it-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:16px 12px}.it-kpis{grid-template-columns:repeat(2,1fr)}.it-kpi{grid-template-columns:1fr}.it-filter-card{align-items:stretch}.it-filter-search,.it-filter-select,.it-count-pill{width:100%;min-width:0;margin-left:0}.it-form-grid{grid-template-columns:1fr}.it-form-wide{grid-column:auto}.it-create-panel-body{padding:16px}.it-detail-top{align-items:flex-start}.it-meta-grid{grid-template-columns:1fr}.it-message{max-width:96%}.it-table{min-width:920px}}
@media(max-width:480px){.it-kpis{grid-template-columns:1fr}.it-actions,.it-form-actions{width:100%}.it-btn{width:100%}.it-create-panel-head{align-items:flex-start;flex-direction:column}.it-preview-backdrop{padding:10px}.it-preview-modal{width:100vw;max-height:94vh;border-radius:18px}}
`;



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

const getIssueTrackerNavItems = (user) => {
  const role = String(user?.role?.name || user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const canRequests = ["admin", "subadmin", "support", "corpuser", "corp_user"].includes(role);

  return [
    { label: "Analytics", path: "/assetdashboard", icon: makeIcon(NAV_ICONS.dashboard) },
    { label: "Branches", path: "/branches", icon: makeIcon(NAV_ICONS.branches) },
    { label: "Asset Master", path: "/branch-assets-report", icon: makeIcon(NAV_ICONS.assets) },
    { label: "Issue Tracker", path: "/branch-issues", icon: makeIcon(NAV_ICONS.issue) },
    { label: "Requests", path: "/requests", icon: makeIcon(NAV_ICONS.requests), show: canRequests },
    { label: "Help & Support", path: "/support", icon: makeIcon(NAV_ICONS.support) },
    { label: "Admin Expiry", path: "/admin/expiry", icon: makeIcon(NAV_ICONS.expiry), show: isAdmin },
    { label: "Users", path: "/admin/users", icon: makeIcon(NAV_ICONS.users), show: isAdmin },
  ].filter((item) => item.show !== false);
};


export default function BranchIssuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const navItems = getIssueTrackerNavItems(user);

  const role = String(user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const canAct = ["admin", "approver", "headoffice", "corpuser", "support"].includes(role);
  const canDelete = role === "admin";

  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");
  const [categoryF, setCategoryF] = useState("");
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (statusF) params.status = statusF;
      if (priorityF) params.priority = priorityF;
      if (categoryF) params.category_id = categoryF;
      if (search) params.search = search;

      const res = await listBranchIssues(params);
      setIssues(Array.isArray(res?.data) ? res.data : []);
      setPage(1);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [search, statusF, priorityF, categoryF]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getIssueCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  const stats = useMemo(() => {
    const total = issues.length;
    const open = issues.filter((issue) => issue.status === "Open").length;
    const underReview = issues.filter((issue) => issue.status === "UnderReview").length;
    const closed = issues.filter((issue) => issue.status === "Closed").length;
    const high = issues.filter((issue) => ["High", "Critical"].includes(issue.priority)).length;

    return { total, open, underReview, closed, high };
  }, [issues]);

  const activeFilters = [search, statusF, priorityF, categoryF].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setStatusF("");
    setPriorityF("");
    setCategoryF("");
  };

  const chips = [
    search && { key: "search", label: `Search: ${search}`, onRemove: () => setSearch("") },
    statusF && { key: "status", label: `Status: ${statusF === "UnderReview" ? "Under Review" : statusF}`, onRemove: () => setStatusF("") },
    priorityF && { key: "priority", label: `Priority: ${priorityF}`, onRemove: () => setPriorityF("") },
    categoryF && {
      key: "category",
      label: `Category: ${categories.find((c) => String(c.id) === String(categoryF))?.name || "Selected"}`,
      onRemove: () => setCategoryF(""),
    },
  ].filter(Boolean);

  const kpis = [
    { label: "Total Issues", value: stats.total, icon: "📋", bg: "#eff6ff", color: "#0B5CAB" },
    { label: "Open", value: stats.open, icon: "📂", bg: "#f0fdf4", color: "#16a34a" },
    { label: "Under Review", value: stats.underReview, icon: "⏱", bg: "#fffbeb", color: "#d97706" },
    { label: "Closed", value: stats.closed, icon: "✓", bg: "#f8fafc", color: "#64748b" },
    { label: "High / Critical", value: stats.high, icon: "!", bg: "#fef2f2", color: "#dc2626" },
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
                  Track, manage, and resolve branch issues from one clean workspace.
                  All data shown here comes from your issue tracker APIs.
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
                <div className="it-kpi" key={kpi.label}>
                  <div className="it-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                    {kpi.icon}
                  </div>
                  <div>
                    <small>{kpi.label}</small>
                    <strong style={{ color: kpi.color }}>{Number(kpi.value || 0).toLocaleString()}</strong>
                    <span>Live count</span>
                  </div>
                </div>
              ))}
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
              categories={categories}
              onClear={clearFilters}
              activeFilters={activeFilters}
              total={issues.length}
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
              <div className="it-create-panel">
                <div className="it-create-panel-head">
                  <div>
                    <small>Report a Problem</small>
                    <h2>New Issue Report</h2>
                  </div>
                  <button className="it-btn it-btn-soft" onClick={() => setShowCreate(false)}>
                    Close
                  </button>
                </div>

                <div className="it-create-panel-body">
                  <div className="it-create-layout">
                    <IssueCreateForm
                      user={user}
                      categories={categories}
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
            )}

            <IssueTable
              issues={issues}
              loading={loading}
              canAct={canAct}
              canDelete={canDelete}
              currentUser={user}
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
