const express = require('express');
const router = express.Router();

const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  updateInfra,
  updateScanner,
  updateProjector,
  updatePrinter,
  updateDesktop,
  updateLaptop,
  updateCctv,
  updatePanel,
  updateIpPhone,
} = require('../controllers/branchContoller'); // 👈 spelling same as filename

const { protect } = require('../middleware/authMiddleware');
const { adminOrSubadmin, adminOnlyDelete } = require('../middleware/adminMiddleware');

// main branch routes
router.get('/', protect, getBranches);
router.get('/:id', protect, getBranchById);
router.post('/', protect, adminOrSubadmin, createBranch);
router.put('/:id', protect, adminOrSubadmin, updateBranch);
router.delete('/:id', protect, adminOnlyDelete, deleteBranch);

// infra routes
router.put('/:id/infra',     protect, adminOrSubadmin, updateInfra);
router.put('/:id/scanner',   protect, adminOrSubadmin, updateScanner);
router.put('/:id/projector', protect, adminOrSubadmin, updateProjector);
router.put('/:id/printer',   protect, adminOrSubadmin, updatePrinter);
router.put('/:id/desktop',   protect, adminOrSubadmin, updateDesktop);
router.put('/:id/laptop',    protect, adminOrSubadmin, updateLaptop);
router.put('/:id/cctv',      protect, adminOrSubadmin, updateCctv);
router.put('/:id/panel',     protect, adminOrSubadmin, updatePanel);
router.put('/:id/ipphone',   protect, adminOrSubadmin, updateIpPhone);

module.exports = router;
