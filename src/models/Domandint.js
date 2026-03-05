const mongoose = require("mongoose");

const domInterSchema  = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  subHeading: {
    type: String
  },

  slug: {
    type: String,
    unique: true
  },

  category: {
    type: String,
    enum: ["domestic", "international"],
    required: true
  },

  location: {
    country: String,
    state: String,
    city: String
  },

  homepageImage: {
    type: String
  },

  images: [
    {
      type: String
    }
  ],

  content: {
    type: String,
    required: true
  },

  tags: [
    {
      type: String
    }
  ],

  publishedAt: {
    type: Date,
    default: Date.now
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("DomInterNews", domInterSchema);