// backend/controllers/notificationController.js
const asyncHandler = require("express-async-handler");
const db = require("../models");
const { Notification } = db;
const { sendSuccess, sendError } = require("../utils/response");

exports.listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);

  const items = await Notification.findAll({

    order: [["createdAt", "DESC"]],
    limit,
  });

  return sendSuccess(res, items, "Notifications");
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.count({ where: { is_read: false } });
  return sendSuccess(res, { count }, "Unread count");
});

exports.markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const n = await Notification.findByPk(id);
  if (!n) return sendError(res, "Notification not found", 404);

  await n.update({ is_read: true });
  return sendSuccess(res, {}, "Marked as read");
});
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);
  if (!notification) return sendError(res, "Notification not found", 404);

  await notification.destroy();
  return sendSuccess(res, {}, "Notification deleted successfully");
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ is_read: true }, { where: { is_read: false } });
  return sendSuccess(res, {}, "All marked as read");
});
