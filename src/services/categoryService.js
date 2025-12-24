const Category = require("../models/Category");

exports.createCategory = async (name) => {
  return await Category.create({ name });
};

exports.getAllCategories = async () => {
  return await Category.find().sort({ name: 1 });
};
