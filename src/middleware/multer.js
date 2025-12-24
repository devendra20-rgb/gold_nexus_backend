const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this folder exists: gold_nexus_backend/public/temp
    cb(null, "./public/temp"); 
  },
  filename: function (req, file, cb) {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage 
});

// ✅ Correct CommonJS export
module.exports = { upload };