const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const path = require("path");
const crypto = require("crypto");
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
const normalizeRole = (r) =>
  String(r || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const isApprover = (user) => {
  const r = normalizeRole(user?.role);
  return ["admin", "approver", "headoffice", "corpuser"].includes(r);
};

// Branch staff see only their own branch; approvers see everything
const branchScope = (user) => {
  const role = normalizeRole(user?.role);

  if (["admin", "approver", "headoffice"].includes(role)) {
    return {};
  }

  if (role === "corpuser") {
    return { assigned_to_user_id: user?.id ?? null };
  }

  return { reporter_branch_id: user?.branch_id ?? user?.service_station_id ?? null };
};

// Generate NL-ISS-2026-5001 style ticket numbers
const generateTicketNo = async () => {
  const year  = new Date().getFullYear();
  const count = await BranchIssue.count();
  return `NL-ISS-${year}-${5000 + count + 1}`;
};

/* ─────────────────────────────────────────────────────────────
   MULTER  (file upload – configured inline, no separate middleware file)
───────────────────────────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/branch-issues/"),
  filename:    (_req,  file, cb) => {
    const ext  = path.extname(file.originalname);
    const rand = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/png", "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

exports.uploadMiddleware = upload.single("file");

/* ─────────────────────────────────────────────────────────────
   1.  GET /api/v1/branch-issues/categories
───────────────────────────────────────────────────────────── */
exports.getCategories = asyncHandler(async (_req, res) => {
  const cats = await BranchIssueCategory.findAll({
    where:  { is_active: true },
    order:  [["sort_order", "ASC"]],
  });
  res.json(cats);
});

/* ─────────────────────────────────────────────────────────────
   1B. GET /api/v1/branch-issues/corp-users
   Only corp_user accounts for assignment dropdown
───────────────────────────────────────────────────────────── */
exports.getCorpUsers = asyncHandler(async (_req, res) => {
  const users = await User.findAll({
    where: { role: "corp_user" },
    attributes: ["id", "name", "email", "role", "service_station_id"],
    order: [["name", "ASC"]],
  });

  res.json(users);
});

/* ─────────────────────────────────────────────────────────────
   2.  GET /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.listIssues = asyncHandler(async (req, res) => {
  const { status, priority, category_id, search } = req.query;

  const where = { is_deleted: false, ...branchScope(req.user) };

  if (status)      where.status      = status;
  if (priority)    where.priority    = priority;
  if (category_id) where.category_id = category_id;
  if (search) {
    where[Op.or] = [
      { title:        { [Op.like]: `%${search}%` } },
      { ticket_no:    { [Op.like]: `%${search}%` } },
      { reporter_name:{ [Op.like]: `%${search}%` } },
    ];
  }

  const issues = await BranchIssue.findAll({
    where,
    include: [{ model: BranchIssueCategory, as: "category", attributes: ["name", "code"] }],
    order: [["created_at", "DESC"]],
  });

  res.json(issues);
});

/* ─────────────────────────────────────────────────────────────
   3.  GET /api/v1/branch-issues/:id
───────────────────────────────────────────────────────────── */
exports.getIssue = asyncHandler(async (req, res) => {
  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
    include: [{ model: BranchIssueCategory, as: "category", attributes: ["name", "code"] }],
  });

  if (!issue) return res.status(404).json({ message: "Issue not found" });

  // messages — internal ones visible to approvers only
  const msgWhere = { issue_id: issue.id };
  if (!isApprover(req.user)) msgWhere.is_internal = false;

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
   4.  POST /api/v1/branch-issues
───────────────────────────────────────────────────────────── */
exports.createIssue = asyncHandler(async (req, res) => {
  const {
    title, description, expected_outcome,
    category_id, priority,
    assigned_to_user_id,
    reporter_branch_id, reporter_name, reporter_email,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  if (!assigned_to_user_id) {
    return res.status(400).json({ message: "Please select a Corporate User" });
  }

  const assignedCorpUser = await User.findOne({
    where: {
      id: assigned_to_user_id,
      role: "corp_user",
    },
    attributes: ["id", "name", "email", "role"],
  });

  if (!assignedCorpUser) {
    return res.status(400).json({ message: "Invalid Corporate User selected" });
  }

  const ticket_no = await generateTicketNo();

  const issue = await BranchIssue.create({
    ticket_no,
    title,
    description,
    expected_outcome: expected_outcome || null,
    category_id:      category_id      || null,
    priority:         ["Low","Medium","High","Critical"].includes(priority) ? priority : "Medium",
    status:           "Open",
    reporter_user_id:   req.user?.id,
    assigned_to_user_id: assignedCorpUser.id,
    reporter_branch_id: req.user?.branch_id ?? req.user?.service_station_id ?? reporter_branch_id ?? null,
    reporter_name:      req.user?.name  ?? reporter_name  ?? null,
    reporter_email:     req.user?.email ?? reporter_email ?? null,
  });

  await BranchIssueActivityLog.create({
    issue_id:      issue.id,
    actor_user_id: req.user?.id,
    actor_name:    req.user?.name,
    action:        "Created",
    remarks:       `Issue submitted and assigned to ${assignedCorpUser.name || assignedCorpUser.email}`,
  });

  res.status(201).json({ message: "Issue submitted successfully", issue });
});

/* ─────────────────────────────────────────────────────────────
   5.  PUT /api/v1/branch-issues/:id/status   (approver only)
───────────────────────────────────────────────────────────── */
exports.changeStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const VALID = ["Open", "UnderReview", "Closed"];

  if (!VALID.includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be Open, UnderReview or Closed" });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false },
  });
  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const oldStatus = issue.status;
  const update    = { status };
  if (status === "Closed") update.closed_at = new Date();

  await issue.update(update);

  await BranchIssueActivityLog.create({
    issue_id:      issue.id,
    actor_user_id: req.user?.id,
    actor_name:    req.user?.name,
    action:        status === "Closed" ? "Closed" : "StatusChanged",
    old_status:    oldStatus,
    new_status:    status,
    remarks:       remarks?.trim() || null,
  });

  res.json({ message: "Status updated", issue });
});

/* ─────────────────────────────────────────────────────────────
   6.  POST /api/v1/branch-issues/:id/messages
───────────────────────────────────────────────────────────── */
exports.addMessage = asyncHandler(async (req, res) => {
  const { message, is_internal } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  // Only approvers can post internal notes
  if (is_internal && !isApprover(req.user)) {
    return res.status(403).json({ message: "Only approvers can post internal notes" });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
  });
  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const msg = await BranchIssueMessage.create({
    issue_id:       issue.id,
    sender_user_id: req.user?.id,
    sender_name:    req.user?.name,
    sender_role:    req.user?.role,
    message:        message.trim(),
    is_internal:    !!is_internal,
  });

  await BranchIssueActivityLog.create({
    issue_id:      issue.id,
    actor_user_id: req.user?.id,
    actor_name:    req.user?.name,
    action:        "MessageAdded",
  });

  res.status(201).json({ message: "Message sent", msg });
});

/* ─────────────────────────────────────────────────────────────
   7.  POST /api/v1/branch-issues/:id/attachments
───────────────────────────────────────────────────────────── */
exports.uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded or file type not allowed" });
  }

  const issue = await BranchIssue.findOne({
    where: { id: req.params.id, is_deleted: false, ...branchScope(req.user) },
  });
  if (!issue) return res.status(404).json({ message: "Issue not found" });

  const attachment = await BranchIssueAttachment.create({
    issue_id:            issue.id,
    original_file_name:  req.file.originalname,
    stored_file_name:    req.file.filename,
    content_type:        req.file.mimetype,
    file_size_bytes:     req.file.size,
    storage_path:        req.file.path,
    uploaded_by_user_id: req.user?.id,
  });

  await BranchIssueActivityLog.create({
    issue_id:      issue.id,
    actor_user_id: req.user?.id,
    actor_name:    req.user?.name,
    action:        "AttachmentAdded",
    remarks:       req.file.originalname,
  });

  res.status(201).json({ message: "File uploaded", attachment });
});

/* ─────────────────────────────────────────────────────────────
   8.  DELETE /api/v1/branch-issues/:id   (soft delete, reporter only)
───────────────────────────────────────────────────────────── */
exports.deleteIssue = asyncHandler(async (req, res) => {
  const issue = await BranchIssue.findByPk(req.params.id);
  if (!issue || issue.is_deleted) {
    return res.status(404).json({ message: "Issue not found" });
  }

  // Only the original reporter or an approver can delete
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
