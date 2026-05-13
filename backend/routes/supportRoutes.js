const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const supportController = require("../controllers/supportController");

// role middleware
const adminOrSubadminOrSupport = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase().replace(/[\s_-]/g, "");

  if (role === "admin" || role === "subadmin" || role === "support") {
    return next();
  }
  return res.status(403).json({ message: "Not authorized" });
};

router.post("/", protect, supportController.createTicket);
router.get("/my", protect, supportController.getMyTickets);
router.get("/", protect, adminOrSubadminOrSupport, supportController.getAllTickets);
router.get("/:id", protect, supportController.getTicketById);

router.put("/:id/status", protect, adminOrSubadminOrSupport, supportController.updateStatus);
router.put("/:id/assign", protect, adminOrSubadminOrSupport, supportController.assignTicket);

router.post("/:id/reply", protect, adminOrSubadminOrSupport, supportController.replyToTicket);
router.post("/:id/forward", protect, adminOrSubadminOrSupport, supportController.forwardTicket);

router.patch("/:id/edit", protect, supportController.editTicket);
router.delete("/:id", protect, adminOrSubadminOrSupport, supportController.deleteTicket);

module.exports = router;