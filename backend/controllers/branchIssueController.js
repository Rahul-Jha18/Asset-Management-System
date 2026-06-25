const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const branchIssueModels = require("../models/BranchIssue");

const BranchIssue = branchIssueModels.BranchIssue;
const BranchIssueCategory = branchIssueModels.BranchIssueCategory;
const BranchIssueAttachment = branchIssueModels.BranchIssueAttachment;
const BranchIssueMessage = branchIssueModels.BranchIssueMessage;
const BranchIssueActivityLog = branchIssueModels.BranchIssueActivityLog;

if (
  !BranchIssue ||
  !BranchIssueCategory ||
  !BranchIssueAttachment ||
  !BranchIssueMessage ||
  !BranchIssueActivityLog
) {
  throw new Error(
    "BranchIssue models are not loaded correctly. Check backend/models/BranchIssue.js exports."
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const normalizeRole = (role) =>
  String(role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const isApprover = (user) => {
  const role = normalizeRole(user?.role);

  // corp_user becomes corpuser after normalizeRole()
  return ["admin", "approver", "headoffice", "corpuser"].includes(role);
};

const canDeleteIssue = (user, issue) => {
  const role = normalizeRole(user?.role);
  const isOwner = String(issue?.reporter_user_id || "") === String(user?.id || "");

  // corp_user can view all, change status, reply, and add internal note.
  // corp_user cannot delete.
  if (role === "corpuser") return false;

  if (role === "admin") return true;

  return isOwner;
};

const getUserBranchId = (user) =>
  user?.branch_id ??
  user?.service_station_id ??
  null;

const branchScope = (user) => {
  if (isApprover(user)) return {};

  return {
    reporter_branch_id: getUserBranchId(user),
  };
};

const canAccessIssue = (user, issue) => {
  if (!user || !issue) return false;

  if (isApprover(user)) return true;

  return String(getUserBranchId(user) || "") === String(issue?.reporter_branch_id || "");
};

const generateTicketNo = async () => {
  const year = new Date().getFullYear();

  const latest = await BranchIssue.findOne({
    where: {
      ticket_no: {
        [Op.like]: `NL-ISS-${year}-%`,
      },
    },
    order: [["id", "DESC"]],
  });

  const latestNumber = latest?.ticket_no
    ? Number(String(latest.ticket_no).split("-").pop())
    : 5000;

  const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 5001;

  return `NL-ISS-${year}-${nextNumber}`;
};

const getUploadPublicUrl = (storagePath) => {
  if (!storagePath) return null;

  const normalized = String(storagePath).replace(/\\/g, "/");
  const idx = normalized.indexOf("uploads/");

  if (idx === -1) return `/${normalized}`;

  return `/${normalized.slice(idx)}`;
};

/* ─────────────────────────────────────────────────────────────
   MULTER UPLOAD CONFIG
───────────────────────────────────────────────────────────── */
const uploadDir = path.join(process.cwd(), "uploads", "branch-issues");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(null, false);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

exports.uploadMiddleware = upload.single("file");

/* ─────────────────────────────────────────────────────────────
   GET /api/v1/branch-issues/categories
───────────────────────────────────────────────────────────── */
exports.getCategories = asyncHandler(async (_req, res) => {
  const categories = await BranchIssueCategory.findAll({
    where: { is_active: true },
    order: [
      ["sort_order", "ASC"],
      ["name", "ASC"],
    ],
  });

  return res.json(categories);
});

/* ─────────────────────────────────────────────────────────────
   GET /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.listIssues = asyncHandler(async (req, res) => {
  const { status, priority, category_id, search } = req.query;

  const where = {
    is_deleted: false,
    ...branchScope(req.user),
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category_id) where.category_id = category_id;

  if (search && String(search).trim()) {
    const q = String(search).trim();

    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { ticket_no: { [Op.like]: `%${q}%` } },
      { reporter_name: { [Op.like]: `%${q}%` } },
      { reporter_email: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }

  const issues = await BranchIssue.findAll({
    where,
    include: [
      {
        model: BranchIssueCategory,
        as: "category",
        attributes: ["id", "name", "code"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return res.json(issues);
});

/* ─────────────────────────────────────────────────────────────
   GET /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */
exports.getIssue = asyncHandler(async (req, res) => {
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
        attributes: ["id", "name", "code", "default_sla_hours"],
      },
    ],
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  const messageWhere = { issue_id: issue.id };

  if (!isApprover(req.user)) {
    messageWhere.is_internal = false;
  }

  const [messages, attachmentsRaw, logs] = await Promise.all([
    BranchIssueMessage.findAll({
      where: messageWhere,
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

  const attachments = attachmentsRaw.map((a) => {
    const json = a.toJSON();

    return {
      ...json,
      url: getUploadPublicUrl(json.storage_path),
    };
  });

  return res.json({
    issue,
    messages,
    attachments,
    logs,
  });
});

/* ─────────────────────────────────────────────────────────────
   POST /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.createIssue = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    expected_outcome,
    category_id,
    priority,
    reporter_branch_id,
    reporter_name,
    reporter_email,
  } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!description || !String(description).trim()) {
    return res.status(400).json({ message: "Description is required" });
  }

  const finalPriority = ["Low", "Medium", "High", "Critical"].includes(priority)
    ? priority
    : "Medium";

  const ticket_no = await generateTicketNo();

  const issue = await BranchIssue.create({
    ticket_no,
    title: String(title).trim(),
    description: String(description).trim(),
    expected_outcome: expected_outcome ? String(expected_outcome).trim() : null,
    category_id: category_id || null,
    priority: finalPriority,
    status: "Open",
    reporter_user_id: req.user?.id || null,
    reporter_branch_id:
      getUserBranchId(req.user) ??
      reporter_branch_id ??
      null,
    reporter_name: req.user?.name ?? reporter_name ?? null,
    reporter_email: req.user?.email ?? reporter_email ?? null,
    due_at: null,
    closed_at: null,
    is_deleted: false,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id || null,
    actor_name: req.user?.name || req.user?.email || null,
    action: "Created",
    remarks: "Issue submitted",
  });

  return res.status(201).json({
    message: "Issue submitted successfully",
    issue,
  });
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/v1/branch-issues/:id/status
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
    where: {
      id: req.params.id,
      is_deleted: false,
    },
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  if (!isApprover(req.user)) {
    return res.status(403).json({ message: "Approvers only" });
  }

  const oldStatus = issue.status;

  const updateData = {
    status,
  };

  if (status === "Closed") {
    updateData.closed_at = new Date();
  }

  if (status !== "Closed") {
    updateData.closed_at = null;
  }

  await issue.update(updateData);

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id || null,
    actor_name: req.user?.name || req.user?.email || null,
    action: status === "Closed" ? "Closed" : "StatusChanged",
    old_status: oldStatus,
    new_status: status,
    remarks: remarks?.trim() || null,
  });

  return res.json({
    message: "Status updated successfully",
    issue,
  });
});

/* ─────────────────────────────────────────────────────────────
   POST /api/v1/branch-issues/:id/messages
───────────────────────────────────────────────────────────── */
exports.addMessage = asyncHandler(async (req, res) => {
  const { message, is_internal } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  if (is_internal && !isApprover(req.user)) {
    return res.status(403).json({
      message: "Only approvers can post internal notes",
    });
  }

  const issue = await BranchIssue.findOne({
    where: {
      id: req.params.id,
      is_deleted: false,
      ...branchScope(req.user),
    },
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  if (!canAccessIssue(req.user, issue)) {
    return res.status(403).json({ message: "Not authorised to access this issue" });
  }

  const msg = await BranchIssueMessage.create({
    issue_id: issue.id,
    sender_user_id: req.user?.id || null,
    sender_name: req.user?.name || req.user?.email || null,
    sender_role: req.user?.role || null,
    message: String(message).trim(),
    is_internal: !!is_internal,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id || null,
    actor_name: req.user?.name || req.user?.email || null,
    action: "MessageAdded",
    remarks: is_internal ? "Internal note added" : "Message added",
  });

  return res.status(201).json({
    message: "Message sent successfully",
    msg,
  });
});

/* ─────────────────────────────────────────────────────────────
   POST /api/v1/branch-issues/:id/attachments
───────────────────────────────────────────────────────────── */
exports.uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded or file type not allowed",
    });
  }

  const issue = await BranchIssue.findOne({
    where: {
      id: req.params.id,
      is_deleted: false,
      ...branchScope(req.user),
    },
  });

  if (!issue) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    return res.status(404).json({ message: "Issue not found" });
  }

  if (!canAccessIssue(req.user, issue)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    return res.status(403).json({ message: "Not authorised to access this issue" });
  }

  const attachment = await BranchIssueAttachment.create({
    issue_id: issue.id,
    original_file_name: req.file.originalname,
    stored_file_name: req.file.filename,
    content_type: req.file.mimetype,
    file_size_bytes: req.file.size,
    storage_path: req.file.path,
    uploaded_by_user_id: req.user?.id || null,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id || null,
    actor_name: req.user?.name || req.user?.email || null,
    action: "AttachmentAdded",
    remarks: req.file.originalname,
  });

  const json = attachment.toJSON();

  return res.status(201).json({
    message: "File uploaded successfully",
    attachment: {
      ...json,
      url: getUploadPublicUrl(json.storage_path),
    },
  });
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */
exports.deleteIssue = asyncHandler(async (req, res) => {
  const issue = await BranchIssue.findOne({
    where: {
      id: req.params.id,
      is_deleted: false,
    },
  });

  if (!issue) {
    return res.status(404).json({ message: "Issue not found" });
  }

  if (!canDeleteIssue(req.user, issue)) {
    return res.status(403).json({
      message: "Not authorised to delete this issue",
    });
  }

  if (issue.status !== "Open") {
    return res.status(400).json({
      message: "Only Open issues can be deleted",
    });
  }

  await issue.update({
    is_deleted: true,
  });

  await BranchIssueActivityLog.create({
    issue_id: issue.id,
    actor_user_id: req.user?.id || null,
    actor_name: req.user?.name || req.user?.email || null,
    action: "StatusChanged",
    old_status: issue.status,
    new_status: issue.status,
    remarks: "Issue deleted",
  });

  return res.json({
    message: "Issue deleted successfully",
  });
});
