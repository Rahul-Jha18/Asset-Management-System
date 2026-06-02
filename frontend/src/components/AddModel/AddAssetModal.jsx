// src/components/AddModel/AddAssetModal.jsx
import React, { useMemo, useState, useEffect } from "react";

const safeArray = (v) => (!v ? [] : Array.isArray(v) ? v : [v]);

const isCameraSubCode = (code) =>
  ["CR", "CM", "CAM", "CAMERA"].includes(String(code || "").trim().toUpperCase());

/* ─── Google Fonts ─── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const NL_BLUE        = "#0B5CAB";
const NL_BLUE2       = "#1474F3";
const NL_RED         = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

const MODAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-300:#93c5fd; --blue-400:#60a5fa; --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#ffffff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px;
    --nl-blue:${NL_BLUE}; --nl-blue-2:${NL_BLUE2}; --nl-red:${NL_RED};
  }
  @keyframes am-fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes am-bounceIn {
    0%  { opacity:0; transform:scale(0.94) translateY(12px); }
    60% { transform:scale(1.02) translateY(-3px); }
    100%{ opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes am-spin     { to{transform:rotate(360deg)} }
  @keyframes am-slideUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes am-slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

  .am-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(17,24,39,0.62); backdrop-filter:blur(8px);
    display:flex; justify-content:center; align-items:center;
    padding:16px;
    padding-top:calc(var(--nav-height,80px) + 14px);
    animation:am-fadeIn 0.2s ease;
    font-family:'DM Sans',sans-serif;
  }
  .am-panel {
    width:100%; max-width:900px; max-height:90vh;
    background:var(--white); border-radius:var(--radius-xl);
    border:1.5px solid var(--gray-200); overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:var(--shadow-lg);
    animation:am-bounceIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .am-header {
    background:${NL_GRADIENT_90}; padding:20px 26px;
    display:flex; align-items:flex-start; justify-content:space-between;
    flex-wrap:wrap; gap:12px; flex-shrink:0;
  }
  .am-step-track { display:flex; align-items:center; gap:8px; margin-top:14px; }
  .am-step-dot {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:800; font-family:'Outfit',sans-serif;
    border:2px solid; transition:all 0.25s ease;
  }
  .am-step-dot.active  { background:white; color:${NL_BLUE}; border-color:white; box-shadow:0 2px 8px rgba(255,255,255,0.3); }
  .am-step-dot.done    { background:rgba(255,255,255,0.25); color:white; border-color:rgba(255,255,255,0.5); }
  .am-step-dot.pending { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.45); border-color:rgba(255,255,255,0.22); }
  .am-step-line        { flex:1; height:2px; border-radius:999px; background:rgba(255,255,255,0.22); }
  .am-step-line.done   { background:rgba(255,255,255,0.55); }
  .am-body { flex:1; overflow-y:auto; background:var(--gray-50); padding:22px 26px; }
  .am-body::-webkit-scrollbar { width:4px; }
  .am-body::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
  .am-footer {
    padding:13px 26px; border-top:1.5px solid var(--gray-100);
    background:var(--white); display:flex; align-items:center;
    justify-content:space-between; flex-shrink:0; flex-wrap:wrap; gap:10px;
  }
  .am-footer-note { font-size:11px; color:var(--gray-400); font-family:'Outfit',sans-serif; flex:1; min-width:0; }
  .am-footer-actions { display:flex; gap:8px; }
  .am-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 18px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .am-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .am-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .am-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .am-btn-primary { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .am-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .am-btn-success { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .am-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .am-btn-white { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .am-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .am-btn-ghost { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .am-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .am-btn-sm { padding:6px 12px; font-size:12px; }
  .am-sel-card {
    background:white; border-radius:var(--radius-lg);
    border:1.5px solid var(--gray-200); padding:16px 18px;
    box-shadow:var(--shadow-sm); transition:border-color 0.18s ease;
  }
  .am-sel-card:focus-within { border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.08); }
  .am-sel-card-label {
    font-size:11px; font-weight:700; color:var(--gray-500);
    text-transform:uppercase; letter-spacing:0.09em;
    font-family:'Outfit',sans-serif; margin-bottom:8px; display:block;
  }
  .am-summary-strip {
    background:white; border-radius:var(--radius-lg);
    border:1.5px solid var(--blue-200); padding:14px 18px;
    box-shadow:var(--shadow-sm); margin-bottom:16px;
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    animation:am-slideUp 0.25s ease both;
  }
  .am-input, .am-select, .am-textarea {
    width:100%; background:rgba(55,65,82,0.07); border:1.5px solid var(--gray-300);
    border-radius:var(--radius); padding:9px 13px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
  }
  .am-input:focus, .am-select:focus, .am-textarea:focus {
    border-color:var(--blue-500); background:white; box-shadow:0 0 0 3px rgba(59,130,246,0.1);
  }
  .am-input::placeholder, .am-textarea::placeholder { color:var(--gray-400); }
  .am-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px;
    background-color:rgba(55,65,82,0.07);
  }
  .am-select:focus { background-color:white; }
  .am-textarea { resize:vertical; }
  .am-label { font-size:11.5px; font-weight:600; color:var(--gray-600); margin-bottom:6px; display:block; }
  .am-field-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
  .am-field-card {
    background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200);
    padding:14px 16px; box-shadow:var(--shadow-sm); transition:border-color 0.18s ease;
  }
  .am-field-card:focus-within { border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.07); }
  .am-field-card.full-width { grid-column:1/-1; }
  .am-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .am-badge-blue   { background:var(--blue-50);  color:var(--blue-700);  border:1px solid var(--blue-200); }
  .am-badge-green  { background:var(--green-50); color:var(--green-700); border:1px solid var(--green-200); }
  .am-badge-gray   { background:var(--gray-100); color:var(--gray-600);  border:1px solid var(--gray-200); }
  .am-badge-amber  { background:var(--amber-50); color:var(--amber-600); border:1px solid var(--amber-100); }
  .am-badge-red    { background:var(--red-50);   color:var(--red-600);   border:1px solid var(--red-100); }
  .am-section-divider { grid-column:1/-1; display:flex; align-items:center; gap:10px; margin:6px 0 2px; }
  .am-section-divider-line  { height:1px; flex:1; }
  .am-section-divider-label {
    font-size:10px; font-weight:800; color:var(--gray-400);
    text-transform:uppercase; letter-spacing:0.12em;
    font-family:'Outfit',sans-serif; white-space:nowrap;
  }
  .am-warn {
    background:var(--red-50); border:1.5px solid var(--red-100);
    border-radius:var(--radius); padding:10px 14px;
    display:flex; align-items:center; gap:8px; font-size:12px;
    color:var(--red-600); font-weight:600; margin-top:6px;
  }
  .am-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:white; animation:am-spin 0.7s linear infinite; }

  /* ── Employee Select ── */
  .am-emp-trigger {
    display:flex; align-items:center; gap:6px;
    border:1.5px solid var(--gray-300); border-radius:var(--radius);
    background:rgba(55,65,82,0.07); padding:0 12px; cursor:pointer;
    transition:all 0.18s ease; min-height:38px; user-select:none;
  }
  .am-emp-trigger:hover { border-color:var(--blue-400); background:rgba(59,130,246,0.04); }
  .am-emp-trigger.open  { border-color:var(--blue-500); background:white; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
  .am-emp-trigger.disabled { opacity:0.55; cursor:not-allowed; pointer-events:none; }
  .am-emp-dropdown {
    position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:10000;
    background:white; border:1.5px solid var(--blue-200); border-radius:var(--radius-lg);
    box-shadow:0 12px 32px rgba(0,0,0,0.14); overflow:hidden;
    animation:am-slideDown 0.18s ease both;
  }
  .am-emp-search {
    width:100%; border:none; border-bottom:1.5px solid var(--gray-100);
    padding:9px 13px; font-size:13px; font-family:'DM Sans',sans-serif;
    outline:none; background:var(--gray-50); color:var(--gray-900);
  }
  .am-emp-search::placeholder { color:var(--gray-400); }
  .am-emp-list { max-height:210px; overflow-y:auto; padding:4px 0; }
  .am-emp-list::-webkit-scrollbar { width:3px; }
  .am-emp-list::-webkit-scrollbar-thumb { background:var(--gray-200); border-radius:999px; }
  .am-emp-item {
    display:flex; align-items:center; gap:9px; padding:8px 13px;
    cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif;
    color:var(--gray-800); transition:background 0.1s ease;
  }
  .am-emp-item:hover   { background:var(--blue-50); }
  .am-emp-item.selected { background:var(--blue-50); color:var(--blue-700); font-weight:700; }
  .am-emp-avatar {
    width:24px; height:24px; border-radius:50%; flex-shrink:0;
    background:${NL_GRADIENT}; display:flex; align-items:center;
    justify-content:center; color:white; font-size:9px; font-weight:800;
    font-family:'Outfit',sans-serif;
  }
  .am-emp-empty { padding:14px 13px; font-size:12px; color:var(--gray-400); font-family:'Outfit',sans-serif; text-align:center; }

  /* ── Camera Card ── */
  .am-camera-card {
    background:white; border:1.5px solid var(--blue-100);
    border-radius:var(--radius-lg); padding:14px 16px;
    margin-bottom:10px; position:relative; overflow:hidden;
    animation:am-slideUp 0.2s ease both;
  }
  .am-camera-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:${NL_GRADIENT};
  }
  .am-camera-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:10px; margin-top:10px;
  }

  @media(max-width:640px) {
    .am-body { padding:14px 16px; }
    .am-header { padding:16px 18px; }
    .am-footer { padding:10px 18px; }
    .am-field-grid { grid-template-columns:1fr; }
    .am-camera-grid { grid-template-columns:1fr; }
  }
`;

const BRAND_OPTIONS = ["Dell", "Lenovo", "HP", "Acer"];

const isBrandDropdownKey = (section, key) => {
  const s = String(section || "").toLowerCase();
  return (
    (s === "desktop" && ["desktop_brand", "monitor_brand"].includes(key)) ||
    (s === "extra_monitor" && key === "monitor_brand")
  );
};

const SECTION_ALL_FIELDS = {
  desktop: [
    "assetId","sub_category_code","desktop_brand","userName","desktop_ids",
    "desktop_ram","system_model","desktop_ssd","desktop_processor","window_version","window_gen",
    "location","ip_address","status",
    "monitor_asset_code","monitor_brand","monitor_size","monitor_location",
    "monitor_purchase_year","monitor_status",
    "remarks",
  ],

  // QR Monitor: only the fields present in excelHeaders.js.
  // Section and Branch are already selected in Step 1, so only these two are editable here.
  qr_desktop_computer: [
    "assetId",
    "sub_category_code",
  ],

  laptop: [
    "assetId","sub_category_code","laptop_brand","name","laptop_user",
    "laptop_ram","laptop_ssd","laptop_processor",
    "location","ip_address","status","remarks",
  ],

  printer: [
    "assetId","sub_category_code","assigned_user","printer_name","printer_model","printer_type",
    "printer_status","location","ip_address","remarks",
  ],

  scanner: [
    "assetId","sub_category_code","scanner_name","scanner_model","assigned_user","location","remarks",
  ],

  projector: [
    "assetId","sub_category_code","projector_name","projector_model",
    "projector_status","projector_purchase_date","location","warranty_years","remarks",
  ],

  panel: [
    "assetId","sub_category_code","panel_name","panel_brand","panel_user",
    "panel_ip","panel_status","panel_purchase_year","location","warranty_years","remarks",
  ],

  ipphone: [
    "assetId","sub_category_code","ip_telephone_ext_no","ip_telephone_ip",
    "ip_telephone_status","assigned_user","model","brand","location","remarks",
  ],

  cctv: [
    "assetId","sub_category_code","cctv_brand","cctv_nvr_ip","cctv_record_days",
    "capacity","channel","vendor","purchase_date","remarks",
  ],

  connectivity: [
    "assetId","sub_category_code","connectivity_status","connectivity_network",
    "connectivity_lan_ip","connectivity_wlink","connectivity_lan_switch","connectivity_wifi",
    "installed_year","location","remarks",
  ],

  ups: [
    "assetId","sub_category_code","ups_model","ups_backup_time","ups_installer",
    "ups_rating","assigned_user","name","location","ip_address","ups_status","remarks",
  ],

  inverter: [
    "assetId","sub_category_code","name","inverter_model","inverter_backup_time",
    "inverter_installer","assigned_user",
    "battery_1","battery_2","battery_3","battery_4","battery_rating",
    "inverter_purchase_year","inverter_status","location","remarks",
  ],

  server: [
    "assetId","sub_category_code","brand","ip_address","location","model_no","purchase_date",
    "vendor","specification","storage","memory","windows_server_version",
    "virtualization","how_many_server","remarks",
  ],

  firewall_router: [
    "sub_category_code","brand","model","purchase_date","vendor",
    "license_expiry","specification_remarks","remarks",
  ],

  switch: [
    "assetId","sub_category_code","asset_name","model","type",
    "brand","location","port","assigned_user","remarks",
  ],

  extra_monitor: [
    "assetId","sub_category_code","monitor_brand","monitor_size",
    "monitor_location","monitor_status","system_model","assigned_user","remarks",
  ],

  application_software: [
    "sub_category_code","software_name","version",
    "vendor_name","license_type","license_key","quantity",
    "purchase_date","expiry_date","assigned_to","remarks",
  ],

  office_software: [
    "sub_category_code","software_name","version",
    "vendor_name","installed_on","pc_name","installed_by","install_date",
    "license_type","license_key","quantity","purchase_date","expiry_date",
    "assigned_to","remarks",
  ],

  utility_software: [
    "sub_category_code","software_name","version",
    "pc_name","installed_by","install_date","expiry_date","remarks",
  ],

  security_software: [
    "sub_category_code","product_name","vendor_name",
    "license_type","total_nodes","expiry_date","remarks",
  ],

  security_software_installed: [
    "sub_category_code","product_name","version","pc_name",
    "real_time_protection","last_update_date","installed_by","expiry_date","remarks",
  ],

  services: [
    "sub_category_code","service_name","service_category",
    "provider_name","contract_no","provider_contact","start_date","expiry_date","remarks",
  ],

  licenses: [
    "sub_category_code","license_name","license_type","license_key",
    "quantity","vendor_name","purchase_date","expiry_date","assigned_to","remarks",
  ],

  windows_os: [
    "sub_category_code","os_version",
    "license_type","license_key","activation_status","installed_date",
    "vendor_name","expiry_date","remarks",
  ],

  online_conference_tools: [
    "sub_category_code","tool_name","vendor_name","license_type","license_key",
    "no_of_users","purchase_date","expiry_date","remarks",
  ],

  windows_servers: [
    "sub_category_code","server_name","server_role","os_version",
    "license_type","license_key","cores_licensed","expiry_date","remarks",
  ],
};

const SUBCODE_TO_SECTION = {
  DC:"desktop", DT:"desktop",
  // ── QR Monitor: QM is new canonical code, QD/QC kept for backward compat ──
  QM:"qr_desktop_computer", QD:"qr_desktop_computer", QC:"qr_desktop_computer",
  LC:"laptop",  LP:"laptop",
  PR:"printer",
  SC:"scanner",
  PJ:"projector",
  PN:"panel",
  IP:"ipphone",
  CC:"cctv", CV:"cctv",
  IN:"connectivity",
  UP:"ups",
  IV:"inverter",
  SR:"server", SVR:"server",
  FR:"firewall_router",
  EA:"switch", EX:"switch", SW:"switch",
  MO:"extra_monitor",
  AL:"application_software",
  OF:"office_software",
  BR:"utility_software",
  SE:"security_software",
  SI:"security_software_installed",
  MS:"services",
  L:"licenses", LS:"licenses",
  WL:"windows_os",
  OC:"online_conference_tools",
  WS:"windows_servers",
};

const isDateKey = (k) => [
  "purchase_date","projector_purchase_date","expiry_date","license_expiry",
  "install_date","installed_date","start_date","last_update_date",
].includes(k);

const isYearKey = (k) => [
  "installed_year","panel_purchase_year","ups_purchase_year",
  "monitor_purchase_year","warranty_years","inverter_purchase_year",
].includes(k);

const isYesNoKey = (k) => k === "virtualization";

const isStatusKey = (k) => [
  "status","printer_status","projector_status","panel_status","ip_telephone_status",
  "ups_status","connectivity_status","activation_status","real_time_protection","monitor_status",
  "inverter_status",
].includes(k);

const isFullWidthKey = (k) => [
  "specification_remarks","specification","remarks","issue_details","action_taken",
].includes(k);

const isReadOnly = (k) => k === "sub_category_code";

const ASSIGNED_USER_KEYS = new Set([
  "userName","laptop_user","assigned_user","panel_user","assigned_to",
]);
const isAssignedUserKey = (k) => ASSIGNED_USER_KEYS.has(k);

const niceLabel = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .replace(/^Assetid$/, "Asset Code")
    .replace(/^Asset Id$/, "Asset Code")
    .replace(/^Sub Category Code$/, "Sub-Cat Code")
    .replace(/^Pc Name$/, "PC Name")
    .replace(/^Ip Address$/, "IP Address")
    .replace(/^Ip Telephone Ext No$/, "Extension No")
    .replace(/^Ip Telephone Ip$/, "IP Address")
    .replace(/^Ups Model$/, "Model")
    .replace(/^Ups Backup Time$/, "Backup Time")
    .replace(/^Ups Installer$/, "Installer")
    .replace(/^Ups Rating$/, "Rating")
    .replace(/^Ups Status$/, "Status")
    .replace(/^Inverter Model$/, "Model")
    .replace(/^Inverter Backup Time$/, "Backup Time")
    .replace(/^Inverter Installer$/, "Installer")
    .replace(/^Inverter Purchase Year$/, "Purchase Year")
    .replace(/^Inverter Status$/, "Status")
    .replace(/^Tool Name$/, "Name")
    .replace(/^Software Name$/, "Name")
    .replace(/^Software Category$/, "Category")
    .replace(/^Product Name$/, "Name")
    .replace(/^Service Name$/, "Name")
    .replace(/^Service Category$/, "Category")
    .replace(/^License Name$/, "Name")
    .replace(/^Vendor Name$/, "Vendor")
    .replace(/^No Of Users$/, "No of Users")
    .replace(/^Desktop Ids$/, "Desktop ID")
    .replace(/^Desktop Brand$/, "Brand")
    .replace(/^Desktop Ram$/, "RAM")
    .replace(/^Desktop Ssd$/, "SSD")
    .replace(/^Desktop Processor$/, "Processor")
    .replace(/^Window Version$/, "Windows Version")
    .replace(/^Window Gen$/, "Windows Gen")
    .replace(/^Username$/, "Assigned User")
    .replace(/^User Name$/, "Assigned User");

// ── CHANGED: qr_desktop_computer now displays as "QR Monitor" ──
const sectionDisplayName = (section) => {
  const s = String(section || "").trim().toLowerCase();
  if (s === "qr_desktop_computer") return "QR Monitor";  // ← renamed display
  if (s === "desktop") return "Desktop";
  if (s === "extra_monitor") return "Extra Monitor";
  if (s === "firewall_router") return "Firewall / Router";
  if (s === "application_software") return "Application Software";
  if (s === "office_software") return "Office Software";
  if (s === "utility_software") return "Utility Software";
  if (s === "security_software") return "Security Software";
  if (s === "security_software_installed") return "Security Software Installed";
  if (s === "windows_os") return "Windows OS";
  if (s === "windows_servers") return "Windows Servers";
  if (s === "online_conference_tools") return "Online Conference Tools";
  return String(section || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const SECTION_GROUPS = {
  desktop: [
    { label:"Device Info",      keys:["assetId","sub_category_code","desktop_brand","userName","desktop_ids"] },
    { label:"Specifications",   keys:["desktop_ram","system_model","desktop_ssd","desktop_processor","window_version","window_gen"] },
    { label:"Network & Status", keys:["location","ip_address","status"] },
    { label:"Monitor",          keys:["monitor_asset_code","monitor_brand","monitor_size","monitor_location","monitor_purchase_year","monitor_status"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  // ── QR Monitor: only Asset Code and Sub-Cat Code ──
  qr_desktop_computer: [
    {
      label: "QR Monitor Info",
      keys: ["assetId", "sub_category_code"],
    },
  ],

  laptop: [
    { label:"Device Info",      keys:["assetId","sub_category_code","laptop_brand","name","laptop_user"] },
    { label:"Specifications",   keys:["laptop_ram","laptop_ssd","laptop_processor"] },
    { label:"Network & Status", keys:["location","ip_address","status"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  printer: [
    { label:"Printer Info",     keys:["assetId","sub_category_code","assigned_user","printer_name","printer_model","printer_type"] },
    { label:"Network & Status", keys:["printer_status","location","ip_address"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  cctv: [
    { label:"NVR / System Info", keys:["assetId","sub_category_code","cctv_brand","cctv_nvr_ip","cctv_record_days"] },
    { label:"Capacity & Vendor", keys:["capacity","channel","vendor","purchase_date"] },
    { label:"Notes",             keys:["remarks"] },
  ],
  server: [
    { label:"Identity",         keys:["assetId","sub_category_code","brand","model_no","vendor"] },
    { label:"Network",          keys:["ip_address","location"] },
    { label:"Hardware",         keys:["storage","memory","virtualization","how_many_server"] },
    { label:"Software",         keys:["windows_server_version","purchase_date"] },
    { label:"Notes",            keys:["specification","remarks"] },
  ],
  switch: [
    { label:"Identity",         keys:["assetId","sub_category_code","asset_name","brand","model","type"] },
    { label:"Location & Access",keys:["location","port","assigned_user"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  extra_monitor: [
    { label:"Monitor Details",  keys:["assetId","sub_category_code","monitor_brand","monitor_size"] },
    { label:"Location & Status",keys:["monitor_location","monitor_status"] },
    { label:"Assignment",       keys:["system_model","assigned_user"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  inverter: [
    { label:"Inverter Info",     keys:["assetId","sub_category_code","name","inverter_model"] },
    { label:"Backup & Install",  keys:["inverter_backup_time","inverter_installer","assigned_user","inverter_purchase_year"] },
    { label:"Battery Details",   keys:["battery_1","battery_2","battery_3","battery_4","battery_rating"] },
    { label:"Status & Location", keys:["inverter_status","location"] },
    { label:"Notes",             keys:["remarks"] },
  ],
  application_software: [
    { label:"Software Info",    keys:["sub_category_code","software_name","version","vendor_name"] },
    { label:"License",          keys:["license_type","license_key","quantity","purchase_date","expiry_date","assigned_to"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  office_software: [
    { label:"Software Info",    keys:["sub_category_code","software_name","version","vendor_name"] },
    { label:"Installation",     keys:["installed_on","pc_name","installed_by","install_date"] },
    { label:"License",          keys:["license_type","license_key","quantity","purchase_date","expiry_date","assigned_to"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  utility_software: [
    { label:"Software Info",    keys:["sub_category_code","software_name","version"] },
    { label:"Installation",     keys:["pc_name","installed_by","install_date","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  security_software: [
    { label:"Security Product", keys:["sub_category_code","product_name","vendor_name"] },
    { label:"License",          keys:["license_type","total_nodes","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  security_software_installed: [
    { label:"Installed Product",keys:["sub_category_code","product_name","version","pc_name"] },
    { label:"Protection",       keys:["real_time_protection","last_update_date","installed_by","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  services: [
    { label:"Service Info",     keys:["sub_category_code","service_name","service_category","provider_name"] },
    { label:"Contract",         keys:["contract_no","provider_contact","start_date","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  licenses: [
    { label:"License Info",     keys:["sub_category_code","license_name","vendor_name"] },
    { label:"License Details",  keys:["license_type","license_key","quantity","purchase_date","expiry_date","assigned_to"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  windows_os: [
    { label:"OS Info",          keys:["sub_category_code","os_version","vendor_name"] },
    { label:"Activation",       keys:["license_type","license_key","activation_status","installed_date","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  online_conference_tools: [
    { label:"Tool Info",        keys:["sub_category_code","tool_name","vendor_name"] },
    { label:"License",          keys:["license_type","license_key","no_of_users","purchase_date","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
  windows_servers: [
    { label:"Server OS",        keys:["sub_category_code","server_name","server_role","os_version"] },
    { label:"License",          keys:["license_type","license_key","cores_licensed","expiry_date"] },
    { label:"Notes",            keys:["remarks"] },
  ],
};

/* ─────────────────────────────────────────────────────
   EmployeeSelect — allows manual typing + dropdown select
───────────────────────────────────────────────────── */
function EmployeeSelect({ employees, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const names = useMemo(() => {
    return [
      ...new Set(
        safeArray(employees)
          .map((e) => String(e.full_name || e.name || e.userName || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const filtered = useMemo(() => {
    const q = String(value || "").toLowerCase().trim();

    if (!q) return names;

    return names.filter((name) => name.toLowerCase().includes(q));
  }, [names, value]);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (name) => {
    onChange(name);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        className={`am-emp-trigger${open ? " open" : ""}${disabled ? " disabled" : ""}`}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
          setOpen(true);
        }}
        style={{ padding: "0 8px 0 12px" }}
      >
        {value ? (
          <div className="am-emp-avatar">
            {String(value).charAt(0).toUpperCase()}
          </div>
        ) : (
          <span style={{ color: "var(--gray-400)", fontSize: 14 }}>👤</span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value || ""}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          placeholder={
            names.length === 0
              ? "Type assigned user name"
              : "Type name or select employee"
          }
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--gray-900)",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13.5,
            fontWeight: value ? 600 : 400,
            height: 36,
          }}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gray-400)",
              fontSize: 16,
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          title="Show employee list"
          style={{
            background: "none",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--gray-400)",
            fontSize: 11,
            lineHeight: 1,
            padding: "2px 4px",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </button>
      </div>

      {open && !disabled && (
        <div className="am-emp-dropdown">
          <ul className="am-emp-list" style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
            {filtered.length === 0 ? (
              <li className="am-emp-empty">
                {value
                  ? `No dropdown match. "${value}" will be saved as typed.`
                  : "No employees available"}
              </li>
            ) : (
              filtered.map((name) => (
                <li
                  key={name}
                  className={`am-emp-item${name === value ? " selected" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(name);
                  }}
                >
                  <div className="am-emp-avatar">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ flex: 1 }}>{name}</span>
                  {name === value && (
                    <span style={{ fontSize: 12, color: "var(--blue-600)", fontWeight: 800 }}>
                      ✓
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>

          <div
            style={{
              padding: "6px 13px",
              borderTop: "1px solid var(--gray-100)",
              fontSize: 10,
              color: "var(--gray-400)",
              fontFamily: "'Outfit',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span>
              {filtered.length} of {names.length} employees
            </span>
            <span>Type custom or select from list</span>
          </div>
        </div>
      )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function AddAssetModal({
  open,
  onClose,
  branches  = [],
  groups    = [],
  subCats   = [],
  employees = [],
  fetchAddSubCats,
  addSaving = false,
  onSubmit,
}) {
  const [step, setStep]       = useState(1);
  const [branchId, setBranchId] = useState("");
  const [groupId, setGroupId]   = useState("");
  const [subCode, setSubCode]   = useState("");
  const [form, setForm]         = useState({});
  // ── CCTV cameras state ──
  const [cameras, setCameras]   = useState([]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setBranchId("");
    setGroupId("");
    setSubCode("");
    setForm({});
    setCameras([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, sub_category_code: subCode || "" }));
  }, [subCode]);

  // Reset cameras when section changes away from cctv
  useEffect(() => {
    if (section !== "cctv") setCameras([]);
  }, [subCode]);

  const selectedSubCat = useMemo(
    () => safeArray(subCats).find((s) => String(s.code) === String(subCode)) || null,
    [subCats, subCode]
  );

  const normalizeSection = (v) =>
    String(v || "")
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();

  const section = useMemo(() => {
    const api =
      selectedSubCat?.section ||
      selectedSubCat?.table_name ||
      selectedSubCat?.tableName ||
      selectedSubCat?.asset_type ||
      selectedSubCat?.assetType;
    if (api) return normalizeSection(api);
    return SUBCODE_TO_SECTION[String(subCode || "").trim().toUpperCase()] || "";
  }, [selectedSubCat, subCode]);

  const fieldsForSection = useMemo(
    () => (section ? SECTION_ALL_FIELDS[section] || [] : []),
    [section]
  );

  const fieldGroups = useMemo(() => {
    const preset = SECTION_GROUPS[section];
    if (preset) return preset;
    const mainFields = fieldsForSection.filter((k) => k !== "remarks" && !isFullWidthKey(k));
    const wideFields = fieldsForSection.filter(isFullWidthKey);
    return [
      { label: "Asset Details", keys: mainFields },
      ...(wideFields.length ? [{ label: "Notes", keys: wideFields }] : []),
    ];
  }, [section, fieldsForSection]);

  if (!open) return null;

  /* ── Camera helpers ── */
  const addCamera = () =>
    setCameras((prev) => [
      ...prev,
      { camera_model: "", location: "", cctv_status: "On", remarks: "" },
    ]);
  const removeCamera = (idx) =>
    setCameras((prev) => prev.filter((_, i) => i !== idx));
  const updateCamera = (idx, field, value) =>
    setCameras((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );

  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (isYearKey(name)) {
      const n = Number(value);
      v = value === "" ? "" : Number.isFinite(n) ? String(n) : value;
    }
    setForm((p) => ({ ...p, [name]: v }));
  };

  const validate = () => {
    if (!branchId) return "Please select a Branch.";
    if (!groupId)  return "Please select a Category.";
    if (!subCode)  return "Please select a Sub Category.";
    if (!section)  return "Cannot determine asset section for this Sub Category.";
    if (!fieldsForSection.length) return `No field map found for section: ${section}`;
    return "";
  };

  const handleSave = () => {
    const err = validate();
    if (err) { alert(err); return; }
    const payload = {};
    fieldsForSection.forEach((k) => {
      const raw = form?.[k];
      payload[k] = raw === "" ? null : raw;
    });
    // ── include cameras array for CCTV ──
    if (section === "cctv") {
      payload.cameras = cameras.filter(
        (c) => c.camera_model || c.location
      );
    }
    onSubmit?.({ branchId: Number(branchId), section, payload });
  };

  const selectedBranch = safeArray(branches).find((b) => String(b.id) === String(branchId));
  const selectedGroup  = safeArray(groups).find((g) => String(g.id) === String(groupId));

  /* ── renderField ── */
  const renderField = (k) => {
    const wide            = isFullWidthKey(k);
    const readOnly        = isReadOnly(k);
    const isUser          = isAssignedUserKey(k);
    const isBrandDropdown = isBrandDropdownKey(section, k);

    if (readOnly) {
      return (
        <div key={k} className="am-field-card">
          <label className="am-label">{niceLabel(k)}</label>
          <input type="text" className="am-input" name={k}
            value={form?.[k] ?? subCode ?? ""} readOnly disabled
            style={{ background:"var(--gray-100)",fontWeight:700,color:"var(--gray-700)" }}
          />
        </div>
      );
    }

    if (isBrandDropdown) {
      return (
        <div key={k} className={`am-field-card${wide ? " full-width" : ""}`}>
          <label className="am-label">{niceLabel(k)}</label>
          <select className="am-select" name={k} value={form?.[k] ?? ""} onChange={onChange}>
            <option value="">— Select Brand —</option>
            {BRAND_OPTIONS.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      );
    }

    if (isUser) {
      return (
        <div key={k} className="am-field-card">
          <label className="am-label" style={{ display:"flex",alignItems:"center",gap:6 }}>
            {niceLabel(k)}
            <span style={{ fontSize:9,fontWeight:600,color:"var(--blue-600)",background:"var(--blue-50)",border:"1px solid var(--blue-200)",borderRadius:999,padding:"1px 6px",fontFamily:"'Outfit',sans-serif",letterSpacing:"0.06em" }}>
              👤 Employee
            </span>
          </label>
          <EmployeeSelect
            employees={employees}
            value={form?.[k] ?? ""}
            disabled={addSaving}
            onChange={(name) => setForm((p) => ({ ...p, [k]: name }))}
          />
        </div>
      );
    }

    return (
      <div key={k} className={`am-field-card${wide ? " full-width" : ""}`}>
        <label className="am-label">{niceLabel(k)}</label>
        {wide ? (
          <textarea className="am-textarea" name={k} value={form?.[k] ?? ""} onChange={onChange}
            rows={k === "remarks" ? 3 : 4} disabled={addSaving}
            placeholder={k === "remarks" ? "Any additional notes…" : "Enter details…"}
          />
        ) : isYesNoKey(k) ? (
          <select className="am-select" name={k} value={form?.[k] ?? "No"} onChange={onChange} disabled={addSaving}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        ) : isStatusKey(k) ? (
          <select className="am-select" name={k} value={form?.[k] ?? "Active"} onChange={onChange} disabled={addSaving}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Repair">Repair</option>
          </select>
        ) : isDateKey(k) ? (
          <input type="date" className="am-input" name={k} value={form?.[k] ?? ""} onChange={onChange} disabled={addSaving}/>
        ) : isYearKey(k) ? (
          <input type="number" className="am-input" name={k} value={form?.[k] ?? ""} onChange={onChange}
            disabled={addSaving} placeholder="YYYY" min="1990" max="2099"
          />
        ) : (
          <input type="text" className="am-input" name={k} value={form?.[k] ?? ""} onChange={onChange} disabled={addSaving}/>
        )}
      </div>
    );
  };

  /* ── CCTV cameras section (shown in step 2 below field grid) ── */
  const renderCamerasSection = () => {
    if (section !== "cctv") return null;
    return (
      <div style={{ marginTop: 20 }}>
        {/* Divider header */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
          <div style={{ height:1,flex:1,background:"linear-gradient(90deg,var(--blue-200),transparent)" }}/>
          <span style={{ fontSize:10,fontWeight:800,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"Outfit,sans-serif",whiteSpace:"nowrap" }}>
            📹 Cameras ({cameras.length})
          </span>
          <div style={{ height:1,flex:1,background:"linear-gradient(270deg,var(--green-200),transparent)" }}/>
        </div>

        {/* Camera cards */}
        {cameras.length === 0 && (
          <div style={{ textAlign:"center",padding:"18px",background:"white",borderRadius:12,border:"1.5px dashed var(--gray-200)",color:"var(--gray-400)",fontSize:12,fontFamily:"Outfit,sans-serif",marginBottom:10 }}>
            No cameras added yet — click <strong>+ Add Camera</strong> below to add one
          </div>
        )}

        {cameras.map((cam, idx) => (
          <div key={idx} className="am-camera-card">
            {/* Card header row */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${NL_BLUE},${NL_BLUE2})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:800,fontFamily:"Outfit,sans-serif",flexShrink:0 }}>
                  {idx + 1}
                </div>
                <span style={{ fontFamily:"Outfit,sans-serif",fontWeight:700,fontSize:12,color:"var(--gray-700)" }}>
                  Camera #{idx + 1}
                </span>
              </div>
              <button type="button" onClick={() => removeCamera(idx)} disabled={addSaving}
                style={{ background:"var(--red-50)",border:"1.5px solid var(--red-100)",color:"var(--red-600)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"Outfit,sans-serif" }}>
                ✕ Remove
              </button>
            </div>

            <div className="am-camera-grid">
              <div>
                <label className="am-label">Camera Model</label>
                <input type="text" className="am-input"
                  value={cam.camera_model}
                  onChange={(e) => updateCamera(idx, "camera_model", e.target.value)}
                  placeholder="e.g. Hikvision DS-2CD2143"
                  disabled={addSaving}
                />
              </div>
              <div>
                <label className="am-label">Location</label>
                <input type="text" className="am-input"
                  value={cam.location}
                  onChange={(e) => updateCamera(idx, "location", e.target.value)}
                  placeholder="e.g. Main Entrance"
                  disabled={addSaving}
                />
              </div>
              <div>
                <label className="am-label">Status</label>
                <select className="am-select"
                  value={cam.cctv_status}
                  onChange={(e) => updateCamera(idx, "cctv_status", e.target.value)}
                  disabled={addSaving}>
                  <option value="On">On</option>
                  <option value="Off">Off</option>
                  <option value="Repair">Repair</option>
                </select>
              </div>
              <div>
                <label className="am-label">Remarks</label>
                <input type="text" className="am-input"
                  value={cam.remarks}
                  onChange={(e) => updateCamera(idx, "remarks", e.target.value)}
                  placeholder="Any notes…"
                  disabled={addSaving}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="am-btn am-btn-primary am-btn-sm"
          onClick={addCamera} disabled={addSaving}
          style={{ marginTop: 4, width:"100%", justifyContent:"center" }}>
          + Add Camera
        </button>
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{FONTS}{MODAL_STYLES}</style>

      <div
        className="am-overlay"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="am-panel">
          {/* ── HEADER ── */}
          <div className="am-header">
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.55)",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Outfit,sans-serif",marginBottom:4 }}>
                Asset Management
              </div>
              <div style={{ fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(1rem,3vw,1.35rem)",color:"white",letterSpacing:"-0.02em" }}>
                Add New Asset
              </div>
              <div className="am-step-track">
                <div className={`am-step-dot ${step === 1 ? "active" : "done"}`}>
                  {step > 1 ? "✓" : "1"}
                </div>
                <div className={`am-step-line ${step > 1 ? "done" : ""}`} />
                <div className={`am-step-dot ${step === 2 ? "active" : step > 2 ? "done" : "pending"}`}>
                  2
                </div>
                <div style={{ marginLeft:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center" }}>
                  <span style={{ fontSize:11,color:"rgba(255,255,255,0.65)",fontFamily:"Outfit,sans-serif" }}>
                    {step === 1 ? "Select branch & category" : "Fill asset details"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
              <button className="am-btn am-btn-white am-btn-sm" onClick={onClose} disabled={addSaving}>
                ✕ Close
              </button>

              {step === 2 && section && (
                <div style={{ display:"flex",flexWrap:"wrap",gap:6,justifyContent:"flex-end" }}>
                  {selectedBranch && (
                    <span className="am-badge am-badge-blue" style={{ background:"rgba(255,255,255,0.15)",color:"white",borderColor:"rgba(255,255,255,0.3)" }}>
                      🏢 {selectedBranch.name}
                    </span>
                  )}
                  <span className="am-badge" style={{ background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.85)",borderColor:"rgba(255,255,255,0.2)" }}>
                    📂 {sectionDisplayName(section)}
                  </span>
                  <span className="am-badge" style={{ background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.85)",borderColor:"rgba(255,255,255,0.2)" }}>
                    {fieldsForSection.length} fields
                  </span>
                  {section === "cctv" && (
                    <span className="am-badge" style={{ background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.85)",borderColor:"rgba(255,255,255,0.2)" }}>
                      📹 {cameras.length} cameras
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="am-body">

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {/* Branch */}
                <div className="am-sel-card">
                  <span className="am-sel-card-label">🏢 Branch *</span>
                  <select className="am-select" value={branchId}
                    onChange={(e) => { setBranchId(e.target.value); setForm({}); }}
                    disabled={addSaving}>
                    <option value="">-- Select Branch --</option>
                    {safeArray(branches).map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {branchId && (
                    <div style={{ marginTop:8 }}>
                      <span className="am-badge am-badge-blue">✓ {selectedBranch?.name || `Branch #${branchId}`}</span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="am-sel-card">
                  <span className="am-sel-card-label">📁 Category (Group) *</span>
                  <select className="am-select" value={groupId}
                    onChange={(e) => {
                      const gid = e.target.value;
                      setGroupId(gid);
                      setSubCode("");
                      setForm({});
                      fetchAddSubCats?.(gid);
                    }}
                    disabled={addSaving}>
                    <option value="">-- Select Category --</option>
                    {safeArray(groups).map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
                    ))}
                  </select>
                  {groupId && (
                    <div style={{ marginTop:8 }}>
                      <span className="am-badge am-badge-green">✓ {selectedGroup?.name || groupId}</span>
                    </div>
                  )}
                </div>

                {/* Sub Category */}
                <div className="am-sel-card">
                  <span className="am-sel-card-label">🏷 Sub Category *</span>
                  <select className="am-select" value={subCode}
                    onChange={(e) => { setSubCode(e.target.value); setForm({}); setCameras([]); }}
                    disabled={addSaving || !groupId}>
                    <option value="">-- Select Sub Category --</option>
                    {safeArray(subCats)
                      .filter((s) => !isCameraSubCode(s.code))
                      .map((s) => (
                        <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                      ))}
                  </select>

                  {subCode && (
                    <div style={{ marginTop:10,display:"flex",flexWrap:"wrap",gap:8,alignItems:"center" }}>
                      <span className="am-badge am-badge-amber">{selectedSubCat?.name || subCode} · {subCode}</span>
                      {section ? (
                        <span className="am-badge am-badge-green">📂 {sectionDisplayName(section)} · {fieldsForSection.length} fields</span>
                      ) : (
                        <span className="am-badge am-badge-red">⚠ Section unmapped</span>
                      )}
                      {section === "cctv" && (
                        <span className="am-badge am-badge-blue">📹 Cameras can be added in next step</span>
                      )}
                    </div>
                  )}

                  {!section && subCode && (
                    <div className="am-warn">
                      <span style={{ fontSize:16 }}>⚠️</span>
                      Cannot infer section for sub-code <strong>{subCode}</strong>.
                      Add <code>section</code> to the subcategory API or extend{" "}
                      <code>SUBCODE_TO_SECTION</code>.
                    </div>
                  )}
                </div>

                {/* Employee count hint */}
                {employees.length > 0 && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"var(--blue-50)",border:"1.5px solid var(--blue-200)",fontSize:12,color:"var(--blue-700)",fontFamily:"'Outfit',sans-serif",fontWeight:600 }}>
                    <span style={{ fontSize:15 }}>👤</span>
                    <span>
                      <strong>{employees.length}</strong> employees loaded —
                      Assigned User fields will show a searchable dropdown.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                {/* Summary strip */}
                <div className="am-summary-strip">
                  <div style={{ width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${NL_BLUE},${NL_BLUE2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>
                    📦
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:"Outfit,sans-serif",fontWeight:700,fontSize:13,color:"var(--gray-800)" }}>
                      {selectedSubCat?.name || subCode} — {selectedBranch?.name || `Branch #${branchId}`}
                    </div>
                    <div style={{ fontSize:11,color:"var(--gray-500)",marginTop:2,display:"flex",gap:8,flexWrap:"wrap" }}>
                      <span>Section: <strong>{sectionDisplayName(section)}</strong></span>
                      <span>Fields: <strong>{fieldsForSection.length}</strong></span>
                      {section === "cctv" && <span>Cameras: <strong>{cameras.length}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Field grid */}
                <div className="am-field-grid">
                  {fieldGroups.map((group, gi) => (
                    <React.Fragment key={gi}>
                      <div className="am-section-divider">
                        <div className="am-section-divider-line"
                          style={{ background:"linear-gradient(90deg,var(--blue-200),transparent)" }}/>
                        <span className="am-section-divider-label">{group.label}</span>
                        <div className="am-section-divider-line"
                          style={{ background:"linear-gradient(270deg,var(--green-200),transparent)" }}/>
                      </div>
                      {group.keys.map((k) => renderField(k))}
                    </React.Fragment>
                  ))}
                </div>

                {/* ── CCTV cameras inline section ── */}
                {renderCamerasSection()}
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="am-footer">
            <div className="am-footer-note">
              {step === 1
                ? "Select branch, category and sub-category to proceed."
                : section === "cctv"
                  ? "Fill NVR details above, then add individual cameras below the fields."
                  : "All DB fields for the selected section. Empty fields are saved as null."}
            </div>
            <div className="am-footer-actions">
              {step === 1 ? (
                <>
                  <button className="am-btn am-btn-ghost am-btn-sm" onClick={onClose} disabled={addSaving}>
                    Cancel
                  </button>
                  <button className="am-btn am-btn-primary am-btn-sm"
                    onClick={() => setStep(2)}
                    disabled={!branchId || !groupId || !subCode || !section || addSaving}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <button className="am-btn am-btn-ghost am-btn-sm" onClick={() => setStep(1)} disabled={addSaving}>
                    ← Back
                  </button>
                  <button className="am-btn am-btn-success am-btn-sm" onClick={handleSave} disabled={addSaving}>
                    {addSaving ? (
                      <><div className="am-spinner" style={{ width:13,height:13 }} />Saving…</>
                    ) : (
                      <>💾 Save Asset{section === "cctv" && cameras.length > 0 ? ` + ${cameras.length} Camera${cameras.length > 1 ? "s" : ""}` : ""}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}