const PropertyDetails = require('../models/PropertyDetails');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const folder = file.fieldname === 'mainMedia' 
      ? 'mariya-homes/property-details/main' 
      : file.fieldname === 'gallery' 
        ? 'mariya-homes/property-details/gallery'
        : 'mariya-homes/property-details/property-images';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

exports.upsertDetails = async (req, res) => {
  try {
    console.log("\n==========================================");
    console.log("PROPERTY DETAILS UPDATE REQUEST RECEIVED");
    console.log("==========================================");
    
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
    
    // Validate propertyId
    if (!propertyId) {
      console.log("\n❌ ERROR: Property ID is missing!");
      return res.status(400).json({ error: "Property ID is required" });
    }
    
    console.log("\n3. Building Update Data...");
    const updateData = { 
      description, 
      additionalDetails, 
      mapUrl,
      propertyId
    };

    // Parse and add amenities if provided
    if (amenities) {
      try {
        let parsedAmenities;
        
        if (typeof amenities === 'string') {
          parsedAmenities = JSON.parse(amenities);
          console.log("   ✓ Parsed amenities from string:", parsedAmenities);
        } else if (Array.isArray(amenities)) {
          parsedAmenities = amenities;
          console.log("   ✓ Amenities already an array:", parsedAmenities);
        } else {
          console.log("   ⚠ Unexpected amenities format:", typeof amenities);
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
      console.log("   ℹ No amenities provided - using empty array");
      updateData.amenities = [];
    }

    // Process main media (video or image)
    if (req.files && req.files['mainMedia']) {
      console.log("   ☁️ Uploading main media to Cloudinary...");
      const mainMediaFile = req.files['mainMedia'][0];
      try {
        const cloudinaryUrl = await uploadToCloudinary(mainMediaFile);
        updateData.mainMedia = cloudinaryUrl;
        console.log("   ✓ Main media uploaded to Cloudinary:", cloudinaryUrl);
      } catch (error) {
        console.log("   ❌ Error uploading main media:", error.message);
        throw error;
      }
    }
    
    // Process gallery images
    if (req.files && req.files['gallery']) {
      console.log(`   ☁️ Uploading ${req.files['gallery'].length} gallery images to Cloudinary...`);
      updateData.gallery = [];
      
      // Upload each gallery image
      for (const file of req.files['gallery']) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          updateData.gallery.push(cloudinaryUrl);
          console.log(`   ✓ Gallery image uploaded: ${cloudinaryUrl}`);
        } catch (error) {
          console.log(`   ❌ Error uploading gallery image:`, error.message);
          throw error;
        }
      }
    }

    // Process property images (constructionProgress)
    console.log("\n4. Processing Property Images...");
    if (req.files && req.files['constructionProgress'] && req.files['constructionProgress'].length > 0) {
      const images = req.files['constructionProgress'];
      console.log(`   Found ${images.length} property image(s)`);
      
      updateData.constructionProgress = [];
      
      // Upload each property image
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          const imageData = {
            image: cloudinaryUrl,
            label: `Image ${i + 1}`
          };
          updateData.constructionProgress.push(imageData);
          console.log(`   ✓ Property image ${i + 1} uploaded to Cloudinary: ${cloudinaryUrl}`);
        } catch (error) {
          console.log(`   ❌ Error uploading property image ${i + 1}:`, error.message);
          throw error;
        }
      }
      console.log(`   ✓ Successfully uploaded ${updateData.constructionProgress.length} images to Cloudinary`);
    } else {
      updateData.constructionProgress = [];
      console.log("   ℹ No property images provided - setting empty array");
    }

    console.log("\n5. Attempting Database Update...");
    console.log("   Query: { propertyId:", propertyId, "}");
    console.log("   Update Data:", JSON.stringify(updateData, null, 2));
    
    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("\n✅ SUCCESS! Property details saved to Cloudinary");
    console.log("   Document ID:", details._id);
    console.log("   Saved amenities:", details.amenities);
    console.log("   Amenities count:", details.amenities?.length || 0);
    console.log("   All images stored in Cloudinary");
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
};

exports.getDetailsByPropertyId = async (req, res) => {
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
    
    // Check if URLs are from Cloudinary
    if (details.mainMedia) {
      console.log("✓ Main media URL:", details.mainMedia.includes('cloudinary') ? "Cloudinary ✅" : "Local ❌");
    }
    if (details.gallery && details.gallery.length > 0) {
      console.log("✓ Gallery URLs:", details.gallery[0].includes('cloudinary') ? "Cloudinary ✅" : "Local ❌");
    }
    
    console.log("================================\n");
    
    res.status(200).json(details);
  } catch (error) {
    console.error("❌ Error fetching details:", error.message);
    res.status(500).json({ error: "Server error while fetching property details." });
  }
};

exports.deleteDetails = async (req, res) => {
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
};