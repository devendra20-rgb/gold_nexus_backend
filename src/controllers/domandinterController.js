const DomInterNews = require("../models/Domandint");
const uploadOnCloudinary = require("../utils/cloudinary");
const axios = require("axios");

// ======================================================
// CREATE ARTICLE
// ======================================================

exports.createArticle = async (req, res) => {
  try {

    const {
      title,
      subHeading,
      content,
      category,
      country,
      state,
      city,
      tags
    } = req.body;

    // slug generate
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");

    let homepageImage = "";
    let images = [];

    // upload homepage image
    if (req.files?.homepageImage) {
      homepageImage = await uploadOnCloudinary(
        req.files.homepageImage[0].path
      );
    }

    // upload article images
    if (req.files?.images) {
      for (let file of req.files.images) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded) images.push(uploaded);
      }
    }

    const article = await DomInterNews.create({
      title,
      subHeading,
      slug,
      category,
      content,
      homepageImage,
      images,
      location: {
        country: category === "domestic" ? "India" : country,
        state,
        city
      },
      tags
    });

    res.status(201).json({
      success: true,
      data: article
    });

  } catch (error) {
    console.log("Create Article Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// ======================================================
// GET DOMESTIC NEWS
// ======================================================

exports.getDomesticNews = async (req, res) => {
  try {

    const news = await DomInterNews
      .find({ category: "domestic" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};



// ======================================================
// GET INTERNATIONAL NEWS
// ======================================================

exports.getInternationalNews = async (req, res) => {
  try {

    const news = await DomInterNews
      .find({ category: "international" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};



// ======================================================
// GET SINGLE ARTICLE
// ======================================================

exports.getArticle = async (req, res) => {
  try {

    const { slug } = req.params;

    const article = await DomInterNews.findOne({ slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};

exports.getAllNews = async (req, res) => {
  try {

    const news = await DomInterNews
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};

// ======================================================
// UPDATE ARTICLE
// ======================================================

exports.updateArticle = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      title,
      subHeading,
      content,
      category,
      country,
      state,
      city,
      tags
    } = req.body;

    const article = await DomInterNews.findById(id);

    if (!article) {
      return res.status(404).json({
        success:false,
        message:"Article not found"
      });
    }

    // update slug
    if (title) {
      article.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");
    }

    // homepage image
    if (req.files?.homepageImage) {
      const uploaded = await uploadOnCloudinary(
        req.files.homepageImage[0].path
      );

      article.homepageImage = uploaded;
    }

    // multiple article images
    if (req.files?.images) {

      let newImages = [];

      for (let file of req.files.images) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded) newImages.push(uploaded);
      }

      article.images = newImages;
    }

    article.title = title || article.title;
    article.subHeading = subHeading || article.subHeading;
    article.content = content || article.content;
    article.category = category || article.category;

    article.location = {
      country: category === "domestic" ? "India" : country,
      state,
      city
    };

    article.tags = tags || article.tags;

    await article.save();

    res.status(200).json({
      success:true,
      data:article
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      error:error.message
    });

  }

};

// ======================================================
// DELETE ARTICLE
// ======================================================

exports.deleteArticle = async (req, res) => {

  try {

    const { id } = req.params;

    const article = await DomInterNews.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success:false,
        message:"Article not found"
      });
    }

    res.status(200).json({
      success:true,
      message:"Article deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      error:error.message
    });

  }

};

exports.getCountries = async (req, res) => {

  try {

    const response = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name"
    );

    const countries = response.data.map(
      c => c.name.common
    ).sort();

    res.status(200).json({
      success:true,
      data:countries
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      error:error.message
    });

  }

};