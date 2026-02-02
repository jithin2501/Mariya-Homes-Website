const mongoose = require('mongoose');

const propertyDetailsSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  description: { type: String, required: true },
  additionalDetails: { type: String }, 
  mainMedia: { type: String }, 
  gallery: [{ type: String }], 
  mapUrl: { type: String },
  constructionProgress: [{
    image: { type: String, required: true },
    label: { type: String, required: true }
  }]
});

module.exports = mongoose.model('PropertyDetails', propertyDetailsSchema);