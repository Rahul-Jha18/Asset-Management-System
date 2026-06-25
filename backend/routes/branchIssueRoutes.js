const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/branchIssueController");

/* ─────────────────────────────────────────────────────────────
   ROLE GUARD
───────────────────────────────────────────────────────────── */
const approverOnly = (req, res, next) => {
  const role = String(req.user?.role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (["admin", "approver", "headoffice"].includes(role)) {
    return next();
  }

  return res.status(403).json({
    message: "Approvers only",
  });
};

/*
  Register in server.js / app.js:

  const branchIssueRoutes = require("./routes/branchIssueRoutes");
  app.use("/api/v1/branch-issues", branchIssueRoutes);
*/

/* Categories */
router.get("/categories", protect, ctrl.getCategories);

/* Issues */
router.get("/", protect, ctrl.listIssues);
router.post("/", protect, ctrl.createIssue);

/* Single issue */
router.get("/:id", protect, ctrl.getIssue);

/* Status change */
router.put("/:id/status", protect, approverOnly, ctrl.changeStatus);

/* Messages */
router.post("/:id/messages", protect, ctrl.addMessage);

/* Attachments */
router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,
  ctrl.uploadAttachment
);

/* Soft delete */
router.delete("/:id", protect, ctrl.deleteIssue);

module.exports = router;