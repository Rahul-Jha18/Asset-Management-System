import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import { getBranchIssueAnalysisDashboard } from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --ad-blue:#4F46E5;
  --ad-blue-dark:#3730A3;
  --ad-violet:#7C3AED;
  --ad-brand-grad:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);
  --ad-red:#E11D48;
  --ad-green:#10B981;
  --ad-amber:#F59E0B;
  --ad-teal:#0891B2;
  --ad-purple:#9333EA;
  --ad-slate:#6B6885;

  --ad-bg:#F4F5FB;
  --ad-card:#FFFFFF;
  --ad-line:#E7E7F3;
  --ad-line-dark:#D6D5EA;
  --ad-text:#161328;
  --ad-muted:#6B6885;
  --ad-faint:#9C99B4;

  --ad-shadow-sm:0 1px 2px rgba(30,20,70,.05);
  --ad-shadow:0 1px 3px rgba(30,20,70,.05),0 12px 28px rgba(45,27,105,.07);
  --ad-shadow-lg:0 20px 50px rgba(45,27,105,.16);
  --ad-radius:18px;
  --ad-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --ad-display:'Sora','Inter',sans-serif;
}

@keyframes ad-spin{to{transform:rotate(360deg)}}
@keyframes ad-fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes ad-pop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes ad-draw{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
@keyframes ad-pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes ad-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

.ad-page{
  font-family:var(--ad-font);
  background:
    radial-gradient(900px 480px at 94% -8%, rgba(124,58,237,.10), transparent 55%),
    radial-gradient(760px 420px at -4% 18%, rgba(79,70,229,.08), transparent 55%),
    var(--ad-bg);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow:auto;
  color:var(--ad-text);
  padding:20px 20px 34px;
  scrollbar-width:thin;
  scrollbar-color:#C9C7E4 transparent;
}

.ad-page::-webkit-scrollbar{width:8px;height:8px}
.ad-page::-webkit-scrollbar-track{background:transparent}
.ad-page::-webkit-scrollbar-thumb{background:#C9C7E4;border-radius:999px}

.ad-inner{max-width:1520px;margin:0 auto}

.ad-head{
  background:var(--ad-card);
  border:1px solid var(--ad-line);
  border-radius:24px;
  box-shadow:var(--ad-shadow);
  padding:22px 26px;
  margin-bottom:16px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
  position:relative;
  overflow:hidden;
  animation:ad-fade-up .35s ease both;
}

.ad-head::before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:4px;
  background:linear-gradient(90deg,#4F46E5,#7C3AED,#E11D48);
}

.ad-head::after{
  content:"";
  position:absolute;
  top:-90px;
  right:-70px;
  width:260px;
  height:260px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(124,58,237,.14),transparent 70%);
}

.ad-eyebrow{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--ad-blue);
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.13em;
  font-weight:700;
  font-family:var(--ad-display);
}

.ad-eyebrow::before{
  content:"";
  width:8px;
  height:8px;
  border-radius:999px;
  background:var(--ad-brand-grad);
  animation:ad-pulse-dot 1.8s ease-in-out infinite;
}

.ad-title{
  margin:8px 0 0;
  font-family:var(--ad-display);
  font-size:clamp(1.5rem,3vw,2.15rem);
  line-height:1.08;
  letter-spacing:-.03em;
  font-weight:800;
  color:#12102A;
}
.ad-actions{
  position:relative;
  z-index:2;
}
.ad-desc{
  max-width:760px;
  margin:9px 0 0;
  color:var(--ad-muted);
  line-height:1.65;
  font-size:13.5px;
}

.ad-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}

.ad-btn{
  border:none;
  border-radius:12px;
  padding:10px 15px;
  font-family:var(--ad-font);
  font-weight:750;
  font-size:12.5px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  cursor:pointer;
  transition:.18s ease;
  white-space:nowrap;
}

.ad-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:var(--ad-shadow)}
.ad-btn:disabled{opacity:.55;cursor:not-allowed}
.ad-btn-primary{background:var(--ad-brand-grad);color:#FFFFFF;box-shadow:0 10px 22px rgba(79,70,229,.26)}
.ad-btn-soft{background:#FFFFFF;color:var(--ad-text);border:1px solid var(--ad-line);box-shadow:var(--ad-shadow-sm)}
.ad-btn-soft:hover{background:#F8F8FE;border-color:var(--ad-line-dark)}

.ad-scope{
  display:flex;
  align-items:center;
  gap:8px;
  background:#EEF0FE;
  color:var(--ad-blue);
  border:1px solid #D7D9FB;
  border-radius:999px;
  padding:8px 13px;
  font-size:12px;
  font-weight:750;
}

.ad-filter-card{
  background:var(--ad-card);
  border:1px solid var(--ad-line);
  border-radius:18px;
  box-shadow:var(--ad-shadow-sm);
  padding:13px;
  display:grid;
  grid-template-columns:repeat(5,minmax(130px,1fr)) auto;
  gap:10px;
  align-items:end;
  margin-bottom:15px;
}

.ad-field{display:flex;flex-direction:column;gap:6px}
.ad-field label{
  color:var(--ad-muted);
  font-size:10px;
  font-weight:700;
  letter-spacing:.07em;
  text-transform:uppercase;
  font-family:var(--ad-display);
}
.ad-field input,.ad-field select{
  height:40px;
  border:1px solid var(--ad-line-dark);
  background:#FFFFFF;
  border-radius:11px;
  padding:0 11px;
  color:var(--ad-text);
  outline:none;
  font-family:var(--ad-font);
  transition:.16s ease;
}
.ad-field input:focus,.ad-field select:focus{
  border-color:var(--ad-blue);
  box-shadow:0 0 0 4px rgba(79,70,229,.10);
}

/* ── KPI cards ──────────────────────────────────────────── */

.ad-kpis{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:13px;
  margin-bottom:15px;
}

.ad-kpi{
  background:var(--ad-card);
  border:1px solid var(--ad-line);
  border-radius:18px;
  box-shadow:var(--ad-shadow-sm);
  padding:15px;
  min-height:114px;
  position:relative;
  overflow:hidden;
  transition:.2s ease;
  animation:ad-fade-up .4s ease both;
}

.ad-kpi:hover{transform:translateY(-3px);box-shadow:var(--ad-shadow-lg);border-color:var(--ad-line-dark)}

.ad-kpi::before{
  content:"";
  position:absolute;
  left:0;
  top:16px;
  bottom:16px;
  width:3px;
  border-radius:0 999px 999px 0;
  background:var(--tone,#4F46E5);
}

.ad-kpi-top{display:flex;align-items:center;justify-content:space-between;gap:10px}

.ad-kpi small{
  display:block;
  color:var(--ad-muted);
  font-size:10px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.07em;
  font-family:var(--ad-display);
}

.ad-kpi-icon{
  width:36px;
  height:36px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--tone-soft,#EEF0FE);
  color:var(--tone,#4F46E5);
  position:relative;
  flex-shrink:0;
}
.ad-kpi-icon-glyph{width:15px;height:15px;background:currentColor;border-radius:4px;opacity:.9}
.ad-kpi-icon-glyph.folder{clip-path:polygon(0 15%,35% 15%,45% 28%,100% 28%,100% 88%,0 88%)}
.ad-kpi-icon-glyph.ring{background:transparent;border:2.4px solid currentColor;border-radius:50%}
.ad-kpi-icon-glyph.clock{background:transparent;border:2.4px solid currentColor;border-radius:50%}
.ad-kpi-icon-glyph.check{clip-path:polygon(20% 45%,40% 65%,80% 15%,90% 25%,40% 85%,10% 55%)}
.ad-kpi-icon-glyph.bolt{clip-path:polygon(55% 0%,10% 60%,45% 60%,35% 100%,90% 35%,50% 35%)}
.ad-kpi-icon-glyph.user{border-radius:50% 50% 0 0;position:relative}
.ad-kpi-icon-glyph.user::before{content:"";position:absolute;width:6px;height:6px;background:currentColor;border-radius:50%;top:-8px;left:4.5px}

.ad-kpi strong{
  display:block;
  margin-top:14px;
  font-family:var(--ad-display);
  font-size:1.9rem;
  line-height:1;
  font-weight:800;
  color:var(--tone,#161328);
  letter-spacing:-.03em;
}

.ad-kpi span{
  display:block;
  margin-top:9px;
  color:var(--ad-muted);
  font-size:11.5px;
  font-weight:600;
}

/* ── Layout grid ────────────────────────────────────────── */

.ad-grid{display:grid;grid-template-columns:1.4fr .8fr .8fr;gap:15px;margin-bottom:15px}
.ad-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px}
.ad-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:15px}

.ad-card{
  background:var(--ad-card);
  border:1px solid var(--ad-line);
  border-radius:20px;
  box-shadow:var(--ad-shadow-sm);
  overflow:hidden;
  min-width:0;
  transition:.2s ease;
  animation:ad-fade-up .4s ease both;
}
.ad-card:hover{box-shadow:var(--ad-shadow);border-color:var(--ad-line-dark)}

.ad-card-head{
  padding:15px 18px;
  border-bottom:1px solid var(--ad-line);
  background:linear-gradient(180deg,#FFFFFF 0%,#FAFAFE 100%);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.ad-card-head small{
  display:block;
  color:var(--ad-blue);
  font-size:10px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.1em;
  margin-bottom:4px;
  font-family:var(--ad-display);
}

.ad-card-head h3{
  margin:0;
  font-size:15.5px;
  font-weight:750;
  letter-spacing:-.02em;
  color:#171532;
  font-family:var(--ad-display);
}

.ad-card-body{padding:17px}
.ad-chart-wrap{height:270px;min-height:230px}
.ad-chart-wrap.tall{height:360px}
.ad-svg{width:100%;height:100%;display:block}
.ad-axis-text{fill:var(--ad-muted);font-size:11px;font-weight:700}
.ad-value-text{fill:var(--ad-text);font-size:11px;font-weight:800}
.ad-grid-line{stroke:var(--ad-line);stroke-width:1}
.ad-line-created{fill:none;stroke:#4F46E5;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:ad-draw 1.1s ease forwards .1s}
.ad-line-closed{fill:none;stroke:#10B981;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:var(--len2);stroke-dashoffset:var(--len2);animation:ad-draw 1.1s ease forwards .3s}
.ad-area-created{opacity:.14}
.ad-area-closed{opacity:.10}
.ad-dot-created{fill:#4F46E5}
.ad-dot-closed{fill:#10B981}

.ad-legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}
.ad-legend-item{
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:var(--ad-soft-text,#3D3A57);
  background:#F8F8FE;
  border:1px solid var(--ad-line);
  border-radius:999px;
  padding:6px 10px;
  font-size:11px;
  font-weight:750;
}
.ad-legend-dot{width:8px;height:8px;border-radius:999px;background:var(--tone)}

.ad-rank-list{display:flex;flex-direction:column;gap:11px}
.ad-rank-row{display:grid;grid-template-columns:minmax(0,1fr) 54px;gap:10px;align-items:center}
.ad-rank-label{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#3D3A57;font-size:12.5px;font-weight:750;margin-bottom:6px}
.ad-rank-track{height:9px;background:#F1F1FA;border-radius:999px;overflow:hidden}
.ad-rank-fill{height:100%;border-radius:999px;animation:ad-pop .5s ease both}
.ad-rank-count{justify-self:end;min-width:40px;height:27px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:#EEF0FE;color:var(--ad-blue);font-weight:800;font-size:11.5px}

.ad-donut-wrap{height:250px;display:flex;align-items:center;justify-content:center}
.ad-donut-center-title{font-size:10px;fill:var(--ad-muted);font-weight:700;text-transform:uppercase}
.ad-donut-center-value{font-size:22px;fill:var(--ad-text);font-weight:800}
.ad-donut-ring{animation:ad-pop .5s ease both}

.ad-recent-table{overflow:auto}
.ad-table{width:100%;border-collapse:collapse;min-width:900px}
.ad-table th{
  background:#F8F8FE;
  color:var(--ad-muted);
  text-align:left;
  font-size:10px;
  letter-spacing:.08em;
  text-transform:uppercase;
  font-weight:700;
  padding:12px 14px;
  border-bottom:1px solid var(--ad-line);
  font-family:var(--ad-display);
}
.ad-table td{padding:12px 14px;border-bottom:1px solid #F0F0F8;color:#3D3A57;font-size:12.5px}
.ad-table tr:hover td{background:#F8F8FE}
.ad-ticket{background:#EEF0FE;color:var(--ad-blue);border:1px solid #D7D9FB;border-radius:9px;padding:5px 9px;font-weight:800;white-space:nowrap}
.ad-type{border-radius:999px;padding:5px 10px;font-size:11px;font-weight:750;border:1px solid #D7D9FB;background:#EEF0FE;color:var(--ad-blue)}
.ad-type.customer{border-color:#FBE1AE;background:#FFF6E7;color:#B45309}

.ad-empty{padding:50px 16px;text-align:center;color:var(--ad-muted);display:flex;flex-direction:column;gap:9px;align-items:center}
.ad-empty-icon{width:52px;height:52px;border-radius:16px;background:#F8F8FE;border:1px solid var(--ad-line);position:relative}
.ad-empty-icon::before{content:"";position:absolute;inset:15px;border:2px solid var(--ad-faint);border-radius:4px}
.ad-empty strong{color:#3D3A57;font-family:var(--ad-display)}

.ad-spinner{width:38px;height:38px;border-radius:50%;border:3px solid var(--ad-line);border-top-color:var(--ad-blue);animation:ad-spin .8s linear infinite}

/* ── Gauge ──────────────────────────────────────────────── */
.ad-gauge-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;padding:6px 0}
.ad-gauge-value{font-family:var(--ad-display);font-size:2.1rem;font-weight:800;color:#171532;letter-spacing:-.03em;margin-top:-64px}
.ad-gauge-label{font-size:11.5px;color:var(--ad-muted);font-weight:650;text-align:center;max-width:200px}
.ad-gauge-stats{display:flex;gap:14px;margin-top:8px}
.ad-gauge-stat{text-align:center}
.ad-gauge-stat strong{display:block;font-family:var(--ad-display);font-size:15px;color:#171532}
.ad-gauge-stat small{display:block;font-size:10px;color:var(--ad-faint);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}

/* ── Status pipeline ────────────────────────────────────── */
.ad-pipeline{display:flex;flex-direction:column;gap:12px}
.ad-pipeline-bar{display:flex;height:16px;border-radius:999px;overflow:hidden;background:#F1F1FA;box-shadow:inset 0 0 0 1px var(--ad-line)}
.ad-pipeline-seg{height:100%;transition:.4s ease}
.ad-pipeline-legend{display:flex;flex-wrap:wrap;gap:10px}
.ad-pipeline-item{display:flex;align-items:center;gap:8px;flex:1;min-width:120px;background:#F8F8FE;border:1px solid var(--ad-line);border-radius:13px;padding:10px 12px}
.ad-pipeline-dot{width:10px;height:10px;border-radius:999px;flex-shrink:0}
.ad-pipeline-item strong{display:block;font-family:var(--ad-display);font-size:15px;color:#171532}
.ad-pipeline-item small{display:block;font-size:10.5px;color:var(--ad-muted);margin-top:1px}

/* ── Leaderboard highlight ──────────────────────────────── */
.ad-highlight-row{display:flex;flex-direction:column;gap:10px}
.ad-highlight-card{
  display:flex;
  align-items:center;
  gap:12px;
  background:linear-gradient(135deg,#F5F4FF,#EEF0FE);
  border:1px solid #D7D9FB;
  border-radius:15px;
  padding:12px 14px;
  animation:ad-float 4s ease-in-out infinite;
}
.ad-highlight-rank{
  width:34px;height:34px;border-radius:11px;
  background:var(--ad-brand-grad);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--ad-display);font-weight:800;font-size:13px;flex-shrink:0;
}
.ad-highlight-card div strong{display:block;font-size:13px;color:#171532;font-weight:750}
.ad-highlight-card div span{display:block;font-size:11px;color:var(--ad-muted);margin-top:1px}

@media(max-width:1400px){
  .ad-grid{grid-template-columns:1fr 1fr}
  .ad-grid-3{grid-template-columns:1fr 1fr}
}
@media(max-width:1280px){
  .ad-kpis{grid-template-columns:repeat(3,1fr)}
  .ad-filter-card{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:1024px){
  .ad-grid,.ad-grid-2,.ad-grid-3{grid-template-columns:1fr}
}
@media(max-width:760px){
  .ad-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:14px 12px}
  .ad-head{padding:18px}
  .ad-actions{width:100%}
  .ad-btn{flex:1}
  .ad-filter-card{grid-template-columns:1fr}
  .ad-kpis{grid-template-columns:repeat(2,1fr)}
  .ad-chart-wrap,.ad-chart-wrap.tall,.ad-donut-wrap{height:230px}
}
@media(max-width:480px){
  .ad-kpis{grid-template-columns:1fr}
  .ad-btn{width:100%}
  .ad-title{font-size:1.55rem}
}
`;

const makeIcon = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const NAV_ICONS = {
  dashboard: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  analysis: "M3 3v18h18M7 16l3.5-4 3 3L19 8M7 8h.01M7 12h.01",
  issue: "M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M9 12.75 11.25 15 15 9.75",
  branches: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
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
    { label: "Analysis Dashboard", path: "/branch-issues/analysis", icon: makeIcon(NAV_ICONS.analysis) },
    { label: "Requests", path: "/requests", icon: makeIcon(NAV_ICONS.requests), show: canRequests },
    { label: "Users", path: "/admin/users", icon: makeIcon(NAV_ICONS.users), show: isAdmin },
  ].filter((item) => item.show !== false);
};

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#E11D48", "#7C3AED", "#0891B2", "#EC4899", "#65A30D"];

const number = (value) => Number(value || 0).toLocaleString();

/* Lightweight count-up used purely for a polished number reveal — display only. */
function AnimatedNumber({ value }) {
  const target = Number(value || 0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 700;
    const from = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [target]);

  return <>{number(display)}</>;
}

function CardHead({ kicker, title, right }) {
  return (
    <div className="ad-card-head">
      <div>
        <small>{kicker}</small>
        <h3>{title}</h3>
      </div>
      {right}
    </div>
  );
}

function KPI({ label, value, hint, icon, color, colorSoft }) {
  return (
    <div className="ad-kpi" style={{ "--tone": color, "--tone-soft": colorSoft }}>
      <div className="ad-kpi-top">
        <small>{label}</small>
        <div className="ad-kpi-icon">
          <span className={`ad-kpi-icon-glyph ${icon}`} />
        </div>
      </div>
      <strong style={{ color }}><AnimatedNumber value={value} /></strong>
      <span>{hint}</span>
    </div>
  );
}

function RankBarChart({ data = [], emptyText = "No data available" }) {
  const max = Math.max(...data.map((item) => Number(item.count || 0)), 1);

  if (!data.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon" />
        <strong>{emptyText}</strong>
      </div>
    );
  }

  return (
    <div className="ad-rank-list">
      {data.map((item, index) => {
        const value = Number(item.count || 0);
        const width = Math.max(4, (value / max) * 100);

        return (
          <div className="ad-rank-row" key={`${item.name}-${index}`}>
            <div>
              <div className="ad-rank-label">
                <span>{item.name}</span>
              </div>
              <div className="ad-rank-track">
                <div
                  className="ad-rank-fill"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                  }}
                />
              </div>
            </div>
            <span className="ad-rank-count">{number(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data = [], total = 0 }) {
  const safeTotal = Number(total || data.reduce((sum, item) => sum + Number(item.count || 0), 0));
  const radius = 70;
  const stroke = 19;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!safeTotal) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon" />
        <strong>No data available</strong>
      </div>
    );
  }

  return (
    <>
      <div className="ad-donut-wrap">
        <svg className="ad-svg" viewBox="0 0 220 220" role="img" aria-label="Distribution">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#F1F1FA" strokeWidth={stroke} />
          {data.map((item, index) => {
            const value = Number(item.count || 0);
            const dash = (value / safeTotal) * circumference;
            const circle = (
              <circle
                key={item.name}
                className="ad-donut-ring"
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 110 110)"
              />
            );
            offset += dash;
            return circle;
          })}
          <text x="110" y="104" textAnchor="middle" className="ad-donut-center-title">Total</text>
          <text x="110" y="130" textAnchor="middle" className="ad-donut-center-value">{number(safeTotal)}</text>
        </svg>
      </div>

      <div className="ad-legend">
        {data.map((item, index) => (
          <span className="ad-legend-item" key={item.name}>
            <span className="ad-legend-dot" style={{ "--tone": COLORS[index % COLORS.length] }} />
            {item.name}: {number(item.count)}
          </span>
        ))}
      </div>
    </>
  );
}

function LineChart({ data = [] }) {
  const width = 700;
  const height = 260;
  const pad = { left: 44, right: 18, top: 22, bottom: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(
    ...data.flatMap((item) => [Number(item.created || 0), Number(item.closed || 0)]),
    1
  );

  const getX = (index) =>
    pad.left + (data.length <= 1 ? plotW / 2 : (index / (data.length - 1)) * plotW);

  const getY = (value) =>
    pad.top + plotH - (Number(value || 0) / max) * plotH;

  const buildPath = (key) =>
    data
      .map((item, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(item[key])}`)
      .join(" ");

  const buildArea = (key) => {
    if (!data.length) return "";
    const line = buildPath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const baseY = pad.top + plotH;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  if (!data.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon" />
        <strong>No monthly trend yet</strong>
      </div>
    );
  }

  const pathLen = 1600;

  return (
    <>
      <div className="ad-chart-wrap">
        <svg className="ad-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ad-area-created-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ad-area-closed-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = pad.top + plotH - ratio * plotH;
            return (
              <g key={ratio}>
                <line className="ad-grid-line" x1={pad.left} y1={y} x2={width - pad.right} y2={y} />
                <text className="ad-axis-text" x={8} y={y + 4}>
                  {Math.round(max * ratio)}
                </text>
              </g>
            );
          })}

          <path className="ad-area-created" d={buildArea("created")} fill="url(#ad-area-created-grad)" />
          <path className="ad-area-closed" d={buildArea("closed")} fill="url(#ad-area-closed-grad)" />

          <path className="ad-line-created" style={{ "--len": pathLen }} d={buildPath("created")} />
          <path className="ad-line-closed" style={{ "--len2": pathLen }} d={buildPath("closed")} />

          {data.map((item, index) => (
            <g key={item.name}>
              <circle className="ad-dot-created" cx={getX(index)} cy={getY(item.created)} r="4" />
              <circle className="ad-dot-closed" cx={getX(index)} cy={getY(item.closed)} r="4" />
              <text className="ad-axis-text" x={getX(index)} y={height - 15} textAnchor="middle">
                {item.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="ad-legend">
        <span className="ad-legend-item"><span className="ad-legend-dot" style={{ "--tone": "#4F46E5" }} />Created</span>
        <span className="ad-legend-item"><span className="ad-legend-dot" style={{ "--tone": "#10B981" }} />Closed</span>
      </div>
    </>
  );
}

/* Resolution-rate radial gauge — derived from summary.total / summary.closed, no new fetch. */
function ResolutionGauge({ total = 0, closed = 0 }) {
  const safeTotal = Number(total || 0);
  const safeClosed = Number(closed || 0);
  const pct = safeTotal > 0 ? Math.round((safeClosed / safeTotal) * 100) : 0;

  const radius = 78;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className="ad-gauge-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#F1F1FA" strokeWidth={stroke} />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#ad-gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90 100 100)"
          className="ad-donut-ring"
        />
        <defs>
          <linearGradient id="ad-gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ad-gauge-value">{pct}%</div>
      <div className="ad-gauge-label">of reports have been resolved and closed</div>
      <div className="ad-gauge-stats">
        <div className="ad-gauge-stat">
          <strong>{number(safeClosed)}</strong>
          <small>Closed</small>
        </div>
        <div className="ad-gauge-stat">
          <strong>{number(safeTotal - safeClosed)}</strong>
          <small>Remaining</small>
        </div>
        <div className="ad-gauge-stat">
          <strong>{number(safeTotal)}</strong>
          <small>Total</small>
        </div>
      </div>
    </div>
  );
}

/* Status pipeline — single segmented bar built from the same summary counts already fetched. */
function StatusPipeline({ open = 0, underReview = 0, closed = 0 }) {
  const total = Math.max(1, Number(open || 0) + Number(underReview || 0) + Number(closed || 0));

  const segments = [
    { label: "Open", value: Number(open || 0), color: "#10B981" },
    { label: "Under Review", value: Number(underReview || 0), color: "#F59E0B" },
    { label: "Closed", value: Number(closed || 0), color: "#6B6885" },
  ];

  return (
    <div className="ad-pipeline">
      <div className="ad-pipeline-bar">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="ad-pipeline-seg"
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>

      <div className="ad-pipeline-legend">
        {segments.map((seg) => (
          <div className="ad-pipeline-item" key={seg.label}>
            <span className="ad-pipeline-dot" style={{ background: seg.color }} />
            <div>
              <strong>{number(seg.value)}</strong>
              <small>{seg.label} &middot; {total ? Math.round((seg.value / total) * 100) : 0}%</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Top-N highlight strip — derived client-side from already-fetched rank data. */
function Leaderboard({ data = [], emptyText = "No data available" }) {
  const top = [...data]
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 3);

  if (!top.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon" />
        <strong>{emptyText}</strong>
      </div>
    );
  }

  return (
    <div className="ad-highlight-row">
      {top.map((item, index) => (
        <div className="ad-highlight-card" key={item.name} style={{ animationDelay: `${index * 0.3}s` }}>
          <div className="ad-highlight-rank">{index + 1}</div>
          <div>
            <strong>{item.name}</strong>
            <span>{number(item.count)} reports</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTable({ rows = [], onOpen }) {
  if (!rows.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon" />
        <strong>No recent reports found</strong>
      </div>
    );
  }

  return (
    <div className="ad-recent-table">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reporter</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onOpen(row.id)} style={{ cursor: "pointer" }}>
              <td><span className="ad-ticket">{row.ticket_no}</span></td>
              <td>{row.title}</td>
              <td>
                <span className={`ad-type ${row.issue_type === "Customer" ? "customer" : ""}`}>
                  {row.issue_type}
                </span>
              </td>
              <td>{row.category}</td>
              <td>{row.priority}</td>
              <td>{row.status === "UnderReview" ? "Under Review" : row.status}</td>
              <td>{row.reporter_name}</td>
              <td>
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString("en-NP", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BranchIssueAnalysisDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const navItems = useMemo(() => getIssueTrackerNavItems(user), [user]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    issue_type: "",
    status: "",
    priority: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );

      const res = await getBranchIssueAnalysisDashboard(params);
      setData(res?.data || null);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load analysis dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  return (
    <>
      <SplitSidebarLayout navItems={navItems} user={user}>
        <div className="ad-page">
          <style>{FONTS}{CSS}</style>

          <div className="ad-inner">
            <div className="ad-head">
              <div>
                <div className="ad-eyebrow">Nepal Life Issue Intelligence</div>
                <h1 className="ad-title">Analysis Dashboard</h1>
                <p className="ad-desc">
                  Analyze reports by branch, issue type, category, priority, status, monthly trend,
                  reporter and assignment visibility based on your role.
                </p>
              </div>

              <div className="ad-actions">
                <span className="ad-scope">
                  Scope: {data?.scope?.label || "Loading..."}
                </span>
                <button className="ad-btn ad-btn-soft" onClick={() => navigate("/branch-issues")}>
                  Issue List
                </button>
                <button className="ad-btn ad-btn-primary" onClick={load} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="ad-filter-card">
              <div className="ad-field">
                <label>From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>

              <div className="ad-field">
                <label>To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <div className="ad-field">
                <label>Issue Type</label>
                <select
                  value={filters.issue_type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, issue_type: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="Employee">Employee</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div className="ad-field">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="UnderReview">Under Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="ad-field">
                <label>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <button
                className="ad-btn ad-btn-soft"
                onClick={() =>
                  setFilters({
                    from: "",
                    to: "",
                    issue_type: "",
                    status: "",
                    priority: "",
                  })
                }
              >
                Clear
              </button>
            </div>

            {loading && !data ? (
              <div className="ad-card">
                <div className="ad-empty">
                  <div className="ad-spinner" />
                  <strong>Loading analysis dashboard...</strong>
                </div>
              </div>
            ) : (
              <>
                <div className="ad-kpis">
                  <KPI label="Total Reports" value={summary.total} icon="folder" color="#4F46E5" colorSoft="#EEF0FE" hint="Visible based on role" />
                  <KPI label="Open" value={summary.open} icon="ring" color="#10B981" colorSoft="#E7FBF3" hint="Waiting for action" />
                  <KPI label="Under Review" value={summary.underReview} icon="clock" color="#F59E0B" colorSoft="#FFF6E7" hint="Currently processing" />
                  <KPI label="Closed" value={summary.closed} icon="check" color="#6B6885" colorSoft="#F2F2F9" hint="Resolved reports" />
                  <KPI label="High / Critical" value={summary.highCritical} icon="bolt" color="#E11D48" colorSoft="#FDECEF" hint="Priority attention" />
                  <KPI label="Customer Issues" value={summary.customer} icon="user" color="#7C3AED" colorSoft="#F4EEFE" hint="Customer-related reports" />
                </div>

                {/* Row 1 — trend (with area fill), resolution gauge, status pipeline */}
                <div className="ad-grid">
                  <div className="ad-card">
                    <CardHead kicker="Trend" title="Monthly created vs closed reports" />
                    <div className="ad-card-body">
                      <LineChart data={charts.monthlyTrend || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Resolution" title="Overall resolution rate" />
                    <div className="ad-card-body">
                      <ResolutionGauge total={summary.total} closed={summary.closed} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Pipeline" title="Status breakdown" />
                    <div className="ad-card-body">
                      <StatusPipeline
                        open={summary.open}
                        underReview={summary.underReview}
                        closed={summary.closed}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 — type & priority donuts, top branches leaderboard */}
                <div className="ad-grid-3">
                  <div className="ad-card">
                    <CardHead kicker="Pie Chart" title="Issue type distribution" />
                    <div className="ad-card-body">
                      <DonutChart data={charts.byType || []} total={summary.total} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Pie Chart" title="Priority distribution" />
                    <div className="ad-card-body">
                      <DonutChart data={charts.byPriority || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Leaderboard" title="Top branches by volume" />
                    <div className="ad-card-body">
                      <Leaderboard data={charts.byBranch || []} emptyText="No branch data available" />
                    </div>
                  </div>
                </div>

                {/* Row 3 — category, status, branch rank bars */}
                <div className="ad-grid-3">
                  <div className="ad-card">
                    <CardHead kicker="Category" title="Reports by category" />
                    <div className="ad-card-body">
                      <RankBarChart data={charts.byCategory || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Status" title="Reports by status" />
                    <div className="ad-card-body">
                      <RankBarChart data={charts.byStatus || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Branch" title="Reports by branch" />
                    <div className="ad-card-body">
                      <RankBarChart data={charts.byBranch || []} />
                    </div>
                  </div>
                </div>

                <div className="ad-grid-2">
                  <div className="ad-card">
                    <CardHead kicker="Priority" title="Reports by priority" />
                    <div className="ad-card-body">
                      <RankBarChart data={charts.byPriority || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Leaderboard" title="Top categories by volume" />
                    <div className="ad-card-body">
                      <Leaderboard data={charts.byCategory || []} emptyText="No category data available" />
                    </div>
                  </div>
                </div>

                <div className="ad-card">
                  <CardHead kicker="Recent" title="Latest visible reports" />
                  <RecentTable
                    rows={data?.recentIssues || []}
                    onOpen={(issueId) => navigate(`/branch-issues/${issueId}`)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </SplitSidebarLayout>
      <Footer />
    </>
  );
}