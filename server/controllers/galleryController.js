const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Get all gallery items by type
exports.getGalleryByType = async (req, res) => {
  try {
    const { type } = req.params;
    const galleries = await Gallery.find({ type, isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery items', error: error.message });
  }
};

// Get all gallery items (for admin)
exports.getAllGallery = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ type: 1, order: 1, createdAt: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery items', error: error.message });
  }
};

// Create new gallery item
exports.createGallery = async (req, res) => {
  try {
    const { type, title, description, image, order } = req.body;

    const gallery = new Gallery({
      type,
      title,
      description,
      image,
      order: order || 0
    });

    await gallery.save();
    res.status(201).json({ message: 'Gallery item created successfully', gallery });
  } catch (error) {
    res.status(500).json({ message: 'Error creating gallery item', error: error.message });
  }
};

// Update gallery item
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, image, order, isActive } = req.body;

    const gallery = await Gallery.findByIdAndUpdate(
      id,
      { type, title, description, image, order, isActive },
      { new: true, runValidators: true }
    );

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({ message: 'Gallery item updated successfully', gallery });
  } catch (error) {
    res.status(500).json({ message: 'Error updating gallery item', error: error.message });
  }
};

// Delete gallery item
exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image file if it exists
    if (gallery.image) {
      const imagePath = path.join(__dirname, '../../uploads', gallery.image.split('/uploads/')[1]);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Gallery.findByIdAndDelete(id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery item', error: error.message });
  }
};

// Reorder gallery items
exports.reorderGallery = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    const updatePromises = items.map(item =>
      Gallery.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Gallery items reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering gallery items', error: error.message });
  }
};