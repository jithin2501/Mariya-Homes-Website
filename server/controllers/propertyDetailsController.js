const PropertyDetails = require('../models/PropertyDetails');

exports.upsertDetails = async (req, res) => {
  try {
    console.log("\n==========================================");
    console.log("PROPERTY DETAILS UPDATE REQUEST RECEIVED");
    console.log("==========================================");
    
    const { propertyId, description, additionalDetails, mapUrl } = req.body;
    
    console.log("1. Request Body:");
    console.log("   - PropertyId:", propertyId);
    console.log("   - Description:", description ? "Provided" : "Missing");
    console.log("   - MapUrl:", mapUrl ? "Provided" : "Missing");
    
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
    
    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    console.log("\n✅ SUCCESS! Property details saved");
    console.log("   Document ID:", details._id);
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
    console.log("\nFetching property details for ID:", req.params.id);
    
    const details = await PropertyDetails.findOne({ propertyId: req.params.id })
      .populate('propertyId');
    
    if (!details) {
      console.log("No details found for this property");
      return res.status(404).json({ message: "No specific details found for this property." });
    }
    
    console.log("✓ Details found successfully");
    res.status(200).json(details);
  } catch (error) {
    console.error("Error fetching details:", error.message);
    res.status(500).json({ error: "Server error while fetching property details." });
  }
};