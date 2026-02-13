const PropertyDetails = require('../models/PropertyDetails');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper function to upload to Cloudinary with better timeout handling for 1GB videos
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const folder = file.fieldname === 'mainMedia' 
      ? 'mariya-homes/property-details/main' 
      : file.fieldname === 'gallery' 
        ? 'mariya-homes/property-details/gallery'
        : 'mariya-homes/property-details/property-images';
    
    const isVideo = file.mimetype.startsWith('video');
    
    const uploadOptions = {
      folder: folder,
      resource_type: isVideo ? 'video' : 'image',
      timeout: 1800000, // 30 minutes timeout for 1GB videos
      chunk_size: 6000000, // 6MB chunks for better stability
    };
    
    // Add different transformations for images vs videos
    if (!isVideo) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' }
      ];
    } else {
      // For videos, use less aggressive compression
      uploadOptions.quality = 'auto';
      uploadOptions.eager = [
        { streaming_profile: 'hd', format: 'auto' }
      ];
      uploadOptions.eager_async = true; // Process in background for faster upload
    }
    
    console.log(`\n📤 Uploading ${isVideo ? 'VIDEO' : 'IMAGE'} to Cloudinary...`);
    console.log(`   File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Folder: ${folder}`);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.log(`\n❌ Cloudinary upload failed:`);
          console.log(`   Error: ${error.message}`);
          reject(error);
        } else {
          console.log(`\n✅ Upload successful!`);
          console.log(`   URL: ${result.secure_url}`);
          console.log(`   Duration: ${result.duration ? result.duration + 's' : 'N/A'}`);
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
    
    const { propertyId, description, additionalDetails, mapUrl, amenities, existingPropertyImages } = req.body;
    
    console.log("1. Request Body:");
    console.log("   - PropertyId:", propertyId);
    console.log("   - Description:", description ? "Provided" : "Missing");
    console.log("   - MapUrl:", mapUrl ? "Provided" : "Missing");
    console.log("   - Raw amenities from body:", amenities);
    console.log("   - Existing Property Images:", existingPropertyImages);
    
    console.log("\n2. Files Received:");
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const files = req.files[key];
        console.log(`   - ${key}: ${files.length} file(s)`);
        files.forEach(file => {
          console.log(`     • ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        });
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
    
    // Start with existing property images if provided
    let constructionProgress = [];
    
    // Parse existing property images if sent from client
    if (existingPropertyImages) {
      try {
        const parsedImages = typeof existingPropertyImages === 'string' 
          ? JSON.parse(existingPropertyImages) 
          : existingPropertyImages;
        
        if (Array.isArray(parsedImages)) {
          constructionProgress = parsedImages.map((img, index) => ({
            image: img.url,
            label: img.label || `Image ${index + 1}`
          }));
          console.log(`   ✓ Loaded ${constructionProgress.length} existing property images`);
        }
      } catch (err) {
        console.log("   ⚠ Error parsing existingPropertyImages:", err.message);
      }
    }
    
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

    // Process main media (video or image) - SUPPORTS UP TO 1GB
    if (req.files && req.files['mainMedia']) {
      console.log("\n☁️ Uploading main media to Cloudinary...");
      const mainMediaFile = req.files['mainMedia'][0];
      
      const fileSizeMB = mainMediaFile.size / (1024 * 1024);
      console.log(`   File size: ${fileSizeMB.toFixed(2)}MB`);
      
      if (fileSizeMB > 1024) {
        console.log(`   ⚠️ WARNING: File exceeds 1GB limit`);
        return res.status(400).json({ 
          error: "File too large", 
          details: "Maximum file size is 1GB (1024MB)",
          suggestion: "Please compress your video to under 1GB"
        });
      }
      
      if (fileSizeMB > 100) {
        console.log(`   ⚠️ Large file detected - upload may take 10-20 minutes`);
      }
      
      try {
        const cloudinaryUrl = await uploadToCloudinary(mainMediaFile);
        updateData.mainMedia = cloudinaryUrl;
        console.log("   ✓ Main media uploaded successfully");
      } catch (error) {
        console.log("   ❌ Error uploading main media:", error.message);
        
        let errorMessage = "Failed to upload video to Cloudinary";
        let suggestion = "Please try again";
        
        if (error.message.includes('timeout') || error.message.includes('ESOCKETTIMEDOUT')) {
          errorMessage = "Upload timeout - this can happen with very large files on slower connections";
          suggestion = "Try compressing your video or ensure you have a stable internet connection";
        } else if (error.message.includes('file size')) {
          errorMessage = "Video file exceeds size limit";
          suggestion = "Please use a video under 1GB";
        }
        
        return res.status(500).json({ 
          error: errorMessage, 
          details: error.message,
          suggestion: suggestion
        });
      }
    }
    
    // Process gallery images
    if (req.files && req.files['gallery']) {
      console.log(`\n☁️ Uploading ${req.files['gallery'].length} gallery images to Cloudinary...`);
      updateData.gallery = [];
      
      // Upload each gallery image
      for (const file of req.files['gallery']) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          updateData.gallery.push(cloudinaryUrl);
        } catch (error) {
          console.log(`   ❌ Error uploading gallery image:`, error.message);
          return res.status(500).json({ 
            error: "Failed to upload gallery image", 
            details: error.message 
          });
        }
      }
      console.log(`   ✓ All gallery images uploaded`);
    }

    // Process NEW property images (constructionProgress)
    console.log("\n4. Processing Property Images...");
    if (req.files && req.files['constructionProgress'] && req.files['constructionProgress'].length > 0) {
      const images = req.files['constructionProgress'];
      console.log(`   Found ${images.length} NEW property image(s)`);
      
      // Upload each NEW property image and add to constructionProgress array
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          const imageData = {
            image: cloudinaryUrl,
            label: `Image ${constructionProgress.length + i + 1}`
          };
          constructionProgress.push(imageData);
          console.log(`   ✓ New property image ${i + 1} uploaded`);
        } catch (error) {
          console.log(`   ❌ Error uploading property image ${i + 1}:`, error.message);
          return res.status(500).json({ 
            error: `Failed to upload property image ${i + 1}`, 
            details: error.message 
          });
        }
      }
    }
    
    // Set the constructionProgress array (existing + new)
    updateData.constructionProgress = constructionProgress;
    console.log(`   ✓ Total property images after update: ${constructionProgress.length}`);

    console.log("\n5. Attempting Database Update...");
    console.log("   Query: { propertyId:", propertyId, "}");
    
    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("\n✅ SUCCESS! Property details saved");
    console.log("   Document ID:", details._id);
    console.log("   Amenities count:", details.amenities?.length || 0);
    console.log("   Property images count:", details.constructionProgress?.length || 0);
    console.log("   Main media:", details.mainMedia ? 'Uploaded ✓' : 'Not provided');
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
      details: error.toString(),
      suggestion: "Check server console for detailed error logs"
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
    console.log("✓ Amenities count:", details.amenities?.length || 0);
    console.log("✓ Property images count:", details.constructionProgress?.length || 0);
    
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