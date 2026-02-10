const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public routes
router.get('/type/:type', galleryController.getGalleryByType);

// Admin routes (protected)
router.get('/', authMiddleware, galleryController.getAllGallery);

// Create gallery with Cloudinary upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'mariya_gallery' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Create gallery item with Cloudinary URL
    const { type, title, description, order } = req.body;
    const Gallery = require('../models/Gallery');
    
    const gallery = new Gallery({
      type,
      title,
      description,
      image: uploadResult.secure_url, // Use Cloudinary URL
      order: order || 0
    });

    await gallery.save();
    res.status(201).json({ message: 'Gallery item created successfully', gallery });
  } catch (error) {
    res.status(500).json({ message: 'Error creating gallery item', error: error.message });
  }
});

router.put('/:id', authMiddleware, galleryController.updateGallery);
router.delete('/:id', authMiddleware, galleryController.deleteGallery);
router.post('/reorder', authMiddleware, galleryController.reorderGallery);

module.exports = router;