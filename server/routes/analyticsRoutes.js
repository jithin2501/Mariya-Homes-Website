const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// IMPORTANT: These routes are already prefixed with /api/analytics in index.js

// ============ TRACKING ENDPOINTS ============
// Track user visit
router.post('/track-visit', analyticsController.trackVisit);

// Update user location
router.post('/update-location', analyticsController.updateLocation);

// ============ DATA RETRIEVAL ENDPOINTS ============
// Get analytics data (main endpoint)
router.get('/', analyticsController.getAnalytics);

// Get user details
router.get('/user/:sessionId', analyticsController.getUserDetails);

// Get geo map data
router.get('/geo-map', analyticsController.getGeoMapData);

// ============ EXPORT ENDPOINTS ============
// Export full visit details
router.get('/export/visits', analyticsController.exportVisitDetails);

// Export users
router.get('/export/users', analyticsController.exportUsers);

// ============ TEST ENDPOINT ============
// Add a test endpoint to verify routes are working
router.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Analytics routes are working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/analytics',
      'GET /api/analytics/geo-map',
      'GET /api/analytics/user/:sessionId',
      'GET /api/analytics/export/visits',
      'GET /api/analytics/export/users',
      'POST /api/analytics/track-visit',
      'POST /api/analytics/update-location',
      'GET /api/analytics/test'
    ]
  });
});

// ============ ERROR HANDLING ============
// Handle 404 for undefined routes
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Analytics endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;