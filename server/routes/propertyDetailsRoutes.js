const express = require('express');
const multer = require('multer');
const path = require('path');
const { upsertDetails, getDetailsByPropertyId, deleteDetails } = require('../controllers/propertyDetailsController');

const router = express.Router();

// Configure Multer to keep original file extensions
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Preserve the original file extension so frontend can identify video vs image
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST: Create or Update Property Details
router.post('/property-details', upload.fields([
  { name: 'mainMedia', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'constructionProgress', maxCount: 20 } // Added support for construction progress images
]), upsertDetails);

// GET: Fetch Details for Frontend
router.get('/property-details/:id', getDetailsByPropertyId);

// DELETE: Delete Property Details
router.delete('/property-details/:id', deleteDetails);

module.exports = router;