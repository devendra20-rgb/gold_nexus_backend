const articleService = require("../services/articleService");
const uploadOnCloudinary = require("../utils/cloudinary");
const User = require("../models/User"); // 🟢 Added
const sendEmail = require("../utils/sendEmail"); // 🟢 Added

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

    // ============================================================
    // 🟢 REAL-TIME EMAIL NOTIFICATION LOGIC (Added Here)
    // ============================================================
    try {
      // Find users who want email updates AND subscribe to one of these categories
      const interestedUsers = await User.find({
        emailUpdates: true,
        preferredCategories: { $in: formattedCategories } 
      });

      if (interestedUsers.length > 0) {
        console.log(`📧 Sending news alert to ${interestedUsers.length} users for categories: ${formattedCategories}`);

        // Email Template (Black & Gold Theme)
        const emailHtml = `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; border: 1px solid #333333;">
            <div style="padding: 20px; text-align: center; border-bottom: 1px solid #D4AF37;">
              <h1 style="color: #D4AF37; margin: 0; font-family: 'Times New Roman', serif; letter-spacing: 2px;">HEADLINES 24/7</h1>
              <p style="font-size: 10px; color: #888; text-transform: uppercase; margin-top: 5px;">New Alert: <span style="color: #fff;">${formattedCategories.join(", ")}</span></p>
            </div>
            
            <div style="padding: 20px;">
              ${article.image ? `<img src="${article.image}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 20px; border: 1px solid #333;" />` : ''}
              
              <h2 style="margin-top: 0; font-size: 22px; line-height: 1.3;">
                <a href="http://localhost:3000/news/${article.slug || article._id}" style="color: #ffffff; text-decoration: none;">
                  ${article.headline || article.title}
                </a>
              </h2>
              
              <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
                ${article.summary ? article.summary.substring(0, 150) + "..." : "Click below to read the full story."}
              </p>

              <div style="margin-top: 30px; text-align: center;">
                <a href="http://localhost:3000/news/${article.slug || article._id}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 2px; font-size: 14px; text-transform: uppercase; display: inline-block;">
                  Read Full Story
                </a>
              </div>
            </div>

            <div style="padding: 15px; text-align: center; font-size: 11px; color: #555555; border-top: 1px solid #333333; background-color: #0a0a0a;">
              <p style="margin-bottom: 5px;">You received this because you subscribed to updates.</p>
              <a href="http://localhost:3000/account" style="color: #D4AF37; text-decoration: none;">Manage Preferences</a>
            </div>
          </div>
        `;

        // Send emails asynchronously (don't block the response)
        interestedUsers.forEach((user) => {
          sendEmail({
            email: user.email,
            subject: `🔔 Breaking in ${formattedCategories[0]}: ${(article.headline || article.title).substring(0, 50)}...`,
            message: emailHtml
          }).catch(err => console.error(`Failed to send to ${user.email}:`, err));
        });
      }
    } catch (notifyErr) {
      console.error("⚠️ Notification Error (Email skipped):", notifyErr.message);
      // We do not stop the response if emails fail
    }
    // ============================================================

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