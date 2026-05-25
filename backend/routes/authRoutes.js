const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); // Add this for the temp route

// Regular routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// TEMPORARY - Make user admin (Remove this after testing!)
router.get('/make-admin/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = 'admin';
    await user.save();
    res.json({ message: 'User is now admin', email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;