const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer"); // same multer file
const {
  createHoroscope,
  getHoroscopeBySign,
  getLuckyNumbers,
  updateHoroscope,
  deleteHoroscope
} = require("../controllers/horoscopeController");
const { authMiddleware } = require("../middleware/auth");

// 🟢 Multiple field upload (zodiacImage + extra images)
router.post(
  "/",
    authMiddleware,
  upload.fields([
    { name: "zodiacImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  (req, res, next) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    next();
  },
  createHoroscope,
);
router.get("/lucky/today", getLuckyNumbers);

router.get("/:zodiacSign", getHoroscopeBySign);
router.put(
  "/:id",
  upload.fields([
    { name: "zodiacImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateHoroscope,
);

router.delete("/:id", deleteHoroscope);

module.exports = router;
