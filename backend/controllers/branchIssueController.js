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

/* ─────────────────────────────────────────────────────────────
   EMAIL HELPERS
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

const getIssueUrl = (issueId) => {
  const baseUrl = String(
    process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      process.env.APP_URL ||
      "http://localhost:3001"
  ).replace(/\/$/, "");

  return `${baseUrl}/branch-issues/${issueId}`;
};

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
        "Assigned Corporate User does not have a valid email address",
    };
  }

  const issueUrl = getIssueUrl(issue.id);

  const assignedName =
    assignedUser?.name ||
    "Corporate User";

  const reporterName =
    reporter?.name ||
    reporter?.email ||
    "Branch User";

  const reporterEmail =
    reporter?.email || "";

  const categoryName =
    category?.name ||
    "General";

  const expectedOutcome =
    issue.expected_outcome || "";

  await sendMail({
    to: recipientEmail,

    subject:
      `[${issue.ticket_no}] New Issue Assigned - ${issue.title}`,

    text: [
      `Hello ${assignedName},`,
      "",
      "A new branch issue has been assigned to you.",
      "",
      `Ticket: ${issue.ticket_no}`,
      `Title: ${issue.title}`,
      `Category: ${categoryName}`,
      `Priority: ${issue.priority}`,
      `Status: ${issue.status}`,
      `Reported by: ${reporterName}`,
      reporterEmail
        ? `Reporter email: ${reporterEmail}`
        : null,
      "",
      "Description:",
      issue.description,
      expectedOutcome
        ? `Expected outcome: ${expectedOutcome}`
        : null,
      "",
      `Open issue: ${issueUrl}`,
      "",
      "Nepal Life Asset Management System",
    ]
      .filter(Boolean)
      .join("\n"),

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          background:#f4f7fb;
          padding:24px;
          color:#172033;
        "
      >
        <div
          style="
            max-width:680px;
            margin:0 auto;
            background:#ffffff;
            border:1px solid #dce4ee;
            border-radius:14px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#0B5CAB;
              color:#ffffff;
              padding:20px 24px;
            "
          >
            <div
              style="
                font-size:12px;
                letter-spacing:.08em;
                text-transform:uppercase;
                opacity:.85;
              "
            >
              Nepal Life Issue Tracker
            </div>

            <h2
              style="
                margin:7px 0 0;
                font-size:22px;
              "
            >
              New Issue Assigned
            </h2>
          </div>

          <div style="padding:24px">
            <p style="margin-top:0">
              Hello
              <strong>
                ${escapeHtml(assignedName)}
              </strong>,
            </p>

            <p>
              A new branch issue has been assigned to you.
              Please review the details below.
            </p>

            <table
              style="
                width:100%;
                border-collapse:collapse;
                margin:18px 0;
                font-size:14px;
              "
            >
              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                    width:160px;
                  "
                >
                  Ticket
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:700;
                  "
                >
                  ${escapeHtml(issue.ticket_no)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                  "
                >
                  Title
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  ${escapeHtml(issue.title)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                  "
                >
                  Category
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  ${escapeHtml(categoryName)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                  "
                >
                  Priority
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    font-weight:700;
                  "
                >
                  ${escapeHtml(issue.priority)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                  "
                >
                  Status
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  ${escapeHtml(issue.status)}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                    color:#64748b;
                  "
                >
                  Reported by
                </td>

                <td
                  style="
                    padding:9px;
                    border-bottom:1px solid #e5e7eb;
                  "
                >
                  ${escapeHtml(reporterName)}
                </td>
              </tr>

              ${
                reporterEmail
                  ? `
                    <tr>
                      <td
                        style="
                          padding:9px;
                          border-bottom:1px solid #e5e7eb;
                          color:#64748b;
                        "
                      >
                        Reporter Email
                      </td>

                      <td
                        style="
                          padding:9px;
                          border-bottom:1px solid #e5e7eb;
                        "
                      >
                        ${escapeHtml(reporterEmail)}
                      </td>
                    </tr>
                  `
                  : ""
              }
            </table>

            <div
              style="
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:10px;
                padding:14px;
                margin-bottom:18px;
              "
            >
              <div
                style="
                  font-size:12px;
                  font-weight:700;
                  color:#64748b;
                  text-transform:uppercase;
                  margin-bottom:6px;
                "
              >
                Description
              </div>

              <div
                style="
                  white-space:pre-wrap;
                  line-height:1.6;
                "
              >
                ${escapeHtml(issue.description)}
              </div>
            </div>

            ${
              expectedOutcome
                ? `
                  <div
                    style="
                      background:#eff6ff;
                      border:1px solid #bfdbfe;
                      border-radius:10px;
                      padding:14px;
                      margin-bottom:18px;
                    "
                  >
                    <div
                      style="
                        font-size:12px;
                        font-weight:700;
                        color:#1d4ed8;
                        text-transform:uppercase;
                        margin-bottom:6px;
                      "
                    >
                      Expected Outcome
                    </div>

                    <div
                      style="
                        white-space:pre-wrap;
                        line-height:1.6;
                      "
                    >
                      ${escapeHtml(expectedOutcome)}
                    </div>
                  </div>
                `
                : ""
            }

            <a
              href="${escapeHtml(issueUrl)}"
              style="
                display:inline-block;
                background:#0B5CAB;
                color:#ffffff;
                text-decoration:none;
                padding:11px 18px;
                border-radius:8px;
                font-weight:700;
              "
            >
              Open Assigned Issue
            </a>

            <p
              style="
                margin:22px 0 0;
                color:#64748b;
                font-size:12px;
              "
            >
              This is an automated notification from the
              Nepal Life Asset Management System.
            </p>
          </div>
        </div>
      </div>
    `,
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
    const users = await User.findAll({
      where: {
        role: "corp_user",
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

      order: [["name", "ASC"]],
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

    if (category_id) {
      where.category_id = category_id;
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
    ]);

    res.json({
      issue,
      messages,
      attachments,
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
          "Please select a Corporate User",
      });
    }

    const assignedCorpUser =
      await User.findOne({
        where: {
          id: cleanAssignedToUserId,
          role: "corp_user",
        },

        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    if (!assignedCorpUser) {
      return res.status(400).json({
        message:
          "Invalid Corporate User selected",

        received:
          assigned_to_user_id,
      });
    }

    const cleanCategoryId =
      toNullableNumber(category_id);

    if (!cleanCategoryId) {
      return res.status(400).json({
        message:
          "Please select issue category",
      });
    }

    const category =
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
            cleanCategoryId,

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
            assignedCorpUser.id,
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
        `Issue submitted and assigned to ${
          assignedCorpUser.name ||
          assignedCorpUser.email
        }`,
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

          assignedUser:
            assignedCorpUser,

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
            assignedCorpUser.id,

          assignedEmail:
            assignedCorpUser.email,

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

    if (
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid status. Must be Open, UnderReview or Closed",
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

    const oldStatus =
      issue.status;

    const update = {
      status,
      closed_at:
        status === "Closed"
          ? new Date()
          : null,
    };

    await issue.update(update);

    await BranchIssueActivityLog.create({
      issue_id:
        issue.id,

      actor_user_id:
        req.user?.id ?? null,

      actor_name:
        req.user?.name ?? null,

      action:
        status === "Closed"
          ? "Closed"
          : oldStatus === "Closed" &&
              status !== "Closed"
            ? "Reopened"
            : "StatusChanged",

      old_status:
        oldStatus,

      new_status:
        status,

      remarks:
        String(remarks || "").trim() ||
        null,
    });

    res.json({
      message:
        "Status updated successfully",

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

      attachment,
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