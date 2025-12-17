// backend/routes/softwareRoutes.js
const express = require('express');
const router = express.Router();

const { protect, adminOrSubAdmin } = require('../middleware/authMiddleware');
const {
  getSoftwareByBranch,
  upsertSoftwareByBranch,
} = require('../controllers/softwareController');

router.get('/:branchId', protect, getSoftwareByBranch);
router.put('/:branchId', protect, adminOrSubAdmin, upsertSoftwareByBranch);

module.exports = router;
