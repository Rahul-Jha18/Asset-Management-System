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
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --it-blue:#4F46E5;
  --it-blue2:#4338CA;
  --it-blue3:#6366F1;
  --it-violet:#7C3AED;
  --it-brand-grad: linear-gradient(135deg, #a324f7c9  0%, #310877a2 100%);
  --it-red:#E11D48;
  --it-green:#10B981;
  --it-amber:#F59E0B;

  --it-bg:#F4F5FB;
  --it-bg2:#EEEFFA;
  --it-card:#FFFFFF;
  --it-card-soft:#F8F8FD;
  --it-panel:#F1F2FA;

  --it-text:#161328;
  --it-soft-text:#3D3A57;
  --it-muted:#6B6885;
  --it-faint:#9C99B4;
  --it-line:#E7E7F3;
  --it-line-dark:#D6D5EA;

  --it-blue-soft:#EEF0FE;
  --it-green-soft:#E7FBF3;
  --it-amber-soft:#FFF6E7;
  --it-red-soft:#FDECEF;

  --it-shadow-sm:0 1px 2px rgba(30,20,70,.05);
  --it-shadow:0 1px 3px rgba(30,20,70,.05),0 12px 26px rgba(45,27,105,.07);
  --it-shadow-lg:0 20px 50px rgba(45,27,105,.16);
  --it-radius:16px;
  --it-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --it-display:'Sora','Inter',sans-serif;
}

@keyframes it-fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes it-pop-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes it-spin{to{transform:rotate(360deg)}}

.it-page{
  font-family:var(--it-font);
  background:
    radial-gradient(760px 420px at 96% -6%, rgba(124,58,237,.09), transparent 55%),
    linear-gradient(180deg,#F8F8FD 0%,#F4F5FB 48%,#EFF0F9 100%);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow-y:auto;
  overflow-x:hidden;
  border-radius:14px;
  color:var(--it-text);
  padding:14px 16px 30px;
  scrollbar-width:thin;
  scrollbar-color:#C9C7E4 transparent;
}

.it-page::-webkit-scrollbar{width:7px}
.it-page::-webkit-scrollbar-track{background:transparent}
.it-page::-webkit-scrollbar-thumb{background:#C9C7E4;border-radius:999px}
.it-page::-webkit-scrollbar-thumb:hover{background:#B2AFD9}

.it-page-inner{max-width:1400px;margin:0 auto}

.it-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.it-btn{
  border:none;
  border-radius:12px;
  padding:10px 17px;
  font-family:var(--it-font);
  font-weight:750;
  font-size:13px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:transform .16s ease,box-shadow .16s ease;
  white-space:nowrap;
}

.it-btn:hover:not(:disabled){transform:translateY(-1px)}
.it-btn:disabled{opacity:.55;cursor:not-allowed}

.it-btn-primary{background:var(--it-brand-grad);color:white;box-shadow:0 10px 22px rgba(79,70,229,.26)}
.it-btn-danger{background:var(--it-red);color:white;box-shadow:0 10px 22px rgba(225,29,72,.20)}
.it-btn-soft{background:#FFFFFF;color:var(--it-soft-text);border:1px solid var(--it-line);box-shadow:var(--it-shadow-sm)}
.it-btn-soft:hover{background:var(--it-card-soft);border-color:var(--it-line-dark)}
.it-btn-amber{background:var(--it-amber);color:white;box-shadow:0 10px 22px rgba(245,158,11,.20)}

.it-empty-state{padding:66px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--it-muted)}
.it-empty-icon{width:56px;height:56px;border-radius:18px;background:var(--it-card-soft);border:1px solid var(--it-line);position:relative}
.it-empty-icon-search::before{content:"";position:absolute;width:20px;height:20px;border:2px solid var(--it-faint);border-radius:50%;top:12px;left:12px}
.it-empty-icon-search::after{content:"";position:absolute;width:8px;height:2px;background:var(--it-faint);bottom:15px;right:11px;transform:rotate(45deg);border-radius:2px}
.it-empty-state strong{color:var(--it-soft-text);font-family:var(--it-display);font-weight:700}

.it-spinner{width:38px;height:38px;border-radius:50%;border:3px solid var(--it-line);border-top-color:var(--it-blue2);animation:it-spin .8s linear infinite}

.it-detail-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom:16px;
  padding:4px 2px;
}

.it-back{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:999px;
  padding:10px 16px;
  color:var(--it-blue);
  font-family:var(--it-font);
  font-weight:750;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:8px;
  box-shadow:var(--it-shadow-sm);
  transition:.16s ease;
}
.it-back::before{content:"←"}
.it-back:hover{background:var(--it-blue-soft);border-color:#D2D6FA;transform:translateX(-2px)}

.it-detail-layout{
  display:grid;
  grid-template-columns:minmax(0,1fr) 440px;
  gap:20px;
}

.it-detail-stack{display:flex;flex-direction:column;gap:18px}

.it-detail-card-pr{
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:20px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
  animation:it-fade-up .35s ease both;
}

.it-detail-card{
  margin-top:0;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:20px;
  box-shadow:var(--it-shadow);
  overflow:hidden;
  animation:it-fade-up .35s ease both;
}

.it-detail-card-pr .it-detail-card{
  margin-top:0;
  border:none;
  border-radius:0;
  box-shadow:none;
  border-bottom:1px solid var(--it-line);
  animation:none;
}

.it-detail-card-pr .it-detail-card:last-child{border-bottom:none}

.it-detail-header{
  position:relative;
  padding:18px 22px;
  background:linear-gradient(135deg,#F5F4FF 0%,#EEF0FE 100%);
  color:var(--it-text);
  border-bottom:1px solid var(--it-line);
  overflow:hidden;
}

.it-detail-header::before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:3px;
  background:var(--it-brand-grad);
}

.it-detail-header small{
  font-family:var(--it-display);
  text-transform:uppercase;
  letter-spacing:.11em;
  color:var(--it-blue);
  font-weight:700;
  font-size:10px;
}

.it-detail-header h2{
  margin:8px 0 0;
  font-family:var(--it-display);
  letter-spacing:-.02em;
  font-size:1.4rem;
  color:#12102A;
  font-weight:800;
  line-height:1.25;
}

.it-detail-body{padding:20px}

.it-meta-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:11px;
  margin-bottom:20px;
}

.it-meta{
  background:var(--it-card-soft);
  border:1px solid var(--it-line);
  border-radius:15px;
  padding:13px;
  transition:.16s ease;
}
.it-meta:hover{border-color:var(--it-line-dark);background:#F4F4FC}

.it-meta small{
  display:block;
  font-family:var(--it-display);
  text-transform:uppercase;
  letter-spacing:.07em;
  color:var(--it-muted);
  font-weight:700;
  font-size:9.5px;
  margin-bottom:6px;
}

.it-meta strong{
  font-size:13px;
  color:#171532;
  font-weight:700;
}

.it-section-title{
  font-family:var(--it-display);
  text-transform:uppercase;
  letter-spacing:.08em;
  color:var(--it-blue);
  font-size:11px;
  font-weight:750;
  margin:18px 0 10px;
  display:flex;
  align-items:center;
  gap:8px;
}
.it-section-title::before{content:"";width:4px;height:14px;border-radius:3px;background:var(--it-brand-grad)}

.it-text-box{
  background:var(--it-card-soft);
  border:1px solid var(--it-line);
  border-radius:15px;
  padding:16px;
  font-weight:500;
  color:var(--it-soft-text);
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
  border:1px solid var(--it-line-dark)!important;
  padding:7px 9px;
  min-width:0!important;
  max-width:1px;
  word-break:break-word;
  overflow-wrap:anywhere;
  white-space:normal;
  vertical-align:top;
}

.it-text-box table th{background:var(--it-panel);font-weight:750;color:#171532}
.it-text-box a{color:var(--it-blue);text-decoration:underline}

.it-card-subhead{
  padding:15px 18px;
  background:linear-gradient(135deg,#F5F4FF 0%,#EEF0FE 100%);
  border-bottom:1px solid var(--it-line);
  color:#171532;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.it-card-subhead h3{
  margin:0;
  font-family:var(--it-display);
  font-size:14.5px;
  font-weight:750;
  display:flex;
  align-items:center;
  gap:9px;
}

.it-card-subhead span{
  font-size:12px;
  color:var(--it-muted);
  font-weight:700;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:999px;
  padding:4px 10px;
}

.it-subhead-icon{width:26px;height:26px;border-radius:9px;background:var(--it-brand-grad);flex-shrink:0;position:relative}
.it-subhead-icon.attach::before{content:"";position:absolute;width:8px;height:12px;border:2px solid #fff;border-radius:5px;top:6px;left:9px;border-bottom:none;border-right:none;transform:rotate(45deg)}
.it-subhead-icon.timeline::before{content:"";position:absolute;inset:7px;border:2px solid #fff;border-radius:3px}
.it-subhead-icon.chat::before{content:"";position:absolute;width:12px;height:9px;background:#fff;border-radius:5px 5px 5px 1px;top:8px;left:7px}

.it-card-pad{padding:18px}

.it-muted-empty{
  text-align:center;
  color:var(--it-muted);
  background:var(--it-card-soft);
  border:1px solid var(--it-line);
  border-radius:15px;
  padding:20px;
  font-size:13px;
}

/* Attachments and preview modal */
.it-attach-drop{
  border:2px dashed var(--it-line-dark);
  background:var(--it-card-soft);
  border-radius:17px;
  padding:20px;
  text-align:center;
  color:var(--it-blue);
  cursor:pointer;
  margin-bottom:13px;
  display:flex;
  flex-direction:column;
  gap:6px;
  align-items:center;
  transition:.16s ease;
}

.it-attach-drop:hover{background:var(--it-blue-soft);border-color:#B7BBF8}
.it-attach-drop-icon{width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:var(--it-shadow-sm);position:relative;margin-bottom:2px}
.it-attach-drop-icon::before{content:"";position:absolute;width:2px;height:14px;background:var(--it-blue);border-radius:2px;top:12px;left:18px}
.it-attach-drop-icon::after{content:"";position:absolute;width:14px;height:2px;background:var(--it-blue);border-radius:2px;top:18px;left:12px}

.it-attach-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
  gap:12px;
}

.it-attach-card{
  position:relative;
  display:flex;
  gap:12px;
  background:#FFFFFF;
  border:1px solid var(--it-line);
  border-radius:17px;
  padding:12px;
  box-shadow:var(--it-shadow-sm);
  min-width:0;
  transition:.16s ease;
}

.it-attach-card:hover{
  border-color:#C7CBFA;
  box-shadow:0 10px 22px rgba(79,70,229,.10);
  transform:translateY(-1px);
}

.it-attach-thumb{
  width:54px;
  height:54px;
  border-radius:15px;
  background:var(--it-blue-soft);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  overflow:hidden;
  color:var(--it-blue);
  font-weight:900;
  font-size:22px;
}

.it-attach-thumb img{width:100%;height:100%;object-fit:cover;display:block}

.it-attach-info{min-width:0;flex:1}
.it-attach-info strong{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#171532;font-weight:750}
.it-attach-info small{display:block;font-size:11px;color:var(--it-faint);margin-top:3px}

.it-attach-actions{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}

.it-attach-action{
  border:none;
  background:var(--it-blue-soft);
  color:var(--it-blue);
  border-radius:10px;
  padding:6px 9px;
  font-family:var(--it-font);
  font-weight:750;
  font-size:11px;
  cursor:pointer;
  text-decoration:none;
  transition:.14s ease;
}
.it-attach-action:hover{background:#DEE1FB}

.it-attach-action.secondary{
  background:var(--it-card-soft);
  color:var(--it-soft-text);
  border:1px solid var(--it-line);
}
.it-attach-action.secondary:hover{background:#EEEEF7}

.it-preview-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,10,35,.74);
  backdrop-filter:blur(7px);
  z-index:9999;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
  animation:it-pop-in .16s ease both;
}

.it-preview-modal{
  width:min(980px,96vw);
  max-height:92vh;
  background:white;
  border-radius:24px;
  box-shadow:0 32px 90px rgba(0,0,0,.4);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

.it-preview-head{
  padding:15px 19px;
  background:#171235;
  color:white;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.it-preview-title{min-width:0}
.it-preview-title strong{display:block;font-family:var(--it-font);font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:750}
.it-preview-title small{opacity:.7;font-size:11px}
.it-preview-close{border:none;background:rgba(255,255,255,.14);color:white;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:20px;transition:.15s ease}
.it-preview-close:hover{background:rgba(255,255,255,.24)}

.it-preview-body{
  background:#0D0A24;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:280px;
  max-height:75vh;
  overflow:auto;
}

.it-preview-body img{max-width:100%;max-height:75vh;object-fit:contain}
.it-preview-body iframe{width:100%;height:72vh;border:none;background:white}
.it-preview-fallback{color:white;text-align:center;padding:40px}
.it-preview-fallback a{color:#B4B9FC}

.it-activity-compact{
  display:flex;
  flex-direction:column;
  gap:7px;
  max-height:260px;
  overflow-y:auto;
  padding-right:4px;
}

.it-activity-compact::-webkit-scrollbar{width:5px}
.it-activity-compact::-webkit-scrollbar-thumb{background:var(--it-line-dark);border-radius:999px}

.it-timeline-empty-glyph{display:none}

.it-activity-mini{
  display:flex;
  gap:10px;
  padding:10px 11px;
  border-radius:13px;
  background:var(--it-card-soft);
  border:1px solid var(--it-line);
  transition:.14s ease;
}
.it-activity-mini:hover{background:#F1F1FA}

.it-activity-dot{width:9px;height:9px;border-radius:50%;margin-top:5px;flex-shrink:0;background:var(--it-muted)}
.it-activity-green .it-activity-dot{background:var(--it-green)}
.it-activity-blue .it-activity-dot{background:var(--it-blue)}
.it-activity-amber .it-activity-dot{background:var(--it-amber)}
.it-activity-violet .it-activity-dot{background:var(--it-violet)}
.it-activity-slate .it-activity-dot{background:var(--it-muted)}
.it-activity-red .it-activity-dot{background:var(--it-red)}

.it-activity-mini-body{min-width:0;flex:1}
.it-activity-mini-line{display:flex;align-items:center;justify-content:space-between;gap:8px}
.it-activity-mini-line strong{font-size:11.5px;font-weight:750;color:#171532;line-height:1.25}
.it-activity-mini-line small{font-size:10px;color:var(--it-faint);white-space:nowrap}
.it-activity-mini p{margin:3px 0 0;font-size:10.5px;color:var(--it-muted);line-height:1.4}

/* Messages */
.it-message-thread{
  padding:16px;
  display:flex;
  flex-direction:column;
  gap:12px;
  max-height:430px;
  overflow-y:auto;
  background:#FFFFFF;
}

.it-message-empty{
  padding:40px 16px;
  text-align:center;
  color:var(--it-faint);
  display:flex;
  flex-direction:column;
  gap:8px;
  align-items:center;
}
.it-message-empty-glyph{width:44px;height:44px;border-radius:14px;background:var(--it-card-soft);border:1px solid var(--it-line);position:relative}
.it-message-empty-glyph::before{content:"";position:absolute;width:20px;height:14px;border-radius:7px 7px 7px 2px;border:2px solid var(--it-faint);top:12px;left:10px}
.it-message-empty strong{color:var(--it-soft-text)}

.it-message-row{display:flex;gap:9px;align-items:flex-end;max-width:100%}
.it-message-row-mine{flex-direction:row-reverse}
.it-message-avatar{
  width:28px;height:28px;border-radius:9px;flex-shrink:0;
  background:linear-gradient(135deg,#E7E7F8,#F1EEFC);
  color:var(--it-blue2);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--it-display);font-weight:800;font-size:10px;
}

.it-message{
  max-width:82%;
  padding:12px 15px;
  border-radius:17px;
  word-break:break-word;
  box-shadow:var(--it-shadow-sm);
  
}

.it-message-mine{
  background:var(--it-brand-grad);
  border:1px solid transparent;
  border-bottom-right-radius:6px;
  color:rgb(3, 3, 3);
}
.it-message-mine p{color:#fff}
.it-message-mine .it-message-head strong{color:#fff}
.it-message-mine .it-message-head span{background:rgba(255,255,255,.22);color:#fff}
.it-message-mine small{color:rgba(255,255,255,.75)}

.it-message-other{
  align-self:flex-start;
  background:var(--it-card-soft);
  border:1px solid var(--it-line);
  border-bottom-left-radius:6px;
}

.it-message-internal{
  background:var(--it-amber-soft);
  border-color:#FBE1AE;
}
.it-message-mine.it-message-internal{background:linear-gradient(135deg,#F59E0B,#EA580C)}

.it-message-sending{opacity:.65}

.it-message-head{
  display:flex;
  gap:6px;
  align-items:center;
  flex-wrap:wrap;
  margin-bottom:5px;
}

.it-message-head strong{font-family:var(--it-font);font-size:11.5px;font-weight:750}
.it-message-head span{background:var(--it-panel);border-radius:6px;padding:1px 7px;font-size:10px;color:var(--it-muted)}
.it-message-head em{background:#FDE68A;color:#92400E;border-radius:999px;padding:1px 8px;font-style:normal;font-size:9px;font-weight:800}

.it-message p{
  margin:0;
  font-size:13px;
  color:var(--it-soft-text);
  line-height:1.58;
  white-space:pre-wrap;
}

.it-message small{
  display:block;
  margin-top:6px;
  font-size:10px;
  color:var(--it-faint);
  text-align:right;
}

.it-compose{
  border-top:1px solid var(--it-line);
  padding:15px;
  display:flex;
  flex-direction:column;
  gap:10px;
  background:#FFFFFF;
}

.it-internal-toggle{
  font-size:12px;
  color:var(--it-muted);
  display:flex;
  align-items:center;
  gap:7px;
  font-family:var(--it-font);
  font-weight:750;
}

.it-compose textarea{
  border:1px solid var(--it-line-dark);
  background:var(--it-card-soft);
  border-radius:15px;
  min-height:88px;
  padding:13px 14px;
  resize:vertical;
  outline:none;
  font-family:var(--it-font);
  transition:.16s ease;
}

.it-compose textarea:focus{
  border-color:var(--it-blue2);
  background:#fff;
  box-shadow:0 0 0 4px rgba(79,70,229,.10);
}

.it-compose-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.it-compose-actions small{color:var(--it-faint)}

.it-status-form{
  padding:18px;
  display:flex;
  flex-direction:column;
  gap:13px;
  background:#FFFFFF;
}

.it-status-form label{
  font-family:var(--it-display);
  font-size:11px;
  font-weight:750;
  text-transform:uppercase;
  letter-spacing:.06em;
  color:var(--it-soft-text);
}

.it-status-form select,.it-status-form textarea{
  border:1px solid var(--it-line-dark);
  background:var(--it-card-soft);
  border-radius:13px;
  padding:12px 14px;
  font-family:var(--it-font);
  outline:none;
  transition:.16s ease;
}

.it-status-form select:focus,.it-status-form textarea:focus{
  border-color:var(--it-blue2);
  background:#fff;
  box-shadow:0 0 0 4px rgba(79,70,229,.10);
}

.it-status-form textarea{min-height:84px;resize:vertical}

/* Status + priority pill contract (shared with badge components) */
.it-priority-dot{width:6px;height:6px;border-radius:999px;flex-shrink:0}
.it-status,.it-priority{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 11px;font-family:var(--it-font);font-weight:750;font-size:11px;white-space:nowrap}
.it-status-dot{width:6px;height:6px;border-radius:50%}
.it-status-open{background:var(--it-green-soft);color:#047857;border:1px solid #B7F0DA}.it-status-open .it-status-dot{background:var(--it-green)}
.it-status-review{background:var(--it-amber-soft);color:#B45309;border:1px solid #FBE1AE}.it-status-review .it-status-dot{background:var(--it-amber)}
.it-status-closed{background:var(--it-panel);color:var(--it-soft-text);border:1px solid var(--it-line-dark)}.it-status-closed .it-status-dot{background:var(--it-muted)}
.it-priority-low{background:var(--it-panel);color:var(--it-soft-text);border:1px solid var(--it-line-dark)}.it-priority-low .it-priority-dot{background:var(--it-muted)}
.it-priority-medium{background:var(--it-blue-soft);color:var(--it-blue2);border:1px solid #D2D6FA}.it-priority-medium .it-priority-dot{background:var(--it-blue)}
.it-priority-high{background:var(--it-amber-soft);color:#B45309;border:1px solid #FBE1AE}.it-priority-high .it-priority-dot{background:var(--it-amber)}
.it-priority-critical{background:var(--it-red-soft);color:#BE123C;border:1px solid #F8C4CE}.it-priority-critical .it-priority-dot{background:var(--it-red)}

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


/* ─────────────────────────────────────────────────────────────
   NLIC RED + BLUE DETAIL PAGE THEME
   Visual-only overrides. Existing API/data behavior is unchanged.
───────────────────────────────────────────────────────────── */

:root{
  --it-blue:#0057D9;
  --it-blue2:#0047B3;
  --it-blue3:#2F7BFF;
  --it-violet:#0B5BD3;
  --it-brand-grad:linear-gradient(135deg,#0057D9 0%,#0047B3 58%,#E31B3F 100%);
  --it-red:#E31B3F;
  --it-green:#00A676;
  --it-amber:#F59E0B;
  --it-bg:#F5F8FF;
  --it-bg2:#EFF5FF;
  --it-card:#FFFFFF;
  --it-card-soft:#F8FBFF;
  --it-panel:#F0F5FF;
  --it-text:#071A44;
  --it-soft-text:#23375F;
  --it-muted:#66789E;
  --it-faint:#96A4BF;
  --it-line:#DDE7FA;
  --it-line-dark:#C6D5F3;
  --it-blue-soft:#EAF2FF;
  --it-green-soft:#E7FBF3;
  --it-amber-soft:#FFF3DF;
  --it-red-soft:#FDECEF;
  --it-shadow-sm:0 4px 14px rgba(0,57,145,.06);
  --it-shadow:0 10px 32px rgba(0,57,145,.10);
  --it-shadow-lg:0 26px 70px rgba(0,57,145,.18);
  --nlic-mountain-bg:url("../assets/nlic-mountain-bg.png");
}

.it-page{
  background:
    radial-gradient(880px 460px at 96% -8%,rgba(227,27,63,.12),transparent 58%),
    radial-gradient(720px 400px at -8% 5%,rgba(0,87,217,.14),transparent 55%),
    linear-gradient(180deg,#F8FBFF 0%,#F2F6FF 50%,#EEF4FF 100%);
  border-radius:0;
  padding:18px 20px 34px;
}

.it-page-inner{
  max-width:1540px;
}

.it-detail-top{
  margin-bottom:18px;
}

.it-back{
  border-radius:16px;
  padding:13px 18px;
  color:#0057D9;
  border-color:#C9D8F3;
  box-shadow:0 10px 24px rgba(0,57,145,.08);
}

.it-actions .it-btn-primary{
  background:linear-gradient(135deg,#0057D9,#0047B3);
}

.it-detail-layout{
  grid-template-columns:minmax(0,1fr) 470px;
  gap:22px;
}

.it-detail-card-pr,
.it-detail-card{
  border-radius:23px;
  border-color:#DDE7FA;
  box-shadow:0 16px 42px rgba(0,57,145,.10);
}

.it-detail-header{
  min-height:150px;
  padding:26px 28px;
  background:
    linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.84) 50%,rgba(255,255,255,.66) 100%),
    var(--nlic-mountain-bg) center 45%/cover no-repeat;
}

.it-detail-header::before{
  height:100%;
  background:
    linear-gradient(135deg,rgba(0,87,217,.22),transparent 38%),
    linear-gradient(315deg,rgba(227,27,63,.25),transparent 35%);
}

.it-detail-header::after{
  content:"";
  position:absolute;
  right:-82px;
  bottom:-88px;
  width:420px;
  height:160px;
  border-radius:50%;
  background:linear-gradient(135deg,transparent,rgba(227,27,63,.66),rgba(0,87,217,.70));
  opacity:.42;
  pointer-events:none;
}

.it-detail-header > *{
  position:relative;
  z-index:1;
}

.it-brandline{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:16px;
}

.it-logo-emblem{
  width:40px;
  height:40px;
  border-radius:14px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#0057D9,#FFFFFF 48%,#E31B3F);
  color:#073B8E;
  font-family:var(--it-display);
  font-size:10px;
  font-weight:900;
  letter-spacing:.08em;
  box-shadow:0 8px 18px rgba(0,87,217,.18);
}

.it-logo-word{
  display:flex;
  flex-direction:column;
  font-family:var(--it-display);
  color:#0057D9;
  font-weight:900;
  line-height:1;
  font-size:18px;
}

.it-logo-word b{color:#E31B3F}
.it-logo-word small{font-size:7.5px;letter-spacing:.13em;color:#23375F;margin-top:3px;font-weight:800}

.it-detail-header small{
  color:#0057D9;
}

.it-detail-header h2{
  font-size:2rem;
  color:#071A44;
}

.it-detail-body{
  padding:24px;
}

.it-meta-grid{
  gap:16px;
}

.it-meta{
  border-radius:18px;
  background:#FFFFFF;
  border-color:#DDE7FA;
  box-shadow:0 8px 20px rgba(0,57,145,.05);
  padding:17px;
  position:relative;
  overflow:hidden;
}

.it-meta::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:4px;
  background:linear-gradient(180deg,#0057D9,#E31B3F);
  opacity:.75;
}

.it-section-title{
  color:#0057D9;
}

.it-text-box{
  border-radius:18px;
  background:#FFFFFF;
  border-color:#DDE7FA;
  box-shadow:0 8px 20px rgba(0,57,145,.04);
}

.it-card-subhead{
  padding:18px 20px;
  background:linear-gradient(135deg,#FFFFFF 0%,#F1F6FF 70%,#FFF4F7 100%);
  border-bottom-color:#DDE7FA;
  border-top:4px solid #0057D9;
}

.it-card-subhead h3{
  color:#071A44;
}

.it-subhead-icon{
  background:linear-gradient(135deg,#0057D9,#0047B3);
}

.it-card-pad,
.it-compose,
.it-status-form{
  background:#FFFFFF;
}

.it-message-thread{
  background:
    radial-gradient(360px 180px at 70% 20%,rgba(0,87,217,.07),transparent 65%),
    #FFFFFF;
}

.it-message-empty-glyph{
  width:70px;
  height:70px;
  border-radius:28px;
  background:#EEF5FF;
}

.it-message{
  box-shadow:0 8px 20px rgba(0,57,145,.07);
}

.it-message-mine{
  background:linear-gradient(135deg,#0057D9,#0047B3);
  color:white;
}

.it-message-other{
  background:#F8FBFF;
  border-color:#DDE7FA;
}

.it-message-internal{
  background:#FFF7EA;
  border-color:#FBD9A4;
}

.it-compose textarea,
.it-status-form select,
.it-status-form textarea{
  background:#F8FBFF;
  border-color:#C9D8F3;
  border-radius:16px;
}

.it-compose textarea:focus,
.it-status-form select:focus,
.it-status-form textarea:focus{
  border-color:#0057D9;
  box-shadow:0 0 0 4px rgba(0,87,217,.10);
}

.it-btn-primary{
  background:linear-gradient(135deg,#0057D9,#0047B3);
  box-shadow:0 14px 28px rgba(0,87,217,.24);
}

.it-status-form .it-btn-primary,
.it-status-form button[type="submit"]{
  background:linear-gradient(135deg,#E31B3F,#B5122E)!important;
}

.it-attach-drop{
  border-radius:20px;
  border-color:#BFD1F5;
  background:linear-gradient(180deg,#FFFFFF,#F6FAFF);
}

.it-attach-card{
  border-radius:18px;
  border-color:#DDE7FA;
}

.it-attach-thumb{
  background:#EAF2FF;
  color:#0057D9;
}

.it-activity-mini{
  border-radius:16px;
  background:#FFFFFF;
  border-color:#DDE7FA;
  box-shadow:0 6px 16px rgba(0,57,145,.04);
}

.it-activity-dot{
  width:12px;
  height:12px;
  box-shadow:0 0 0 4px rgba(0,87,217,.10);
}

.it-status-open{background:#E7FBF3!important;color:#008B63!important;border-color:#B8F0DC!important}
.it-status-review{background:#EAF2FF!important;color:#0057D9!important;border-color:#C9D8F3!important}
.it-status-closed{background:#F2F4F8!important;color:#475569!important;border-color:#D7DEE9!important}
.it-priority-low{background:#F2F4F8!important;color:#475569!important;border-color:#D7DEE9!important}
.it-priority-medium{background:#EAF2FF!important;color:#0057D9!important;border-color:#C9D8F3!important}
.it-priority-high{background:#FFF3DF!important;color:#C26A00!important;border-color:#FBD9A4!important}
.it-priority-critical{background:#FDECEF!important;color:#E31B3F!important;border-color:#F5B8C6!important}

@media(max-width:1180px){
  .it-detail-layout{grid-template-columns:1fr}
}

@media(max-width:760px){
  .it-detail-header{min-height:auto}
  .it-meta-grid{grid-template-columns:1fr}
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
  const isAssignedUser =
    String(issue?.assigned_to_user_id || "") === String(user?.id || "");
  const isCreator =
    String(issue?.reporter_user_id || "") === String(user?.id || "");

  const canChat = isAdmin || isAssignedUser || isCreator;
  const canChangeStatus = isAssignedUser;
  const canPostInternal = isAdmin;

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
              <div className="it-empty-icon it-empty-icon-search" aria-hidden="true" />
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
                Back to Issue List
              </button>

              <div className="it-actions">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
                <button className="it-btn it-btn-soft" onClick={load}>↻ Refresh</button>
              </div>
            </div>

            <div className="it-detail-layout">
              <div className="it-detail-stack">
                <div className="it-detail-card-pr">
                <div className="it-detail-card">
                  <div className="it-detail-header">
                    <div className="it-brandline">
                      <span className="it-logo-emblem">NLIC</span>
                      <span className="it-logo-word">NEPAL<b>Life</b><small>INSURANCE CO. LTD.</small></span>
                    </div>
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
                        <small>Customer Category / Category</small>
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
                    <h3><span className="it-subhead-icon attach" aria-hidden="true" />Attachments</h3>
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
                    <h3><span className="it-subhead-icon timeline" aria-hidden="true" />Activity Timeline</h3>
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
                    <h3><span className="it-subhead-icon chat" aria-hidden="true" />Conversation</h3>
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
                      <small>Assigned User Actions</small>
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