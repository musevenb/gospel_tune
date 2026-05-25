const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model (copy from your models/User.js)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // New password (change this to whatever you want)
    const newPassword = 'admin123';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the admin user
    const result = await User.updateOne(
      { email: 'kmusevenb@gmail.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successful!');
      console.log(`📧 Email: kmusevenb@gmail.com`);
      console.log(`🔑 New Password: ${newPassword}`);
    } else {
      console.log('❌ User not found or password already the same');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword();