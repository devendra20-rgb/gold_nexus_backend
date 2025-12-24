const Category = require("../models/Category");

// 1. Create a new Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    // Auto-generate slug (e.g., "Crypto News" -> "crypto-news")
    const slug = name.toLowerCase().replace(/ /g, "-");

    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 2. Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Alphabetical order
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 3. Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};