const express = require('express');
const router = express.Router();
const {
  getSermons,
  getSermonById,
  createSermon,
  updateSermon,
  deleteSermon,
  likeSermon,
  getSermonsBySong
} = require('../controllers/sermonController');
const { protect, admin, moderator } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSermons);
router.get('/:id', getSermonById);
router.get('/song/:songId', getSermonsBySong);

// Protected routes
router.post('/', protect, createSermon);
router.post('/:id/like', protect, likeSermon);

// Admin only routes
router.put('/:id', protect, admin, updateSermon);
router.delete('/:id', protect, admin, deleteSermon);

module.exports = router;