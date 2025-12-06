const express = require("express");
const {
  registerAdminController,
  loginAdminController,
  requestResetPasswordController,
  resetPasswordController
} = require("../controllers/authController");

const router = express.Router();

// Register first admin (you can disable this in production)
router.post("/register", registerAdminController);

// Login
router.post("/login", loginAdminController);

// Forgot password
router.post("/forgot-password", requestResetPasswordController);

// Reset password
router.post("/reset-password", resetPasswordController);

module.exports = router;
