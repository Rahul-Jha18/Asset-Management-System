const express = require("express");
const router = express.Router();

const assetTransferController = require("../controllers/assetTransferController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/assets/transfer
router.post("/transfer", protect, assetTransferController.transferAsset);

// GET /api/assets/transfer-history?assetId=27&section=cctv&limit=10&offset=0
router.get(
  "/transfer-history",
  protect,
  assetTransferController.getAssetTransferHistory
);

// Optional alias if frontend later uses /api/assets/history
router.get(
  "/history",
  protect,
  assetTransferController.getAssetTransferHistory
);

module.exports = router;