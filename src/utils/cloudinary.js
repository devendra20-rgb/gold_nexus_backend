const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure with your keys (Get these from your Cloudinary Dashboard)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // File uploaded successfully, remove local file
    fs.unlinkSync(localFilePath); 
    return response.secure_url; // Return the URL

  } catch (error) {
    // If upload fails, remove the local file
    fs.unlinkSync(localFilePath); 
    return null;
  }
}

module.exports = uploadOnCloudinary;