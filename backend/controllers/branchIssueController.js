const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const db = require("../models");

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
  return ["admin", "approver", "headoffice", "corpuser"].includes(role);
};

// Branch staff see their own branch/submissions.
// Admin/approver/head office see everything.
// Corporate users see issues assigned to them.
const branchScope = (user) => {
  const role = normalizeRole(user?.role);

  if (["admin", "approver", "headoffice"].includes(role)) {
    return {};
  }

  if (role === "corpuser") {
    return { assigned_to_user_id: user?.id ?? -1 };
  }

  const branchId =
    user?.branch_id ??
    user?.branchId ??
    user?.service_station_id ??
    null;

  if (branchId) {
    return { reporter_branch_id: branchId };
  }

  // Safe fallback if login token has no branch id
  return { reporter_user_id: user?.id ?? -1 };
};

// Generate NL-ISS-2026-5001 style ticket numbers safely.
// Do NOT use count(); it can create duplicate ticket_no.
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
    const lastNumber = Number(String(latestIssue.ticket_no).replace(prefix, ""));

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber}`;
};

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return null;

  return numberValue;
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
   MULTER  (file upload – configured inline, no separate middleware file)
───────────────────────────────────────────────────────────── */
const uploadDir = "uploads/branch-issues/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadMiddleware = upload.single("file");

/* ─────────────────────────────────────────────────────────────
   1. GET /api/v1/branch-issues/categories
───────────────────────────────────────────────────────────── */
exports.getCategories = asyncHandler(async (_req, res) => {
  const cats = await BranchIssueCategory.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]],
  });

  res.json(cats);
});

/* ─────────────────────────────────────────────────────────────
   1B. GET /api/v1/branch-issues/corp-users
───────────────────────────────────────────────────────────── */
exports.getCorpUsers = asyncHandler(async (_req, res) => {
  const users = await User.findAll({
    where: { role: "corp_user" },
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
});

/* ─────────────────────────────────────────────────────────────
   2. GET /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.listIssues = asyncHandler(async (req, res) => {
  const { status, priority, category_id, search } = req.query;

  const where = { is_deleted: false, ...branchScope(req.user) };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category_id) where.category_id = category_id;

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { ticket_no: { [Op.like]: `%${search}%` } },
      { reporter_name: { [Op.like]: `%${search}%` } },
    ];
  }

  const issues = await BranchIssue.findAll({
    where,
    include: [
      {
        model: BranchIssueCategory,
        as: "category",
        attributes: ["name", "code"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  res.json(issues);
});

/* ─────────────────────────────────────────────────────────────
   3. GET /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */
exports.getIssue = asyncHandler(async (req, res) => {
  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
    include: [
      {
        model: BranchIssueCategory,
        as: "category",
        attributes: ["name", "code"],
      },
    ],
  });

  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const msgWhere = { issue_id: issue.id };

  if (!isApprover(req.user)) {
    msgWhere.is_internal = false;
  }

  const [messages, attachments, logs] = await Promise.all([
    BranchIssueMessage.findAll({
      where: msgWhere,
      order: [["created_at", "ASC"]],
    }),
    BranchIssueAttachment.findAll({
      where: { issue_id: issue.id },
      order: [["created_at", "ASC"]],
    }),
    BranchIssueActivityLog.findAll({
      where: { issue_id: issue.id },
      order: [["created_at", "ASC"]],
    }),
  ]);

  res.json({ issue, messages, attachments, logs });
});

/* ─────────────────────────────────────────────────────────────
   4. POST /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.createIssue = asyncHandler(async (req, res) => {
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

  const cleanTitle = String(title || "").trim();
  const cleanDescription = String(description || "").trim();

  if (!cleanTitle || !cleanDescription) {
    return res.status(400).json({
      message: "Title and description are required",
      received: {
        title: cleanTitle,
        descriptionLength: cleanDescription.length,
      },
    });
  }

  const cleanAssignedToUserId = toNullableNumber(assigned_to_user_id);

  if (!cleanAssignedToUserId) {
    return res.status(400).json({ message: "Please select a Corporate User" });
  }

  const assignedCorpUser = await User.findOne({
    where: {
      id: cleanAssignedToUserId,
      role: "corp_user",
    },
    attributes: ["id", "name", "email", "role"],
  });

  if (!assignedCorpUser) {
    return res.status(400).json({
      message: "Invalid Corporate User selected",
      received: assigned_to_user_id,
    });
  }

  const cleanCategoryId = toNullableNumber(category_id);

  if (!cleanCategoryId) {
    return res.status(400).json({ message: "Please select issue category" });
  }

  const category = await BranchIssueCategory.findOne({
    where: {
      id: cleanCategoryId,
      is_active: true,
    },
    attributes: ["id", "name"],
  });

  if (!category) {
    return res.status(400).json({
      message: "Invalid issue category selected",
      received: category_id,
    });
  }

  const cleanReporterBranchId =
    toNullableNumber(req.user?.branch_id) ??
    toNullableNumber(req.user?.branchId) ??
    toNullableNumber(req.user?.service_station_id) ??
    toNullableNumber(reporter_branch_id);

  let issue = null;
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const ticket_no = await generateTicketNo();

      issue = await BranchIssue.create({
        ticket_no,
        title: cleanTitle,
        description: cleanDescription,
        expected_outcome: expected_outcome || null,
        category_id: cleanCategoryId,
        priority: ["Low", "Medium", "High", "Critical"].includes(priority)
          ? priority
          : "Medium",
        status: "Open",
        reporter_user_id: req.user?.id ?? null,
        assigned_to_user_id: assignedCorpUser.id,
        reporter_branch_id: cleanReporterBranchId ?? null,
        reporter_name: req.user?.name ?? reporter_name ?? null,
        reporter_email: req.user?.email ?? reporter_email ?? null,
      });

      break;
    } catch (error) {
      lastError = error;

      if (
        error?.name === "SequelizeUniqueConstraintError" ||
        error?.parent?.code === "ER_DUP_ENTRY"
      ) {
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
        detail: getSequelizeErrorPayload(error),
      });
    }
  }

  if (!issue) {
    console.error(
      "BRANCH ISSUE CREATE FAILED AFTER RETRY:",
      getSequelizeErrorPayload(lastError)
    );

    return res.status(500).json({
      message:
        lastError?.parent?.sqlMessage ||
        lastError?.errors?.[0]?.message ||
        lastError?.message ||
        "Issue creation failed after retry",
      detail: getSequelizeErrorPayload(lastError),
    });
  }

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id ?? null,
    actor_name: req.user?.name ?? null,
    action: "Created",
    remarks: `Issue submitted and assigned to ${
      assignedCorpUser.name || assignedCorpUser.email
    }`,
  });

  res.status(201).json({
    message: "Issue submitted successfully",
    issue,
  });
});

/* ─────────────────────────────────────────────────────────────
   5. PUT /api/v1/branch-issues/:id/status
───────────────────────────────────────────────────────────── */
exports.changeStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const validStatuses = ["Open", "UnderReview", "Closed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Must be Open, UnderReview or Closed",
    });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false },
  });

  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const oldStatus = issue.status;
  const update = { status };

  if (status === "Closed") {
    update.closed_at = new Date();
  }

  await issue.update(update);

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id,
    actor_name: req.user?.name,
    action: status === "Closed" ? "Closed" : "StatusChanged",
    old_status: oldStatus,
    new_status: status,
    remarks: remarks?.trim() || null,
  });

  res.json({ message: "Status updated", issue });
});

/* ─────────────────────────────────────────────────────────────
   6. POST /api/v1/branch-issues/:id/messages
───────────────────────────────────────────────────────────── */
exports.addMessage = asyncHandler(async (req, res) => {
  const { message, is_internal } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  if (is_internal && !isApprover(req.user)) {
    return res
      .status(403)
      .json({ message: "Only approvers can post internal notes" });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
  });

  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const msg = await BranchIssueMessage.create({
    issue_id: issue.id,
    sender_user_id: req.user?.id,
    sender_name: req.user?.name,
    sender_role: req.user?.role,
    message: message.trim(),
    is_internal: !!is_internal,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id,
    actor_name: req.user?.name,
    action: "MessageAdded",
  });

  res.status(201).json({ message: "Message sent", msg });
});

/* ─────────────────────────────────────────────────────────────
   7. POST /api/v1/branch-issues/:id/attachments
───────────────────────────────────────────────────────────── */
exports.uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded or file type not allowed" });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
  });

  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const attachment = await BranchIssueAttachment.create({
    issue_id: issue.id,
    original_file_name: req.file.originalname,
    stored_file_name: req.file.filename,
    content_type: req.file.mimetype,
    file_size_bytes: req.file.size,
    storage_path: req.file.path,
    uploaded_by_user_id: req.user?.id,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id,
    actor_name: req.user?.name,
    action: "AttachmentAdded",
    remarks: req.file.originalname,
  });

  res.status(201).json({ message: "File uploaded", attachment });
});

/* ─────────────────────────────────────────────────────────────
   8. DELETE /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */
exports.deleteIssue = asyncHandler(async (req, res) => {
  const issue = await BranchIssue.findByPk(req.params.id);

  if (!issue || issue.is_deleted) {
    return res.status(404).json({ message: "Issue not found" });
  }

  const isOwner = String(issue.reporter_user_id) === String(req.user?.id);

  if (!isOwner && !isApprover(req.user)) {
    return res.status(403).json({ message: "Not authorised to delete this issue" });
  }

  if (issue.status !== "Open") {
    return res.status(400).json({ message: "Only Open issues can be deleted" });
  }

  await issue.update({ is_deleted: true });

  res.json({ message: "Issue deleted" });
});