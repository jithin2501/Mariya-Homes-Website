const express = require('express');
const multer = require('multer');
const path = require('path');
const { upsertDetails, getDetailsByPropertyId, deleteDetails } = require('../controllers/propertyDetailsController');

const router = express.Router();

// Configure Multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB limit (more stable than 1GB)
    files: 30 // Maximum total files
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|webm|ogg/;
    const extname = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image/') && allowedImageTypes.test(extname)) {
      return cb(null, true);
    } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(extname)) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// POST: Create or Update Property Details
router.post('/property-details', upload.fields([
  { name: 'mainMedia', maxCount: 1 }, // Can be video or image
  { name: 'gallery', maxCount: 10 }, // Images only
  { name: 'constructionProgress', maxCount: 20 } // Property images
]), (req, res, next) => {
  // Add timeout extension for this route specifically
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
}, upsertDetails);

// GET: Fetch Details for Frontend
router.get('/property-details/:id', getDetailsByPropertyId);

// DELETE: Delete Property Details
router.delete('/property-details/:id', deleteDetails);

module.exports = router;