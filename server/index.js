const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (ONLY ONE)
app.use('/api', require('./routes/contactRoutes'));
app.use("/api", require("./routes/videoRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 POST  http://localhost:${PORT}/api/contact`);
  console.log(`📊 GET   http://localhost:${PORT}/api/admin/contact`);
  console.log(`🗑 DELETE http://localhost:${PORT}/api/admin/contact/:id`);
});
