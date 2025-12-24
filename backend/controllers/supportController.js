const asyncHandler = require("express-async-handler");
const SupportTicket = require("../models/SupportTicket");

// POST /api/support
exports.createTicket = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const ticket = await SupportTicket.create({
    name,
    email,
    subject,
    message,
  });

  return res.status(201).json({
    message: "Support request submitted successfully",
    ticket,
  });
});

// GET /api/support/my  (logged-in user)
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

// GET /api/support  (admin/subadmin/support)
exports.getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.findAll({
    order: [["created_at", "DESC"]],
  });

  return res.json(tickets);
});

// PUT /api/support/:id  (admin/subadmin/support)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const allowed = ["Open", "In Progress", "Resolved"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  await ticket.update({ status });

  return res.json({
    message: "Status updated successfully",
    ticket,
  });
});
