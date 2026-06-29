const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl     = require("../controllers/branchIssueController");

/* ── Role guard: only admin / approver / headoffice ── */
const approverOnly = (req, res, next) => {
  const role = String(req.user?.role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  if (["admin", "approver", "headoffice", "corpuser"].includes(role)) return next();
  return res.status(403).json({ message: "Approvers only" });
};

// Categories (public to all authenticated users)
router.get("/categories",protect,ctrl.getCategories);

// Corporate users list for assignment dropdown
router.get("/corp-users",protect,ctrl.getCorpUsers);

// Issues list & create
router.get("/",protect,ctrl.listIssues);
router.post("/",protect, ctrl.createIssue);

// Single issue detail
router.get("/:id", protect,ctrl.getIssue);

// Status change  — approver only
router.put("/:id/status",protect, approverOnly, ctrl.changeStatus);

// Chat messages  — any authenticated user who can see the issue
router.post("/:id/messages",protect, ctrl.addMessage);

// File attachments
router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,   
  ctrl.uploadAttachment
);

// Soft delete
router.delete("/:id", protect,ctrl.deleteIssue);

module.exports = router;
