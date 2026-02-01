const express = require('express');
const multer = require('multer');
const { 
  addProperty, 
  getAllProperties, 
  deleteProperty,
  updateProperty // 1. Make sure this is imported
} = require('../controllers/propertyController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/properties', getAllProperties);
router.post('/properties', upload.single('image'), addProperty);
router.delete('/properties/:id', deleteProperty);

// 2. Add this specific line to handle the PUT request
router.put('/properties/:id', upload.single('image'), updateProperty);

module.exports = router;