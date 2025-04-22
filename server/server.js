const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// Pour Vercel, nous devons adapter le chemin
const uploadsPath = process.env.VERCEL ? path.join(__dirname, './uploads') : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Import routes
const fileRoutes = require('./routes/fileRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Use routes
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Add more comprehensive logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Add a default route handler for Vercel
app.get('*', (req, res) => {
  console.log(`[${new Date().toISOString()}] Default route handler for: ${req.url}`);
  res.status(200).json({ message: 'WhatsApp HTML Manager API is running' });
});

// Set port and start server - Only use in development, not needed for Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
