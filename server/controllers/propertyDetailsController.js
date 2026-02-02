const PropertyDetails = require('../models/PropertyDetails');

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

    // Parse and add amenities if provided - FIXED VERSION
    if (amenities) {
      try {
        let parsedAmenities;
        
        // Check if amenities is already an array or a string
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
        
        // Ensure it's an array of strings and filter out empty values
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

    // Process main media
    if (req.files && req.files['mainMedia']) {
      updateData.mainMedia = `http://localhost:5000/uploads/${req.files['mainMedia'][0].filename}`;
      console.log("   ✓ Main media:", updateData.mainMedia);
    }
    
    // Process gallery
    if (req.files && req.files['gallery']) {
      updateData.gallery = req.files['gallery'].map(file => 
        `http://localhost:5000/uploads/${file.filename}`
      );
      console.log("   ✓ Gallery images:", updateData.gallery.length);
    }

    // Process property images (constructionProgress)
    console.log("\n4. Processing Property Images...");
    if (req.files && req.files['constructionProgress'] && req.files['constructionProgress'].length > 0) {
      const images = req.files['constructionProgress'];
      console.log(`   Found ${images.length} property image(s)`);
      
      try {
        updateData.constructionProgress = images.map((file, index) => {
          const imageData = {
            image: `http://localhost:5000/uploads/${file.filename}`,
            label: `Image ${index + 1}`
          };
          console.log(`   ✓ Image ${index + 1}: ${file.filename}`);
          return imageData;
        });
        console.log(`   ✓ Successfully processed ${updateData.constructionProgress.length} images`);
      } catch (mapError) {
        console.log("   ❌ Error processing images:", mapError.message);
        throw mapError;
      }
    } else {
      updateData.constructionProgress = [];
      console.log("   ℹ No property images provided - setting empty array");
    }

    console.log("\n5. Attempting Database Update...");
    console.log("   Query: { propertyId:", propertyId, "}");
    console.log("   Update Data:", JSON.stringify(updateData, null, 2));
    
    // IMPORTANT: Use $set explicitly to ensure amenities field is updated
    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("\n✅ SUCCESS! Property details saved");
    console.log("   Document ID:", details._id);
    console.log("   Saved amenities:", details.amenities);
    console.log("   Amenities count:", details.amenities?.length || 0);
    console.log("   Full document amenities:", JSON.stringify(details.amenities));
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
      .lean(); // Use lean() for better performance and plain JS object
    
    if (!details) {
      console.log("❌ No details found for this property");
      return res.status(404).json({ message: "No specific details found for this property." });
    }
    
    console.log("✓ Details found");
    console.log("✓ Amenities in DB:", details.amenities);
    console.log("✓ Amenities count:", details.amenities?.length || 0);
    console.log("✓ Amenities type:", Array.isArray(details.amenities) ? 'array' : typeof details.amenities);
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