const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Import Routes
const contactRoutes = require('./routes/contactRoutes');
const videoRoutes = require('./routes/videoRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const propertyDetailsRoutes = require('./routes/propertyDetailsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

// Route Middlewares
app.use('/api', contactRoutes);
app.use('/api', videoRoutes);
app.use('/api/admin', propertyRoutes);
app.use('/api/admin', propertyDetailsRoutes);
app.use('/api/gallery', galleryRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 POST  http://localhost:${PORT}/api/contact`);
  console.log(`📊 GET   http://localhost:${PORT}/api/admin/contact`);
  console.log(`🗑 DELETE http://localhost:${PORT}/api/admin/contact/:id`);
  console.log(`🖼️  GET   http://localhost:${PORT}/api/gallery`);
  console.log(`📤 POST  http://localhost:${PORT}/api/upload`);
});