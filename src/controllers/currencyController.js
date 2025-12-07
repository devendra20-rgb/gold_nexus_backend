const { fetchCurrencyRates } = require("../services/currencyService");

async function getCurrencyRatesController(req, res) {
  try {
    const { base } = req.query;
    const data = await fetchCurrencyRates(base || "USD");
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch currency rates" });
  }
}

module.exports = { getCurrencyRatesController };
