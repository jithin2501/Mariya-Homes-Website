const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  locationText: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  category: { type: String, enum: ["For Sale", "Featured", "New", "Sold"], default: "For Sale" },
  features: {
    bed: { type: Number, required: true },
    bath: { type: Number, required: true },
    sqft: { type: Number, required: true }
  },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Property", propertySchema);