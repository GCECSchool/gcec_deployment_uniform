// cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sales-preset", // Change this to your desired folder name
    allowedFormats: ["jpg", "png"],
  },
});

const parser = multer({ storage });

module.exports = { cloudinary, parser };
