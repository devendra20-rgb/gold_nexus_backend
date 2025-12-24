const Article = require("../models/Article");

// Helper: Generate Slug
const generateSlug = (headline) => {
  return headline
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Date.now();
};

// 1. Create
const createArticle = async (data) => {
  if (!data.slug && data.headline) {
    data.slug = generateSlug(data.headline);
  }
  const article = new Article(data);
  return await article.save();
};

// 2. Get All
const getAllArticles = async () => {
  return await Article.find().sort({ createdAt: -1 });
};

// 3. Get Single (By Slug - For Public Site)
// Get Single Article by Slug (AND Increment View Count)
const getArticleBySlug = async (slug) => {
  // $inc: { views: 1 } adds 1 to the 'views' field automatically
  return await Article.findOneAndUpdate(
    { slug }, 
    { $inc: { views: 1 } }, 
    { new: true } // Return the updated article with the new view count
  );
};

// 4. Get Single (By ID - For Admin Editor)
const getArticleById = async (id) => {
  return await Article.findById(id);
};

// 5. Update (By ID)
const updateArticleById = async (id, data) => {
  // Optional: Update slug if headline changes (remove if you want permanent URLs)
  if (data.headline) {
     data.slug = generateSlug(data.headline);
  }
  return await Article.findByIdAndUpdate(id, data, { new: true });
};

// 6. Delete (By ID)
const deleteArticleById = async (id) => {
  return await Article.findByIdAndDelete(id);
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  updateArticleById,
  deleteArticleById
};