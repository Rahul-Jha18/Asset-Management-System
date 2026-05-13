// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Admin-only notification center
router.get("/", protect, adminOnly, c.listNotifications);
router.get("/unread-count", protect, adminOnly, c.unreadCount);

// IMPORTANT: keep /read-all BEFORE /:id/read
router.put("/read-all", protect, adminOnly, c.markAllRead);
router.put("/:id/read", protect, adminOnly, c.markRead);

router.delete("/:id", protect, adminOnly, c.deleteNotification);

module.exports = router;
