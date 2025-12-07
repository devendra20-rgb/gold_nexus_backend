const axios = require("axios");

async function fetchCurrencyRates(base = "USD") {
  const url = `https://api.frankfurter.app/latest?from=${base}`;
  const { data } = await axios.get(url);
  return data;
}

module.exports = { fetchCurrencyRates };
