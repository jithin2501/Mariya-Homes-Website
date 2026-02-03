const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['construction', 'renovation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
gallerySchema.index({ type: 1, order: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);