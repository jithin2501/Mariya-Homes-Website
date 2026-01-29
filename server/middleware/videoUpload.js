const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "website-videos",
    resource_type: "video",
    allowed_formats: ["mp4"],
  },
});

const upload = multer({ storage });

module.exports = upload; // ✅ IMPORTANT
