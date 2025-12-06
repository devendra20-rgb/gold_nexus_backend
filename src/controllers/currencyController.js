const { fetchCurrencyRates } = require("../services/currencyService");

async function getCurrencyRatesController(req, res) {
  try {
    const { base, symbols } = req.query;
    const symArr = symbols ? symbols.split(",") : undefined;
    const data = await fetchCurrencyRates(base, symArr);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch currency rates" });
  }
}

module.exports = { getCurrencyRatesController };
