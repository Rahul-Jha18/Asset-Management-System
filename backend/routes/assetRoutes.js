// backend/routes/assetRoutes.js
const express = require("express");
const router = express.Router();
const { createGroupAndSubcategory } = require("../controllers/assetController");

router.post("/group-subcategory", createGroupAndSubcategory);

module.exports = router;
