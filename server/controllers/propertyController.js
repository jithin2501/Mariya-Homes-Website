const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');

exports.addProperty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Stream the image buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mariya_properties" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Parse features (FormData sends objects as strings)
    const features = typeof req.body.features === 'string' 
      ? JSON.parse(req.body.features) 
      : req.body.features;

    const newProperty = new Property({
      title: req.body.title,
      locationText: req.body.locationText,
      price: req.body.price,
      category: req.body.category,
      features: features,
      image: uploadResult.secure_url 
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(500).json({ message: "Error adding property", error: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties", error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property", error: error.message });
  }
};
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    let imageUrl = property.image; // Use existing image by default

    // Check if a new file was uploaded to replace the old one
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mariya_properties" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const features = typeof req.body.features === 'string' 
      ? JSON.parse(req.body.features) 
      : req.body.features;

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        locationText: req.body.locationText,
        price: req.body.price,
        category: req.body.category,
        features: features,
        image: imageUrl
      },
      { new: true }
    );

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};