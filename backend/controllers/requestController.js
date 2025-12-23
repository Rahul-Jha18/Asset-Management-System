// backend/controllers/requestController.js
const asyncHandler = require("express-async-handler");
const Request = require("../models/Request");
const User = require("../models/User");
const Branch = require("../models/Branch");

// helper: allow empty -> null
const toNull = (v) => (v === "" || v === undefined ? null : v);

const allowedStatuses = ["Pending", "In Progress", "Approved", "Rejected", "Completed", "Done"];

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

    // ✅ new fields
    requestedByName,
    requestedByContact,
    purchaseDate,
    warrantyExpiry,
    invoiceNo,
    vendorName,
    province,
    district,
    localLevel,
    fiscalYear,
    agreeAccuracy,
  } = req.body;

  if (!type || !description || !branchId) {
    res.status(400);
    throw new Error("Type, description and branch are required");
  }

  // ✅ agreement must be true
  if (!agreeAccuracy) {
    res.status(400);
    throw new Error("Agreement is required");
  }

  const bId = Number(branchId);
  if (!bId || Number.isNaN(bId)) {
    res.status(400);
    throw new Error("branchId must be a valid number");
  }

  const payload = {
    userId: req.user.id,
    type,
    title: toNull(title),
    category: toNull(category),
    sub_category: toNull(sub_category),
    asset: toNull(asset),
    priority: priority || "Medium",
    description,
    status: "Pending",
    branchId: bId,
    deviceId: deviceId ? Number(deviceId) : null,

    requestedByName: toNull(requestedByName),
    requestedByContact: toNull(requestedByContact),
    purchaseDate: toNull(purchaseDate),
    warrantyExpiry: toNull(warrantyExpiry),
    invoiceNo: toNull(invoiceNo),
    vendorName: toNull(vendorName),
    province: toNull(province),
    district: toNull(district),
    localLevel: toNull(localLevel),
    fiscalYear: toNull(fiscalYear),
    agreeAccuracy: true,
  };

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

// @desc Update request status (Admin/Subadmin) - STATUS ONLY
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
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

// @desc Edit request (Admin/Subadmin) - FULL EDIT
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
    status,

    // ✅ new fields
    requestedByName,
    requestedByContact,
    purchaseDate,
    warrantyExpiry,
    invoiceNo,
    vendorName,
    province,
    district,
    localLevel,
    fiscalYear,
    agreeAccuracy,
  } = req.body;

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (type !== undefined) request.type = type;
  if (title !== undefined) request.title = toNull(title);
  if (category !== undefined) request.category = toNull(category);
  if (sub_category !== undefined) request.sub_category = toNull(sub_category);
  if (asset !== undefined) request.asset = toNull(asset);
  if (priority !== undefined) request.priority = priority || "Medium";
  if (description !== undefined) request.description = description;

  // ✅ allow admins to update status here too (optional)
  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status value");
    }
    request.status = status;
  }

  // ✅ branchId must not become null
  if (branchId !== undefined) {
    if (!branchId) {
      res.status(400);
      throw new Error("branchId cannot be empty");
    }
    const bId = Number(branchId);
    if (!bId || Number.isNaN(bId)) {
      res.status(400);
      throw new Error("branchId must be a valid number");
    }
    request.branchId = bId;
  }

  if (deviceId !== undefined) request.deviceId = deviceId ? Number(deviceId) : null;

  // ✅ update new fields
  if (requestedByName !== undefined) request.requestedByName = toNull(requestedByName);
  if (requestedByContact !== undefined) request.requestedByContact = toNull(requestedByContact);
  if (purchaseDate !== undefined) request.purchaseDate = toNull(purchaseDate);
  if (warrantyExpiry !== undefined) request.warrantyExpiry = toNull(warrantyExpiry);
  if (invoiceNo !== undefined) request.invoiceNo = toNull(invoiceNo);
  if (vendorName !== undefined) request.vendorName = toNull(vendorName);
  if (province !== undefined) request.province = toNull(province);
  if (district !== undefined) request.district = toNull(district);
  if (localLevel !== undefined) request.localLevel = toNull(localLevel);
  if (fiscalYear !== undefined) request.fiscalYear = toNull(fiscalYear);

  // ✅ admin edit: keep agreeAccuracy true once already submitted
  if (agreeAccuracy !== undefined) request.agreeAccuracy = !!agreeAccuracy;

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
