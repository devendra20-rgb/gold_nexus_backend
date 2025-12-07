const express = require("express");
const {
  createMetalPriceController,
  getLatestPriceController,
  getLatestPricesTableController,
  getPriceHistoryController,
  updateMetalPriceController,
  deleteMetalPriceController,
  getLatestAllMetalsController,
  getIndiaPricesTableController
} = require("../controllers/metalPriceController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Admin-only routes
router.post("/", authMiddleware, adminOnly, createMetalPriceController);
router.put("/:id", authMiddleware, adminOnly, updateMetalPriceController);
router.delete("/:id", authMiddleware, adminOnly, deleteMetalPriceController);

// Public routes for client-side
router.get("/latest", getLatestPriceController);
router.get("/latest-all", getLatestAllMetalsController);

router.get("/latest-table", getLatestPricesTableController);
router.get("/history", getPriceHistoryController);
router.get("/india-table", getIndiaPricesTableController);


module.exports = router;
