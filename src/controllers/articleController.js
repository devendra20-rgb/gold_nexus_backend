const articleService = require("../services/articleService");
const uploadOnCloudinary = require("../utils/cloudinary");

// 1. Create
async function createArticleController(req, res) {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await uploadOnCloudinary(req.file.path);

    let formattedCategories = req.body.categories;
    if (typeof req.body.categories === 'string') {
      try { formattedCategories = JSON.parse(req.body.categories); } 
      catch (e) { formattedCategories = req.body.categories.split(','); }
    }

    const articleData = {
      ...req.body,
      categories: formattedCategories,
      image: imageUrl || ""
    };

    const article = await articleService.createArticle(articleData);
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    console.error("❌ Create Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Get All
async function getAllArticlesController(req, res) {
  try {
    const articles = await articleService.getAllArticles();
    res.status(200).json({ success: true, data: articles });
  } catch (err) {
    console.error("❌ Get All Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch articles" });
  }
}

// 3. Get One (By Slug)
async function getArticleController(req, res) {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error("❌ Get Slug Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Get One (By ID)
async function getArticleByIdController(req, res) {
  try {
    console.log("🔍 Finding Article by ID:", req.params.id);
    const article = await articleService.getArticleById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error("❌ Get ID Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Update
async function updateArticleController(req, res) {
  try {
    console.log("🔄 Updating Article ID:", req.params.id);
    
    let imageUrl = req.body.image; 
    if (req.file) {
      console.log("📸 Uploading new image...");
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    let formattedCategories = req.body.categories;
    if (typeof req.body.categories === 'string') {
      try { formattedCategories = JSON.parse(req.body.categories); } 
      catch (e) { formattedCategories = req.body.categories.split(','); }
    }

    const updateData = {
      ...req.body,
      categories: formattedCategories,
      image: imageUrl
    };

    const updatedArticle = await articleService.updateArticleById(req.params.id, updateData);
    
    console.log("✅ Update Success!");
    res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error("❌ Update Error:", err); // Logs full error
    res.status(500).json({ success: false, error: "Update failed: " + err.message });
  }
}

// 6. Delete
async function deleteArticleController(req, res) {
  try {
    console.log("🗑️ Deleting Article ID:", req.params.id);
    await articleService.deleteArticleById(req.params.id);
    
    console.log("✅ Delete Success!");
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Error:", err.message);
    res.status(500).json({ success: false, error: "Delete failed: " + err.message });
  }
}

module.exports = {
  createArticleController,
  getAllArticlesController,
  getArticleController,
  getArticleByIdController,
  updateArticleController,
  deleteArticleController
};