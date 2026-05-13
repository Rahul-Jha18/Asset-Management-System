// backend/jobs/expiryJob.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("../models");
const { sendMail } = require("../utils/mailer");

const {
  Notification,
  BranchLicenses,
  BranchServices,
  BranchWindowsServers,
  BranchWindowsOS,
  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchUtilitySoftware,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchOnlineConferenceTools,
  BranchDesktop,
  BranchLaptop,
  BranchPrinter,
  BranchProjector,
  BranchUps,
  BranchPanel,
  BranchIpPhone,
  BranchServer,
  BranchFirewallRouter,
} = db;

function toDateOnly(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildUniqKey(entityType, entityId, dueDate, status) {
  return `${entityType}:${entityId}:${dueDate}:${status}`;
}

function getDisplayName(row, keys = [], fallback) {
  for (const key of keys) {
    if (row[key] && String(row[key]).trim()) {
      return String(row[key]).trim();
    }
  }
  return fallback;
}

async function runExpiryCheck({ daysAhead = 3 } = {}) {
  const adminEmail = process.env.ADMIN_EMAIL;

  const today = new Date();
  const start = toDateOnly(today);
  const end = toDateOnly(addDays(today, daysAhead));

  const sources = [
    { entityType: "licenses", model: BranchLicenses, nameKeys: ["license_name", "product_name", "license_key"], dateField: "expiry_date" },
    { entityType: "services", model: BranchServices, nameKeys: ["service_name", "service_provider"], dateField: "expiry_date" },
    { entityType: "windows_servers", model: BranchWindowsServers, nameKeys: ["server_name", "vendor_name", "version"], dateField: "expiry_date" },
    { entityType: "windows_os", model: BranchWindowsOS, nameKeys: ["vendor_name", "version", "edition"], dateField: "expiry_date" },
    { entityType: "application_software", model: BranchApplicationSoftware, nameKeys: ["software_name", "vendor_name", "version"], dateField: "expiry_date" },
    { entityType: "office_software", model: BranchOfficeSoftware, nameKeys: ["software_name", "vendor_name", "version"], dateField: "expiry_date" },
    { entityType: "utility_software", model: BranchUtilitySoftware, nameKeys: ["software_name", "vendor_name", "version"], dateField: "expiry_date" },
    { entityType: "security_software", model: BranchSecuritySoftware, nameKeys: ["product_name", "vendor_name", "version"], dateField: "expiry_date" },
    { entityType: "security_software_installed", model: BranchSecuritySoftwareInstalled, nameKeys: ["product_name", "software_name", "installed_by", "device_name"], dateField: "expiry_date" },
    { entityType: "online_conference_tools", model: BranchOnlineConferenceTools, nameKeys: ["tool_name", "vendor_name", "license_type"], dateField: "expiry_date" },

    // existing hardware / network tables kept unchanged
// { entityType: "servers", model: BranchServer, nameKeys: ["ip_address"], dateField: "expiry_date" },
    { entityType: "servers", model: BranchServer, nameKeys: ["ip_address"], dateField: "warranty_expiry" },
    { entityType: "firewall_routers", model: BranchFirewallRouter, nameKeys: ["model"], dateField: "license_expiry" },
  ];

  const newNotifications = [];

  for (const src of sources) {
    if (!src.model) continue;

    const dateField = src.dateField;

    const [expiringSoon, overdue] = await Promise.all([
      src.model.findAll({
        where: { [dateField]: { [Op.between]: [start, end] } },
        limit: 5000,
      }),
      src.model.findAll({
        where: { [dateField]: { [Op.lt]: start } },
        limit: 5000,
      }),
    ]);

    const rows = [
      ...expiringSoon.map((r) => ({ ...r.get(), __status: "EXPIRING" })),
      ...overdue.map((r) => ({ ...r.get(), __status: "OVERDUE" })),
    ];

    if (!rows.length) continue;

    const uniqKeys = rows
      .map((r) => {
        const expiry = r[dateField] ? toDateOnly(r[dateField]) : null;
        return expiry ? buildUniqKey(src.entityType, r.id, expiry, r.__status) : null;
      })
      .filter(Boolean);

    const existingNotifs = await Notification.findAll({ where: { uniqKey: uniqKeys } });
    const existingKeys = new Set(existingNotifs.map((n) => n.uniqKey));

    for (const r of rows) {
      const expiry = r[dateField] ? toDateOnly(r[dateField]) : null;
      if (!expiry) continue;

      const status = r.__status;
      const entityId = r.id;
      const uniq = buildUniqKey(src.entityType, entityId, expiry, status);
      if (existingKeys.has(uniq)) continue;

      const displayName = getDisplayName(
        r,
        src.nameKeys || [],
        `${src.entityType}#${entityId}`
      );

      const branchId = r.branchId ?? null;

      const title = status === "OVERDUE"
        ? `Expired: ${displayName}`
        : `Expiry soon: ${displayName}`;

      const message = status === "OVERDUE"
        ? `${displayName} expired on ${expiry}.`
        : `${displayName} will expire on ${expiry} (within ${daysAhead} days).`;

      const notifType = status === "OVERDUE" ? "error" : "warning";

      try {
        const created = await Notification.create({
          type: notifType,
          title,
          message,
          entityType: src.entityType,
          entityId,
          expiryDate: expiry,
          dueDate: expiry,
          uniqKey: uniq,
          is_read: false,
          link: "/reports",
          meta: {
            branchId,
            displayName,
            daysAhead,
            status,
            sourceTable: src.model?.getTableName?.() || src.entityType,
            dateField,
          },
        });
        newNotifications.push(created);
      } catch (err) {
        console.error(
          `[ExpiryJob] Failed to create notification for ${displayName}:`,
          err.message || err
        );
      }
    }
  }

  if (adminEmail && newNotifications.length > 0) {
    const subject = "IT Asset Expiry & Overdue Notification Summary";

    const tableRows = newNotifications
      .slice(0, 50)
      .map(
        (n, i) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;text-align:center;">${i + 1}</td>
        <td style="padding:8px;">${String(n.type || "").toUpperCase()}</td>
        <td style="padding:8px;">${n.title}</td>
        <td style="padding:8px;text-align:center;">${n.meta?.branchId || "-"}</td>
        <td style="padding:8px;text-align:center;">${n.dueDate || n.due_date || "-"}</td>
      </tr>`
      )
      .join("");

    const html = `
  <div style="font-family:Arial,sans-serif; font-size:14px; color:#333;">
    <p>Dear Admin,</p>
    <p>This is an automated notification from the <strong>Project Asset Management System (AMS)</strong>.</p>
    <p>The system has identified IT assets whose validity or warranty period is either:</p>
    <ul>
      <li>Approaching expiry within the next <strong>${daysAhead} days</strong></li>
      <li>Already expired and requiring immediate attention</li>
    </ul>
    <p><strong>Summary of newly generated alerts:</strong></p>
    <table style="border-collapse:collapse; width:100%; margin-top:10px;">
      <thead>
        <tr style="background-color:#f2f2f2;">
          <th style="padding:8px; border-bottom:1px solid #ddd;">#</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Type</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Title</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Branch ID</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <p style="margin-top:15px;">
      Please review the above items and take necessary actions to ensure uninterrupted operations and compliance.
    </p>
    <p style="margin-top:20px;">This is a system-generated message. Please do not reply.</p>
    <p>Regards,<br>
    <strong>IT & Digital Transformation Department</strong><br>
    Nepal Life Insurance Company Ltd.</p>
  </div>
  `;

    try {
      await sendMail({ to: adminEmail, subject, html });
      console.log(`[ExpiryJob] Email sent to ${adminEmail} for ${newNotifications.length} alerts.`);
    } catch (err) {
      console.error("[ExpiryJob] Email send failed:", err?.message || err);
    }
  } else {
    console.log(`[ExpiryJob] Done. New alerts: ${newNotifications.length}`);
    if (!adminEmail) console.log("[ExpiryJob] ADMIN_EMAIL not set. Email skipped.");
  }

  return { count: newNotifications.length };
}

function startExpiryJob() {
  const cronExpr = process.env.EXPIRY_CRON || "45 11 * * *";
  const daysAhead = Number(process.env.EXPIRY_DAYS_AHEAD || 7);

  cron.schedule(
    cronExpr,
    async () => {
      console.log("[ExpiryJob] Running expiry check...");
      await runExpiryCheck({ daysAhead });
    },
    { timezone: "Asia/Kathmandu" }
  );

  console.log(`[ExpiryJob] Scheduled: ${cronExpr} (Asia/Kathmandu), daysAhead=${daysAhead}`);
}

module.exports = { startExpiryJob, runExpiryCheck };