const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");

const db = require("../models");
const { sendMail } = require("../utils/mailer");

const User = db.User;

const {
  BranchIssue,
  BranchIssueCategory,
  BranchIssueAttachment,
  BranchIssueMessage,
  BranchIssueActivityLog,
} = require("../models/BranchIssue");

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const isApprover = (user) => {
  const role = normalizeRole(user?.role);

  return [
    "admin",
    "approver",
    "headoffice",
    "corpuser",
  ].includes(role);
};

/*
  Access rules:

  Admin, Approver and Head Office:
  - Can view all issues.

  Corporate users:
  - Can view only issues assigned to them.

  Branch users:
  - Can view issues from their own branch.
*/
const branchScope = (user) => {
  const role = normalizeRole(user?.role);

  if (
    ["admin", "approver", "headoffice"].includes(role)
  ) {
    return {};
  }

  if (role === "corpuser") {
    return {
      assigned_to_user_id: user?.id ?? -1,
    };
  }

  const branchId =
    user?.branch_id ??
    user?.branchId ??
    user?.service_station_id ??
    null;

  if (branchId) {
    return {
      reporter_branch_id: branchId,
    };
  }

  return {
    reporter_user_id: user?.id ?? -1,
  };
};

/*
  Generates ticket numbers such as:

  NL-ISS-2026-5001
*/
const generateTicketNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `NL-ISS-${year}-`;

  const latestIssue = await BranchIssue.findOne({
    where: {
      ticket_no: {
        [Op.like]: `${prefix}%`,
      },
    },
    attributes: ["ticket_no"],
    order: [["id", "DESC"]],
  });

  let nextNumber = 5001;

  if (latestIssue?.ticket_no) {
    const lastNumber = Number(
      String(latestIssue.ticket_no).replace(prefix, "")
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber}`;
};

const toNullableNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return numericValue;
};


const VALID_ISSUE_TYPES = [
  "Employee",
  "Customer",
];

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

const normalizeIssueTypeValue = (value, fallback = "Employee") => {
  const normalized = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (
    normalized === "customer" ||
    normalized === "customerissue"
  ) {
    return "Customer";
  }

  return "Employee";
};

const normalizeIssueTypeFilter = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return normalizeIssueTypeValue(value);
};

const normalizeCustomerCategoryName = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 160);

const buildCustomerCategoryObject = (name) => ({
  id: null,
  name:
    normalizeCustomerCategoryName(name) ||
    "Customer Issue",
  code: "CUSTOMER",
});

const getIssueCategoryDisplayName = (issue, category) => {
  const issueType = normalizeIssueTypeValue(
    issue?.issue_type
  );

  if (issueType === "Customer") {
    return (
      normalizeCustomerCategoryName(
        issue?.customer_category_name
      ) ||
      normalizeCustomerCategoryName(
        issue?.custom_category_name
      ) ||
      "Customer Issue"
    );
  }

  return String(
    category?.name ||
      issue?.category?.name ||
      "General"
  ).trim();
};


const getSequelizeErrorPayload = (error) => ({
  name: error?.name,
  message: error?.message,

  errors: error?.errors?.map((item) => ({
    message: item.message,
    path: item.path,
    value: item.value,
    validatorKey: item.validatorKey,
  })),

  parent: error?.parent
    ? {
        code: error.parent.code,
        errno: error.parent.errno,
        sqlMessage: error.parent.sqlMessage,
      }
    : null,
});


const getUserBranchId = (user) =>
  toNullableNumber(user?.branch_id) ??
  toNullableNumber(user?.branchId) ??
  toNullableNumber(user?.service_station_id) ??
  null;

const getAnalysisScope = (user) => {
  const role = normalizeRole(user?.role);
  const branchId = getUserBranchId(user);

  /*
    Dashboard visibility rule:
    - admin / corp_user / approver / head office: all issue data
    - subadmin: station/branch scoped data using service_station_id/branch_id
    - normal branch user: own branch data, fallback to own submitted issues
  */
  if (
    [
      "admin",
      "corpuser",
      "approver",
      "headoffice",
    ].includes(role)
  ) {
    return {
      where: {},
      label: "All branches",
      role,
      level: "all",
    };
  }

  if (role === "subadmin") {
    if (branchId) {
      return {
        where: {
          reporter_branch_id: branchId,
        },
        label: "Assigned station / branch",
        role,
        level: "station",
      };
    }

    return {
      where: {
        reporter_user_id: user?.id ?? -1,
      },
      label: "Your submitted issues",
      role,
      level: "own",
    };
  }

  if (branchId) {
    return {
      where: {
        reporter_branch_id: branchId,
      },
      label: "Your branch",
      role,
      level: "branch",
    };
  }

  return {
    where: {
      reporter_user_id: user?.id ?? -1,
    },
    label: "Your submitted issues",
    role,
    level: "own",
  };
};

const getIssueTypeForAnalysis = (issue) =>
  normalizeIssueTypeValue(
    issue?.issue_type || "Employee"
  );

const getCategoryForAnalysis = (issue) => {
  const issueType = getIssueTypeForAnalysis(issue);

  if (issueType === "Customer") {
    return (
      normalizeCustomerCategoryName(
        issue?.customer_category_name
      ) ||
      normalizeCustomerCategoryName(
        issue?.custom_category_name
      ) ||
      "Customer Issue"
    );
  }

  return (
    issue?.category?.name ||
    "Uncategorized"
  );
};

const getAnyValue = (row, keys) => {
  for (const key of keys) {
    if (
      row?.[key] !== undefined &&
      row?.[key] !== null &&
      String(row[key]).trim() !== ""
    ) {
      return row[key];
    }
  }

  return null;
};

const getBranchModel = () =>
  db.Branch ||
  db.Branches ||
  db.BranchMaster ||
  db.BranchInfo ||
  db.NlicBranch ||
  db.nlicBranch ||
  db.NLICBranch ||
  null;

const loadReporterUserLookup = async (issues) => {
  const ids = Array.from(
    new Set(
      issues
        .map((issue) => {
          const row =
            typeof issue.toJSON === "function"
              ? issue.toJSON()
              : issue;

          return row?.reporter_user_id;
        })
        .filter((value) => value !== null && value !== undefined)
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value))
    )
  );

  const emails = Array.from(
    new Set(
      issues
        .map((issue) => {
          const row =
            typeof issue.toJSON === "function"
              ? issue.toJSON()
              : issue;

          return String(row?.reporter_email || "")
            .trim()
            .toLowerCase();
        })
        .filter(Boolean)
    )
  );

  if (!ids.length && !emails.length) {
    return {
      byId: {},
      byEmail: {},
    };
  }

  const orWhere = [];

  if (ids.length) {
    orWhere.push({
      id: {
        [Op.in]: ids,
      },
    });
  }

  if (emails.length) {
    orWhere.push({
      email: {
        [Op.in]: emails,
      },
    });
  }

  const users = await User.findAll({
    where: {
      [Op.or]: orWhere,
    },

    attributes: [
      "id",
      "name",
      "email",
      "role",
      "service_station_id",
      "br_code",
      "emp_code",
    ],
  });

  const byId = {};
  const byEmail = {};

  for (const user of users) {
    const row =
      typeof user.toJSON === "function"
        ? user.toJSON()
        : user;

    if (row?.id !== undefined && row?.id !== null) {
      byId[String(row.id)] = row;
    }

    if (row?.email) {
      byEmail[String(row.email).trim().toLowerCase()] = row;
    }
  }

  return {
    byId,
    byEmail,
  };
};

const loadBranchLookup = async () => {
  const BranchModel = getBranchModel();

  const lookup = {
    byCode: {},
    byId: {},
  };

  if (!BranchModel?.findAll) {
    return lookup;
  }

  try {
    const branches = await BranchModel.findAll({
      raw: true,
    });

    for (const branch of branches) {
      const branchId = getAnyValue(branch, [
        "id",
        "Id",
        "branch_id",
        "BranchId",
        "BranchID",
      ]);

      const branchCode = getAnyValue(branch, [
        "br_code",
        "BrCode",
        "BR_CODE",
        "branch_code",
        "BranchCode",
        "code",
        "Code",
      ]);

      const branchName = getAnyValue(branch, [
        "name",
        "Name",
        "branch_name",
        "BranchName",
        "BrName",
        "BR_NAME",
      ]);

      if (branchName) {
        if (branchCode !== null) {
          lookup.byCode[String(branchCode).trim()] =
            String(branchName).trim();
        }

        if (branchId !== null) {
          lookup.byId[String(branchId).trim()] =
            String(branchName).trim();
        }
      }
    }
  } catch (error) {
    console.warn("Branch lookup failed for analysis dashboard:", {
      message: error?.message,
    });
  }

  return lookup;
};

const getBranchForAnalysis = (
  issue,
  reporterUserLookup = {
    byId: {},
    byEmail: {},
  },
  branchLookup = {
    byCode: {},
    byId: {},
  }
) => {
  const reporterUser =
    reporterUserLookup.byId?.[
      String(issue?.reporter_user_id ?? "")
    ] ||
    reporterUserLookup.byEmail?.[
      String(issue?.reporter_email || "")
        .trim()
        .toLowerCase()
    ] ||
    null;

  const branchId =
    issue?.reporter_branch_id ??
    issue?.branch_id ??
    reporterUser?.service_station_id ??
    null;

  const branchCode =
    issue?.reporter_branch_code ??
    issue?.br_code ??
    reporterUser?.br_code ??
    null;

  const branchName =
    (branchCode !== null &&
      branchLookup.byCode?.[
        String(branchCode).trim()
      ]) ||
    (branchId !== null &&
      branchLookup.byId?.[
        String(branchId).trim()
      ]) ||
    null;

  if (branchName && branchCode) {
    return `${branchName} (${branchCode})`;
  }

  if (branchName) {
    return branchName;
  }

  if (branchCode) {
    return `Branch ${branchCode}`;
  }

  if (branchId) {
    return `Branch ${branchId}`;
  }

  return "Unknown branch";
};

const monthKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const incrementGroup = (target, key) => {
  const safeKey =
    String(key || "").trim() ||
    "Unknown";

  target[safeKey] =
    (target[safeKey] || 0) + 1;
};

const groupMapToArray = (map, limit = 12) =>
  Object.entries(map)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);


/* ─────────────────────────────────────────────────────────────
   PROFESSIONAL EMAIL HELPERS
───────────────────────────────────────────────────────────── */

const isValidEmail = (value) => {
  const email = String(value || "")
    .trim()
    .toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/*
  Converts rich-text issue descriptions into safe readable text.

  Example:
  <p>Printer is <strong>not working</strong></p>

  becomes:
  Printer is not working
*/
const stripHtml = (value) =>
  String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const formatEmailDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIssueUrl = (issueId) => {
  const baseUrl = String(
    process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      process.env.CLIENT_URL_VITE ||
      process.env.APP_URL ||
      "http://localhost:3001"
  ).replace(/\/$/, "");

  return `${baseUrl}/branch-issues/${issueId}`;
};

const getBackendBaseUrl = () =>
  String(
    process.env.BACKEND_URL ||
      process.env.API_URL ||
      "http://192.168.0.50:5001"
  ).replace(/\/$/, "");

const buildAttachmentResponse = (attachment) => {
  const item =
    typeof attachment?.toJSON === "function"
      ? attachment.toJSON()
      : { ...attachment };

  if (item?.stored_file_name) {
    item.file_url =
      `${getBackendBaseUrl()}/uploads/branch-issues/${encodeURIComponent(
        item.stored_file_name
      )}`;
  }

  return item;
};

const getPriorityTheme = (priority) => {
  switch (
    String(priority || "")
      .trim()
      .toLowerCase()
  ) {
    case "critical":
      return {
        text: "#991B1B",
        background: "#FEE2E2",
        border: "#FCA5A5",
        accent: "#DC2626",
      };

    case "high":
      return {
        text: "#9A3412",
        background: "#FFEDD5",
        border: "#FDBA74",
        accent: "#EA580C",
      };

    case "low":
      return {
        text: "#166534",
        background: "#DCFCE7",
        border: "#86EFAC",
        accent: "#16A34A",
      };

    case "medium":
    default:
      return {
        text: "#92400E",
        background: "#FEF3C7",
        border: "#FCD34D",
        accent: "#D97706",
      };
  }
};

const getStatusTheme = (status) => {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "closed":
      return {
        text: "#334155",
        background: "#E2E8F0",
        border: "#CBD5E1",
      };

    case "underreview":
    case "under review":
      return {
        text: "#92400E",
        background: "#FEF3C7",
        border: "#FCD34D",
      };

    case "open":
    default:
      return {
        text: "#166534",
        background: "#DCFCE7",
        border: "#86EFAC",
      };
  }
};

const buildDetailRow = ({
  label,
  value,
  valueHtml,
  last = false,
}) => `
  <tr>
    <td
      width="145"
      valign="top"
      style="
        width:145px;
        padding:12px 14px;
        border-bottom:${last ? "none" : "1px solid #E8EDF3"};
        color:#64748B;
        font-family:Arial,Helvetica,sans-serif;
        font-size:12px;
        font-weight:700;
        line-height:18px;
        text-transform:uppercase;
        letter-spacing:.04em;
      "
    >
      ${escapeHtml(label)}
    </td>

    <td
      valign="top"
      style="
        padding:12px 14px;
        border-bottom:${last ? "none" : "1px solid #E8EDF3"};
        color:#172033;
        font-family:Arial,Helvetica,sans-serif;
        font-size:14px;
        font-weight:600;
        line-height:20px;
        word-break:break-word;
      "
    >
      ${valueHtml || escapeHtml(value || "—")}
    </td>
  </tr>
`;

const sendIssueAssignmentEmail = async ({
  issue,
  assignedUser,
  category,
  reporter,
}) => {
  const recipientEmail = String(
    assignedUser?.email || ""
  )
    .trim()
    .toLowerCase();

  if (!isValidEmail(recipientEmail)) {
    return {
      sent: false,
      reason:
        "The assigned user does not have a valid email address",
    };
  }

  const issueUrl = getIssueUrl(issue.id);

  const assignedName =
    String(assignedUser?.name || "").trim() ||
    "Issue Handler";

  const reporterName =
    String(
      reporter?.name ||
        reporter?.email ||
        "Branch User"
    ).trim();

  const reporterEmail =
    String(reporter?.email || "").trim();

  const issueTypeLabel = normalizeIssueTypeValue(issue?.issue_type);

  const categoryName = getIssueCategoryDisplayName(issue, category);

  const descriptionText =
    stripHtml(issue.description) ||
    "No description was provided.";

  const expectedOutcomeText =
    stripHtml(issue.expected_outcome);

  const priority =
    String(issue.priority || "Medium").trim();

  const status =
    String(issue.status || "Open").trim();

  const submittedAt =
    formatEmailDate(issue.created_at);

  const priorityTheme =
    getPriorityTheme(priority);

  const statusTheme =
    getStatusTheme(status);

  const emailSubject =
    `[${issue.ticket_no}] New issue assigned: ${issue.title}`;

  const plainTextMessage = [
    "NEPAL LIFE",
    "Asset Management System",
    "",
    "NEW ISSUE ASSIGNED",
    "",
    `Hello ${assignedName},`,
    "",
    "A new branch issue has been assigned to you and requires your review.",
    "",
    `Ticket Number: ${issue.ticket_no}`,
    `Issue Title: ${issue.title}`,
    `Issue Type: ${issueTypeLabel}`,
    `Category: ${categoryName}`,
    `Priority: ${priority}`,
    `Status: ${status}`,
    `Reported By: ${reporterName}`,
    reporterEmail
      ? `Reporter Email: ${reporterEmail}`
      : null,
    `Submitted On: ${submittedAt}`,
    "",
    "ISSUE DESCRIPTION",
    descriptionText,
    "",
    expectedOutcomeText
      ? "EXPECTED OUTCOME"
      : null,
    expectedOutcomeText || null,
    "",
    `Open assigned issue: ${issueUrl}`,
    "",
    "Please review the issue and update its status through the Asset Management System.",
    "",
    "This is an automated message. Please do not reply directly to this email.",
    "",
    "Nepal Life Insurance Company Limited",
    "Asset Management System",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const htmlMessage = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1"
    >

    <title>${escapeHtml(emailSubject)}</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#EEF2F7;
      color:#172033;
      font-family:Arial,Helvetica,sans-serif;
      -webkit-text-size-adjust:100%;
      -ms-text-size-adjust:100%;
    "
  >
    <!-- Email preview text -->
    <div
      style="
        display:none;
        max-height:0;
        overflow:hidden;
        opacity:0;
        color:transparent;
      "
    >
      ${escapeHtml(
        `New issue ${issue.ticket_no} has been assigned to you.`
      )}
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width:100%;
        border-collapse:collapse;
        background-color:#EEF2F7;
      "
    >
      <tr>
        <td
          align="center"
          style="padding:28px 12px;"
        >
          <table
            role="presentation"
            width="680"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width:100%;
              max-width:680px;
              border-collapse:separate;
              background-color:#FFFFFF;
              border:1px solid #DCE4ED;
              border-radius:18px;
              overflow:hidden;
              box-shadow:0 12px 35px rgba(15,23,42,.10);
            "
          >
            <!-- Brand header -->
            <tr>
              <td
                style="
                  padding:0;
                  background-color:#FFFFFF;
                  border-radius:18px 18px 0 0;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="border-collapse:collapse;"
                >
                  <tr>
                    <td
                      style="
                        padding:20px 24px;
                        border-bottom:1px solid #E7ECF2;
                      "
                    >
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="border-collapse:collapse;"
                      >
                        <tr>
                          <td
                            width="58"
                            valign="middle"
                            style="width:58px;"
                          >
                            <!-- Text-based logo mark -->
                            <table
                              role="presentation"
                              width="48"
                              height="48"
                              cellspacing="0"
                              cellpadding="0"
                              border="0"
                              style="
                                width:48px;
                                height:48px;
                                border-collapse:separate;
                                background-color:#D71920;
                                border-radius:13px;
                              "
                            >
                              <tr>
                                <td
                                  align="center"
                                  valign="middle"
                                  style="
                                    color:#FFFFFF;
                                    font-family:Arial,Helvetica,sans-serif;
                                    font-size:20px;
                                    font-weight:900;
                                    letter-spacing:-1px;
                                  "
                                >
                                  NL
                                </td>
                              </tr>
                            </table>
                          </td>

                          <td
                            valign="middle"
                            style="padding-left:3px;"
                          >
                            <div
                              style="
                                color:#D71920;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:22px;
                                font-weight:900;
                                line-height:25px;
                                letter-spacing:-.5px;
                              "
                            >
                              NEPAL LIFE
                            </div>

                            <div
                              style="
                                margin-top:2px;
                                color:#64748B;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:11px;
                                font-weight:700;
                                line-height:16px;
                                letter-spacing:.08em;
                                text-transform:uppercase;
                              "
                            >
                              Asset Management System
                            </div>
                          </td>

                          <td
                            align="right"
                            valign="middle"
                            style="padding-left:12px;"
                          >
                            <span
                              style="
                                display:inline-block;
                                padding:7px 11px;
                                background-color:#F1F5F9;
                                border:1px solid #DCE4ED;
                                border-radius:999px;
                                color:#475569;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:11px;
                                font-weight:700;
                                line-height:15px;
                              "
                            >
                              Issue Notification
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero -->
            <tr>
              <td
                style="
                  padding:28px 26px 26px;
                  background-color:#152A54;
                  border-left:6px solid #D71920;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="border-collapse:collapse;"
                >
                  <tr>
                    <td valign="top">
                      <div
                        style="
                          color:#FFB7BA;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:11px;
                          font-weight:800;
                          line-height:16px;
                          letter-spacing:.10em;
                          text-transform:uppercase;
                        "
                      >
                        Action required
                      </div>

                      <div
                        style="
                          margin-top:7px;
                          color:#FFFFFF;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:25px;
                          font-weight:800;
                          line-height:32px;
                          letter-spacing:-.4px;
                        "
                      >
                        New Issue Assigned
                      </div>

                      <div
                        style="
                          margin-top:10px;
                          color:#D8E2F2;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;
                          font-weight:400;
                          line-height:22px;
                        "
                      >
                        A new issue has been assigned to your account.
                        Please review the details and take the appropriate action.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main content -->
            <tr>
              <td style="padding:27px 26px 12px;">
                <div
                  style="
                    color:#172033;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:16px;
                    font-weight:400;
                    line-height:25px;
                  "
                >
                  Hello
                  <strong>${escapeHtml(assignedName)}</strong>,
                </div>

                <div
                  style="
                    margin-top:8px;
                    color:#526174;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:14px;
                    font-weight:400;
                    line-height:23px;
                  "
                >
                  The following issue has been submitted and assigned
                  to you through the Nepal Life Asset Management System.
                </div>
              </td>
            </tr>

            <!-- Ticket highlight -->
            <tr>
              <td style="padding:12px 26px 0;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    border-collapse:separate;
                    background-color:#F8FAFC;
                    border:1px solid #DCE4ED;
                    border-radius:14px;
                  "
                >
                  <tr>
                    <td style="padding:17px 18px;">
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        style="border-collapse:collapse;"
                      >
                        <tr>
                          <td valign="middle">
                            <div
                              style="
                                color:#64748B;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:10px;
                                font-weight:800;
                                line-height:15px;
                                letter-spacing:.08em;
                                text-transform:uppercase;
                              "
                            >
                              Ticket number
                            </div>

                            <div
                              style="
                                margin-top:4px;
                                color:#152A54;
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:20px;
                                font-weight:900;
                                line-height:25px;
                              "
                            >
                              ${escapeHtml(issue.ticket_no)}
                            </div>
                          </td>

                          <td
                            align="right"
                            valign="middle"
                          >
                            <span
                              style="
                                display:inline-block;
                                margin:2px;
                                padding:7px 11px;
                                background-color:${priorityTheme.background};
                                border:1px solid ${priorityTheme.border};
                                border-radius:999px;
                                color:${priorityTheme.text};
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:11px;
                                font-weight:800;
                                line-height:15px;
                              "
                            >
                              ${escapeHtml(priority)} Priority
                            </span>

                            <span
                              style="
                                display:inline-block;
                                margin:2px;
                                padding:7px 11px;
                                background-color:${statusTheme.background};
                                border:1px solid ${statusTheme.border};
                                border-radius:999px;
                                color:${statusTheme.text};
                                font-family:Arial,Helvetica,sans-serif;
                                font-size:11px;
                                font-weight:800;
                                line-height:15px;
                              "
                            >
                              ${escapeHtml(
                                status === "UnderReview"
                                  ? "Under Review"
                                  : status
                              )}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Issue details -->
            <tr>
              <td style="padding:20px 26px 0;">
                <div
                  style="
                    margin-bottom:9px;
                    color:#152A54;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:12px;
                    font-weight:800;
                    line-height:18px;
                    letter-spacing:.07em;
                    text-transform:uppercase;
                  "
                >
                  Issue information
                </div>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    border-collapse:separate;
                    border:1px solid #DCE4ED;
                    border-radius:12px;
                    overflow:hidden;
                  "
                >
                  ${buildDetailRow({
                    label: "Issue title",
                    value: issue.title,
                  })}

                  ${buildDetailRow({
                    label: "Issue type",
                    value: issueTypeLabel,
                  })}

                  ${buildDetailRow({
                    label: "Category",
                    value: categoryName,
                  })}

                  ${buildDetailRow({
                    label: "Reported by",
                    value: reporterName,
                  })}

                  ${
                    reporterEmail
                      ? buildDetailRow({
                          label: "Reporter email",
                          valueHtml: `
                            <a
                              href="mailto:${escapeHtml(reporterEmail)}"
                              style="
                                color:#1D4ED8;
                                text-decoration:none;
                                font-weight:700;
                              "
                            >
                              ${escapeHtml(reporterEmail)}
                            </a>
                          `,
                        })
                      : ""
                  }

                  ${buildDetailRow({
                    label: "Submitted on",
                    value: submittedAt,
                    last: true,
                  })}
                </table>
              </td>
            </tr>

            <!-- Description -->
            <tr>
              <td style="padding:20px 26px 0;">
                <div
                  style="
                    margin-bottom:9px;
                    color:#152A54;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:12px;
                    font-weight:800;
                    line-height:18px;
                    letter-spacing:.07em;
                    text-transform:uppercase;
                  "
                >
                  Issue description
                </div>

                <div
                  style="
                    padding:17px 18px;
                    background-color:#F8FAFC;
                    border:1px solid #DCE4ED;
                    border-left:4px solid ${priorityTheme.accent};
                    border-radius:12px;
                    color:#334155;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:14px;
                    font-weight:400;
                    line-height:23px;
                    white-space:pre-line;
                    word-break:break-word;
                  "
                >
                  ${escapeHtml(descriptionText).replace(/\n/g, "<br>")}
                </div>
              </td>
            </tr>

            ${
              expectedOutcomeText
                ? `
                  <!-- Expected outcome -->
                  <tr>
                    <td style="padding:20px 26px 0;">
                      <div
                        style="
                          margin-bottom:9px;
                          color:#152A54;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:12px;
                          font-weight:800;
                          line-height:18px;
                          letter-spacing:.07em;
                          text-transform:uppercase;
                        "
                      >
                        Expected outcome
                      </div>

                      <div
                        style="
                          padding:17px 18px;
                          background-color:#EFF6FF;
                          border:1px solid #BFDBFE;
                          border-radius:12px;
                          color:#1E3A5F;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;
                          font-weight:400;
                          line-height:23px;
                          white-space:pre-line;
                          word-break:break-word;
                        "
                      >
                        ${escapeHtml(expectedOutcomeText).replace(
                          /\n/g,
                          "<br>"
                        )}
                      </div>
                    </td>
                  </tr>
                `
                : ""
            }

            <!-- Call to action -->
            <tr>
              <td
                align="center"
                style="padding:28px 26px 12px;"
              >
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="border-collapse:separate;"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#D71920"
                      style="
                        background-color:#D71920;
                        border-radius:10px;
                      "
                    >
                      <a
                        href="${escapeHtml(issueUrl)}"
                        target="_blank"
                        style="
                          display:inline-block;
                          padding:14px 24px;
                          color:#FFFFFF;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;
                          font-weight:800;
                          line-height:18px;
                          text-decoration:none;
                          border-radius:10px;
                        "
                      >
                        Review Assigned Issue &nbsp;→
                      </a>
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    margin-top:13px;
                    color:#94A3B8;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    font-weight:400;
                    line-height:17px;
                  "
                >
                  Button not working? Copy and open this address:
                </div>

                <div
                  style="
                    margin-top:3px;
                    color:#1D4ED8;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    font-weight:600;
                    line-height:17px;
                    word-break:break-all;
                  "
                >
                  ${escapeHtml(issueUrl)}
                </div>
              </td>
            </tr>

            <!-- Notice -->
            <tr>
              <td style="padding:17px 26px 26px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    border-collapse:separate;
                    background-color:#FFF7ED;
                    border:1px solid #FED7AA;
                    border-radius:11px;
                  "
                >
                  <tr>
                    <td
                      width="40"
                      valign="top"
                      style="
                        width:40px;
                        padding:13px 0 13px 14px;
                        color:#C2410C;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:17px;
                        font-weight:900;
                      "
                    >
                      !
                    </td>

                    <td
                      valign="top"
                      style="
                        padding:13px 14px 13px 4px;
                        color:#9A3412;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:12px;
                        font-weight:500;
                        line-height:19px;
                      "
                    >
                      Please review the assigned issue and update its
                      status through the system. Avoid replying directly
                      to this automated email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding:23px 24px;
                  background-color:#F8FAFC;
                  border-top:1px solid #E3E9F0;
                  border-radius:0 0 18px 18px;
                "
              >
                <div
                  style="
                    color:#D71920;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:14px;
                    font-weight:900;
                    line-height:20px;
                    letter-spacing:.02em;
                  "
                >
                  NEPAL LIFE
                </div>

                <div
                  style="
                    margin-top:3px;
                    color:#475569;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:11px;
                    font-weight:700;
                    line-height:17px;
                  "
                >
                  Nepal Life Insurance Company Limited
                </div>

                <div
                  style="
                    margin-top:7px;
                    color:#94A3B8;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:10px;
                    font-weight:400;
                    line-height:16px;
                  "
                >
                  Asset Management System · Automated Issue Notification
                </div>

                <div
                  style="
                    margin-top:3px;
                    color:#94A3B8;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:10px;
                    font-weight:400;
                    line-height:16px;
                  "
                >
                  © ${new Date().getFullYear()} Nepal Life Insurance
                  Company Limited. All rights reserved.
                </div>
              </td>
            </tr>
          </table>

          <div
            style="
              max-width:680px;
              padding:13px 10px 0;
              color:#94A3B8;
              font-family:Arial,Helvetica,sans-serif;
              font-size:10px;
              font-weight:400;
              line-height:16px;
              text-align:center;
            "
          >
            This message was generated automatically because an issue
            was assigned to your system account.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  await sendMail({
    to: recipientEmail,
    subject: emailSubject,
    text: plainTextMessage,
    html: htmlMessage,
  });

  return {
    sent: true,
    to: recipientEmail,
  };
};
/* ─────────────────────────────────────────────────────────────
   MULTER FILE UPLOAD
───────────────────────────────────────────────────────────── */
const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "branch-issues"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(
      file.originalname
    );

    const randomValue = crypto
      .randomBytes(6)
      .toString("hex");

    callback(
      null,
      `${Date.now()}-${randomValue}${extension}`
    );
  },
});

const fileFilter = (_req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error("File type is not allowed"),
      false
    );
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

exports.uploadMiddleware =
  upload.single("file");

/* ─────────────────────────────────────────────────────────────
   1. GET ISSUE CATEGORIES
   GET /api/v1/branch-issues/categories
───────────────────────────────────────────────────────────── */

exports.getCategories = asyncHandler(
  async (_req, res) => {
    const categories =
      await BranchIssueCategory.findAll({
        where: {
          is_active: true,
        },

        order: [
          ["sort_order", "ASC"],
          ["name", "ASC"],
        ],
      });

    res.json(categories);
  }
);

/* ─────────────────────────────────────────────────────────────
   2. GET CORPORATE USERS
   GET /api/v1/branch-issues/corp-users
───────────────────────────────────────────────────────────── */

exports.getCorpUsers = asyncHandler(
  async (_req, res) => {
    /*
      Keep the existing route/function name for frontend compatibility,
      but return every user from the users table for assignment.
    */
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "service_station_id",
        "br_code",
        "emp_code",
      ],

      order: [
        ["name", "ASC"],
        ["email", "ASC"],
      ],
    });

    res.json(users);
  }
);

/* ─────────────────────────────────────────────────────────────
   3. LIST ISSUES
   GET /api/v1/branch-issues
───────────────────────────────────────────────────────────── */

exports.listIssues = asyncHandler(
  async (req, res) => {
    const {
      status,
      priority,
      category_id,
      issue_type,
      customer_category_name,
      search,
    } = req.query;

    const where = {
      is_deleted: false,
      ...branchScope(req.user),
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const cleanIssueType = normalizeIssueTypeFilter(issue_type);

    if (cleanIssueType) {
      where.issue_type = cleanIssueType;
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (customer_category_name) {
      where.customer_category_name =
        normalizeCustomerCategoryName(customer_category_name);
    }

    if (search) {
      const cleanSearch = String(search).trim();

      where[Op.or] = [
        {
          title: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
        {
          ticket_no: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
        {
          reporter_name: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
        {
          reporter_email: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
        {
          customer_category_name: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
        {
          custom_category_name: {
            [Op.like]: `%${cleanSearch}%`,
          },
        },
      ];
    }

    const issues = await BranchIssue.findAll({
      where,

      include: [
        {
          model: BranchIssueCategory,
          as: "category",
          attributes: [
            "id",
            "name",
            "code",
          ],
        },
      ],

      order: [["created_at", "DESC"]],
    });

    res.json(issues);
  }
);


/* ─────────────────────────────────────────────────────────────
   3B. ANALYSIS DASHBOARD
   GET /api/v1/branch-issues/analysis-dashboard
───────────────────────────────────────────────────────────── */

exports.getAnalysisDashboard = asyncHandler(
  async (req, res) => {
    const {
      from,
      to,
      issue_type,
      status,
      priority,
    } = req.query || {};

    const scope = getAnalysisScope(req.user);

    const where = {
      is_deleted: false,
      ...scope.where,
    };

    const cleanIssueType =
      normalizeIssueTypeFilter(issue_type);

    if (cleanIssueType) {
      where.issue_type = cleanIssueType;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (from || to) {
      where.created_at = {};

      if (from) {
        where.created_at[Op.gte] = new Date(from);
      }

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = toDate;
      }
    }

    const issues = await BranchIssue.findAll({
      where,

      include: [
        {
          model: BranchIssueCategory,
          as: "category",
          attributes: [
            "id",
            "name",
            "code",
          ],
        },
      ],

      order: [["created_at", "ASC"]],
    });

    const [
      reporterUserLookup,
      branchLookup,
    ] = await Promise.all([
      loadReporterUserLookup(issues),
      loadBranchLookup(),
    ]);

    const summary = {
      total: issues.length,
      open: 0,
      underReview: 0,
      closed: 0,
      highCritical: 0,
      employee: 0,
      customer: 0,
    };

    const byStatus = {};
    const byPriority = {};
    const byType = {};
    const byCategory = {};
    const byBranch = {};
    const monthlyCreated = {};
    const monthlyClosed = {};
    const byAssignedUser = {};
    const byReporter = {};

    for (const issue of issues) {
      const plainIssue =
        typeof issue.toJSON === "function"
          ? issue.toJSON()
          : issue;

      const issueType =
        getIssueTypeForAnalysis(plainIssue);

      const categoryName =
        getCategoryForAnalysis(plainIssue);

      const branchName =
        getBranchForAnalysis(
          plainIssue,
          reporterUserLookup,
          branchLookup
        );

      const statusValue =
        plainIssue.status || "Unknown";

      const priorityValue =
        plainIssue.priority || "Unknown";

      if (statusValue === "Open") summary.open += 1;
      if (statusValue === "UnderReview") summary.underReview += 1;
      if (statusValue === "Closed") summary.closed += 1;

      if (
        priorityValue === "High" ||
        priorityValue === "Critical"
      ) {
        summary.highCritical += 1;
      }

      if (issueType === "Customer") {
        summary.customer += 1;
      } else {
        summary.employee += 1;
      }

      incrementGroup(byStatus, statusValue);
      incrementGroup(byPriority, priorityValue);
      incrementGroup(byType, issueType);
      incrementGroup(byCategory, categoryName);
      incrementGroup(byBranch, branchName);
      incrementGroup(
        byAssignedUser,
        plainIssue.assigned_to_user_id
          ? `User ${plainIssue.assigned_to_user_id}`
          : "Unassigned"
      );
      incrementGroup(
        byReporter,
        plainIssue.reporter_name ||
          plainIssue.reporter_email ||
          "Unknown reporter"
      );

      incrementGroup(
        monthlyCreated,
        monthKey(plainIssue.created_at)
      );

      if (plainIssue.closed_at) {
        incrementGroup(
          monthlyClosed,
          monthKey(plainIssue.closed_at)
        );
      }
    }

    const monthlyKeys = Array.from(
      new Set([
        ...Object.keys(monthlyCreated),
        ...Object.keys(monthlyClosed),
      ])
    ).filter((item) => item !== "Unknown");

    const monthlyTrend = monthlyKeys.map((name) => ({
      name,
      created: monthlyCreated[name] || 0,
      closed: monthlyClosed[name] || 0,
    }));

    const recentIssues = issues
      .slice()
      .reverse()
      .slice(0, 10)
      .map((issue) => {
        const plainIssue =
          typeof issue.toJSON === "function"
            ? issue.toJSON()
            : issue;

        return {
          id: plainIssue.id,
          ticket_no: plainIssue.ticket_no,
          title: plainIssue.title,
          issue_type:
            getIssueTypeForAnalysis(plainIssue),
          category:
            getCategoryForAnalysis(plainIssue),
          priority: plainIssue.priority,
          status: plainIssue.status,
          reporter_name:
            plainIssue.reporter_name ||
            plainIssue.reporter_email ||
            "Unknown",
          reporter_branch_id:
            plainIssue.reporter_branch_id,
          branch:
            getBranchForAnalysis(
              plainIssue,
              reporterUserLookup,
              branchLookup
            ),
          created_at:
            plainIssue.created_at,
        };
      });

    res.json({
      scope: {
        label: scope.label,
        role: scope.role,
        level: scope.level,
      },

      filters: {
        from: from || null,
        to: to || null,
        issue_type:
          cleanIssueType || null,
        status: status || null,
        priority: priority || null,
      },

      summary,

      charts: {
        byType: groupMapToArray(byType),
        byStatus: groupMapToArray(byStatus),
        byPriority: groupMapToArray(byPriority),
        byCategory: groupMapToArray(byCategory, 15),
        byBranch: groupMapToArray(byBranch, 15),
        byAssignedUser: groupMapToArray(byAssignedUser, 10),
        byReporter: groupMapToArray(byReporter, 10),
        monthlyTrend,
      },

      recentIssues,
    });
  }
);


/* ─────────────────────────────────────────────────────────────
   4. GET SINGLE ISSUE
   GET /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */

exports.getIssue = asyncHandler(
  async (req, res) => {
    const issue = await BranchIssue.findOne({
      where: {
        id: req.params.id,
        is_deleted: false,
        ...branchScope(req.user),
      },

      include: [
        {
          model: BranchIssueCategory,
          as: "category",
          attributes: [
            "id",
            "name",
            "code",
          ],
        },
      ],
    });

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const messageWhere = {
      issue_id: issue.id,
    };

    if (!isApprover(req.user)) {
      messageWhere.is_internal = false;
    }

    const [
      messages,
      attachments,
      logs,
      assignedUser,
    ] = await Promise.all([
      BranchIssueMessage.findAll({
        where: messageWhere,
        order: [["created_at", "ASC"]],
      }),

      BranchIssueAttachment.findAll({
        where: {
          issue_id: issue.id,
        },
        order: [["created_at", "ASC"]],
      }),

      BranchIssueActivityLog.findAll({
        where: {
          issue_id: issue.id,
        },
        order: [["created_at", "ASC"]],
      }),

      issue.assigned_to_user_id
        ? User.findByPk(issue.assigned_to_user_id, {
            attributes: [
              "id",
              "name",
              "email",
              "role",
            ],
          })
        : Promise.resolve(null),
    ]);

    const assignedUserPayload = assignedUser
      ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role,
        }
      : null;

    const issuePayload =
      typeof issue.toJSON === "function"
        ? issue.toJSON()
        : { ...issue };

    issuePayload.assigned_to_name =
      assignedUserPayload?.name ||
      assignedUserPayload?.email ||
      null;

    issuePayload.assigned_to_email =
      assignedUserPayload?.email ||
      null;

    issuePayload.assigned_user =
      assignedUserPayload;

    res.json({
      issue: issuePayload,
      messages,
      attachments: attachments.map(buildAttachmentResponse),
      logs,
    });
  }
);

/* ─────────────────────────────────────────────────────────────
   5. CREATE ISSUE
   POST /api/v1/branch-issues
───────────────────────────────────────────────────────────── */

exports.createIssue = asyncHandler(
  async (req, res) => {
    const {
      title,
      description,
      expected_outcome,
      category_id,
      issue_type,
      customer_category_name,
      custom_category_name,
      issue_category_name,
      priority,
      assigned_to_user_id,
      reporter_branch_id,
      reporter_name,
      reporter_email,
    } = req.body || {};

    const cleanTitle =
      String(title || "").trim();

    const cleanDescription =
      String(description || "").trim();

    if (
      !cleanTitle ||
      !cleanDescription
    ) {
      return res.status(400).json({
        message:
          "Title and description are required",

        received: {
          title: cleanTitle,
          descriptionLength:
            cleanDescription.length,
        },
      });
    }

    const cleanAssignedToUserId =
      toNullableNumber(
        assigned_to_user_id
      );

    if (!cleanAssignedToUserId) {
      return res.status(400).json({
        message:
          "Please select a user",
      });
    }

    const assignedUser =
      await User.findByPk(cleanAssignedToUserId, {
        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    if (!assignedUser) {
      return res.status(400).json({
        message:
          "Invalid user selected. Please select a valid user.",

        received:
          assigned_to_user_id,
      });
    }

    const cleanIssueType =
      normalizeIssueTypeValue(issue_type);

    const cleanCategoryId =
      toNullableNumber(category_id);

    const requestedCustomerCategory =
      normalizeCustomerCategoryName(
        customer_category_name ||
          issue_category_name ||
          custom_category_name
      );

    const cleanCustomCategoryName =
      normalizeCustomerCategoryName(custom_category_name);

    let category = null;
    let finalCategoryId = null;
    let finalCustomerCategoryName = null;
    let finalCustomCategoryName = null;

    if (cleanIssueType === "Employee") {
      if (!cleanCategoryId) {
        return res.status(400).json({
          message:
            "Please select employee issue category",
        });
      }

      category =
        await BranchIssueCategory.findOne({
          where: {
            id: cleanCategoryId,
            is_active: true,
          },

          attributes: [
            "id",
            "name",
            "code",
          ],
        });

      if (!category) {
        return res.status(400).json({
          message:
            "Invalid issue category selected",

          received: category_id,
        });
      }

      finalCategoryId = category.id;
    }

    if (cleanIssueType === "Customer") {
      if (!requestedCustomerCategory) {
        return res.status(400).json({
          message:
            "Please select or enter customer issue category",
        });
      }

      finalCustomerCategoryName =
        requestedCustomerCategory;

      /*
        When frontend sends custom_category_name, we keep it separately.
        For predefined customer categories, this remains null.
      */
      finalCustomCategoryName =
        cleanCustomCategoryName || null;

      category =
        buildCustomerCategoryObject(
          finalCustomerCategoryName
        );
    }

    const cleanReporterBranchId =
      toNullableNumber(
        req.user?.branch_id
      ) ??
      toNullableNumber(
        req.user?.branchId
      ) ??
      toNullableNumber(
        req.user?.service_station_id
      ) ??
      toNullableNumber(
        reporter_branch_id
      );

    const validPriorities = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const cleanPriority =
      validPriorities.includes(priority)
        ? priority
        : "Medium";

    let issue = null;
    let lastError = null;

    for (
      let attempt = 1;
      attempt <= 3;
      attempt += 1
    ) {
      try {
        const ticketNumber =
          await generateTicketNo();

        issue = await BranchIssue.create({
          ticket_no: ticketNumber,
          title: cleanTitle,
          description: cleanDescription,

          expected_outcome:
            String(
              expected_outcome || ""
            ).trim() || null,

          category_id:
            finalCategoryId,

          issue_type:
            cleanIssueType,

          customer_category_name:
            finalCustomerCategoryName,

          custom_category_name:
            finalCustomCategoryName,

          priority:
            cleanPriority,

          status:
            "Open",

          reporter_user_id:
            req.user?.id ?? null,

          reporter_branch_id:
            cleanReporterBranchId ??
            null,

          reporter_name:
            req.user?.name ??
            reporter_name ??
            null,

          reporter_email:
            req.user?.email ??
            reporter_email ??
            null,

          assigned_to_user_id:
            assignedUser.id,
        });

        break;
      } catch (error) {
        lastError = error;

        const isDuplicateTicket =
          error?.name ===
            "SequelizeUniqueConstraintError" ||
          error?.parent?.code ===
            "ER_DUP_ENTRY";

        if (isDuplicateTicket) {
          continue;
        }

        console.error(
          "BRANCH ISSUE CREATE ERROR:",
          getSequelizeErrorPayload(error)
        );

        return res.status(500).json({
          message:
            error?.parent?.sqlMessage ||
            error?.errors?.[0]?.message ||
            error?.message ||
            "Issue creation failed",

          detail:
            getSequelizeErrorPayload(
              error
            ),
        });
      }
    }

    if (!issue) {
      console.error(
        "BRANCH ISSUE CREATE FAILED AFTER RETRY:",
        getSequelizeErrorPayload(
          lastError
        )
      );

      return res.status(500).json({
        message:
          lastError?.parent
            ?.sqlMessage ||
          lastError?.errors?.[0]
            ?.message ||
          lastError?.message ||
          "Issue creation failed after retry",

        detail:
          getSequelizeErrorPayload(
            lastError
          ),
      });
    }

    await BranchIssueActivityLog.create({
      issue_id: issue.id,

      actor_user_id:
        req.user?.id ?? null,

      actor_name:
        req.user?.name ?? null,

      action: "Created",

      remarks:
        `${cleanIssueType} issue submitted under ${getIssueCategoryDisplayName(
          issue,
          category
        )} and assigned to ${
          assignedUser.name ||
          assignedUser.email
        } (${assignedUser.role})`,
    });

    /*
      Email errors do not cancel issue creation.

      The issue remains successfully created even
      if SMTP delivery fails.
    */
    let emailNotification = {
      sent: false,
      reason:
        "Email notification was not attempted",
    };

    try {
      emailNotification =
        await sendIssueAssignmentEmail({
          issue,

          assignedUser,

          category,

          reporter: {
            name:
              req.user?.name ??
              reporter_name ??
              null,

            email:
              req.user?.email ??
              reporter_email ??
              null,
          },
        });
    } catch (mailError) {
      console.error(
        "ISSUE ASSIGNMENT EMAIL ERROR:",
        {
          issueId:
            issue.id,

          ticketNo:
            issue.ticket_no,

          assignedUserId:
            assignedUser.id,

          assignedEmail:
            assignedUser.email,

          assignedRole:
            assignedUser.role,

          message:
            mailError?.message,

          stack:
            mailError?.stack,
        }
      );

      emailNotification = {
        sent: false,

        reason:
          mailError?.message ||
          "Email delivery failed",
      };
    }

    return res.status(201).json({
      message:
        emailNotification.sent
          ? "Issue submitted successfully and assignment email sent"
          : "Issue submitted successfully, but assignment email was not sent",

      issue,

      email_notification:
        emailNotification,
    });
  }
);

/* ─────────────────────────────────────────────────────────────
   6. CHANGE ISSUE STATUS
   PUT /api/v1/branch-issues/:id/status

   Permission:
   - Only the specifically assigned user can change status.
   - The assigned user must have role admin or corp_user.
   - Unassigned admins cannot change the status.
───────────────────────────────────────────────────────────── */

exports.changeStatus = asyncHandler(
  async (req, res) => {
    const {
      status,
      remarks,
    } = req.body || {};

    const validStatuses = [
      "Open",
      "UnderReview",
      "Closed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Must be Open, UnderReview or Closed",
      });
    }

    const issue = await BranchIssue.findOne({
      where: {
        id: req.params.id,
        is_deleted: false,
      },
    });

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const currentUserId = req.user?.id;
    const assignedUserId = issue.assigned_to_user_id;
    const currentRole = normalizeRole(req.user?.role);

    const isAssignedUser =
      currentUserId !== undefined &&
      currentUserId !== null &&
      assignedUserId !== undefined &&
      assignedUserId !== null &&
      String(currentUserId) === String(assignedUserId);

    const hasAllowedRole = [
      "admin",
      "corpuser",
    ].includes(currentRole);

    if (!isAssignedUser || !hasAllowedRole) {
      return res.status(403).json({
        message:
          "Only the assigned Admin or Corporate User can change this issue status",
      });
    }

    const oldStatus = issue.status;

    if (oldStatus === status) {
      return res.status(400).json({
        message: `Issue status is already ${status}`,
      });
    }

    const cleanRemarks = String(remarks || "").trim();

    await issue.update({
      status,
      closed_at:
        status === "Closed"
          ? new Date()
          : null,
    });

    await BranchIssueActivityLog.create({
      issue_id: issue.id,
      actor_user_id: req.user?.id ?? null,
      actor_name:
        req.user?.name ??
        req.user?.email ??
        null,
      action:
        status === "Closed"
          ? "Closed"
          : oldStatus === "Closed" && status !== "Closed"
            ? "Reopened"
            : "StatusChanged",
      old_status: oldStatus,
      new_status: status,
      remarks: cleanRemarks || null,
    });

    return res.json({
      message: "Status updated successfully",
      issue,
    });
  }
);

/* ─────────────────────────────────────────────────────────────
   7. ADD MESSAGE
   POST /api/v1/branch-issues/:id/messages
───────────────────────────────────────────────────────────── */

exports.addMessage = asyncHandler(
  async (req, res) => {
    const {
      message,
      is_internal,
    } = req.body || {};

    const cleanMessage =
      String(message || "").trim();

    if (!cleanMessage) {
      return res.status(400).json({
        message:
          "Message cannot be empty",
      });
    }

    if (
      is_internal &&
      !isApprover(req.user)
    ) {
      return res.status(403).json({
        message:
          "Only approvers can post internal notes",
      });
    }

    const issue =
      await BranchIssue.findOne({
        where: {
          id: req.params.id,
          is_deleted: false,
          ...branchScope(req.user),
        },
      });

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const createdMessage =
      await BranchIssueMessage.create({
        issue_id:
          issue.id,

        sender_user_id:
          req.user?.id ?? null,

        sender_name:
          req.user?.name ?? null,

        sender_role:
          req.user?.role ?? null,

        message:
          cleanMessage,

        is_internal:
          Boolean(is_internal),

        created_at:
          new Date(),
      });

    await BranchIssueActivityLog.create({
      issue_id:
        issue.id,

      actor_user_id:
        req.user?.id ?? null,

      actor_name:
        req.user?.name ?? null,

      action:
        "MessageAdded",

      remarks:
        is_internal
          ? "Internal note added"
          : "Message added",
    });

    res.status(201).json({
      message:
        "Message sent successfully",

      msg:
        createdMessage,
    });
  }
);

/* ─────────────────────────────────────────────────────────────
   8. UPLOAD ATTACHMENT
   POST /api/v1/branch-issues/:id/attachments
───────────────────────────────────────────────────────────── */

exports.uploadAttachment = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message:
          "No file uploaded or file type not allowed",
      });
    }

    const issue =
      await BranchIssue.findOne({
        where: {
          id: req.params.id,
          is_deleted: false,
          ...branchScope(req.user),
        },
      });

    if (!issue) {
      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const attachment =
      await BranchIssueAttachment.create({
        issue_id:
          issue.id,

        original_file_name:
          req.file.originalname,

        stored_file_name:
          req.file.filename,

        content_type:
          req.file.mimetype,

        file_size_bytes:
          req.file.size,

        storage_path:
          req.file.path,

        uploaded_by_user_id:
          req.user?.id ?? null,

        created_at:
          new Date(),
      });

    await BranchIssueActivityLog.create({
      issue_id:
        issue.id,

      actor_user_id:
        req.user?.id ?? null,

      actor_name:
        req.user?.name ?? null,

      action:
        "AttachmentAdded",

      remarks:
        req.file.originalname,
    });

    res.status(201).json({
      message:
        "File uploaded successfully",

      attachment:
        buildAttachmentResponse(
          attachment
        ),
    });
  }
);

/* ─────────────────────────────────────────────────────────────
   9. DELETE ISSUE
   DELETE /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */

exports.deleteIssue = asyncHandler(
  async (req, res) => {
    const issue =
      await BranchIssue.findByPk(
        req.params.id
      );

    if (
      !issue ||
      issue.is_deleted
    ) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const role =
      normalizeRole(req.user?.role);

    const isAdmin =
      role === "admin";

    const isOwner =
      String(
        issue.reporter_user_id
      ) ===
      String(
        req.user?.id
      );

    if (
      !isAdmin &&
      !isOwner
    ) {
      return res.status(403).json({
        message:
          "You are not authorised to delete this issue",
      });
    }

    if (
      issue.status !== "Open"
    ) {
      return res.status(400).json({
        message:
          "Only Open issues can be deleted",
      });
    }

    await issue.update({
      is_deleted: true,
    });

    res.json({
      message:
        "Issue deleted successfully",
    });
  }
);