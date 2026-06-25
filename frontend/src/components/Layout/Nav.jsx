// src/components/Layout/Nav.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Logo from "../../assets/nepallife.png"

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap');`;

const CSS = `
${FONTS}
:root{
  --nb:   #0B5CAB;
  --nb2:  #1474F3;
  --nr:   #E11D2E;
  --nsur: #0d1117;
  --nnav: rgba(40, 64, 90, 0.94);
  --nbor: rgba(255,255,255,0.07);
  --nw78: rgba(255,255,255,0.78);
  --ngr:  linear-gradient(135deg,#0B5CAB 0%,#1474F3 55%,#E11D2E 100%);
  --ngb:  linear-gradient(135deg,rgba(3, 17, 44, 0.88),rgba(2, 13, 34, 0.94));
}

/* NAV BAR */
.nb{font-family:'DM Sans',sans-serif;position:sticky;top:0;z-index:200;height:62px;
  background:var(--nnav);border-bottom:1px solid var(--nbor);
  backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);
  box-shadow:0 1px 0 rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.4);}
.nb::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ngr);opacity:.9;}
.nb-in{max-width:1320px;margin:0 auto;height:100%;padding:0 20px;display:flex;align-items:center;gap:14px;}

/* LOGO */
.nb-logo{
  display:flex;
  flex-direction: column;
  align-items:center;
  gap:10px;   
  padding:6px 10px;
  text-decoration:none;
  flex-shrink:0;
  user-select:none;
  background:rgba(197, 193, 193, 0.16);
  border-radius:12px;

  box-shadow:
    0 0 0 1px rgba(10,76,149,0.08),
    0 4px 14px rgba(0,0,0,0.12);
}

.nb-mark{
  width:34px;
  height:34px;
  border-radius:9px;

  background:linear-gradient(
    135deg,
    #0a4c95 0%,
    #0d5cb6 100%
  );

  display:flex;
  align-items:center;
  justify-content:center;

  font-family:'Syne',sans-serif;
  font-weight:900;
  font-size:12px;
  color:#fff;
  flex-shrink:0;

  box-shadow:
    0 0 0 1px rgba(255,255,255,0.25),
    0 4px 14px rgba(10,76,149,0.25);
}

.nb-name{
  display:flex;
  flex-direction: column;
  font-family:'Syne',sans-serif;
  font-size:10px;
  letter-spacing:-0.025em;
  color:rgb(255, 255, 255);
}

.nb-name .r{
  font-size:16px;
  font-weight: 900;
  color:#d71920; /* LIFE red */
}

.nb-name strong{
  font-size:16px;
  color:#0a4c95 !important; /* NEPAL blue */
}

.nb-sp{
  flex:1;
}



/* DESKTOP LINKS */
.nb-links{display:flex;align-items:center;gap:2px;}
.nb-lnk{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:10px;
  font-size:13px;font-weight:600;color:var(--nw78);text-decoration:none;white-space:nowrap;
  border:1px solid transparent;transition:color .18s,background .18s,border-color .18s;position:relative;}
.nb-lnk:hover{color:#fff;background:rgba(255,255,255,0.07);}
.nb-lnk.active{color:#fff;background:rgba(20,116,243,0.15);border-color:rgba(20,116,243,0.30);}
.nb-lnk.active::after{content:'';position:absolute;bottom:-1px;left:50%;transform:translateX(-50%);
  width:20px;height:2px;border-radius:99px;background:var(--nb2);}
.nb-ico{opacity:.70;display:flex;align-items:center;transition:opacity .18s;}
.nb-lnk:hover .nb-ico,.nb-lnk.active .nb-ico{opacity:1;}

/* ACTIONS */
.nb-act{display:flex;align-items:center;gap:8px;}

/* AVATAR */
.nb-av{border-radius:50%;object-fit:cover;flex-shrink:0;}
.nb-av-fb{border-radius:50%;background:linear-gradient(135deg,#1474F3,#7c3aed);display:flex;align-items:center;
  justify-content:center;font-family:'Syne',sans-serif;font-weight:800;color:#fff;
  border:2px solid rgba(255,255,255,0.10);flex-shrink:0;}

/* BELL */
.nb-bell{position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;
  border-radius:11px;background:rgba(255,255,255,0.05);border:1px solid var(--nbor);cursor:pointer;
  text-decoration:none;color:rgba(248,229,30,0.88);transition:background .18s,border-color .18s;}
.nb-bell:hover{background:rgba(255,255,255,0.10);border-color:rgba(255,255,255,0.14);}
.nb-bell-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:999px;
  background:linear-gradient(135deg,#ef4444,#dc2626);font-size:10px;font-weight:900;color:#fff;
  display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid var(--nsur);
  box-shadow:0 2px 8px rgba(239,68,68,0.55);}
@keyframes nbWig{0%,100%{transform:rotate(0)}20%{transform:rotate(16deg)}40%{transform:rotate(-13deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-5deg)}}
.nb-bell-wig svg{animation:nbWig .65s ease;}

/* USER BTN */
.nb-usr{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,0.05);border:1px solid var(--nbor);
  border-radius:11px;padding:5px 11px 5px 6px;cursor:pointer;color:#fff;transition:background .18s,border-color .18s;}
.nb-usr:hover{background:rgba(255,255,255,0.10);border-color:rgba(255,255,255,0.14);}
.nb-uname{font-size:13px;font-weight:600;color:var(--nw78);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nb-chev{color:rgba(255,255,255,0.38);transition:transform .2s;}
.nb-chev.open{transform:rotate(180deg);}

/* ROLE CHIP */
.nb-role{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  padding:2px 8px;border-radius:6px;font-family:'Outfit',sans-serif;margin-top:5px;}

/* DROPDOWN */
@keyframes nbDrop{from{opacity:0;transform:translateY(-8px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.nb-drop{position:absolute;top:calc(100% + 10px);right:0;min-width:252px;background:#0d1117;
  border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:8px;
  box-shadow:0 24px 60px rgba(0,0,0,0.70),0 0 0 1px rgba(255,255,255,0.04) inset;
  animation:nbDrop .2s ease;z-index:500;}
.nb-dhead{padding:10px 12px 12px;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:6px;display:flex;align-items:center;gap:11px;}
.nb-dinfo{flex:1;min-width:0;}
.nb-dname{font-size:13.5px;font-weight:800;color:#fff;font-family:'Syne',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nb-demail{font-size:11px;color:rgba(255,255,255,0.32);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nb-ditem{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;font-size:13px;
  font-weight:600;color:rgba(255,255,255,0.65);cursor:pointer;transition:background .15s,color .15s;
  border:none;background:none;width:100%;text-align:left;text-decoration:none;font-family:'DM Sans',sans-serif;}
.nb-ditem:hover{background:rgba(255,255,255,0.08);color:#fff;}
.nb-ditem.danger:hover{background:rgba(239,68,68,0.12);color:#f87171;}
.nb-ditem svg{opacity:.68;}
.nb-ddiv{height:1px;background:rgba(255,255,255,0.07);margin:5px 0;}

/* SIGN IN */
.nb-signin{background:var(--ngb);border:none;border-radius:10px;padding:9px 18px;font-size:13px;
  font-weight:700;color:#fff;cursor:pointer;font-family:'Outfit',sans-serif;
  box-shadow:0 4px 16px rgba(20,116,243,0.35);transition:opacity .18s,transform .18s;}
.nb-signin:hover{opacity:.88;transform:translateY(-1px);}

/* HAMBURGER */
.nb-burg{display:none;width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,0.06);
  border:1px solid var(--nbor);cursor:pointer;color:var(--nw78);align-items:center;justify-content:center;transition:background .18s;}
.nb-burg:hover{background:rgba(255,255,255,0.11);}

/* OVERLAY */
.nb-ov{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(5px);z-index:290;
  opacity:0;pointer-events:none;transition:opacity .25s;}
.nb-ov.open{opacity:1;pointer-events:all;}

/* DRAWER */
.nb-drawer{position:fixed;top:0;right:0;bottom:0;width:min(360px,88vw);background:#080e1c;
  border-left:1px solid rgba(255,255,255,0.07);transform:translateX(105%);
  transition:transform .35s cubic-bezier(.4,0,.2,1);z-index:300;display:flex;flex-direction:column;
  padding:18px 16px;overflow-y:auto;box-shadow:-24px 0 80px rgba(0,0,0,0.65);}
.nb-drawer.open{transform:translateX(0);}
.nb-drhd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.nb-drtitle{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#fff;}
.nb-drclose{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,0.06);
  border:1px solid var(--nbor);cursor:pointer;color:rgba(255,255,255,0.65);display:flex;align-items:center;justify-content:center;}
.nb-druser{display:flex;align-items:center;gap:12px;padding:13px;background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-bottom:12px;cursor:pointer;transition:background .18s;}
.nb-druser:hover{background:rgba(255,255,255,0.07);}
.nb-druname{font-size:13px;font-weight:800;color:#fff;font-family:'Syne',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nb-dremail{font-size:11px;color:rgba(255,255,255,0.38);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.nb-drsep{height:1px;background:rgba(255,255,255,0.07);margin:8px 0 14px;}
.nb-drlnk{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:12px;font-size:13.5px;
  font-weight:600;color:rgba(255,255,255,0.58);text-decoration:none;border:1px solid transparent;
  transition:all .18s;margin-bottom:3px;}
.nb-drlnk:hover{color:#fff;background:rgba(255,255,255,0.06);}
.nb-drlnk.active{color:#fff;background:rgba(20,116,243,0.13);border-color:rgba(20,116,243,0.26);}
.nb-drico{opacity:.68;display:flex;align-items:center;}
.nb-drlnk:hover .nb-drico,.nb-drlnk.active .nb-drico{opacity:1;}
.nb-drsp{flex:1;}
.nb-drlogout{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;font-size:14px;
  font-weight:700;color:#f87171;cursor:pointer;background:rgba(239,68,68,0.07);
  border:1px solid rgba(239,68,68,0.18);width:100%;transition:background .18s;font-family:'DM Sans',sans-serif;}
.nb-drlogout:hover{background:rgba(239,68,68,0.14);}

/* TICKER */
.nb-ticker{background:rgba(5,23,51,0.72);border-bottom:1px solid rgba(20,116,243,0.18);height:32px;display:flex;align-items:center;overflow:hidden;}
@keyframes nbTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.nb-ttrack{display:inline-flex;white-space:nowrap;animation:nbTick 32s linear infinite;}
.nb-ttrack:hover{animation-play-state:paused;}
.nb-titem{font-size:12.5px;color:rgba(255,255,255,0.78);padding:0 44px;display:inline-flex;align-items:center;gap:9px;font-family:'Outfit',sans-serif;font-weight:600;}
.nb-ttag{font-size:10px;font-weight:800;color:#60a5fa;letter-spacing:.09em;text-transform:uppercase;}

/* PROFILE MODAL */
@keyframes pBack{from{opacity:0}to{opacity:1}}
@keyframes pUp{from{opacity:0;transform:translate(-50%,-48%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes pSpin{to{transform:rotate(360deg)}}
.p-back{position:fixed;inset:0;background:rgba(0,0,0,0.80);backdrop-filter:blur(12px);z-index:998;animation:pBack .22s ease;}
.p-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999;width:min(820px,95vw);
  background:#080e1c;border:1px solid rgba(255,255,255,0.09);border-radius:26px;
  box-shadow:0 40px 120px rgba(0,0,0,0.90),0 0 0 1px rgba(255,255,255,0.04) inset;
  animation:pUp .32s cubic-bezier(.34,1.56,.64,1);overflow:hidden;display:flex;max-height:90vh;}
.p-side{width:230px;flex-shrink:0;background:rgba(255,255,255,0.025);border-right:1px solid rgba(255,255,255,0.07);padding:28px 0 20px;display:flex;flex-direction:column;}
.p-avwrap{display:flex;flex-direction:column;align-items:center;padding:0 20px 22px;border-bottom:1px solid rgba(255,255,255,0.07);}
.p-avring{position:relative;margin-bottom:14px;}
.p-avimg{width:84px;height:84px;border-radius:50%;object-fit:cover;border:3px solid rgba(20,116,243,0.40);box-shadow:0 0 0 5px rgba(20,116,243,0.10),0 8px 28px rgba(0,0,0,0.55);}
.p-avfb{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#1474F3,#7c3aed);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:900;font-size:28px;color:#fff;border:3px solid rgba(20,116,243,0.40);box-shadow:0 0 0 5px rgba(20,116,243,0.10),0 8px 28px rgba(0,0,0,0.55);}
.p-cam{position:absolute;bottom:2px;right:2px;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1474F3,#6366f1);border:3px solid #080e1c;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 12px rgba(20,116,243,0.55);transition:transform .2s;}
.p-cam:hover{transform:scale(1.12);}
.p-sname{font-family:'Syne',sans-serif;font-weight:900;font-size:15px;color:#fff;text-align:center;margin-bottom:3px;}
.p-semail{font-size:11px;color:rgba(255,255,255,0.30);text-align:center;margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:185px;}
.p-tabs{padding:14px 12px 0;flex:1;}
.p-tab{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.46);cursor:pointer;transition:all .18s;border:1px solid transparent;background:none;width:100%;text-align:left;margin-bottom:3px;font-family:'DM Sans',sans-serif;}
.p-tab:hover{color:#fff;background:rgba(255,255,255,0.06);}
.p-tab.on{color:#fff;background:rgba(20,116,243,0.14);border-color:rgba(20,116,243,0.27);}
.p-tab svg{opacity:.62;}
.p-tab.on svg{opacity:1;}
.p-main{flex:1;overflow-y:auto;padding:28px 28px 24px;min-width:0;}
.p-main::-webkit-scrollbar{width:5px;}
.p-main::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.10);border-radius:99px;}
.p-phead{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;}
.p-ptitle{font-family:'Syne',sans-serif;font-weight:900;font-size:18px;color:#fff;}
.p-psub{font-size:12.5px;color:rgba(255,255,255,0.33);margin-top:2px;}
.p-pclose{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.52);transition:background .18s,color .18s;flex-shrink:0;}
.p-pclose:hover{background:rgba(239,68,68,0.15);color:#f87171;}
.p-field{padding:11px 15px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;transition:border-color .18s;}
.p-field:hover{border-color:rgba(255,255,255,0.12);}
.p-fico{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.p-finfo{flex:1;min-width:0;}
.p-flbl{font-size:10.5px;color:rgba(255,255,255,0.28);font-family:'Outfit',sans-serif;font-weight:700;letter-spacing:.09em;text-transform:uppercase;}
.p-fval{font-size:13.5px;color:#fff;font-weight:600;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.p-zone{border:2px dashed rgba(255,255,255,0.11);border-radius:14px;padding:24px 18px;text-align:center;cursor:pointer;transition:all .22s;margin:18px 0 14px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.p-zone:hover,.p-zone.drag{border-color:rgba(20,116,243,0.55);background:rgba(20,116,243,0.05);}
.p-zone.has{border-color:rgba(20,116,243,0.40);}
.p-zone-ico{width:44px;height:44px;border-radius:12px;background:rgba(20,116,243,0.12);border:1px solid rgba(20,116,243,0.22);display:flex;align-items:center;justify-content:center;color:var(--nb2);}
.p-zone-txt{font-size:13px;color:rgba(255,255,255,0.43);line-height:1.55;}
.p-zone-txt strong{color:rgba(255,255,255,0.72);display:block;margin-bottom:2px;font-weight:700;}
.p-zone-hint{font-size:11px;color:rgba(255,255,255,0.22);}
.p-btns{display:flex;gap:10px;margin-top:4px;}
.p-btn{flex:1;padding:10px 14px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;}
.p-btn-p{background:linear-gradient(135deg,#1474F3,#6366f1);border:none;color:#fff;box-shadow:0 4px 16px rgba(20,116,243,0.35);}
.p-btn-p:hover{opacity:.88;transform:translateY(-1px);}
.p-btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.p-btn-d{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);color:#f87171;}
.p-btn-d:hover{background:rgba(239,68,68,0.16);}
.p-btn-g{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);color:rgba(255,255,255,0.58);}
.p-btn-g:hover{background:rgba(255,255,255,0.10);color:#fff;}
.p-act{display:flex;align-items:flex-start;gap:13px;padding:13px 15px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:8px;}
.p-actdot{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;}
.p-acttitle{font-size:13px;font-weight:600;color:#fff;}
.p-actsub{font-size:11.5px;color:rgba(255,255,255,0.33);margin-top:2px;}
.p-acttime{font-size:11px;color:rgba(255,255,255,0.20);margin-top:4px;font-family:'Outfit',sans-serif;}
.p-sg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.p-sc{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;position:relative;overflow:hidden;}
.p-scval{font-family:'Syne',sans-serif;font-weight:900;font-size:26px;margin-bottom:3px;}
.p-sclbl{font-size:11px;color:rgba(255,255,255,0.33);font-family:'Outfit',sans-serif;font-weight:700;letter-spacing:.07em;text-transform:uppercase;}
.p-scem{position:absolute;top:14px;right:14px;font-size:18px;opacity:.38;}
.p-ok,.p-err{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-size:12.5px;font-weight:600;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
.p-ok{background:rgba(34,197,94,0.10);border:1px solid rgba(34,197,94,0.22);color:#4ade80;}
.p-err{background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.22);color:#f87171;}
.p-micro{font-size:11px;font-weight:800;color:rgba(255,255,255,0.26);letter-spacing:.12em;text-transform:uppercase;font-family:'Outfit',sans-serif;margin-bottom:12px;}

@media(max-width:640px){
  .p-modal{flex-direction:column;width:95vw;max-height:92vh;}
  .p-side{width:100%;padding:18px 14px 12px;}
  .p-avwrap{flex-direction:row;text-align:left;gap:14px;}
  .p-sname,.p-semail{text-align:left;}
  .p-tabs{display:flex;gap:5px;padding:10px 0 0;flex-wrap:wrap;}
  .p-tab{padding:7px 10px;font-size:11.5px;}
  .p-main{padding:16px;}
  .p-sg{grid-template-columns:1fr;}
}
@media(max-width:768px){
  .nb-links,.nb-desktop{display:none!important;}
  .nb-burg{display:flex;}
}
@media(min-width:769px){.nb-mobile{display:none!important;}}
`;

/* ─────────────────────────────────────────────────────────────
   ICON
───────────────────────────────────────────────────────────── */
function Ic({ d, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const D = {
  branch:   "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:   "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  issue:    "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  help:     "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  graph:    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  bell:     "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0",
  logout:   "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9",
  user:     "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  chevron:  "M19.5 8.25l-7.5 7.5-7.5-7.5",
  x:        "M6 18L18 6M6 6l12 12",
  camera:   "M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z",
  email:    "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  shield:   "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  upload:   "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5",
  clock:    "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  check:    "M4.5 12.75l6 6 9-13.5",
  menu:     "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  arrow:    "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
};

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
function Avatar({ name, src, size = 36 }) {
  const [err, setErr] = useState(false);
  const init = (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (src && !err)
    return <img src={src} alt={name} className="nb-av" style={{ width: size, height: size }} onError={() => setErr(true)} />;
  return (
    <div className="nb-av-fb" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {init}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROLE CHIP
───────────────────────────────────────────────────────────── */
function RoleChip({ isAdmin, isSubAdmin }) {
  if (!isAdmin && !isSubAdmin) return null;
  return (
    <span className="nb-role" style={isAdmin
      ? { background: "rgba(20,116,243,0.14)", color: "#60a5fa", border: "1px solid rgba(20,116,243,0.25)" }
      : { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.20)" }}>
      {isAdmin ? "Administrator" : "Sub-Admin"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE COMPRESS
───────────────────────────────────────────────────────────── */
function compressImage(file, mw = 300, mh = 300, q = 0.82) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = e => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        let [w, h] = [img.width, img.height];
        if (w > mw || h > mh) { const r = Math.min(mw / w, mh / h); w = Math.round(w * r); h = Math.round(h * r); }
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", q));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ─────────────────────────────────────────────────────────────
   PROFILE MODAL
───────────────────────────────────────────────────────────── */
function ProfileModal({ user, isAdmin, isSubAdmin, token, onClose, onImgUpdate }) {
  const [tab,         setTab]         = useState("profile");
  const [preview,     setPreview]     = useState(user?.img_url || null);
  const [drag,        setDrag]        = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const fileRef = useRef(null);
  const isDirty = preview !== (user?.img_url || null);

  const handleFile = async file => {
    if (!file || !file.type.startsWith("image/")) return setError("Please select a valid image.");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be under 10 MB.");
    setError(""); setCompressing(true);
    try { setPreview(await compressImage(file)); }
    catch { setError("Failed to process image."); }
    finally { setCompressing(false); }
  };

  const handleSave = async () => {
    if (!isDirty) return onClose();
    setSaving(true); setError("");
    try {
      const res = await api.patch("/api/users/profile-image", { img_url: preview }, { headers: { Authorization: `Bearer ${token}` } });
      const saved = res?.data?.data?.img_url ?? preview;
      onImgUpdate(saved); setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1400);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await api.patch("/api/users/profile-image", { img_url: null }, { headers: { Authorization: `Bearer ${token}` } });
      setPreview(null); onImgUpdate(null);
    } catch { setError("Failed to remove photo."); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: "profile",  label: "Profile",  icon: D.user   },
    { id: "activity", label: "Activity", icon: D.graph  },
    { id: "security", label: "Security", icon: D.shield },
  ];

  const FIELDS = [
    { label: "Full Name",  val: user?.name  || "—", icon: D.user,   bg: "rgba(20,116,243,0.12)", col: "#60a5fa" },
    { label: "Email",      val: user?.email || "—", icon: D.email,  bg: "rgba(20,116,243,0.12)", col: "#60a5fa" },
    { label: "Role",       val: isAdmin ? "Administrator" : isSubAdmin ? "Sub-Admin" : "User", icon: D.shield, bg: "rgba(34,197,94,0.10)", col: "#4ade80" },
    { label: "Last Login", val: "Today, 9:42 AM",   icon: D.clock,  bg: "rgba(245,158,11,0.12)", col: "#fbbf24" },
  ];

  const ACTIVITY = [
    { e: "📦", title: "Asset report exported",  sub: "Branch Assets Master — 2,041 records", time: "2 hours ago",  bg: "rgba(20,116,243,0.12)", col: "#60a5fa" },
    { e: "✅", title: "Request approved",        sub: "IT Equipment — Kathmandu Branch",      time: "5 hours ago",  bg: "rgba(34,197,94,0.11)",  col: "#4ade80" },
    { e: "🔔", title: "Expiry alert reviewed",   sub: "14 assets expiring this month",        time: "Yesterday",    bg: "rgba(245,158,11,0.12)", col: "#fbbf24" },
    { e: "🏢", title: "Branch data updated",     sub: "Pokhara Branch — infrastructure",      time: "2 days ago",   bg: "rgba(139,92,246,0.12)", col: "#a78bfa" },
    { e: "💬", title: "Support ticket closed",   sub: "Ticket #2941 — Resolved",              time: "3 days ago",   bg: "rgba(13,148,136,0.12)", col: "#2dd4bf" },
  ];

  const STATS = [
    { val: "142", lbl: "Assets Managed",   e: "📦", col: "#1474F3" },
    { val: "38",  lbl: "Requests Handled", e: "📋", col: "#10B981" },
    { val: "7",   lbl: "Tickets Resolved", e: "💬", col: "#7c3aed" },
    { val: "99%", lbl: "Uptime (month)",   e: "🟢", col: "#E11D2E" },
  ];

  const TAB_LABELS = { profile: "My Profile", photo: "Profile Photo", activity: "Activity", security: "Security" };
  const TAB_SUBS   = { profile: "Your account information", photo: "Upload or change your photo", activity: "Recent actions & stats", security: "Account security overview" };

  return (
    <>
      <div className="p-back" onClick={onClose} />
      <div className="p-modal">

        {/* Sidebar */}
        <div className="p-side">
          <div className="p-avwrap">
            <div className="p-avring">
              {(preview || user?.img_url)
                ? <img src={preview || user?.img_url} alt={user?.name} className="p-avimg" onError={() => setPreview(null)} />
                : <div className="p-avfb">{(user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
              }
              <button className="p-cam" onClick={() => { setTab("photo"); setTimeout(() => fileRef.current?.click(), 80); }}>
                <Ic d={D.camera} size={12} />
              </button>
            </div>
            <div className="p-sname">{user?.name || "User"}</div>
            <div className="p-semail">{user?.email}</div>
            <RoleChip isAdmin={isAdmin} isSubAdmin={isSubAdmin} />
          </div>

          <div className="p-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`p-tab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
                <Ic d={t.icon} size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="p-main">
          <div className="p-phead">
            <div>
              <div className="p-ptitle">{TAB_LABELS[tab]}</div>
              <div className="p-psub">{TAB_SUBS[tab]}</div>
            </div>
            <button className="p-pclose" onClick={onClose}><Ic d={D.x} size={14} /></button>
          </div>

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <>
              {FIELDS.map(f => (
                <div className="p-field" key={f.label}>
                  <div className="p-fico" style={{ background: f.bg, color: f.col }}><Ic d={f.icon} size={14} /></div>
                  <div className="p-finfo">
                    <div className="p-flbl">{f.label}</div>
                    <div className="p-fval">{f.val}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(20,116,243,0.06)", border: "1px solid rgba(20,116,243,0.16)", borderRadius: 13 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#60a5fa", letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "Outfit", marginBottom: 9 }}>Account Status</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["✅ Email Verified", "🔒 2FA Disabled", "🟢 Active Session"].map(t => (
                    <span key={t} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.52)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Outfit", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* ── Activity tab ── */}
          {tab === "activity" && (
            <>
              <div className="p-sg">
                {STATS.map(s => (
                  <div className="p-sc" key={s.lbl}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.col, borderRadius: "14px 14px 0 0" }} />
                    <div className="p-scem">{s.e}</div>
                    <div className="p-scval" style={{ color: s.col }}>{s.val}</div>
                    <div className="p-sclbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="p-micro">Recent Actions</div>
              {ACTIVITY.map((a, i) => (
                <div className="p-act" key={i}>
                  <div className="p-actdot" style={{ background: a.bg, color: a.col }}>{a.e}</div>
                  <div>
                    <div className="p-acttitle">{a.title}</div>
                    <div className="p-actsub">{a.sub}</div>
                    <div className="p-acttime">{a.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Security tab ── */}
          {tab === "security" && (
            <>
              {[
                { title: "Password",        sub: "Last changed 30 days ago",             icon: D.shield, bg: "rgba(20,116,243,0.12)", col: "#60a5fa", btn: "Change", bs: "blue"  },
                { title: "Two-Factor Auth", sub: "Not enabled — recommended for admins", icon: D.shield, bg: "rgba(239,68,68,0.10)",  col: "#f87171", btn: "Enable", bs: "red"   },
                { title: "Active Sessions", sub: "1 device — Chrome · Windows",          icon: D.clock,  bg: "rgba(34,197,94,0.10)",  col: "#4ade80", btn: "Manage", bs: "green" },
              ].map(s => (
                <div className="p-field" key={s.title} style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="p-fico" style={{ background: s.bg, color: s.col }}><Ic d={s.icon} size={14} /></div>
                    <div className="p-finfo">
                      <div className="p-flbl">{s.title}</div>
                      <div className="p-fval" style={{ fontSize: 12.5 }}>{s.sub}</div>
                    </div>
                  </div>
                  <button style={{
                    padding: "6px 13px", borderRadius: 9, fontSize: 11.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: "Outfit", border: "1px solid", flexShrink: 0, marginLeft: 10,
                    ...(s.bs === "blue"  ? { background: "rgba(20,116,243,0.12)", color: "#60a5fa", borderColor: "rgba(20,116,243,0.25)" }
                      : s.bs === "red"   ? { background: "rgba(239,68,68,0.10)",  color: "#f87171", borderColor: "rgba(239,68,68,0.25)"  }
                      :                    { background: "rgba(34,197,94,0.10)",  color: "#4ade80", borderColor: "rgba(34,197,94,0.22)"   }),
                  }}>{s.btn}</button>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button className="p-btn p-btn-d" style={{ width: "100%" }}>
                  <Ic d={D.logout} size={14} /> Sign out of all devices
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV  (default export)
───────────────────────────────────────────────────────────── */
export default function Nav() {
  const { user, logout, isAdmin, isSubAdmin, token, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread,      setUnread]      = useState(0);
  const [bellWiggle,  setBellWiggle]  = useState(false);
  const dropRef = useRef(null);

  const isLanding   = location.pathname === "/";
  const hideNav     = location.pathname === "/login";
  const canRequests = isAdmin || isSubAdmin;

  const NAV_LINKS = [
    { to: "/branches",             label: "Branch",        icon: D.branch   },
    { to: "/branch-assets-report", label: "Asset Master",  icon: D.assets   },
    { to: "/branch-issues",        label: "Issue Tracker", icon: D.issue    },
    { to: "/requests",             label: "Requests",      icon: D.requests, show: canRequests },
    { to: "/support",              label: "Help",          icon: D.help     },
    { to: "/assetdashboard",       label: "Analytics",     icon: D.graph    },
    { to: "/admin/users",          label: "Users",         icon: D.users,    show: isAdmin },
  ].filter(l => l.show !== false);

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  // ESC key
  useEffect(() => {
    const k = e => {
      if (e.key === "Escape") { setMenuOpen(false); setDropOpen(false); setProfileOpen(false); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  // Lock scroll when drawer open
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Poll unread notifications
  useEffect(() => {
    if (!token || !isAdmin) return;
    const load = async () => {
      try {
        const res = await api.get("/api/notifications/unread-count", { headers: { Authorization: `Bearer ${token}` } });
        const count = Number(res?.data?.data?.count || 0);
        setUnread(prev => {
          if (count > prev) { setBellWiggle(true); setTimeout(() => setBellWiggle(false), 700); }
          return count;
        });
      } catch { setUnread(0); }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [token, isAdmin]);

  const handleLogout   = () => { logout(); setMenuOpen(false); setDropOpen(false); navigate("/login"); };
  const handleImgUpdate = url => { if (typeof setUser === "function") setUser(prev => ({ ...prev, img_url: url })); };

  return (
    <>
      <style>{CSS}</style>

      {profileOpen && (
        <ProfileModal
          user={user} isAdmin={isAdmin} isSubAdmin={isSubAdmin}
          token={token} onClose={() => setProfileOpen(false)} onImgUpdate={handleImgUpdate}
        />
      )}

      {/* ── Header bar ── */}
      <header className="nb">
        <div className="nb-in">

          {/* Logo */}
          <Link to="/" className="nb-logo">
            <span className="nb-name"><span className="r"><strong>NEPAL</strong>LIFE</span> Asset Management System</span>
          </Link>

          <div className="nb-sp" />

          {/* Desktop links */}
          {!hideNav && (
            <nav className="nb-links">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nb-lnk${isActive ? " active" : ""}`}>
                  <span className="nb-ico"><Ic d={icon} size={14} /></span>
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right actions */}
          {!hideNav && (
            <div className="nb-act">
              {/* Bell */}
              {user && isAdmin && (
                <NavLink to="/admin/expiry" className={`nb-bell${bellWiggle ? " nb-bell-wig" : ""}`}>
                  <Ic d={D.bell} size={16} />
                  {unread > 0 && <span className="nb-bell-badge">{unread > 99 ? "99+" : unread}</span>}
                </NavLink>
              )}

              {/* User dropdown */}
              {user ? (
                <div ref={dropRef} className="nb-desktop" style={{ position: "relative" }}>
                  <button className="nb-usr" onClick={() => setDropOpen(v => !v)}>
                    <Avatar name={user?.name} src={user?.img_url} size={30} />
                    <span className="nb-uname">{user.name || user.email}</span>
                    <span className={`nb-chev${dropOpen ? " open" : ""}`}><Ic d={D.chevron} size={12} /></span>
                  </button>

                  {dropOpen && (
                    <div className="nb-drop">
                      <div className="nb-dhead">
                        <Avatar name={user?.name} src={user?.img_url} size={40} />
                        <div className="nb-dinfo">
                          <div className="nb-dname">{user.name || "User"}</div>
                          <div className="nb-demail">{user.email}</div>
                          <RoleChip isAdmin={isAdmin} isSubAdmin={isSubAdmin} />
                        </div>
                      </div>

                      <button className="nb-ditem" onClick={() => { setDropOpen(false); setProfileOpen(true); }}>
                        <Ic d={D.user} size={14} /> My Profile
                      </button>
                      {isAdmin && (
                        <NavLink to="/admin/expiry" className="nb-ditem" onClick={() => setDropOpen(false)}>
                          <Ic d={D.bell} size={14} /> Notifications
                          {unread > 0 && (
                            <span style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 999, fontSize: 10, fontWeight: 900, color: "#fff", padding: "2px 7px" }}>
                              {unread}
                            </span>
                          )}
                        </NavLink>
                      )}
                      <div className="nb-ddiv" />
                      <button className="nb-ditem danger" onClick={handleLogout}>
                        <Ic d={D.logout} size={14} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="nb-signin nb-desktop" onClick={() => navigate("/login")}>Sign in</button>
              )}

              {/* Hamburger */}
              <button className="nb-burg nb-mobile" onClick={() => setMenuOpen(v => !v)}>
                <Ic d={menuOpen ? D.x : D.menu} size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`nb-ov${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`nb-drawer${menuOpen ? " open" : ""}`}>
        <div className="nb-drhd">
          <span className="nb-drtitle">Navigation</span>
          <button className="nb-drclose" onClick={() => setMenuOpen(false)}>
            <Ic d={D.x} size={15} />
          </button>
        </div>

        {user && (
          <div className="nb-druser" onClick={() => { setMenuOpen(false); setProfileOpen(true); }}>
            <Avatar name={user?.name} src={user?.img_url} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nb-druname">{user.name || "User"}</div>
              <div className="nb-dremail">{user.email}</div>
              <RoleChip isAdmin={isAdmin} isSubAdmin={isSubAdmin} />
            </div>
            <Ic d={D.arrow} size={14} />
          </div>
        )}

        <div className="nb-drsep" />

        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `nb-drlnk${isActive ? " active" : ""}`}>
            <span className="nb-drico"><Ic d={icon} size={15} /></span>
            {label}
          </NavLink>
        ))}

        {user && isAdmin && (
          <NavLink to="/admin/expiry" onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `nb-drlnk${isActive ? " active" : ""}`}
            style={{ marginTop: 4 }}>
            <span className="nb-drico"><Ic d={D.bell} size={15} /></span>
            Notifications
            {unread > 0 && (
              <span style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 999, fontSize: 10, fontWeight: 900, color: "#fff", padding: "2px 8px" }}>
                {unread}
              </span>
            )}
          </NavLink>
        )}

        <div className="nb-drsp" />
        <div className="nb-drsep" />

        {user ? (
          <button className="nb-drlogout" onClick={handleLogout}>
            <Ic d={D.logout} size={15} /> Sign out
          </button>
        ) : (
          <button className="nb-signin" style={{ width: "100%", borderRadius: 12, padding: "12px" }}
            onClick={() => { setMenuOpen(false); navigate("/login"); }}>
            Sign in
          </button>
        )}
      </div>

      {/* ── Landing ticker ── */}
      {isLanding && (
        <div className="nb-ticker">
          <div style={{ overflow: "hidden", width: "100%" }}>
            <div className="nb-ttrack">
              {[0, 1].map(i => (
                <span key={i} className="nb-titem">
                  <span className="nb-ttag">Update</span>
                  Sub-Admin can now submit new requests · Admin can update, edit, or delete requests · Stay compliant with monthly asset audits
                  <span style={{ color: "rgba(255,255,255,0.15)", padding: "0 18px" }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}