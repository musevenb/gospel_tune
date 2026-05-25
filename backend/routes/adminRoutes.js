const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  getPendingSongs,
  getPendingSermons,
  getAllSongs,
  getAllSermons,
  deleteUser,
  featureSong,
  approveSermon,
  featureSermon,
  deleteSermon
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin
router.use(protect, admin);

// Stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Song management
router.get('/pending-songs', getPendingSongs);
router.get('/songs', getAllSongs);
router.put('/songs/:id/feature', featureSong);

// Sermon management
router.get('/pending-sermons', getPendingSermons);
router.get('/sermons', getAllSermons);
router.put('/sermons/:id/approve', approveSermon);
router.put('/sermons/:id/feature', featureSermon);
router.delete('/sermons/:id', deleteSermon);

module.exports = router;