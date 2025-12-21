// backend/controllers/requestController.js
const asyncHandler = require("express-async-handler");
const Request = require("../models/Request");
const User = require("../models/User");
const Branch = require("../models/Branch");

// @desc Create a new request (User)
exports.createRequest = asyncHandler(async (req, res) => {
  const {
    type,
    description,
    branchId,
    deviceId,
    title,
    category,
    sub_category,
    asset,
    priority,
  } = req.body;

  // ✅ branchId required
  if (!type || !description || !branchId) {
    res.status(400);
    throw new Error("Type, description and branch are required");
  }

  const payload = {
    userId: req.user.id,
    type,
    title: title || null,
    category: category || null,
    sub_category: sub_category || null,
    asset: asset || null,
    priority: priority || "Medium",
    description,
    status: "Pending",
    branchId: Number(branchId),
    deviceId: deviceId ? Number(deviceId) : null,
  };

  if (!payload.branchId || Number.isNaN(payload.branchId)) {
    res.status(400);
    throw new Error("branchId must be a valid number");
  }

  const newRequest = await Request.create(payload);
  res.status(201).json(newRequest);
});

// @desc Get requests for logged-in user
exports.getUserRequests = asyncHandler(async (req, res) => {
  const requests = await Request.findAll({
    where: { userId: req.user.id },
    include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  });
  res.json(requests);
});

// @desc Get all requests (Admin/Subadmin)
exports.getAllRequests = asyncHandler(async (req, res) => {
  const requests = await Request.findAll({
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email", "role"] },
      { model: Branch, as: "branch", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(requests);
});

// @desc Update request status (Admin/Subadmin)
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ keep your existing rule OR expand if your DB supports more
  const validStatuses = ["Pending", "Done", "In Progress", "Approved", "Rejected", "Completed"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  request.status = status;
  await request.save();

  res.json({ message: "Status updated", request });
});

// @desc Edit request (Admin/Subadmin)
exports.editRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    type,
    description,
    branchId,
    deviceId,
    title,
    category,
    sub_category,
    asset,
    priority,
  } = req.body;

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (type !== undefined) request.type = type;
  if (title !== undefined) request.title = title || null;
  if (category !== undefined) request.category = category || null;
  if (sub_category !== undefined) request.sub_category = sub_category || null;
  if (asset !== undefined) request.asset = asset || null;
  if (priority !== undefined) request.priority = priority || "Medium";
  if (description !== undefined) request.description = description;

  // ✅ branchId must not become null
  if (branchId !== undefined) {
    if (!branchId) {
      res.status(400);
      throw new Error("branchId cannot be empty");
    }
    request.branchId = Number(branchId);
  }

  if (deviceId !== undefined) request.deviceId = deviceId ? Number(deviceId) : null;

  await request.save();
  res.json({ message: "Request updated", request });
});

// @desc Delete request (Admin only)
exports.deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  await request.destroy();
  res.json({ message: "Request deleted successfully" });
});
