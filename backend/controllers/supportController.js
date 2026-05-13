const asyncHandler = require("express-async-handler");
const SupportTicket = require("../models/SupportTicket");
const SupportReply = require("../models/SupportReply");

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed", "Forwarded"];
const ROLE_OPTIONS = ["support", "subadmin", "admin"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

const normalizeRole = (role) =>
  String(role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const getSenderRole = (user) => {
  const role = normalizeRole(user?.role);
  if (role === "admin") return "admin";
  if (role === "subadmin") return "subadmin";
  if (role === "support") return "support";
  return "user";
};

const isSameBranch = (user, ticket) => {
  return String(user?.branch_id || "") === String(ticket?.branch_id || "");
};

const canViewTicket = (user, ticket) => {
  const role = normalizeRole(user?.role);

  if (!user) return false;

  // creator can view own ticket
  if (ticket?.email && user?.email && String(ticket.email).toLowerCase() === String(user.email).toLowerCase()) {
    return true;
  }

  // admin/support can view all tickets
  if (role === "admin" || role === "support") {
    return true;
  }

  // subadmin can view only same-branch tickets
  if (role === "subadmin") {
    return isSameBranch(user, ticket);
  }

  return false;
};

const canActOnTicket = (user, ticket) => {
  const role = normalizeRole(user?.role);

  // subadmin can act only on same branch
  if (role === "subadmin") {
    return isSameBranch(user, ticket);
  }

  // admin/support can act only after forwarded
  if (role === "admin" || role === "support") {
    return ticket?.status === "Forwarded" || ticket?.assigned_to_role === "admin";
  }

  return false;
};

const canForwardTicket = (user, ticket) => {
  const role = normalizeRole(user?.role);

  // only subadmin of same branch can forward
  if (role !== "subadmin") return false;
  if (!isSameBranch(user, ticket)) return false;

  // do not forward twice
  if (ticket?.status === "Forwarded" || ticket?.assigned_to_role === "admin") return false;

  return true;
};

// POST /api/support
exports.createTicket = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    subject,
    message,
    contact_no,
    type,
    category,
    sub_category,
    issue_type,
    requested_change,
    branch_id,
    branch_name,
    asset_id,
    asset_label,
    location_note,
    priority,
  } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      message: "Name, email, subject and message are required",
    });
  }

  if (!branch_id || !branch_name) {
    return res.status(400).json({ message: "Branch is required" });
  }

  if (!type || !category || !sub_category) {
    return res.status(400).json({
      message: "Category, sub-category and type are required",
    });
  }

  if (!asset_id || !asset_label) {
    return res.status(400).json({ message: "Please select an asset" });
  }

  const finalPriority = PRIORITY_OPTIONS.includes(priority) ? priority : "Medium";

  const ticket = await SupportTicket.create({
    name,
    email,
    subject,
    message,
    contact_no: contact_no || null,
    type: type || null,
    category: category || null,
    sub_category: sub_category || null,
    issue_type: issue_type || "Issue",
    requested_change: requested_change || null,
    branch_id: branch_id ? Number(branch_id) : null,
    branch_name: branch_name || null,
    asset_id: asset_id || null,
    asset_label: asset_label || null,
    location_note: location_note || null,
    priority: finalPriority,
    status: "Open",
    assigned_to_role: "subadmin", // always first goes to subadmin
    forwarded_remark: null,
    forwarded_by_email: null,
    forwarded_at: null,
  });

  return res.status(201).json({
    message: "Support request submitted successfully",
    ticket,
  });
});

// GET /api/support/my
exports.getMyTickets = asyncHandler(async (req, res) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(400).json({ message: "User email not found in token" });
  }

  const tickets = await SupportTicket.findAll({
    where: { email: userEmail },
    order: [["created_at", "DESC"]],
  });

  return res.json(tickets);
});

// GET /api/support
exports.getAllTickets = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.user?.role);
  let where = {};

  // subadmin sees only tickets of their own branch
  if (role === "subadmin") {
    where.branch_id = req.user?.branch_id || null;
  }

  // admin + support see all
  const tickets = await SupportTicket.findAll({
    where,
    order: [["created_at", "DESC"]],
  });

  return res.json(tickets);
});

// GET /api/support/:id
exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByPk(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canViewTicket(req.user, ticket)) {
    return res.status(403).json({ message: "You are not allowed to view this ticket" });
  }

  const replies = await SupportReply.findAll({
    where: { ticket_id: ticket.id },
    order: [["created_at", "ASC"]],
  });

  return res.json({ ticket, replies });
});

// PUT /api/support/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!STATUS_OPTIONS.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canActOnTicket(req.user, ticket)) {
    return res.status(403).json({
      message: "You cannot update this ticket until it is forwarded to admin",
    });
  }

  await ticket.update({ status });

  return res.json({
    message: "Status updated successfully",
    ticket,
  });
});

// PUT /api/support/:id/assign
exports.assignTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assigned_to_role } = req.body;

  if (!ROLE_OPTIONS.includes(assigned_to_role)) {
    return res.status(400).json({ message: "Invalid assigned role" });
  }

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canActOnTicket(req.user, ticket)) {
    return res.status(403).json({
      message: "You cannot assign this ticket until it is forwarded to admin",
    });
  }

  await ticket.update({ assigned_to_role });

  return res.json({
    message: "Ticket assigned successfully",
    ticket,
  });
});

// POST /api/support/:id/reply
exports.replyToTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Reply message is required" });
  }

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canActOnTicket(req.user, ticket)) {
    return res.status(403).json({
      message: "You cannot reply until the ticket is forwarded to admin",
    });
  }

  const reply = await SupportReply.create({
    ticket_id: ticket.id,
    sender_role: getSenderRole(req.user),
    message: message.trim(),
  });

  return res.status(201).json({
    message: "Reply sent successfully",
    reply,
  });
});

// POST /api/support/:id/forward
exports.forwardTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark || !remark.trim()) {
    return res.status(400).json({ message: "Forward remark is required" });
  }

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canForwardTicket(req.user, ticket)) {
    return res.status(403).json({
      message: "Only the subadmin of this branch can forward this ticket to admin",
    });
  }

  await ticket.update({
    status: "Forwarded",
    assigned_to_role: "admin",
    forwarded_remark: remark.trim(),
    forwarded_by_email: req.user?.email || null,
    forwarded_at: new Date(),
  });

  return res.json({
    message: "Ticket forwarded successfully",
    ticket,
  });
});

// PATCH /api/support/:id/edit
exports.editTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (ticket.email !== req.user?.email) {
    return res.status(403).json({ message: "You can edit only your own ticket" });
  }

  // optional: don't allow editing after forwarded / progress
  if (ticket.status !== "Open") {
    return res.status(400).json({
      message: "Only open tickets can be edited",
    });
  }

  await ticket.update({
    subject: subject || ticket.subject,
    message: message || ticket.message,
  });

  return res.json({
    message: "Ticket updated successfully",
    ticket,
  });
});

// DELETE /api/support/:id
exports.deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByPk(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  if (!canActOnTicket(req.user, ticket)) {
    return res.status(403).json({
      message: "You cannot delete this ticket until it is forwarded to admin",
    });
  }

  await SupportReply.destroy({ where: { ticket_id: ticket.id } });
  await ticket.destroy();

  return res.json({ message: "Ticket deleted successfully" });
});