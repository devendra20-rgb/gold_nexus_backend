const express = require("express");
const { getCurrencyRatesController } = require("../controllers/currencyController");

const router = express.Router();

router.get("/rates", getCurrencyRatesController);

module.exports = router;
