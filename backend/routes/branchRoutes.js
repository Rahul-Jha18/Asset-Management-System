// backend/routes/branchRoutes.js
const express = require("express");
const router = express.Router();

const branchController = require("../controllers/branchContoller");

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin, adminOnlyDelete } = require("../middleware/adminMiddleware");

// main branch routes
router.get("/", protect, branchController.getBranches);
router.get("/:id", protect, branchController.getBranchById);

router.post("/", protect, adminOrSubadmin, branchController.createBranch);
router.put("/:id", protect, adminOrSubadmin, branchController.updateBranch);
router.delete("/:id", protect, adminOnlyDelete, branchController.deleteBranch);

// infra route (single)
router.put("/:id/infra", protect, adminOrSubadmin, branchController.updateInfra);

// ================= MULTI DEVICE ROUTES =================

// scanners
router.get("/:id/scanners", protect, branchController.scanners.list);
router.post("/:id/scanners", protect, adminOrSubadmin, branchController.scanners.create);
router.put("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.update);
router.delete("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.remove);

// projectors
router.get("/:id/projectors", protect, branchController.projectors.list);
router.post("/:id/projectors", protect, adminOrSubadmin, branchController.projectors.create);
router.put("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.update);
router.delete("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.remove);

// printers
router.get("/:id/printers", protect, branchController.printers.list);
router.post("/:id/printers", protect, adminOrSubadmin, branchController.printers.create);
router.put("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.update);
router.delete("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.remove);

// desktops
router.get("/:id/desktops", protect, branchController.desktops.list);
router.post("/:id/desktops", protect, adminOrSubadmin, branchController.desktops.create);
router.put("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.update);
router.delete("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.remove);

// laptops
router.get("/:id/laptops", protect, branchController.laptops.list);
router.post("/:id/laptops", protect, adminOrSubadmin, branchController.laptops.create);
router.put("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.update);
router.delete("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.remove);

// cctvs
router.get("/:id/cctvs", protect, branchController.cctvs.list);
router.post("/:id/cctvs", protect, adminOrSubadmin, branchController.cctvs.create);
router.put("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.update);
router.delete("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.remove);

// panels
router.get("/:id/panels", protect, branchController.panels.list);
router.post("/:id/panels", protect, adminOrSubadmin, branchController.panels.create);
router.put("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.update);
router.delete("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.remove);

// ipphones
router.get("/:id/ipphones", protect, branchController.ipphones.list);
router.post("/:id/ipphones", protect, adminOrSubadmin, branchController.ipphones.create);
router.put("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.update);
router.delete("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.remove);

module.exports = router;
