const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const assetTrackingController = require("../controllers/assetTrackingController");

router.get("/", protect, assetTrackingController.getTrackingList);
router.get("/summary", protect, assetTrackingController.getTrackingSummary);
router.get("/scan-now", protect, assetTrackingController.scanNow);
router.get("/:asset_id", protect, assetTrackingController.getTrackingDetail);

router.post("/sync-from-master", protect, assetTrackingController.syncFromMaster);

module.exports = router;