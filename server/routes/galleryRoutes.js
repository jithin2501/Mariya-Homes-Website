const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Public routes
router.get('/type/:type', galleryController.getGalleryByType);

// Admin routes (add authentication middleware if needed)
router.get('/', galleryController.getAllGallery);
router.post('/', galleryController.createGallery);
router.put('/:id', galleryController.updateGallery);
router.delete('/:id', galleryController.deleteGallery);
router.post('/reorder', galleryController.reorderGallery);

module.exports = router;