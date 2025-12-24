const express = require("express");
const router = express.Router();
const { createCategory, getAllCategories, deleteCategory } = require("../controllers/categoryController");

router.post("/", createCategory);   // Create
router.get("/", getAllCategories);  // Read
router.delete("/:id", deleteCategory); // Delete

module.exports = router;