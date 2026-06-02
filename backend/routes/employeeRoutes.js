// routes/employeeRoutes.js
const express = require("express");
const router  = express.Router();

const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  exportEmployees,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");

// Inline admin/sub-admin guard — works with your existing User model
const adminOnly = (req, res, next) => {
  const role = req.user?.role;
  const isAdmin = req.user?.is_admin;

  if (isAdmin || role === "admin" || role === "sub_admin" || role === "subadmin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin or Sub-Admin role required.",
  });
};

// ── Read (any authenticated user) ─────────────────────────
router.get("/",        protect, getAllEmployees);
router.get("/export",  protect, exportEmployees);
router.get("/:id",     protect, getEmployeeById);

// ── Write (admin / sub-admin only) ────────────────────────
router.post("/",       protect, adminOnly, createEmployee);
router.post("/import", protect, adminOnly, importEmployees);
router.put("/:id",     protect, adminOnly, updateEmployee);
router.delete("/:id",  protect, adminOnly, deleteEmployee);

module.exports = router;