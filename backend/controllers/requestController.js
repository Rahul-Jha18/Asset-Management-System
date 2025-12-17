// backend/controllers/requestController.js
const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');
const User = require('../models/User');
const Branch = require('../models/Branch');

// @desc Create a new request (User)
exports.createRequest = asyncHandler(async (req, res) => {
  const { type, description, branchId, deviceId } = req.body;

  if (!type || !description) {
    res.status(400);
    throw new Error('Type and description are required');
  }

  const payload = {
    userId: req.user.id,
    type,
    description,
    status: 'Pending',
    branchId: branchId ? Number(branchId) : null,
    deviceId: deviceId ? Number(deviceId) : null,
  };

  const newRequest = await Request.create(payload);
  res.status(201).json(newRequest);
});

// @desc Get requests for logged-in user
exports.getUserRequests = asyncHandler(async (req, res) => {
  const requests = await Request.findAll({
    where: { userId: req.user.id },
    include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(requests);
});

// @desc Get all requests (Admin/Subadmin)
exports.getAllRequests = asyncHandler(async (req, res) => {
  const requests = await Request.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
      { model: Branch, as: 'branch', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(requests);
});

// @desc Update request status (Admin/Subadmin)
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Done'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  request.status = status;
  await request.save();

  res.json({ message: 'Status updated', request });
});

// @desc Edit request (Admin/Subadmin)
exports.editRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description, branchId, deviceId } = req.body;

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (type) request.type = type;
  if (description) request.description = description;

  if (branchId !== undefined) request.branchId = branchId || null;
  if (deviceId !== undefined) request.deviceId = deviceId || null;

  await request.save();
  res.json({ message: 'Request updated', request });
});

// @desc Delete request (Admin only)
exports.deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await Request.findByPk(id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  await request.destroy();
  res.json({ message: 'Request deleted successfully' });
});
