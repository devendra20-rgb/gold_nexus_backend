const MetalPrice = require("../models/MetalPrice");

/**
 * Create a new metal price entry (admin side - Edit Prices)
 */
async function createMetalPrice({
  country,
  stateOrRegion,
  metalType,
  currency,
  pricePerGram,
  effectiveAt,
}) {
  if (country === "IN" && !stateOrRegion) {
    // India default to Delhi if not provided
    stateOrRegion = "Delhi";
  }

  const doc = await MetalPrice.create({
    country,
    stateOrRegion: stateOrRegion || null,
    metalType,
    currency,
    pricePerGram,
    effectiveAt: effectiveAt || new Date(),
  });

  return doc;
}

/**
 * Get latest price for given filters.
 * If no state provided for India, defaults to Delhi.
 */
async function getLatestPrice({ country, stateOrRegion, metalType }) {
  const query = { country };

  if (country === "IN" && !stateOrRegion) {
    query.stateOrRegion = "Delhi";
  } else if (stateOrRegion) {
    query.stateOrRegion = stateOrRegion;
  }

  if (metalType) {
    query.metalType = metalType;
  }

  const latest = await MetalPrice.findOne(query)
    .sort({ effectiveAt: -1, createdAt: -1 })
    .lean();

  if (!latest) return null;

  const ounceConversionFactor = 31.1035;
  let displayPrice = latest.pricePerGram;

  if (latest.country === "US" || latest.country === "UK") {
    displayPrice = latest.pricePerGram * ounceConversionFactor;
  }

  return {
    ...latest,
    displayPrice, // what frontend will show
    displayUnit:
      latest.country === "IN" || latest.country === "AE" ? "gram" : "ounce",
  };
}

/**
 * Get latest prices table for client side.
 * Returns latest price per metalType for given region.
 */
async function getLatestPricesTable({ country, stateOrRegion }) {
  const metals = ["gold", "silver", "platinum"];
  const results = [];

  for (const metalType of metals) {
    const latest = await getLatestPrice({ country, stateOrRegion, metalType });
    if (latest) {
      results.push(latest);
    }
  }

  return results;
}

/**
 * Get history series for charts.
 */
async function getPriceHistory({
  country,
  stateOrRegion,
  metalType,
  limit = 200,
}) {
  const query = { country };

  if (stateOrRegion) {
    query.stateOrRegion = stateOrRegion;
  }

  if (metalType) {
    query.metalType = metalType;
  }

  const history = await MetalPrice.find(query)
    .sort({ effectiveAt: 1 })
    .limit(limit)
    .lean();

  return history;
}

/**
 * Update an existing price (history edit).
 */
async function updateMetalPrice(id, updateData) {
  const doc = await MetalPrice.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return doc;
}

/**
 * Delete an existing price (history delete).
 */
async function deleteMetalPrice(id) {
  await MetalPrice.findByIdAndDelete(id);
}

module.exports = {
  createMetalPrice,
  getLatestPrice,
  getLatestPricesTable,
  getPriceHistory,
  updateMetalPrice,
  deleteMetalPrice,
};
