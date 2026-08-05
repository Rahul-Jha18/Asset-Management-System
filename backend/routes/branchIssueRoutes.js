const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl     = require("../controllers/branchIssueController");

router.get("/categories", protect, ctrl.getCategories);
router.get("/corp-users", protect, ctrl.getCorpUsers);

router.get("/", protect, ctrl.listIssues);
router.get("/analysis-dashboard", protect, ctrl.getAnalysisDashboard);
router.post("/", protect, ctrl.createIssue);

router.get("/:id", protect, ctrl.getIssue);

// Role is not checked here. Controller allows only the assigned user.
router.put("/:id/status", protect, ctrl.changeStatus);

router.post("/:id/messages", protect, ctrl.addMessage);

router.post(
  "/:id/attachments",
  protect,
  ctrl.uploadMiddleware,
  ctrl.uploadAttachment
);

router.delete("/:id", protect, ctrl.deleteIssue);

module.exports = router;
