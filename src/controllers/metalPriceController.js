const {
  createMetalPrice,
  getLatestPrice,
  getLatestPricesTable,
  getPriceHistory,
  updateMetalPrice,
  deleteMetalPrice,
  
} = require("../services/metalPriceService");

async function createMetalPriceController(req, res) {
  try {
    const {
      country,
      stateOrRegion,
      metalType,
      currency,
      pricePerGram,
      effectiveAt,
    } = req.body;

    if (!country || !metalType || !currency || !pricePerGram) {
      return res.status(400).json({
        error: "country, metalType, currency and pricePerGram are required",
      });
    }

    const doc = await createMetalPrice({
      country,
      stateOrRegion,
      metalType,
      currency,
      pricePerGram,
      effectiveAt,
    });

    return res.status(201).json({ message: "Price created", data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create price" });
  }
}

async function getLatestPriceController(req, res) {
  try {
    const { country, stateOrRegion, metalType } = req.query;

    if (!country) {
      return res.status(400).json({ error: "country is required" });
    }

    const latest = await getLatestPrice({ country, stateOrRegion, metalType });
    if (!latest) {
      return res.status(404).json({ error: "No price found" });
    }

    // For your requirement: we can optionally "pretend" this is live by overriding display date
    const normalize = req.query.normalizeDate === "true";
    const now = new Date();

    const response = {
      ...latest,
      displayDate: normalize ? now : latest.effectiveAt,
    };

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch latest price" });
  }
}

async function getLatestPricesTableController(req, res) {
  try {
    const { country, stateOrRegion } = req.query;
    if (!country) {
      return res.status(400).json({ error: "country is required" });
    }

    const rows = await getLatestPricesTable({ country, stateOrRegion });
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to fetch latest prices table" });
  }
}

async function getPriceHistoryController(req, res) {
  try {
    const { country, stateOrRegion, metalType, limit } = req.query;
    if (!country) {
      return res.status(400).json({ error: "country is required" });
    }

    const history = await getPriceHistory({
      country,
      stateOrRegion,
      metalType,
      limit: limit ? parseInt(limit, 10) : 200,
    });

    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch price history" });
  }
}

async function updateMetalPriceController(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await updateMetalPrice(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: "Price not found" });
    }

    return res.json({ message: "Price updated", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update price" });
  }
}

async function deleteMetalPriceController(req, res) {
  try {
    const { id } = req.params;
    await deleteMetalPrice(id);
    return res.json({ message: "Price deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete price" });
  }
}

async function getLatestAllMetalsController(req, res) {
  try {
    const { country, stateOrRegion } = req.query;
    if (!country) {
      return res.status(400).json({ error: "country is required" });
    }

    const metals = ["gold", "silver", "platinum"];
    const result = [];

    for (const metal of metals) {
      const latest = await getLatestPrice({
        country,
        stateOrRegion,
        metalType: metal,
      });
      if (latest) {
        result.push(latest);
      }
    }

    return res.json({ prices: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch all metals prices" });
  }
}

async function getIndiaPricesTableController(req, res) {
  try {
    const states = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Delhi",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Jammu and Kashmir",
    ];

    const metals = ["gold", "silver", "platinum"];
    const result = [];

    for (const state of states) {
      const row = { stateOrRegion: state };

      for (const metal of metals) {
        const latest = await getLatestPrice({
          country: "IN",
          stateOrRegion: state,
          metalType: metal,
        });

        row[metal] = latest ? latest.pricePerGram : 0;
      }

      result.push(row);
    }

    return res.json({ prices: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch India table" });
  }
}

async function bulkUpdatePricesController(req, res) {
  try {
    const { country, stateOrRegion, prices } = req.body;
    const MetalPrice = require("../models/MetalPrice");

    if (!country || !prices || !Array.isArray(prices)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const now = new Date();
    const currencyMap = {
      IN: "INR",
      US: "USD",
      AE: "AED",
      UK: "GBP",
    };

    const currency = currencyMap[country] || "USD";

    for (const p of prices) {
      if (!p.metalType || typeof p.pricePerGram !== "number") continue;

      await createMetalPrice({
        country,
        stateOrRegion,
        metalType: p.metalType,
        pricePerGram: p.pricePerGram,
        currency,             // <-- FIXED
        effectiveAt: now,
      });
    }

    await MetalPrice.updateMany(
      { country },
      { $set: { effectiveAt: now } }
    );

    return res.json({ message: "Bulk update successful", updatedAt: now });
  } catch (err) {
    console.error("Bulk Update Error:", err);
    return res.status(500).json({ error: "Failed to update price" });
  }
}


module.exports = {
  createMetalPriceController,
  getLatestPriceController,
  getLatestPricesTableController,
  getPriceHistoryController,
  updateMetalPriceController,
  deleteMetalPriceController,
  getLatestAllMetalsController,
  getIndiaPricesTableController,
  bulkUpdatePricesController
};
