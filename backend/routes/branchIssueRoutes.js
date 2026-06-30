const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl     = require("../controllers/branchIssueController");

const approverOnly = (req, res, next) => {
  const role = String(req.user?.role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  if (["admin", "approver", "headoffice", "corpuser"].includes(role)) return next();
  return res.status(403).json({ message: "Approvers only" });
};

router.get("/categories",protect,ctrl.getCategories);

router.get("/corp-users",protect,ctrl.getCorpUsers);

router.get("/",protect,ctrl.listIssues);
router.post("/",protect, ctrl.createIssue);

router.get("/:id", protect,ctrl.getIssue);

router.put("/:id/status",protect, approverOnly, ctrl.changeStatus);

router.post("/:id/messages",protect, ctrl.addMessage);

router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,   
  ctrl.uploadAttachment
);

// Soft delete
router.delete("/:id", protect,ctrl.deleteIssue);

module.exports = router;
