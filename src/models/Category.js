const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // No duplicate categories like "Tech" and "Tech"
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);