const express = require("express");
const router = express.Router();
const { 
  createArticleController, 
  getAllArticlesController,
  getArticleController,
  getArticleByIdController,
  updateArticleController,
  deleteArticleController
} = require("../controllers/articleController");
const { upload } = require("../middleware/multer"); 

// Standard Routes
router.post("/", upload.single("image"), createArticleController);
router.get("/", getAllArticlesController);

// Specific ID Routes (Admin)
router.get("/find/:id", getArticleByIdController);
router.put("/:id", upload.single("image"), updateArticleController);
router.delete("/:id", deleteArticleController);

// Slug Route (Public) - MUST BE LAST
router.get("/:slug", getArticleController);

module.exports = router;