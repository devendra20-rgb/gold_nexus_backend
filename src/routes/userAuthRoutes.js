const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  verifyEmail,      // 🟢 New: Registration OTP verify karne ke liye
  forgotPassword,   // 🟢 New: Password reset OTP bhejne ke liye
  resetPassword,    // 🟢 New: Naya password set karne ke liye
  updateUserProfile 
} = require("../controllers/userAuthController");

const { authMiddleware } = require("../middleware/auth"); 

// --- Auth Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🟢 New Routes for OTP & Password Reset
router.post("/verify-email", verifyEmail);       
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);   

// --- Protected Routes (Login Required) ---
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;