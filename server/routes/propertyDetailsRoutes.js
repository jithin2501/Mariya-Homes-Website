const express = require('express');
const router = express.Router();
const propertyDetailsController = require('../controllers/propertyDetailsController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upsert property details with Cloudinary uploads
router.post('/property-details', authMiddleware, upload.fields([
  { name: 'mainMedia', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'constructionProgress', maxCount: 20 }
]), async (req, res) => {
  try {
    const PropertyDetails = require('../models/PropertyDetails');
    const { propertyId, description, additionalDetails, mapUrl, amenities } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required" });
    }
    
    const updateData = { 
      description, 
      additionalDetails, 
      mapUrl,
      propertyId
    };

    // Parse amenities
    if (amenities) {
      try {
        let parsedAmenities;
        if (typeof amenities === 'string') {
          parsedAmenities = JSON.parse(amenities);
        } else if (Array.isArray(amenities)) {
          parsedAmenities = amenities;
        } else {
          parsedAmenities = [];
        }
        
        updateData.amenities = parsedAmenities
          .filter(item => item && typeof item === 'string' && item.trim() !== '')
          .map(item => item.trim());
      } catch (err) {
        updateData.amenities = [];
      }
    } else {
      updateData.amenities = [];
    }

    // Upload main media to Cloudinary
    if (req.files && req.files['mainMedia']) {
      const file = req.files['mainMedia'][0];
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: 'mariya_property_details',
            resource_type: 'auto' // Supports both images and videos
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      updateData.mainMedia = uploadResult.secure_url;
    }
    
    // Upload gallery images to Cloudinary
    if (req.files && req.files['gallery']) {
      const galleryUploads = await Promise.all(
        req.files['gallery'].map(file => 
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'mariya_property_details/gallery' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          })
        )
      );
      updateData.gallery = galleryUploads;
    }

    // Upload construction progress images to Cloudinary
    if (req.files && req.files['constructionProgress'] && req.files['constructionProgress'].length > 0) {
      const progressUploads = await Promise.all(
        req.files['constructionProgress'].map((file, index) => 
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'mariya_property_details/progress' },
              (error, result) => {
                if (error) reject(error);
                else resolve({
                  image: result.secure_url,
                  label: `Image ${index + 1}`
                });
              }
            );
            stream.end(file.buffer);
          })
        )
      );
      updateData.constructionProgress = progressUploads;
    } else {
      updateData.constructionProgress = [];
    }

    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(details);
    
  } catch (error) {
    console.error('Error in property details:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

router.get('/property-details/:id', propertyDetailsController.getDetailsByPropertyId);
router.delete('/property-details/:id', authMiddleware, propertyDetailsController.deleteDetails);

module.exports = router;