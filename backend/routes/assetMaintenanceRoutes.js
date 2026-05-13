// backend/routes/assetMaintenanceRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin, adminOnly } = require("../middleware/adminMiddleware");

const assetMaintenanceController = require("../controllers/assetMaintenanceController");

router.get("/", protect, assetMaintenanceController.getLogs);

router.post("/", protect, adminOrSubadmin, assetMaintenanceController.createLog);

router.put("/:id", protect, adminOrSubadmin, assetMaintenanceController.updateLog);

router.delete("/:id", protect, adminOnly, assetMaintenanceController.deleteLog);

module.exports = router;
