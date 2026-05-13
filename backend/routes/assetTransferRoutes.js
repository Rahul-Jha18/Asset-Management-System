const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin } = require("../middleware/adminMiddleware");
const assetTransferController = require("../controllers/assetTransferController");

router.post(
  "/transfer",
  protect,
  adminOrSubadmin,
  assetTransferController.transferAsset
);

router.get(
  "/asset-transfers/history",
  protect,
  assetTransferController.getAssetTransferHistory
);

module.exports = router;