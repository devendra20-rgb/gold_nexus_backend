const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin"
    },
    otp: {
      type: String
    },
    otpExpiry: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
