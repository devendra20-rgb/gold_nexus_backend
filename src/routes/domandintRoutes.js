const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer");

const {
  createArticle,
  getDomesticNews,
  getInternationalNews,
  getArticle,
    getAllNews,
    getCountries,
    updateArticle,
    deleteArticle
} = require("../controllers/domandinterController");
const { authMiddleware } = require("../middleware/auth");

router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "homepageImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createArticle,
);

router.get("/", getAllNews);

router.get("/domestic", getDomesticNews);

router.get("/international", getInternationalNews);

router.get("/countries", getCountries);
router.get("/:slug", getArticle);

router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "homepageImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateArticle,
);

router.delete("/:id", authMiddleware, deleteArticle);

module.exports = router;
