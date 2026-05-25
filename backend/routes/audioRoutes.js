const express = require('express');
const router = express.Router();
const {
  uploadAudio,
  getAudio,
  deleteAudio
} = require('../controllers/audioController');
const { protect, admin } = require('../middleware/authMiddleware');

// Upload audio file (protected)
router.post('/upload', protect, uploadAudio);

// Get audio file (public)
router.get('/file/:filename', getAudio);

// Delete audio file (admin only)
router.delete('/:filename', protect, admin, deleteAudio);

module.exports = router;