const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/branchIssueController");

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const approverOnly = (req, res, next) => {
  const role = normalizeRole(req.user?.role);

  // corp_user becomes corpuser after normalizeRole()
  if (["admin", "approver", "headoffice", "corpuser"].includes(role)) {
    return next();
  }

  return res.status(403).json({ message: "Approvers only" });
};

/*
  All routes are prefixed with /api/v1/branch-issues
*/

router.get("/categories", protect, ctrl.getCategories);

router.get("/", protect, ctrl.listIssues);
router.post("/", protect, ctrl.createIssue);

router.get("/:id", protect, ctrl.getIssue);

router.put("/:id/status", protect, approverOnly, ctrl.changeStatus);

router.post("/:id/messages", protect, ctrl.addMessage);

router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,
  ctrl.uploadAttachment
);

router.delete("/:id", protect, ctrl.deleteIssue);

module.exports = router;
