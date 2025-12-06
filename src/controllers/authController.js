const {
  registerAdmin,
  loginAdmin,
  requestPasswordReset,
  resetPassword
} = require("../services/authService");

async function registerAdminController(req, res) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username and password are required" });
    }

    const admin = await registerAdmin({ email, username, password });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "Failed to register admin" });
  }
}

async function loginAdminController(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Email/Username and password are required" });
    }

    const { admin, token } = await loginAdmin({ emailOrUsername, password });

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: err.message || "Login failed" });
  }
}

async function requestResetPasswordController(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    await requestPasswordReset(email);
    return res.json({ message: "OTP sent if email exists" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to request password reset" });
  }
}

async function resetPasswordController(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP and new password required" });
    }

    await resetPassword(email, otp, newPassword);
    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
}


module.exports = {
  registerAdminController,
  loginAdminController,
  requestResetPasswordController,
  resetPasswordController
};
