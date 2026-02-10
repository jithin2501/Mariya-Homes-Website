const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// ⚠️ CRITICAL: Load environment variables FIRST before importing anything else
dotenv.config();

// Now import cloudinary AFTER dotenv is loaded
const cloudinary = require('./config/cloudinary');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Image upload endpoint - Upload to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('📁 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Import streamifier
    const streamifier = require('streamifier');
    console.log('✅ Streamifier loaded');

    // Upload to Cloudinary
    console.log('☁️  Uploading to Cloudinary...');
    
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mariya-homes/gallery',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result.secure_url);
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;
    
    // Return the secure URL from Cloudinary
    res.json({ imageUrl: result.secure_url });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message
    });
  }
});

// Import Routes
const contactRoutes = require('./routes/contactRoutes');
const videoRoutes = require('./routes/videoRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const propertyDetailsRoutes = require('./routes/propertyDetailsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const userRoutes = require('./routes/userRoutes');

// Route Middlewares
app.use('/api', contactRoutes);
app.use('/api', videoRoutes);
app.use('/api/admin', propertyRoutes);
app.use('/api/admin', propertyDetailsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('='.repeat(60));
  console.log(`📡 POST  http://localhost:${PORT}/api/contact`);
  console.log(`📊 GET   http://localhost:${PORT}/api/admin/contact`);
  console.log(`🗑️  DELETE http://localhost:${PORT}/api/admin/contact/:id`);
  console.log(`🖼️  GET   http://localhost:${PORT}/api/gallery`);
  console.log(`📤 POST  http://localhost:${PORT}/api/upload (Cloudinary)`);
  console.log(`🏠 POST  http://localhost:${PORT}/api/admin/property-details (Property Details - Cloudinary)`);
  console.log('='.repeat(60) + '\n');
});