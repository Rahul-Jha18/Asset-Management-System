// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// PATCH /api/users/profile-image
router.patch("/profile-image", protect, async (req, res) => {
  try {
    const { img_url } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.update({ img_url: img_url || null });

    res.json({
      success: true,
      data: { img_url: user.img_url },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;