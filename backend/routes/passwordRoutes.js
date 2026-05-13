const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// no protect here (user is not logged in)
router.post("/forgot", authController.forgotPassword);
router.post("/reset", authController.resetPassword);

module.exports = router;
