const PropertyDetails = require('../models/PropertyDetails');

exports.upsertDetails = async (req, res) => {
  try {
    const { propertyId, description, additionalDetails, mapUrl } = req.body;
    
    // Validate if propertyId is provided
    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required" });
    }
    
    const updateData = { 
      description, 
      additionalDetails, 
      mapUrl,
      propertyId 
    };

    // Process files from Multer and construct full URLs
    if (req.files && req.files['mainMedia']) {
      updateData.mainMedia = `http://localhost:5000/uploads/${req.files['mainMedia'][0].filename}`;
    }
    
    if (req.files && req.files['gallery']) {
      updateData.gallery = req.files['gallery'].map(file => 
        `http://localhost:5000/uploads/${file.filename}`
      );
    }

    const details = await PropertyDetails.findOneAndUpdate(
      { propertyId: propertyId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(details);
  } catch (error) {
    console.error("Error saving property details:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDetailsByPropertyId = async (req, res) => {
  try {
    const details = await PropertyDetails.findOne({ propertyId: req.params.id })
      .populate('propertyId');
    
    if (!details) {
      return res.status(404).json({ message: "No specific details found for this property." });
    }
    
    res.status(200).json(details);
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ error: "Server error while fetching property details." });
  }
};