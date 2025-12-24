const express = require("express");
const router = express.Router();

const supportController = require("../controllers/supportController");
const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadminOrSupport } = require("../middleware/supportMiddleware");

// user creates ticket
router.post("/", protect, supportController.createTicket);

// user views own tickets
router.get("/my", protect, supportController.getMyTickets);

// staff views all + updates
router.get("/", protect, adminOrSubadminOrSupport, supportController.getAllTickets);
router.put("/:id", protect, adminOrSubadminOrSupport, supportController.updateStatus);

module.exports = router;
