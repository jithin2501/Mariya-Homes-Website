const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db'); // Remove .js extension for CommonJS

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes using CommonJS
const contactRoutes = require('./routes/contactRoutes');
const videoRoutes = require('./routes/videoRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const propertyDetailsRoutes = require('./routes/propertyDetailsRoutes');

// Route Middlewares
app.use('/api', contactRoutes);
app.use("/api", videoRoutes);
app.use("/api/admin", propertyRoutes);
app.use("/api/admin", propertyDetailsRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 POST  http://localhost:${PORT}/api/contact`);
  console.log(`📊 GET   http://localhost:${PORT}/api/admin/contact`);
  console.log(`🗑 DELETE http://localhost:${PORT}/api/admin/contact/:id`);
});