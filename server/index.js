const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

dotenv.config();

const cloudinary = require('./config/cloudinary');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());

// ⚠️ IMPORTANT: Increase body parser limits for large video uploads (up to 1GB)
app.use(express.json({ limit: '1200mb' }));
app.use(express.urlencoded({ limit: '1200mb', extended: true }));

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const streamifier = require('streamifier');

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mariya-homes/gallery',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// ============ IMPORT ROUTES ============
const contactRoutes = require('./routes/contactRoutes');
const videoRoutes = require('./routes/videoRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const propertyDetailsRoutes = require('./routes/propertyDetailsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// ============ REGISTER API ROUTES - MUST COME BEFORE STATIC FILES ============
app.use('/api', contactRoutes);
app.use('/api', videoRoutes);
app.use('/api/admin', propertyRoutes);
app.use('/api/admin', propertyDetailsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// ============ SIMPLE ROUTE VERIFICATION ============
console.log('\n=== SERVER STARTUP ===');
console.log('✅ Contact routes mounted');
console.log('✅ Video routes mounted');
console.log('✅ Property routes mounted');
console.log('✅ Property details routes mounted');
console.log('✅ Gallery routes mounted');
console.log('✅ User routes mounted');
console.log('✅ Analytics routes mounted at /api/analytics');
console.log('✅ Body parser limits: 1200MB');
console.log('========================\n');

// ============ SERVE STATIC FILES - AFTER API ROUTES ============
app.use(express.static(path.join(__dirname, '../client/build')));

// ============ CATCH-ALL ROUTE - MUST BE LAST ============
app.use((req, res, next) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    // Return JSON for unmatched API routes
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics API available at: http://localhost:${PORT}/api/analytics`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/analytics/test`);
  console.log(`📱 Client app: http://localhost:${PORT}`);
});