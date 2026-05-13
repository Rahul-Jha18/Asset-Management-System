const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");
const db = require("../models");

const {
  BranchConnectivity,
  BranchUps,
  Inverter,
  BranchScanner,
  BranchProjector,
  BranchPrinter,
  BranchDesktop,
  QrDesktopComputer,
  BranchLaptop,
  BranchCctv,
  BranchPanel,
  BranchIpPhone,
  BranchServer,
  BranchFirewallRouter,
  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchUtilitySoftware,
  BranchServices,
  BranchLicenses,
  BranchWindowsOS,
  BranchOnlineConferenceTools,
  BranchWindowsServers,
  BranchSwitch,
  BranchExtraMonitor,
  Branch,
} = db;

const norm = (v) => String(v ?? "").trim();
const normLower = (v) => norm(v).toLowerCase();

function excelDateToJSDate(serial) {
  if (!serial) return null;

  if (typeof serial === "number") {
    const utcDays = Math.floor(serial - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate());
  }

  const d = new Date(serial);
  return Number.isNaN(d.getTime()) ? null : d;
}

const toStrOrNull = (v) => {
  const s = norm(v);
  return s || null;
};

const toIntOrNull = (v) => {
  const s = norm(v);
  if (!s) return null;

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNullSafe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toYesNoOrNull = (v) => {
  const s = normLower(v);

  if (!s) return null;
  if (["yes", "y", "true", "1"].includes(s)) return "Yes";
  if (["no", "n", "false", "0"].includes(s)) return "No";

  return null;
};

const normalizeLicenseType = (v) => {
  const s = normLower(v);

  if (!s) return null;
  if (["perpetual", "perpectual"].includes(s)) return "Perpetual";
  if (["subscription", "subcription"].includes(s)) return "Subscription";

  return toStrOrNull(v);
};

const getExcel = (row, keys = []) => {
  for (const k of keys) {
    if (row?.[k] !== undefined) return row[k];
  }

  return undefined;
};

const toSnakeKey = (k) =>
  norm(k)
    .toLowerCase()
    .replace(/[\s\-\/]+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const attachExtrasFromExcel = (Model, excelRow, payload) => {
  if (!Model?.rawAttributes || !excelRow) return payload;

  const deny = new Set([
    "id",
    "branchId",
    "branch_code",
    "cctv_id",
    "assetId",
    "createdAt",
    "updatedAt",
    "created_at",
    "updated_at",
  ]);

  const allowed = Object.keys(Model.rawAttributes).filter((k) => !deny.has(k));
  const attrMap = new Map(allowed.map((a) => [toSnakeKey(a), a]));

  for (const [k, v] of Object.entries(excelRow)) {
    const attr = attrMap.get(toSnakeKey(k));

    if (!attr || payload[attr] !== undefined) continue;

    const typeKey = Model.rawAttributes[attr]?.type?.key || "";

    if (["INTEGER", "BIGINT"].includes(typeKey)) {
      payload[attr] = toIntOrNull(v);
    } else if (typeKey === "DATEONLY" || typeKey === "DATE") {
      payload[attr] = excelDateToJSDate(v);
    } else {
      payload[attr] = toStrOrNull(v);
    }
  }

  return payload;
};

const buildDesktopPayloadFromExcelRow = (common, row) => ({
  ...common,
  assetId: toStrOrNull(getExcel(row, ["Asset Code", "asset_code", "assetId"])),
  desktop_brand: toStrOrNull(getExcel(row, ["Brand"])),
  userName: toStrOrNull(getExcel(row, ["Assigned User"])),
  desktop_ids: toStrOrNull(getExcel(row, ["Desktop ID"])),
  desktop_ram: toStrOrNull(getExcel(row, ["RAM"])),
  system_model: toStrOrNull(getExcel(row, ["System Model"])),
  desktop_ssd: toStrOrNull(getExcel(row, ["SSD"])),
  desktop_processor: toStrOrNull(getExcel(row, ["Processor"])),
  window_version: toStrOrNull(getExcel(row, ["Windows Version"])),
  monitor_asset_code: toStrOrNull(getExcel(row, ["Monitor code"])),
  location: toStrOrNull(getExcel(row, ["Location"])),
  ip_address: toStrOrNull(getExcel(row, ["IP Address"])),
  monitor_brand: toStrOrNull(getExcel(row, ["Monitor Brand"])),
  monitor_size: toStrOrNull(getExcel(row, ["Monitor Size"])),
  monitor_location: toStrOrNull(getExcel(row, ["Monitor Location"])),
  window_gen: toStrOrNull(getExcel(row, ["Windows Gen"])),
  monitor_purchase_year: toIntOrNullSafe(getExcel(row, ["Monitor Purchase Year"])),
  monitor_status: toStrOrNull(getExcel(row, ["Monitor Status"])),
  status: toStrOrNull(getExcel(row, ["Status"])),
});

const buildPayloadFromExcelRow = (section, row) => {
  const common = {
    sub_category_code: toStrOrNull(getExcel(row, ["Sub-Cat Code", "sub_category_code"])),
    remarks: toStrOrNull(getExcel(row, ["Remarks", "remarks"])),
  };

  switch (section) {
    case "desktop":
      return buildDesktopPayloadFromExcelRow(common, row);

    case "qr_desktop_computer":
    case "qr-desktop-computer":
    case "qrdesktopcomputer":
    case "qr_desktop_computers":
    case "qr-desktop-computers":
      return buildDesktopPayloadFromExcelRow(common, row);

    case "laptop":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        laptop_brand: toStrOrNull(getExcel(row, ["Brand"])),
        name: toStrOrNull(getExcel(row, ["Name"])),
        laptop_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        laptop_ram: toStrOrNull(getExcel(row, ["RAM"])),
        laptop_ssd: toStrOrNull(getExcel(row, ["SSD"])),
        laptop_processor: toStrOrNull(getExcel(row, ["Processor"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        ip_address: toStrOrNull(getExcel(row, ["IP Address"])),
        status: toStrOrNull(getExcel(row, ["Status"])),
      };

    case "printer":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        name: toStrOrNull(getExcel(row, ["Name"])),
        printer_name: toStrOrNull(getExcel(row, ["Name"])),
        printer_model: toStrOrNull(getExcel(row, ["Model"])),
        printer_type: toStrOrNull(getExcel(row, ["Printer Type"])),
        printer_status: toStrOrNull(getExcel(row, ["Status"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        ip_address: toStrOrNull(getExcel(row, ["IP Address"])),
      };

    case "scanner":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        scanner_name: toStrOrNull(getExcel(row, ["Name"])),
        scanner_model: toStrOrNull(getExcel(row, ["Model"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
      };

    case "projector":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        projector_name: toStrOrNull(getExcel(row, ["Name"])),
        projector_model: toStrOrNull(getExcel(row, ["Model"])),
        projector_status: toStrOrNull(getExcel(row, ["Status"])),
        projector_purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        warranty_years: toIntOrNullSafe(getExcel(row, ["Warranty Years"])),
      };

    case "panel":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        panel_name: toStrOrNull(getExcel(row, ["Name"])),
        panel_brand: toStrOrNull(getExcel(row, ["Brand"])),
        panel_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        panel_ip: toStrOrNull(getExcel(row, ["IP Address"])),
        panel_status: toStrOrNull(getExcel(row, ["Status"])),
        panel_purchase_year: toIntOrNullSafe(getExcel(row, ["Purchased Year"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        warranty_years: toIntOrNullSafe(getExcel(row, ["Warranty Years"])),
      };

    case "ipphone":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        ip_telephone_ext_no: toStrOrNull(getExcel(row, ["Extension No"])),
        ip_telephone_ip: toStrOrNull(getExcel(row, ["IP Address"])),
        ip_telephone_status: toStrOrNull(getExcel(row, ["Status"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        model: toStrOrNull(getExcel(row, ["Model"])),
        brand: toStrOrNull(getExcel(row, ["Brand"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
      };

    case "cctv":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        cctv_brand: toStrOrNull(getExcel(row, ["Brand"])),
        cctv_nvr_ip: toStrOrNull(getExcel(row, ["NVR IP"])),
        cctv_record_days: toIntOrNullSafe(getExcel(row, ["Record Days"])),
        capacity: toStrOrNull(getExcel(row, ["Capacity"])),
        channel: toIntOrNullSafe(getExcel(row, ["Channel"])),
        vendor: toStrOrNull(getExcel(row, ["Vendor"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
      };

    case "connectivity":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        connectivity_status: toStrOrNull(getExcel(row, ["Status"])),
        connectivity_network: toStrOrNull(getExcel(row, ["Network"])),
        connectivity_lan_ip: toStrOrNull(getExcel(row, ["LAN IP"])),
        connectivity_wlink: toStrOrNull(getExcel(row, ["WAN Link"])),
        connectivity_lan_switch: toStrOrNull(getExcel(row, ["LAN Switch"])),
        connectivity_wifi: toStrOrNull(getExcel(row, ["WiFi"])),
        installed_year: toIntOrNullSafe(getExcel(row, ["Installed Year"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
      };

    case "ups":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        ups_model: toStrOrNull(getExcel(row, ["Model"])),
        ups_backup_time: toStrOrNull(getExcel(row, ["Backup Time"])),
        ups_installer: toStrOrNull(getExcel(row, ["Installer"])),
        ups_rating: toStrOrNull(getExcel(row, ["Rating"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        name: toStrOrNull(getExcel(row, ["Name"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        ip_address: toStrOrNull(getExcel(row, ["IP Address"])),
        ups_status: toStrOrNull(getExcel(row, ["Status"])),
      };

    case "inverter":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code", "assetId"])),
        name: toStrOrNull(getExcel(row, ["Name"])),
        inverter_model: toStrOrNull(getExcel(row, ["Model", "Inverter Model"])),
        inverter_backup_time: toStrOrNull(getExcel(row, ["Backup Time", "Inverter Backup Time"])),
        inverter_installer: toStrOrNull(getExcel(row, ["Installer", "Inverter Installer"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
        battery_1: toStrOrNull(getExcel(row, ["Battery 1"])),
        battery_2: toStrOrNull(getExcel(row, ["Battery 2"])),
        battery_3: toStrOrNull(getExcel(row, ["Battery 3"])),
        battery_4: toStrOrNull(getExcel(row, ["Battery 4"])),
        battery_rating: toStrOrNull(getExcel(row, ["Battery Rating"])),
        inverter_purchase_year: toIntOrNullSafe(getExcel(row, ["Purchase Year", "Inverter Purchase Year"])),
        inverter_status: toStrOrNull(getExcel(row, ["Status", "Inverter Status"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
      };

    case "server":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        brand: toStrOrNull(getExcel(row, ["Brand"])),
        ip_address: toStrOrNull(getExcel(row, ["IP Address"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        model_no: toStrOrNull(getExcel(row, ["Model No"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        vendor: toStrOrNull(getExcel(row, ["Vendor"])),
        specification: toStrOrNull(getExcel(row, ["Specification"])),
        storage: toStrOrNull(getExcel(row, ["Storage"])),
        memory: toStrOrNull(getExcel(row, ["Memory"])),
        windows_server_version: toStrOrNull(getExcel(row, ["Window Server Version"])),
        virtualization: toYesNoOrNull(getExcel(row, ["Virtualization"])),
      };

    case "firewall_router":
    case "firewall-routers":
    case "firewallrouters":
      return {
        ...common,
        brand: toStrOrNull(getExcel(row, ["Brand"])),
        model: toStrOrNull(getExcel(row, ["Model"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        vendor: toStrOrNull(getExcel(row, ["Vendor"])),
        license_expiry: excelDateToJSDate(getExcel(row, ["Liscence-expiry", "License Expiry"])),
      };

    case "switch":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        asset_name: toStrOrNull(getExcel(row, ["Asset Name"])),
        model: toStrOrNull(getExcel(row, ["Model"])),
        type: toStrOrNull(getExcel(row, ["Type"])),
        brand: toStrOrNull(getExcel(row, ["Brand"])),
        location: toStrOrNull(getExcel(row, ["Location"])),
        port: toStrOrNull(getExcel(row, ["Port"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
      };

    case "extra_monitor":
    case "extramonitor":
    case "extra-monitor":
    case "extra_monitors":
      return {
        ...common,
        assetId: toStrOrNull(getExcel(row, ["Asset Code"])),
        monitor_brand: toStrOrNull(getExcel(row, ["Monitor Brand"])),
        monitor_size: toStrOrNull(getExcel(row, ["Monitor Size"])),
        monitor_location: toStrOrNull(getExcel(row, ["Monitor Location"])),
        monitor_status: toStrOrNull(getExcel(row, ["Monitor Status"])),
        system_model: toStrOrNull(getExcel(row, ["System Model"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User"])),
      };

    case "application_software":
      return {
        ...common,
        software_name: toStrOrNull(getExcel(row, ["Name"])),
        software_category: toStrOrNull(getExcel(row, ["Category"])),
        version: toStrOrNull(getExcel(row, ["Version"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        quantity: toIntOrNull(getExcel(row, ["Quantity"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
        assigned_to: toStrOrNull(getExcel(row, ["Assigned To"])),
      };

    case "office_software":
      return {
        ...common,
        software_name: toStrOrNull(getExcel(row, ["Name"])),
        software_category: toStrOrNull(getExcel(row, ["Category"])),
        version: toStrOrNull(getExcel(row, ["Version"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        installed_on: toStrOrNull(getExcel(row, ["Installed On"])),
        pc_name: toStrOrNull(getExcel(row, ["PC Name"])),
        installed_by: toStrOrNull(getExcel(row, ["Installed By"])),
        install_date: excelDateToJSDate(getExcel(row, ["Install Date"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        quantity: toIntOrNull(getExcel(row, ["Quantity"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
        assigned_to: toStrOrNull(getExcel(row, ["Assigned To"])),
      };

    case "utility_software":
      return {
        ...common,
        software_name: toStrOrNull(getExcel(row, ["Name"])),
        version: toStrOrNull(getExcel(row, ["Version"])),
        category: toStrOrNull(getExcel(row, ["Category"])),
        pc_name: toStrOrNull(getExcel(row, ["PC Name"])),
        installed_by: toStrOrNull(getExcel(row, ["Installed By"])),
        install_date: excelDateToJSDate(getExcel(row, ["Install Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "security_software":
      return {
        ...common,
        product_name: toStrOrNull(getExcel(row, ["Name"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        total_nodes: toIntOrNull(getExcel(row, ["Total Nodes"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "security_software_installed":
      return {
        ...common,
        product_name: toStrOrNull(getExcel(row, ["Name"])),
        version: toStrOrNull(getExcel(row, ["Version"])),
        pc_name: toStrOrNull(getExcel(row, ["PC Name"])),
        real_time_protection: toStrOrNull(getExcel(row, ["Real Time Protection"])),
        last_update_date: excelDateToJSDate(getExcel(row, ["Last Update Date"])),
        installed_by: toStrOrNull(getExcel(row, ["Installed By"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "services":
      return {
        ...common,
        service_name: toStrOrNull(getExcel(row, ["Name"])),
        service_category: toStrOrNull(getExcel(row, ["Category"])),
        provider_name: toStrOrNull(getExcel(row, ["Provider"])),
        contract_no: toStrOrNull(getExcel(row, ["Contract No"])),
        provider_contact: toStrOrNull(getExcel(row, ["Provider Contact"])),
        start_date: excelDateToJSDate(getExcel(row, ["Start Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "licenses":
      return {
        ...common,
        license_name: toStrOrNull(getExcel(row, ["Name"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        quantity: toIntOrNull(getExcel(row, ["Quantity"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
        assigned_to: toStrOrNull(getExcel(row, ["Assigned To"])),
      };

    case "windows_os":
      return {
        ...common,
        os_version: toStrOrNull(getExcel(row, ["OS Version"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        activation_status: toStrOrNull(getExcel(row, ["Activation Status"])),
        installed_date: excelDateToJSDate(getExcel(row, ["Installed Date"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "online_conference_tools":
      return {
        ...common,
        tool_name: toStrOrNull(getExcel(row, ["Name"])),
        vendor_name: toStrOrNull(getExcel(row, ["Vendor"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        no_of_users: toIntOrNull(getExcel(row, ["No of Users", "No Of Users"])),
        purchase_date: excelDateToJSDate(getExcel(row, ["Purchase Date"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    case "windows_servers":
      return {
        ...common,
        server_name: toStrOrNull(getExcel(row, ["Server Name"])),
        server_role: toStrOrNull(getExcel(row, ["Server Role"])),
        os_version: toStrOrNull(getExcel(row, ["OS Version"])),
        license_type: normalizeLicenseType(getExcel(row, ["License Type"])),
        license_key: toStrOrNull(getExcel(row, ["License Key"])),
        cores_licensed: toIntOrNull(getExcel(row, ["Cores Licensed"])),
        expiry_date: excelDateToJSDate(getExcel(row, ["Expiry Date"])),
      };

    default:
      return common;
  }
};

const sectionMap = {
  desktop: { type: "multi", model: BranchDesktop, usesAssetId: true },

  qr_desktop_computer: { type: "multi", model: QrDesktopComputer, usesAssetId: true },
  "qr-desktop-computer": { type: "multi", model: QrDesktopComputer, usesAssetId: true },
  qrdesktopcomputer: { type: "multi", model: QrDesktopComputer, usesAssetId: true },
  qr_desktop_computers: { type: "multi", model: QrDesktopComputer, usesAssetId: true },
  "qr-desktop-computers": { type: "multi", model: QrDesktopComputer, usesAssetId: true },

  laptop: { type: "multi", model: BranchLaptop, usesAssetId: true },
  printer: { type: "multi", model: BranchPrinter, usesAssetId: true },
  scanner: { type: "multi", model: BranchScanner, usesAssetId: true },
  projector: { type: "multi", model: BranchProjector, usesAssetId: true },
  panel: { type: "multi", model: BranchPanel, usesAssetId: true },
  ipphone: { type: "multi", model: BranchIpPhone, usesAssetId: true },
  cctv: { type: "multi", model: BranchCctv, usesAssetId: true },
  server: { type: "multi", model: BranchServer, usesAssetId: true },
  firewall_router: { type: "multi", model: BranchFirewallRouter, usesAssetId: false },
  "firewall-routers": { type: "multi", model: BranchFirewallRouter, usesAssetId: false },
  firewallrouters: { type: "multi", model: BranchFirewallRouter, usesAssetId: false },
  switch: { type: "multi", model: BranchSwitch, usesAssetId: true },
  extra_monitor: { type: "multi", model: BranchExtraMonitor, usesAssetId: true },
  extramonitor: { type: "multi", model: BranchExtraMonitor, usesAssetId: true },
  "extra-monitor": { type: "multi", model: BranchExtraMonitor, usesAssetId: true },
  extra_monitors: { type: "multi", model: BranchExtraMonitor, usesAssetId: true },
  connectivity: { type: "multi", model: BranchConnectivity, usesAssetId: true },
  ups: { type: "multi", model: BranchUps, usesAssetId: true },
  inverter: { type: "multi", model: Inverter, usesAssetId: true },

  application_software: { type: "multi", model: BranchApplicationSoftware, usesAssetId: false },
  office_software: { type: "multi", model: BranchOfficeSoftware, usesAssetId: false },
  utility_software: { type: "multi", model: BranchUtilitySoftware, usesAssetId: false },
  security_software: { type: "multi", model: BranchSecuritySoftware, usesAssetId: false },
  security_software_installed: { type: "multi", model: BranchSecuritySoftwareInstalled, usesAssetId: false },
  services: { type: "multi", model: BranchServices, usesAssetId: false },
  licenses: { type: "multi", model: BranchLicenses, usesAssetId: false },
  windows_os: { type: "multi", model: BranchWindowsOS, usesAssetId: false },
  online_conference_tools: { type: "multi", model: BranchOnlineConferenceTools, usesAssetId: false },
  windows_servers: { type: "multi", model: BranchWindowsServers, usesAssetId: false },
};

exports.importAssets = asyncHandler(async (req, res) => {
  const rows = req.body?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return sendError(res, "rows[] is required", 400);
  }

  const result = {
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const rowNo = item?.rowNo ?? i + 1;

    const section = normLower(item?.section);
    const branchId = toIntOrNull(item?.branchId);
    const excelRow = item?.excelRow || item?.data || item;

    if (!section || !branchId) {
      result.failed++;
      result.errors.push({ rowNo, message: "Missing section or branchId" });
      continue;
    }

    const cfg = sectionMap[section];

    if (!cfg) {
      result.failed++;
      result.errors.push({ rowNo, message: `Invalid section: "${section}"` });
      continue;
    }

    const identifierRaw = cfg.usesAssetId
      ? getExcel(excelRow, ["Asset Code", "Asset ID", "assetId", "asset_id", "AssetID"]) ||
        item?.assetId ||
        null
      : null;

    const numericId = cfg.usesAssetId ? toIntOrNull(identifierRaw) : null;
    const stringAssetId = cfg.usesAssetId ? toStrOrNull(identifierRaw) : null;

    let payload =
      item?.payload && typeof item.payload === "object"
        ? item.payload
        : buildPayloadFromExcelRow(section, excelRow);

    payload = attachExtrasFromExcel(cfg.model, excelRow, payload);

    const t = await db.sequelize.transaction();

    try {
      payload.branchId = branchId;

      let whereCondition = {};
      let rec = null;

      if (section === "cctv") {
        const branch = await Branch.findByPk(branchId, { transaction: t });

        if (!branch) throw new Error("Branch not found");

        if (numericId) {
          whereCondition = { cctv_id: numericId, branchId };
        } else if (stringAssetId) {
          whereCondition = { assetId: stringAssetId, branchId };
        }
      } else if (section === "online_conference_tools") {
        const toolName = payload.tool_name || toStrOrNull(getExcel(excelRow, ["Name"]));

        if (toolName) {
          whereCondition = { branchId, tool_name: toolName };
        }
      } else if (cfg.usesAssetId) {
        if (numericId) {
          whereCondition = { id: numericId, branchId };
        } else if (stringAssetId) {
          whereCondition = { assetId: stringAssetId, branchId };
        }
      }

      if (Object.keys(whereCondition).length) {
        rec = await cfg.model.findOne({ where: whereCondition, transaction: t });
      }

      if (rec) {
        await rec.update(payload, { transaction: t });
        result.updated++;
      } else {
        if (cfg.usesAssetId && stringAssetId) {
          payload.assetId = stringAssetId;
        }

        await cfg.model.create(payload, { transaction: t });
        result.inserted++;
      }

      await t.commit();
    } catch (rowErr) {
      await t.rollback();

      result.failed++;
      result.errors.push({
        rowNo,
        message: rowErr?.message || "Row import failed",
      });
    }
  }

  return sendSuccess(res, result, "Import finished");
});