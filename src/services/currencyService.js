const axios = require("axios");

async function fetchCurrencyRates(base = process.env.CURRENCY_API_BASE || "USD", symbols = ["INR", "USD", "AED"]) {
  const apiUrl = process.env.CURRENCY_API_URL;
  if (!apiUrl) {
    throw new Error("CURRENCY_API_URL not configured");
  }

  const params = {
    base,
    symbols: symbols.join(",")
  };

  const { data } = await axios.get(apiUrl, { params });
  return data;
}

module.exports = { fetchCurrencyRates };
