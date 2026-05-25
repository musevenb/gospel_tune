const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/api/audio/file', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/documentary', require('./routes/documentaryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audio', require('./routes/audioRoutes')); // Add this line

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gospel Tune API is running!',
    version: '2.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Gospel Tune Server running on port ${PORT}`);
  console.log(`📁 Audio files saved to: ${path.join(__dirname, 'uploads')}`);
  console.log(`📝 API endpoints ready`);
});