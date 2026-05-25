const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../config/localStorage');
const {
  getSongs,
  getSongById,
  createSong,
  createSongWithAudio,
  updateSong,
  deleteSong,
  shareSong,
  addSubtitle,
  approveSubtitle,
  approveSong
} = require('../controllers/songController');
const { protect, admin, moderator } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSongs);
router.get('/:id', getSongById);
router.post('/:id/share', shareSong);

// Protected routes - User can create songs
router.post('/', protect, createSong);
router.post('/with-audio', protect, uploadSingle, createSongWithAudio);
router.put('/:id', protect, updateSong);
router.delete('/:id', protect, deleteSong);
router.post('/:id/subtitles', protect, addSubtitle);

// Admin/Moderator routes
router.put('/:songId/subtitles/:subtitleId/approve', protect, moderator, approveSubtitle);
router.put('/:id/approve', protect, moderator, approveSong);

module.exports = router;