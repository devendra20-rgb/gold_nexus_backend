const mongoose = require("mongoose");

const horoscopeSchema = new mongoose.Schema(
  {
    zodiacSign: {
      type: String,
      required: true,
      enum: [
        "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
        "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ["daily", "love", "career"],
    },
    content: {
      type: String,
      required: true,
    },
    luckyNumber: String,
    luckyColor: String,

    // 🟣 Main Zodiac Image
    zodiacImage: {
      type: String
    },

    // 🟢 Extra Multiple Images
    images: [
      {
        type: String
      }
    ],

    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Horoscope", horoscopeSchema);