// backend/routes/backupRoutes.js
const express = require("express");
const router = express.Router();

const { downloadBackup } = require("../controllers/backupController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/download", protect, adminOnly, downloadBackup);

module.exports = router;