// backend/routes/requestRoutes.js
const express = require("express");
const router = express.Router();
const { sendMail } = require("../utils/mailer");

const {
  createRequest,
  getSubadminOwnRequests,
  getAllRequests,
  updateRequestStatus,
  editRequest,
  deleteRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles, adminOrSubadmin, adminOnly } = require("../middleware/adminMiddleware");

// SubAdmin create
router.post("/", protect, allowRoles("subadmin"), createRequest);

// SubAdmin view OWN created requests (you asked this)
router.get("/", protect, allowRoles("subadmin"), getSubadminOwnRequests);

// Admin/SubAdmin view all in table
router.get("/all", protect, adminOrSubadmin, getAllRequests);

router.get("/test-email", protect, adminOnly, async (req, res) => {
  await sendMail({
    to: process.env.ADMIN_EMAIL || "",
    subject: "Test Email - Project IMS",
    text: "SMTP is working ✅",
    html: "<b>SMTP is working ✅</b>",
  });

  res.json({ message: "Test email sent" });
});

// Only Admin can update status
router.put("/:id", protect, adminOnly, updateRequestStatus);

// Only Admin can edit full request
router.put("/:id/edit", protect, adminOnly, editRequest);

// Only Admin can delete
router.delete("/:id", protect, adminOnly, deleteRequest);


module.exports = router;
