const mongoose = require("mongoose");

const MetalPriceSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      enum: ["IN", "US", "AE", "UK"],   
      required: true
    },
    stateOrRegion: {
      type: String,
      default: null
    },
    metalType: {
      type: String,
      enum: ["gold", "silver", "platinum"],
      required: true
    },
    currency: {
      type: String,
      required: false
    },
    pricePerGram: {
      type: Number,
      required: true
    },
    priceUnit: {
      type: String,
      enum: ["gram", "ounce"],
      default: "gram"
    },
    effectiveAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

MetalPriceSchema.index(
  { country: 1, stateOrRegion: 1, metalType: 1, effectiveAt: -1 },
  { name: "latest_price_index" }
);

module.exports = mongoose.model("MetalPrice", MetalPriceSchema);
