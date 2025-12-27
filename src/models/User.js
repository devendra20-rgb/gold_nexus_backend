const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: "user" },
  
  // 🟢 NEW: OTP Fields (Password Reset & Registration ke liye)
  otp: { type: String },
  otpExpire: { type: Date },

  // 🟢 NEW: News Preferences (Newsletter ke liye)
  preferredCategories: { type: [String], default: [] }, // e.g., ["Tech", "Sports"]
  emailUpdates: { type: Boolean, default: false },      // User wants emails?

  createdAt: { type: Date, default: Date.now },
});

// Password Hash Logic (Purana wala same rahega)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);