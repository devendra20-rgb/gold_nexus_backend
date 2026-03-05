const Horoscope = require("../models/Horoscope");
const uploadOnCloudinary = require("../utils/cloudinary");

// ======================================================
// 1️⃣ CREATE HOROSCOPE
// ======================================================
exports.createHoroscope = async (req, res) => {
  try {
    let zodiacImageUrl = "";
    let extraImages = [];

    // 🟣 Upload Zodiac Image
    if (req.files?.zodiacImage) {
      zodiacImageUrl = await uploadOnCloudinary(req.files.zodiacImage[0].path);
    }

    // Upload Multiple Images
    if (req.files?.images) {
      for (let file of req.files.images) {
        const uploaded = await uploadOnCloudinary(file.path);

        if (uploaded) {
          extraImages.push(uploaded);
        }
      }
    }

    const horoscopeData = {
      ...req.body,
      zodiacImage: zodiacImageUrl,
      images: extraImages,
    };

    const horoscope = await Horoscope.create(horoscopeData);

    res.status(201).json({ success: true, data: horoscope });
  } catch (error) {
    console.error("❌ Create Horoscope Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// 2️⃣ GET BY ZODIAC (OPTIONAL TYPE FILTER)
// ======================================================
exports.getHoroscopeBySign = async (req, res) => {
  try {
    const sign = req.params.zodiacSign;

    if (!sign) {
      return res.status(400).json({
        success: false,
        error: "Zodiac sign is required"
      });
    }

    const data = await Horoscope.find({
      zodiacSign: { $regex: `^${sign.trim()}$`, $options: "i" }
    });

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ======================================================
// 3️⃣ UPDATE HOROSCOPE
// ======================================================
exports.updateHoroscope = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Horoscope.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    let zodiacImageUrl = existing.zodiacImage;
    let extraImages = existing.images || [];

    // 🟣 Replace Zodiac Image (if new uploaded)
    if (req.files?.zodiacImage) {
      zodiacImageUrl = await uploadOnCloudinary(req.files.zodiacImage[0].path);
    }

    // 🟢 Add New Extra Images (append, not replace)
    if (req.files?.images) {
      for (let file of req.files.images) {
        const uploaded = await uploadOnCloudinary(file.path);
        extraImages.push(uploaded);
      }
    }

    const updateData = {
      ...req.body,
      zodiacImage: zodiacImageUrl,
      images: extraImages,
    };

    const updated = await Horoscope.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update Horoscope Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// 4️⃣ DELETE HOROSCOPE
// ======================================================
exports.deleteHoroscope = async (req, res) => {
  try {
    const { id } = req.params;

    await Horoscope.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Horoscope deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Horoscope Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// 5️⃣ GET LUCKY NUMBERS TODAY
// ======================================================
exports.getLuckyNumbers = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    const data = await Horoscope.find({
      date: { $gte: today, $lt: tomorrow },
      type: "daily",
    }).select("zodiacSign luckyNumber luckyColor");

    res.status(200).json({ success: true, data });

  } catch (error) {
    console.error("❌ Lucky Number Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};