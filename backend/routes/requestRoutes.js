// backend/routes/requestRoutes.js
const express = require("express");
const router = express.Router();

const {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus,
  editRequest,
  deleteRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin, adminOnlyDelete, allowRoles } = require("../middleware/adminMiddleware");

// ✅ ONLY normal user can create request
router.post("/", protect, allowRoles("user"), createRequest);

// user view own
router.get("/", protect, getUserRequests);

// admin/subadmin view all
router.get("/all", protect, adminOrsubadminSafe, getAllRequests);

// status-only update
router.put("/:id", protect, adminOrsubadminSafe, updateRequestStatus);

// full edit
router.put("/:id/edit", protect, adminOrsubadminSafe, editRequest);

// admin delete
router.delete("/:id", protect, adminOnlyDelete, deleteRequest);

module.exports = router;

// small wrapper so spelling mistake never breaks routes
function adminOrsubadminSafe(req, res, next) {
  return adminOrSubadmin(req, res, next);
}
