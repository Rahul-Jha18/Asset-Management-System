// backend/routes/assetMetaRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const assetMetaController = require("../controllers/assetMetaController");

router.get("/asset-groups", protect, assetMetaController.getAssetGroups);
router.post("/asset-groups", protect, adminOnly, assetMetaController.createAssetGroup);

router.get("/asset-sub-categories", protect, assetMetaController.getAssetSubCategories);
router.post("/asset-sub-categories", protect, adminOnly, assetMetaController.createAssetSubCategory);

module.exports = router;
