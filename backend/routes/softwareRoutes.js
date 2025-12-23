// backend/routes/softwareRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin } = require("../middleware/adminMiddleware");

const {
  getSoftwareByBranch,
  upsertSoftwareByBranch,
} = require("../controllers/softwareController");

router.get("/:branchId", protect, getSoftwareByBranch);
router.put("/:branchId", protect, adminOrSubadmin, upsertSoftwareByBranch);

module.exports = router;
