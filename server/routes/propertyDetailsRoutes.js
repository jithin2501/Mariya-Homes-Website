const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const PropertyDetails = require('../models/PropertyDetails');

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
    console.log("\n==========================================");
    console.log("PROPERTY DETAILS UPDATE REQUEST RECEIVED");
    console.log("==========================================");
    console.log("Auth user:", req.user); // This should be populated by authMiddleware
    
    const { propertyId, description, additionalDetails, mapUrl, amenities } = req.body;
    
    console.log("1. Request Body:");
    console.log("   - PropertyId:", propertyId);
    console.log("   - Description:", description ? "Provided" : "Missing");
    console.log("   - MapUrl:", mapUrl ? "Provided" : "Missing");
    console.log("   - Raw amenities from body:", amenities);
    console.log("   - Amenities type:", typeof amenities);
    
    console.log("\n2. Files Received:");
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        console.log(`   - ${key}: ${req.files[key].length} file(s)`);
      });
    } else {
      console.log("   - No files received");
    }
    
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
          
        console.log("   ✓ Final amenities array:", updateData.amenities);
        console.log("   ✓ Amenities count:", updateData.amenities.length);
      } catch (err) {
        console.log("   ⚠ Amenities parse error:", err.message);
        updateData.amenities = [];
      }
    } else {
      updateData.amenities = [];
    }

    // Upload main media to Cloudinary
    if (req.files && req.files['mainMedia']) {
      const file = req.files['mainMedia'][0];
      console.log("   ℹ Uploading main media to Cloudinary...");
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
      console.log("   ✓ Main media uploaded:", uploadResult.secure_url);
    }
    
    // Upload gallery images to Cloudinary
    if (req.files && req.files['gallery']) {
      console.log("   ℹ Uploading gallery images to Cloudinary...");
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
      console.log("   ✓ Gallery images uploaded:", galleryUploads.length);
    }

    // Upload construction progress images to Cloudinary
    if (req.files && req.files['constructionProgress'] && req.files['constructionProgress'].length > 0) {
      console.log("   ℹ Uploading property images to Cloudinary...");
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
      console.log(`   ✓ Successfully uploaded ${progressUploads.length} property images`);
    } else {
      updateData.constructionProgress = [];
    }

    console.log("\n3. Attempting Database Update...");
    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("\n✅ SUCCESS! Property details saved");
    console.log("   Document ID:", details._id);
    console.log("   Saved amenities:", details.amenities);
    console.log("   Amenities count:", details.amenities?.length || 0);
    console.log("==========================================\n");
    
    res.status(200).json(details);
    
  } catch (error) {
    console.log("\n❌❌❌ ERROR OCCURRED ❌❌❌");
    console.log("Error Type:", error.name);
    console.log("Error Message:", error.message);
    console.log("\nFull Error:");
    console.log(error);
    console.log("==========================================\n");
    
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

// Get property details by property ID - NO AUTH REQUIRED (public endpoint)
router.get('/property-details/:id', async (req, res) => {
  try {
    console.log("\n=== FETCHING PROPERTY DETAILS ===");
    console.log("Property ID:", req.params.id);
    
    const details = await PropertyDetails.findOne({ propertyId: req.params.id })
      .populate('propertyId')
      .lean();
    
    if (!details) {
      console.log("❌ No details found for this property");
      return res.status(404).json({ message: "No specific details found for this property." });
    }
    
    console.log("✓ Details found");
    console.log("✓ Amenities in DB:", details.amenities);
    console.log("✓ Amenities count:", details.amenities?.length || 0);
    console.log("================================\n");
    
    res.status(200).json(details);
  } catch (error) {
    console.error("❌ Error fetching details:", error.message);
    res.status(500).json({ error: "Server error while fetching property details." });
  }
});

// Delete property details - AUTH REQUIRED
router.delete('/property-details/:id', authMiddleware, async (req, res) => {
  try {
    console.log("\n=== DELETING PROPERTY DETAILS ===");
    console.log("Details ID:", req.params.id);
    
    const details = await PropertyDetails.findByIdAndDelete(req.params.id);
    
    if (!details) {
      console.log("❌ No details found with this ID");
      return res.status(404).json({ message: "Property details not found." });
    }
    
    console.log("✓ Details deleted successfully");
    console.log("================================\n");
    
    res.status(200).json({ message: "Property details deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting details:", error.message);
    res.status(500).json({ error: "Server error while deleting property details." });
  }
});

module.exports = router;