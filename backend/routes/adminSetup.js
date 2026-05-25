const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TEMPORARY - Remove after use
router.post('/setup-first-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    // Create admin user
    const admin = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    res.json({ 
      message: 'Admin user created successfully!',
      user: { username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;