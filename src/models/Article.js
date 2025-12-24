const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  headline: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    unique: true, 
    index: true 
  }, 
  content: { 
    type: String, 
    required: true 
  },
  image: { type: String, default: null },
  categories: { type: [String], required: true },
  author: { type: String, default: 'Admin' },
  isBreaking: { type: Boolean, default: false },
  visibility: { type: String, default: 'public' },
  schedule: { type: Date },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);