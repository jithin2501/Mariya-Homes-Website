const express = require('express');
const multer = require('multer');
const { 
  addProperty, 
  getAllProperties, 
  deleteProperty,
  updateProperty,
  getPropertyById // NEW: Import the new function
} = require('../controllers/propertyController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/properties', getAllProperties);
router.get('/properties/:id', getPropertyById); // NEW: Add this route
router.post('/properties', upload.single('image'), addProperty);
router.delete('/properties/:id', deleteProperty);
router.put('/properties/:id', upload.single('image'), updateProperty);

module.exports = router;