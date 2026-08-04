const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl     = require("../controllers/branchIssueController");

const normalizeRole = (r) =>
  String(r || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

// Route-level gate: only corp_user role may even attempt a status
// change. Controller re-verifies it's THIS issue's assigned user.
const corpUserOnly = (req, res, next) => {
  const role = normalizeRole(req.user?.role);
  if (role === "corpuser") return next();

  return res.status(403).json({
    message: "Assigned corporate user only",
  });
};

router.get("/categories", protect, ctrl.getCategories);
router.get("/corp-users", protect, ctrl.getCorpUsers);

router.get("/", protect, ctrl.listIssues);
router.get("/analysis-dashboard", protect, ctrl.getAnalysisDashboard);
router.post("/", protect, ctrl.createIssue);

router.get("/:id", protect, ctrl.getIssue);

router.put("/:id/status", protect, corpUserOnly, ctrl.changeStatus);

router.post("/:id/messages", protect, ctrl.addMessage);

router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,
  ctrl.uploadAttachment
);

router.delete("/:id", protect, ctrl.deleteIssue);

module.exports = router;
