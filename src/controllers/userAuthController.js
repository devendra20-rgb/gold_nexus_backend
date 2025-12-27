const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // 🟢 Import Email Utility

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🟢 1. USER REGISTRATION (Updated with OTP)
exports.registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      preferredCategories, 
      emailUpdates,        
      termsAccepted        
    } = req.body;

    // A. Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }
    
    // B. Check T&C
    if (termsAccepted !== true) {
      return res.status(400).json({ success: false, message: "You must accept Terms & Conditions" });
    }

    // C. Check Existing
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // D. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes validity

    // E. Create User (Save to DB)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "user",
      preferredCategories,
      emailUpdates,
      termsAccepted,
      otp,        // 🟢 Save OTP
      otpExpire,  // 🟢 Save Expiry
      isVerified: false // Not verified yet
    });

    // F. Send OTP Email
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd;">
        <h2 style="color: #D4AF37;">Welcome to Headlines 24/7</h2>
        <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
        <p style="font-size: 12px; color: #777;">This code expires in 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Headlines 24/7",
        message: message,
      });

      res.status(201).json({
        success: true,
        message: "Account Created! Please check email for OTP.",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.firstName,
          email: user.email,
          categories: user.preferredCategories,
          isVerified: user.isVerified
        }
      });
    } catch (emailError) {
      console.error("Email Error:", emailError);
      // Still return success but mention email failed
      res.status(201).json({ 
        success: true, 
        message: "Account Created, but email failed to send.",
        token: generateToken(user._id),
        user: { id: user._id, name: user.firstName, email: user.email }
      });
    }

  } catch (error) {
    console.error("User Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🟢 2. VERIFY EMAIL OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email Verified Successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🟢 3. USER LOGIN (Fixed matchPassword)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) { // 🟢 Fixed: comparePassword -> matchPassword
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          firstName: user.firstName, // Send separated names for frontend
          lastName: user.lastName,
          name: user.name || user.firstName, // Fallback
          email: user.email,
          role: user.role,
          preferredCategories: user.preferredCategories,
          emailUpdates: user.emailUpdates
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error("User Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🟢 4. FORGOT PASSWORD (Send OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
      <div style="background-color: #000; padding: 30px; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #D4AF37;">Headlines 24/7</h1>
        <p style="color: #fff;">You requested a password reset.</p>
        <div style="background: #D4AF37; color: #000; font-size: 24px; font-weight: bold; padding: 10px 20px; display: inline-block; margin: 20px 0; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: #ccc; font-size: 12px;">This OTP is valid for 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Code",
        message: message,
      });
      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🟢 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🟢 6. UPDATE USER PROFILE (With Old Password Check)
exports.updateUserProfile = async (req, res) => {
  try {
    // Select password to verify old password
    const user = await User.findById(req.user.id).select('+password');

    if (user) {
      // 🟢 SECURITY CHECK: If changing password, verify old one
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ success: false, message: "Please enter your current password to set a new one." });
        }

        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Incorrect current password!" });
        }

        user.password = req.body.newPassword;
      }

      // Update Details
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;

      if (req.body.preferredCategories) {
        user.preferredCategories = req.body.preferredCategories;
      }
      if (req.body.emailUpdates !== undefined) {
        user.emailUpdates = req.body.emailUpdates;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Profile Updated Successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          preferredCategories: updatedUser.preferredCategories,
          emailUpdates: updatedUser.emailUpdates
        }
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};