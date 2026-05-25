const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  saveSong,
  subscribeToArtist,
  getMySongs
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/save-song/:songId', protect, saveSong);
router.post('/subscribe/:artistId', protect, subscribeToArtist);
router.get('/my-songs', protect, getMySongs);

module.exports = router;