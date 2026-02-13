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
    fileSize: 1100 * 1024 * 1024, // 1.1GB limit (covers 1GB files with some overhead)
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
  { name: 'mainMedia', maxCount: 1 }, // Can be video or image (up to 1GB)
  { name: 'gallery', maxCount: 10 }, // Images only
  { name: 'constructionProgress', maxCount: 20 } // Property images
]), (req, res, next) => {
  // Add extended timeout for this route specifically (30 minutes)
  req.setTimeout(1800000); // 30 minutes
  res.setTimeout(1800000); // 30 minutes
  next();
}, upsertDetails);

// GET: Fetch Details for Frontend
router.get('/property-details/:id', getDetailsByPropertyId);

// DELETE: Delete Property Details
router.delete('/property-details/:id', deleteDetails);

module.exports = router;