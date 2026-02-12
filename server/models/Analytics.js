const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  district: {
    type: String,
    default: 'N/A'
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  exitReason: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const analyticsSchema = new mongoose.Schema({
  username: {
    type: String,
    default: 'Anonymous'
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  visits: [visitSchema],
  ipAddress: String,
  userAgent: String,
  location: {
    city: String,
    region: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
analyticsSchema.index({ username: 1 });
analyticsSchema.index({ 'visits.timestamp': -1 });
analyticsSchema.index({ firstVisit: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);