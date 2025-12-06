const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const { hashPassword, comparePassword } = require("../utils/password");
const { sendResetPasswordEmail } = require("../utils/email");

async function registerAdmin({ email, username, password }) {
  const existingEmail = await Admin.findOne({ email });
  if (existingEmail) throw new Error("Email already in use");

  const existingUsername = await Admin.findOne({ username });
  if (existingUsername) throw new Error("Username already in use");

  const passwordHash = await hashPassword(password);
  const admin = await Admin.create({ email, username, passwordHash });

  return admin;
}

async function loginAdmin({ emailOrUsername, password }) {
  const admin = await Admin.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });

  if (!admin) throw new Error("Admin not found");

  const match = await comparePassword(password, admin.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { admin, token };
}

// SEND OTP
async function requestPasswordReset(email) {
  const admin = await Admin.findOne({ email });
  if (!admin) return;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  admin.otp = otp;
  admin.otpExpiry = expiry;
  await admin.save();

  await sendResetPasswordEmail(admin.email, otp);
}

// VERIFY OTP & RESET PASSWORD
async function resetPassword(email, otp, newPassword) {
  const admin = await Admin.findOne({ email });

  if (!admin || admin.otp !== otp || admin.otpExpiry < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  admin.passwordHash = await hashPassword(newPassword);
  admin.otp = undefined;
  admin.otpExpiry = undefined;
  await admin.save();
}

module.exports = {
  registerAdmin,
  loginAdmin,
  requestPasswordReset,
  resetPassword
};
