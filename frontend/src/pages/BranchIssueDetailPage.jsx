import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import IssueStatusBadge from "../components/branchIssues/IssueStatusBadge";
import IssuePriorityBadge from "../components/branchIssues/IssuePriorityBadge";
import IssueMessageThread from "../components/branchIssues/IssueMessageThread";
import IssueActivityLog from "../components/branchIssues/IssueActivityLog";
import IssueAttachmentUpload from "../components/branchIssues/IssueAttachmentUpload";
import {
  getBranchIssue,
  changeBranchIssueStatus,
  addBranchIssueMessage,
  uploadBranchIssueAttachment,
} from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --it-blue:#1D4ED8;
  --it-blue2:#2563EB;
  --it-blue3:#3B82F6;
  --it-red:#DC2626;

  --it-bg:#F3F6FA;
  --it-bg2:#E9EEF5;
  --it-card:#FFFFFF;
  --it-card-soft:#F8FAFC;
  --it-panel:#F1F5F9;

  --it-text:#0F172A;
  --it-soft-text:#334155;
  --it-muted:#64748B;
  --it-faint:#94A3B8;
  --it-line:#E2E8F0;
  --it-line-dark:#CBD5E1;

  --it-blue-soft:#EFF6FF;
  --it-green-soft:#F0FDF4;
  --it-amber-soft:#FFFBEB;
  --it-red-soft:#FEF2F2;

  --it-shadow-sm:0 1px 2px rgba(15,23,42,.05);
  --it-shadow:0 1px 3px rgba(15,23,42,.07),0 10px 25px rgba(15,23,42,.06);
  --it-shadow-lg:0 18px 50px rgba(15,23,42,.12);
  --it-radius:18px;
  --it-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}

.it-page{
  font-family:var(--it-font);
  background:
    linear-gradient(180deg,#F8FAFC 0%,#F3F6FA 48%,#EEF3F8 100%);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow-y:auto;
  overflow-x:hidden;
  border-radius:14px;
  color:var(--it-text);
  padding:12px 14px 28px;
  scrollbar-width:thin;
  scrollbar-color:#CBD5E1 transparent;
}

.it-page::-webkit-scrollbar{width:6px}
.it-page::-webkit-scrollbar-track{background:transparent}
.it-page::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:999px}
.it-page::-webkit-scrollbar-thumb:hover{background:#94A3B8}

.it-page-inner{max-width:1380px;margin:0 auto}

.it-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.it-btn{
  border:none;
  border-radius:11px;
  padding:10px 16px;
  font-family:var(--it-font);
  font-weight:800;
  font-size:13px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:.18s ease;
  white-space:nowrap;
}

.it-btn:hover:not(:disabled){transform:translateY(-1px)}
.it-btn:disabled{opacity:.55;cursor:not-allowed}

.it-btn-primary{
  background:#1D4ED8;
  color:white;
  box-shadow:0 8px 18px rgba(29,78,216,.20);
}

.it-btn-primary:hover{background:#1E40AF}

.it-btn-danger{
  background:#DC2626;
  color:white;
  box-shadow:0 8px 18px rgba(220,38,38,.18);
}

.it-btn-soft{
  background:#FFFFFF;
  color:#334155;
  border:1px solid var(--it-line);
  box-shadow:var(--it-shadow-sm);
}

.it-btn-soft:hover{background:#F8FAFC;border-color:#CBD5E1}

.it-btn-amber{
  background:#D97706;
  color:white;
  box-shadow:0 8px 18px rgba(217,119,6,.18);
}

.it-empty-state{
  padding:64px 20px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:9px;
  color:#64748B;
}

.it-empty-icon{font-size:44px}
.it-empty-state strong{color:#334155;font-family:var(--it-font);font-weight:800}

.it-spinner{
  width:38px;
  height:38px;
  border-radius:50%;
  border:3px solid #E2E8F0;
  border-top-color:var(--it-blue2);
  animation:it-spin .8s linear infinite;
}

@keyframes it-spin{to{transform:rotate(360deg)}}

.it-detail-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom:14px;
  padding:4px 2px;
}

.it-back{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:999px;
  padding:9px 14px;
  color:var(--it-blue);
  font-family:var(--it-font);
  font-weight:800;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:7px;
  box-shadow:var(--it-shadow-sm);
}

.it-back:hover{background:#EFF6FF;border-color:#BFDBFE}

.it-detail-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr) 430px;
  gap:18px;
}

.it-detail-stack{display:flex;flex-direction:column;gap:16px}

.it-detail-card-pr{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border:1px solid rgba(36, 35, 35, 0.25);
  border-radius:18px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
}

.it-detail-card{
  margin-top:10px;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:18px;
  border:1px solid rgba(36, 35, 35, 0.25);
  box-shadow:var(--it-shadow);
  overflow:hidden;
}

.it-detail-card-pr .it-detail-card{
  margin-top:0;
  border:none;
  border-radius:0;
  box-shadow:none;
  border-bottom:1px solid var(--it-line);
}

.it-detail-card-pr .it-detail-card:last-child{border-bottom:none}

.it-detail-header{
  padding:13px 20px;
  background: rgba(74, 95, 107, 0.17);
  color:white;
  border-bottom:1px solid rgba(36, 35, 35, 0.25);

}

.it-detail-header small{
  font-family:var(--it-font);
  text-transform:uppercase;
  letter-spacing:.10em;
  color: rgba(17, 17, 17, 0.8);
  font-weight:800;
  font-size:10px;
}

.it-detail-header h2{
  margin:6px 0 0;
  font-family:var(--it-font);
  letter-spacing:-.025em;
  font-size:1.36rem;
  color:rgba(17, 17, 17, 0.8);
  font-weight:850;
  line-height:1.25;
}

.it-detail-body{padding:18px}

.it-meta-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
  margin-bottom:18px;
}

.it-meta{
  background:rgba(193, 221, 248, 0.33);
  border:1px solid #E2E8F0;
  border-bottom: 1px solid rgba(17, 17, 17, 0.19);
  border-radius:14px;
  
  padding:12px;
}

.it-meta small{
  display:block;
  font-family:var(--it-font);
  text-transform:uppercase;
  letter-spacing:.07em;
  color:#64748B;
  font-weight:800;
  font-size:9.5px;
  margin-bottom:5px;
}

.it-meta strong{
  font-size:13px;
  color:#1E293B;
  font-weight:750;
}

.it-section-title{
  font-family:var(--it-font);
  text-transform:uppercase;
  letter-spacing:.07em;
  color:#1D4ED8;
  font-size:11px;
  font-weight:850;
  margin:16px 0 10px;
}

.it-text-box{
  background:rgba(193, 221, 248, 0.33);
  border:1px solid #E2E8F0;
  border: 1px solid rgba(17, 17, 17, 0.19);
  border-radius:14px;
  padding:15px;
  font-weight:500;
  color:#334155;
  font-size:14px;
  line-height:1.7;
  white-space:normal;
  max-width:100%;
  overflow-x:hidden;
}

.it-text-box p{margin:0 0 8px}
.it-text-box ul,.it-text-box ol{margin:8px 0;padding-left:22px}

.it-text-box table{
  width:100%!important;
  max-width:100%!important;
  table-layout:fixed!important;
  border-collapse:collapse!important;
  margin:10px 0;
}

.it-text-box table td,.it-text-box table th{
  border:1px solid #CBD5E1!important;
  padding:7px 9px;
  min-width:0!important;
  max-width:1px;
  word-break:break-word;
  overflow-wrap:anywhere;
  white-space:normal;
  vertical-align:top;
}

.it-text-box table th{background:#F1F5F9;font-weight:800;color:#0F172A}
.it-text-box a{color:#1D4ED8;text-decoration:underline}

.it-card-subhead{
  padding:14px 17px;
  background: rgba(74, 95, 107, 0.17);
  border-bottom:1px solid #696a6b83;
  border-top: none !important ;
  color:#0F172A;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.it-card-subhead h3{
  margin:0;
  font-family:var(--it-font);
  font-size:15px;
  font-weight:850;
}

.it-card-subhead span{
  font-size:12px;
  color:#64748B;
  font-weight:700;
}

.it-card-pad{padding:16px}

.it-muted-empty{
  text-align:center;
  color:#64748B;
  background:#F8FAFC;
  border:1px solid #E2E8F0;
  border-radius:14px;
  padding:18px;
  font-size:13px;
}

/* Attachments and preview modal */
.it-attach-drop{
  border:2px dashed #CBD5E1;
  background:#F8FAFC;
  border-radius:16px;
  padding:18px;
  text-align:center;
  color:#1D4ED8;
  cursor:pointer;
  margin-bottom:12px;
  display:flex;
  flex-direction:column;
  gap:5px;
}

.it-attach-drop:hover{background:#EFF6FF;border-color:#93C5FD}

.it-attach-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:11px;
}

.it-attach-card{
  position:relative;
  display:flex;
  gap:11px;
  background:#FFFFFF;
  border:1px solid #E2E8F0;
  border-radius:16px;
  padding:11px;
  box-shadow:var(--it-shadow-sm);
  min-width:0;
}

.it-attach-card:hover{
  border-color:#BFDBFE;
  box-shadow:0 8px 18px rgba(37,99,235,.08);
}

.it-attach-thumb{
  width:52px;
  height:52px;
  border-radius:14px;
  background:#EFF6FF;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  overflow:hidden;
  color:#1D4ED8;
  font-weight:900;
}

.it-attach-thumb img{width:100%;height:100%;object-fit:cover;display:block}

.it-attach-info{min-width:0;flex:1}
.it-attach-info strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0F172A;font-weight:800}
.it-attach-info small{display:block;font-size:11px;color:#94A3B8;margin-top:3px}

.it-attach-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}

.it-attach-action{
  border:none;
  background:#EFF6FF;
  color:#1D4ED8;
  border-radius:9px;
  padding:5px 8px;
  font-family:var(--it-font);
  font-weight:800;
  font-size:11px;
  cursor:pointer;
  text-decoration:none;
}

.it-attach-action.secondary{
  background:#F8FAFC;
  color:#475569;
  border:1px solid #E2E8F0;
}

.it-preview-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.72);
  backdrop-filter:blur(6px);
  z-index:9999;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
}

.it-preview-modal{
  width:min(980px,96vw);
  max-height:92vh;
  background:white;
  border-radius:22px;
  box-shadow:0 30px 90px rgba(0,0,0,.35);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

.it-preview-head{
  padding:14px 18px;
  background:#111827;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-preview-title{min-width:0}
.it-preview-title strong{display:block;font-family:var(--it-font);font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:850}
.it-preview-title small{opacity:.75;font-size:11px}
.it-preview-close{border:none;background:rgba(255,255,255,.14);color:white;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:20px}

.it-preview-body{
  background:#0B1120;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:280px;
  max-height:75vh;
  overflow:auto;
}

.it-preview-body img{max-width:100%;max-height:75vh;object-fit:contain}
.it-preview-body iframe{width:100%;height:72vh;border:none;background:white}
.it-preview-fallback{color:white;text-align:center;padding:38px}
.it-preview-fallback a{color:#93C5FD}

.it-activity-compact{
  display:flex;
  flex-direction:column;
  gap:6px;
  max-height:230px;
  overflow-y:auto;
  padding-right:4px;
}

.it-activity-compact::-webkit-scrollbar{width:5px}
.it-activity-compact::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:999px}

.it-activity-mini{
  display:flex;
  gap:9px;
  padding:9px 10px;
  border-radius:12px;
  background:#F8FAFC;
  border:1px solid #E2E8F0;
}

.it-activity-dot{width:9px;height:9px;border-radius:50%;border:2px solid;margin-top:5px;flex-shrink:0}
.it-activity-mini-body{min-width:0;flex:1}
.it-activity-mini-line{display:flex;align-items:center;justify-content:space-between;gap:8px}
.it-activity-mini-line strong{font-size:11.5px;font-weight:800;color:#0F172A;line-height:1.25}
.it-activity-mini-line small{font-size:10px;color:#94A3B8;white-space:nowrap}
.it-activity-mini p{margin:2px 0 0;font-size:10.5px;color:#64748B;line-height:1.35}

/* Messages */
.it-message-thread{
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:10px;
  max-height:430px;
  overflow-y:auto;
  background:#FFFFFF;
}

.it-message-empty{
  padding:38px 16px;
  text-align:center;
  color:#94A3B8;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.it-message-empty div{font-size:34px}
.it-message-empty strong{color:#475569}

.it-message{
  max-width:88%;
  padding:11px 14px;
  border-radius:16px;
  word-break:break-word;
  box-shadow:var(--it-shadow-sm);
}

.it-message-mine{
  align-self:flex-end;
  background:#EFF6FF;
  border:1px solid #BFDBFE;
  border-bottom-right-radius:6px;
}

.it-message-other{
  align-self:flex-start;
  background:#F8FAFC;
  border:1px solid #E2E8F0;
  border-bottom-left-radius:6px;
}

.it-message-internal{
  background:#FFFBEB;
  border-color:#FDE68A;
}

.it-message-sending{opacity:.65}

.it-message-head{
  display:flex;
  gap:6px;
  align-items:center;
  flex-wrap:wrap;
  margin-bottom:5px;
}

.it-message-head strong{font-family:var(--it-font);font-size:11.5px;font-weight:800}
.it-message-head span{background:#E2E8F0;border-radius:6px;padding:1px 6px;font-size:10px;color:#64748B}
.it-message-head em{background:#FDE68A;color:#92400E;border-radius:999px;padding:1px 7px;font-style:normal;font-size:9px;font-weight:900}

.it-message p{
  margin:0;
  font-size:13px;
  color:#334155;
  line-height:1.58;
  white-space:pre-wrap;
}

.it-message small{
  display:block;
  margin-top:6px;
  font-size:10px;
  color:#94A3B8;
  text-align:right;
}

.it-compose{
  border-top:1px solid #E2E8F0;
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:9px;
  background:#FFFFFF;
}

.it-internal-toggle{
  font-size:12px;
  color:#64748B;
  display:flex;
  align-items:center;
  gap:7px;
  font-family:var(--it-font);
  font-weight:800;
}

.it-compose textarea{
  border:1px solid #CBD5E1;
  background:#F8FAFC;
  border-radius:14px;
  min-height:86px;
  padding:12px 13px;
  resize:vertical;
  outline:none;
  font-family:var(--it-font);
}

.it-compose textarea:focus{
  border-color:var(--it-blue2);
  box-shadow:0 0 0 3px rgba(37,99,235,.10);
}

.it-compose-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.it-compose-actions small{color:#94A3B8}

.it-status-form{
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:12px;
  background:#FFFFFF;
}

.it-status-form label{
  font-family:var(--it-font);
  font-size:11px;
  font-weight:850;
  text-transform:uppercase;
  letter-spacing:.06em;
  color:#475569;
}

.it-status-form select,.it-status-form textarea{
  border:1px solid #CBD5E1;
  background:#F8FAFC;
  border-radius:12px;
  padding:11px 13px;
  font-family:var(--it-font);
  outline:none;
}

.it-status-form select:focus,.it-status-form textarea:focus{
  border-color:var(--it-blue2);
  box-shadow:0 0 0 3px rgba(37,99,235,.10);
}

.it-status-form textarea{min-height:84px;resize:vertical}

@media(max-width:1150px){
  .it-detail-layout{grid-template-columns:1fr}
  .it-meta-grid{grid-template-columns:repeat(2,1fr)}
}

@media(max-width:760px){
  .it-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:16px 12px}
  .it-detail-top{align-items:flex-start}
  .it-meta-grid{grid-template-columns:1fr}
  .it-message{max-width:96%}
}

@media(max-width:480px){
  .it-actions{width:100%}
  .it-btn{width:100%}
  .it-preview-backdrop{padding:10px}
  .it-preview-modal{width:100vw;max-height:94vh;border-radius:18px}
}
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
    { label: "Users", path: "/admin/users", icon: makeIcon(NAV_ICONS.users), show: isAdmin },
  ].filter((item) => item.show !== false);
};


const normalizeIssueType = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const getIssueTypeLabel = (issue) => {
  const raw =
    issue?.issue_type ??
    issue?.issueType ??
    issue?.type ??
    issue?.issueCategoryType ??
    issue?.issue_category_type ??
    "Employee";

  const normalized = normalizeIssueType(raw);

  return normalized === "customer" || normalized === "customerissue"
    ? "Customer"
    : "Employee";
};

const getIssueCustomerCategory = (issue) =>
  String(
    issue?.customer_category_name ??
      issue?.customerCategoryName ??
      issue?.custom_category_name ??
      issue?.customCategoryName ??
      issue?.issue_category_name ??
      issue?.issueCategoryName ??
      ""
  ).trim();


const getAssignedToName = (issue) =>
  String(
    issue?.assigned_to_name ??
      issue?.assignedToName ??
      issue?.assigned_user?.name ??
      issue?.assignedUser?.name ??
      issue?.assigned_to_user?.name ??
      issue?.assignedToUser?.name ??
      issue?.assigned_to_email ??
      issue?.assigned_user?.email ??
      issue?.assignedUser?.email ??
      ""
  ).trim();

const getAssignedToDisplay = (issue) => {
  const name = getAssignedToName(issue);

  if (name) return name;

  if (issue?.assigned_to_user_id) {
    return `User #${issue.assigned_to_user_id}`;
  }

  return "—";
};

export default function BranchIssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const navItems = getIssueTrackerNavItems(user);

  const role = String(user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin = role === "admin";
  const isCorpUser = role === "corpuser";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const [msg, setMsg] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  const [attLoading, setAttLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBranchIssue(id);
      setData(res?.data || null);
      setNewStatus(res?.data?.issue?.status || "Open");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load issue");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        getBranchIssue(id)
          .then((res) => {
            setData((prev) => {
              if (!prev) return res?.data || prev;

              return {
                ...prev,
                issue: res?.data?.issue || prev.issue,
                messages: res?.data?.messages || prev.messages || [],
                logs: res?.data?.logs || prev.logs || [],
                attachments: res?.data?.attachments || prev.attachments || [],
              };
            });
          })
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [id]);

  const issue = data?.issue;

  // Issue-specific permission flags
  const isAssignedCorpUser = isCorpUser && String(issue?.assigned_to_user_id) === String(user?.id);
  const isCreator = String(issue?.reporter_user_id) === String(user?.id);

  const canChat = isAdmin || isAssignedCorpUser || isCreator;
  const canChangeStatus = isAssignedCorpUser; // admin can chat but NOT change status
  const canPostInternal = isAdmin || isAssignedCorpUser;

  const handleStatusChange = async () => {
    if (!newStatus) return;

    try {
      setStatusLoading(true);
      await changeBranchIssueStatus(id, newStatus, statusRemark);
      setStatusRemark("");
      await load();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSendMsg = async () => {
    const text = msg.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const wasInternal = !!isInternal;

    const optimisticMessage = {
      id: tempId,
      issue_id: Number(id),
      sender_user_id: user?.id || null,
      sender_name: user?.name || user?.email || "You",
      sender_role: user?.role || "user",
      message: text,
      is_internal: wasInternal,
      created_at: new Date().toISOString(),
      _sending: true,
    };

    try {
      setMsgLoading(true);
      setMsg("");
      setIsInternal(false);

      setData((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), optimisticMessage],
      }));

      const res = await addBranchIssueMessage(id, text, wasInternal);
      const savedMsg = res?.data?.msg;

      if (savedMsg) {
        setData((prev) => ({
          ...prev,
          messages: (prev?.messages || []).map((message) =>
            message.id === tempId ? savedMsg : message
          ),
        }));
      }
    } catch (error) {
      setData((prev) => ({
        ...prev,
        messages: (prev?.messages || []).filter((message) => message.id !== tempId),
      }));

      alert(error?.response?.data?.message || "Failed to send message");
    } finally {
      setMsgLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setAttLoading(true);
      await uploadBranchIssueAttachment(id, file);
      await load();
    } catch (error) {
      alert(error?.response?.data?.message || "File upload failed");
    } finally {
      setAttLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SplitSidebarLayout navItems={navItems} user={user}>
          <div className="it-page">
            <style>{FONTS}{CSS}</style>
            <div className="it-empty-state">
              <div className="it-spinner" />
              <strong>Loading issue...</strong>
            </div>
          </div>
        </SplitSidebarLayout>
        <Footer />
      </>
    );
  }

  if (!issue) {
    return (
      <>
        <SplitSidebarLayout navItems={navItems} user={user}>
          <div className="it-page">
            <style>{FONTS}{CSS}</style>
            <div className="it-empty-state">
              <div className="it-empty-icon">🔍</div>
              <strong>Issue not found</strong>
              <button className="it-btn it-btn-primary" onClick={() => navigate("/branch-issues")}>
                Back to Issues
              </button>
            </div>
          </div>
        </SplitSidebarLayout>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="it-page">
          <style>{FONTS}{CSS}</style>

          <div className="it-page-inner">
            <div className="it-detail-top">
              <button className="it-back" onClick={() => navigate("/branch-issues")}>
                ← Back to Issue List
              </button>

              <div className="it-actions">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
                <button className="it-btn it-btn-soft" onClick={load}>Refresh</button>
              </div>
            </div>

            <div className="it-detail-layout">
              <div className="it-detail-stack">
                <div className="it-detail-card-pr">
                <div className="it-detail-card">
                  <div className="it-detail-header">
                    <small>{issue.category?.name || "Issue"}</small>
                    <h2>{issue.title}</h2>
                  </div>

                  <div className="it-detail-body">
                    <div className="it-meta-grid">
                      <div className="it-meta">
                        <small>Ticket No</small>
                        <strong>{issue.ticket_no}</strong>
                      </div>

                      <div className="it-meta">
                        <small>Reported By</small>
                        <strong>{issue.reporter_name || issue.reporter_email || "—"}</strong>
                      </div>

                      <div className="it-meta">
                        <small>Assigned To</small>
                        <strong>{getAssignedToDisplay(issue)}</strong>
                      </div>

                      <div className="it-meta">
                        <small>Priority</small>
                        <IssuePriorityBadge priority={issue.priority} />
                      </div>

                      <div className="it-meta">
                        <small>Status</small>
                        <IssueStatusBadge status={issue.status} />
                      </div>

                      <div className="it-meta">
                        <small>Issue Type</small>
                        <strong>{getIssueTypeLabel(issue)}</strong>
                      </div>

                      <div className="it-meta">
                        <small>Category</small>
                        <strong>
                          {getIssueTypeLabel(issue) === "Customer"
                            ? getIssueCustomerCategory(issue) || issue.category?.name || "Customer Issue"
                            : issue.category?.name || "—"}
                        </strong>
                      </div>

                      <div className="it-meta">
                        <small>Submitted</small>
                        <strong>{issue.created_at ? new Date(issue.created_at).toLocaleString("en-NP") : "—"}</strong>
                      </div>

                      {issue.closed_at && (
                        <div className="it-meta">
                          <small>Closed</small>
                          <strong>{new Date(issue.closed_at).toLocaleString("en-NP")}</strong>
                        </div>
                      )}
                    </div>

                    <div className="it-section-title">Issue Description</div>
                    <div
                      className="it-text-box"
                      dangerouslySetInnerHTML={{ __html: issue.description || "" }}
                    />

                    {issue.expected_outcome && (
                      <>
                        <div className="it-section-title">Expected Outcome</div>
                        <div className="it-text-box">{issue.expected_outcome}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="it-detail-card">
                  <div className="it-card-subhead">
                    <h3>📎 Attachments</h3>
                    <span>{(data?.attachments || []).length} file(s)</span>
                  </div>

                  <div className="it-card-pad">
                    <IssueAttachmentUpload
                      attachments={data?.attachments || []}
                      onUpload={handleFileUpload}
                      loading={attLoading}
                      issueStatus={issue.status}
                    />
                  </div>
                </div>
                </div>

                <div className="it-detail-card">
                  <div className="it-card-subhead">
                    <h3>📋 Activity Timeline</h3>
                    <span>{(data?.logs || []).length} item(s)</span>
                  </div>

                  <div className="it-card-pad">
                    <IssueActivityLog logs={data?.logs || []} />
                  </div>
                </div>
              </div>

              <div className="it-detail-stack">
                <div className="it-detail-card">
                  <div className="it-card-subhead">
                    <h3>💬 Conversation</h3>
                    <span>{(data?.messages || []).length} message(s)</span>
                  </div>

                  <IssueMessageThread messages={data?.messages || []} currentUser={user} />

                  {!canChat ? (
                    <div className="it-muted-empty" style={{ margin: 16 }}>
                      You don't have permission to message on this issue.
                    </div>
                  ) : issue.status !== "Closed" ? (
                    <div className="it-compose">
                      {canPostInternal && (
                        <label className="it-internal-toggle">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                          />
                          Internal note
                        </label>
                      )}

                      <textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder={isInternal ? "Write an internal note..." : "Write a message..."}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleSendMsg();
                          }
                        }}
                      />

                      <div className="it-compose-actions">
                        <small>Ctrl + Enter to send</small>
                        <button
                          className="it-btn it-btn-primary"
                          disabled={!msg.trim() || msgLoading}
                          onClick={handleSendMsg}
                        >
                          {msgLoading ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="it-muted-empty" style={{ margin: 16 }}>
                      This issue is closed. New messages are disabled.
                    </div>
                  )}
                </div>

                {canChangeStatus && (
                  <div className="it-detail-card">
                    <div className="it-detail-header">
                      <small>Corporate User Actions</small>
                      <h2>Change Status</h2>
                    </div>

                    <div className="it-status-form">
                      <label>New Status</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="Open">Open</option>
                        <option value="UnderReview">Under Review</option>
                        <option value="Closed">Closed</option>
                      </select>

                      <label>Remarks</label>
                      <textarea
                        value={statusRemark}
                        onChange={(e) => setStatusRemark(e.target.value)}
                        placeholder="Add remarks for this status change..."
                        maxLength={500}
                      />

                      <button
                        className={`it-btn ${newStatus === "Closed" ? "it-btn-primary" : "it-btn-amber"}`}
                        disabled={statusLoading || newStatus === issue.status}
                        onClick={handleStatusChange}
                      >
                        {statusLoading ? "Updating..." : "Update Status"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SplitSidebarLayout>
      <Footer />
    </>
  );
}