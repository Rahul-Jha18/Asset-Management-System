// backend/routes/assetHistoryRoutes.js
const express = require("express");
const router = express.Router();
const assetHistoryController = require("../controllers/assetHistoryController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

/**
 * All routes require authentication
 */

// Get history for a specific asset
router.get("/asset/:assetId", protect, assetHistoryController.getAssetHistory);

// Get history for a branch
router.get("/branch/:branchId", protect, assetHistoryController.getBranchHistory);

// Get change summary for an asset (useful for dashboard)
router.get("/summary/:assetId", protect, assetHistoryController.getAssetChangeSummary);

// Get recent changes in a branch
router.get("/recent-changes/:branchId", protect, assetHistoryController.getRecentChanges);

// Get branch statistics
router.get("/stats/:branchId", protect, assetHistoryController.getBranchStats);

// Clear history (admin only)
router.delete("/clear", protect, adminOnly, assetHistoryController.clearHistory);

module.exports = router;
