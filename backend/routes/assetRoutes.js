// backend/routes/assetRoutes.js
const express = require("express");
const router = express.Router();

const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset, // 👈 NEW
} = require("../controllers/assetController");

const { protect } = require("../middleware/authMiddleware");

// /api/assets
router
  .route("/")
  .get(protect, getAssets)
  .post(protect, createAsset);

// /api/assets/:id
router
  .route("/:id")
  .get(protect, getAssetById)
  .put(protect, updateAsset)
  .delete(protect, deleteAsset); // 👈 NEW

module.exports = router;