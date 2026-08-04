import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SplitSidebarLayout from "../components/Layout/SplitSidebarLayout";
import Footer from "../components/Layout/Footer";
import { getBranchIssueAnalysisDashboard } from "../services/branchIssueApi";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
`;

const CSS = `
*,*::before,*::after{box-sizing:border-box}

:root{
  --ad-blue:#1D4ED8;
  --ad-blue-dark:#1E3A8A;
  --ad-red:#DC2626;
  --ad-green:#16A34A;
  --ad-amber:#D97706;
  --ad-purple:#7E22CE;
  --ad-slate:#64748B;
  --ad-bg:#F6F8FC;
  --ad-card:#FFFFFF;
  --ad-line:#E2E8F0;
  --ad-line-dark:#CBD5E1;
  --ad-text:#0F172A;
  --ad-muted:#64748B;
  --ad-faint:#94A3B8;
  --ad-shadow-sm:0 1px 2px rgba(15,23,42,.05);
  --ad-shadow:0 1px 3px rgba(15,23,42,.06),0 10px 26px rgba(15,23,42,.06);
  --ad-shadow-lg:0 18px 50px rgba(15,23,42,.12);
  --ad-radius:18px;
  --ad-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}

.ad-page{
  font-family:var(--ad-font);
  background:
    radial-gradient(circle at top left,rgba(29,78,216,.08),transparent 32%),
    linear-gradient(180deg,#FBFCFF 0%,#F2F6FB 100%);
  height:calc(100vh - 36px);
  max-height:calc(100vh - 36px);
  overflow:auto;
  color:var(--ad-text);
  padding:18px 18px 32px;
  scrollbar-width:thin;
  scrollbar-color:#CBD5E1 transparent;
}

.ad-page::-webkit-scrollbar{width:8px;height:8px}
.ad-page::-webkit-scrollbar-track{background:transparent}
.ad-page::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:999px}

.ad-inner{max-width:1480px;margin:0 auto}

.ad-head{
  background:#FFFFFF;
  border:1px solid var(--ad-line);
  border-radius:22px;
  box-shadow:var(--ad-shadow);
  padding:18px 20px;
  margin-bottom:14px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
  position:relative;
  overflow:hidden;
}

.ad-head::before{
  content:"";
  position:absolute;
  top:0;
  left:20px;
  right:20px;
  height:3px;
  border-radius:0 0 999px 999px;
  background:linear-gradient(90deg,var(--ad-blue),var(--ad-red));
}

.ad-eyebrow{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--ad-blue);
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:900;
}

.ad-eyebrow::before{
  content:"";
  width:8px;
  height:8px;
  border-radius:999px;
  background:var(--ad-red);
}

.ad-title{
  margin:7px 0 0;
  font-size:clamp(1.45rem,3vw,2.08rem);
  line-height:1.08;
  letter-spacing:-.04em;
  font-weight:900;
  color:#0F172A;
}

.ad-desc{
  max-width:760px;
  margin:8px 0 0;
  color:var(--ad-muted);
  line-height:1.65;
  font-size:13.5px;
}

.ad-actions{
  display:flex;
  align-items:center;
  gap:9px;
  flex-wrap:wrap;
}

.ad-btn{
  border:none;
  border-radius:12px;
  padding:10px 14px;
  font-family:var(--ad-font);
  font-weight:850;
  font-size:12.5px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  cursor:pointer;
  transition:.18s ease;
  white-space:nowrap;
}

.ad-btn:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:var(--ad-shadow);
}

.ad-btn:disabled{opacity:.55;cursor:not-allowed}
.ad-btn-primary{background:var(--ad-blue);color:#FFFFFF;box-shadow:0 8px 18px rgba(29,78,216,.20)}
.ad-btn-primary:hover{background:var(--ad-blue-dark)}
.ad-btn-soft{background:#FFFFFF;color:#334155;border:1px solid var(--ad-line);box-shadow:var(--ad-shadow-sm)}
.ad-btn-soft:hover{background:#F8FAFC;border-color:#CBD5E1}

.ad-scope{
  display:flex;
  align-items:center;
  gap:8px;
  background:#EFF6FF;
  color:#1D4ED8;
  border:1px solid #BFDBFE;
  border-radius:999px;
  padding:8px 12px;
  font-size:12px;
  font-weight:850;
}

.ad-filter-card{
  background:#FFFFFF;
  border:1px solid var(--ad-line);
  border-radius:18px;
  box-shadow:var(--ad-shadow-sm);
  padding:12px;
  display:grid;
  grid-template-columns:repeat(5,minmax(130px,1fr)) auto;
  gap:10px;
  align-items:end;
  margin-bottom:14px;
}

.ad-field{display:flex;flex-direction:column;gap:6px}
.ad-field label{
  color:#475569;
  font-size:10px;
  font-weight:900;
  letter-spacing:.07em;
  text-transform:uppercase;
}
.ad-field input,.ad-field select{
  height:39px;
  border:1px solid #CBD5E1;
  background:#FFFFFF;
  border-radius:11px;
  padding:0 11px;
  color:#0F172A;
  outline:none;
  font-family:var(--ad-font);
}
.ad-field input:focus,.ad-field select:focus{
  border-color:var(--ad-blue);
  box-shadow:0 0 0 3px rgba(29,78,216,.10);
}

.ad-kpis{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:12px;
  margin-bottom:14px;
}

.ad-kpi{
  background:#FFFFFF;
  border:1px solid var(--ad-line);
  border-radius:18px;
  box-shadow:var(--ad-shadow-sm);
  padding:14px;
  min-height:112px;
  position:relative;
  overflow:hidden;
  transition:.18s ease;
}

.ad-kpi:hover{
  transform:translateY(-2px);
  box-shadow:var(--ad-shadow);
}

.ad-kpi::before{
  content:"";
  position:absolute;
  left:0;
  top:16px;
  bottom:16px;
  width:3px;
  border-radius:0 999px 999px 0;
  background:var(--tone,#1D4ED8);
}

.ad-kpi-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.ad-kpi small{
  display:block;
  color:#64748B;
  font-size:10px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.07em;
}

.ad-kpi-icon{
  width:34px;
  height:34px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#F1F5F9;
  color:var(--tone,#1D4ED8);
  font-size:17px;
}

.ad-kpi strong{
  display:block;
  margin-top:13px;
  font-size:1.85rem;
  line-height:1;
  font-weight:900;
  color:var(--tone,#0F172A);
  letter-spacing:-.04em;
}

.ad-kpi span{
  display:block;
  margin-top:8px;
  color:#64748B;
  font-size:11.5px;
  font-weight:650;
}

.ad-grid{
  display:grid;
  grid-template-columns:1.25fr .85fr;
  gap:14px;
}

.ad-card{
  background:#FFFFFF;
  border:1px solid var(--ad-line);
  border-radius:20px;
  box-shadow:var(--ad-shadow-sm);
  overflow:hidden;
  min-width:0;
}

.ad-card-head{
  padding:14px 16px;
  border-bottom:1px solid var(--ad-line);
  background:linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.ad-card-head small{
  display:block;
  color:#64748B;
  font-size:10px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.08em;
  margin-bottom:4px;
}

.ad-card-head h3{
  margin:0;
  font-size:16px;
  font-weight:900;
  letter-spacing:-.02em;
  color:#0F172A;
}

.ad-card-body{padding:16px}
.ad-chart-wrap{height:280px;min-height:240px}
.ad-chart-wrap.tall{height:360px}
.ad-svg{width:100%;height:100%;display:block}
.ad-axis-text{fill:#64748B;font-size:11px;font-weight:700}
.ad-value-text{fill:#0F172A;font-size:11px;font-weight:850}
.ad-grid-line{stroke:#E2E8F0;stroke-width:1}
.ad-line-created{fill:none;stroke:#1D4ED8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.ad-line-closed{fill:none;stroke:#16A34A;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.ad-dot-created{fill:#1D4ED8}
.ad-dot-closed{fill:#16A34A}

.ad-legend{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:12px;
}

.ad-legend-item{
  display:inline-flex;
  align-items:center;
  gap:7px;
  color:#475569;
  background:#F8FAFC;
  border:1px solid #E2E8F0;
  border-radius:999px;
  padding:5px 9px;
  font-size:11px;
  font-weight:800;
}

.ad-legend-dot{width:8px;height:8px;border-radius:999px;background:var(--tone)}

.ad-rank-list{display:flex;flex-direction:column;gap:9px}
.ad-rank-row{
  display:grid;
  grid-template-columns:minmax(0,1fr) 52px;
  gap:10px;
  align-items:center;
}
.ad-rank-label{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  color:#334155;
  font-size:12.5px;
  font-weight:800;
  margin-bottom:5px;
}
.ad-rank-track{
  height:8px;
  background:#F1F5F9;
  border-radius:999px;
  overflow:hidden;
}
.ad-rank-fill{
  height:100%;
  border-radius:999px;
  background:linear-gradient(90deg,#1D4ED8,#3B82F6);
}
.ad-rank-count{
  justify-self:end;
  min-width:38px;
  height:26px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#EFF6FF;
  color:#1D4ED8;
  font-weight:900;
  font-size:11.5px;
}

.ad-donut-wrap{
  height:280px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.ad-donut-center-title{font-size:10px;fill:#64748B;font-weight:800;text-transform:uppercase}
.ad-donut-center-value{font-size:22px;fill:#0F172A;font-weight:900}

.ad-recent-table{overflow:auto}
.ad-table{width:100%;border-collapse:collapse;min-width:900px}
.ad-table th{
  background:#F8FAFC;
  color:#64748B;
  text-align:left;
  font-size:10px;
  letter-spacing:.08em;
  text-transform:uppercase;
  font-weight:900;
  padding:11px 13px;
  border-bottom:1px solid var(--ad-line);
}
.ad-table td{
  padding:12px 13px;
  border-bottom:1px solid #EEF2F7;
  color:#334155;
  font-size:12.5px;
}
.ad-table tr:hover td{background:#F8FAFC}
.ad-ticket{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:8px;padding:5px 8px;font-weight:900;white-space:nowrap}
.ad-type{border-radius:999px;padding:5px 9px;font-size:11px;font-weight:850;border:1px solid #BFDBFE;background:#EFF6FF;color:#1D4ED8}
.ad-type.customer{border-color:#FED7AA;background:#FFF7ED;color:#C2410C}

.ad-empty{
  padding:48px 16px;
  text-align:center;
  color:#64748B;
  display:flex;
  flex-direction:column;
  gap:8px;
  align-items:center;
}
.ad-empty-icon{font-size:42px}
.ad-empty strong{color:#334155}

.ad-spinner{
  width:38px;
  height:38px;
  border-radius:50%;
  border:3px solid #E2E8F0;
  border-top-color:#1D4ED8;
  animation:ad-spin .8s linear infinite;
}
@keyframes ad-spin{to{transform:rotate(360deg)}}

@media(max-width:1280px){
  .ad-kpis{grid-template-columns:repeat(3,1fr)}
  .ad-filter-card{grid-template-columns:repeat(3,1fr)}
}

@media(max-width:1024px){
  .ad-grid{grid-template-columns:1fr}
}

@media(max-width:760px){
  .ad-page{height:calc(100dvh - 24px);max-height:calc(100dvh - 24px);padding:14px 12px}
  .ad-head{padding:16px}
  .ad-actions{width:100%}
  .ad-btn{flex:1}
  .ad-filter-card{grid-template-columns:1fr}
  .ad-kpis{grid-template-columns:repeat(2,1fr)}
  .ad-chart-wrap,.ad-chart-wrap.tall,.ad-donut-wrap{height:250px}
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

const COLORS = ["#1D4ED8", "#16A34A", "#D97706", "#DC2626", "#7E22CE", "#64748B", "#0891B2", "#BE123C"];

const number = (value) => Number(value || 0).toLocaleString();

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

function KPI({ label, value, hint, icon, color }) {
  return (
    <div className="ad-kpi" style={{ "--tone": color }}>
      <div className="ad-kpi-top">
        <small>{label}</small>
        <div className="ad-kpi-icon">{icon}</div>
      </div>
      <strong>{number(value)}</strong>
      <span>{hint}</span>
    </div>
  );
}

function RankBarChart({ data = [], emptyText = "No data available" }) {
  const max = Math.max(...data.map((item) => Number(item.count || 0)), 1);

  if (!data.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon">📊</div>
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
  const radius = 72;
  const stroke = 20;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!safeTotal) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon">◔</div>
        <strong>No type data available</strong>
      </div>
    );
  }

  return (
    <>
      <div className="ad-donut-wrap">
        <svg className="ad-svg" viewBox="0 0 220 220" role="img" aria-label="Issue type distribution">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          {data.map((item, index) => {
            const value = Number(item.count || 0);
            const dash = (value / safeTotal) * circumference;
            const circle = (
              <circle
                key={item.name}
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

  if (!data.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon">📈</div>
        <strong>No monthly trend yet</strong>
      </div>
    );
  }

  return (
    <>
      <div className="ad-chart-wrap">
        <svg className="ad-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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

          <path className="ad-line-created" d={buildPath("created")} />
          <path className="ad-line-closed" d={buildPath("closed")} />

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
        <span className="ad-legend-item"><span className="ad-legend-dot" style={{ "--tone": "#1D4ED8" }} />Created</span>
        <span className="ad-legend-item"><span className="ad-legend-dot" style={{ "--tone": "#16A34A" }} />Closed</span>
      </div>
    </>
  );
}

function RecentTable({ rows = [], onOpen }) {
  if (!rows.length) {
    return (
      <div className="ad-empty">
        <div className="ad-empty-icon">📭</div>
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
                  <KPI label="Total Reports" value={summary.total} icon="📋" color="#1D4ED8" hint="Visible based on role" />
                  <KPI label="Open" value={summary.open} icon="📂" color="#16A34A" hint="Waiting for action" />
                  <KPI label="Under Review" value={summary.underReview} icon="⏱" color="#D97706" hint="Currently processing" />
                  <KPI label="Closed" value={summary.closed} icon="✓" color="#64748B" hint="Resolved reports" />
                  <KPI label="High / Critical" value={summary.highCritical} icon="!" color="#DC2626" hint="Priority attention" />
                  <KPI label="Customer Issues" value={summary.customer} icon="👤" color="#7E22CE" hint="Customer-related reports" />
                </div>

                <div className="ad-grid">
                  <div className="ad-card">
                    <CardHead kicker="Trend" title="Monthly created vs closed reports" />
                    <div className="ad-card-body">
                      <LineChart data={charts.monthlyTrend || []} />
                    </div>
                  </div>

                  <div className="ad-card">
                    <CardHead kicker="Pie Chart" title="Issue type distribution" />
                    <div className="ad-card-body">
                      <DonutChart data={charts.byType || []} total={summary.total} />
                    </div>
                  </div>

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

                  <div className="ad-card">
                    <CardHead kicker="Priority" title="Reports by priority" />
                    <div className="ad-card-body">
                      <RankBarChart data={charts.byPriority || []} />
                    </div>
                  </div>
                </div>

                <div className="ad-card" style={{ marginTop: 14 }}>
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
