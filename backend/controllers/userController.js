const User = require('../models/User');
const Song = require('../models/Song');
const Subscription = require('../models/Subscription');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('savedSongs', 'title artist albumArt')
      .populate('subscribedArtists', 'username profilePicture');
    
    const stats = {
      uploadedSongs: await Song.countDocuments({ artistId: req.user._id, status: 'approved' }),
      pendingSongs: await Song.countDocuments({ artistId: req.user._id, status: 'pending' }),
      totalPlays: await Song.aggregate([
        { $match: { artistId: req.user._id } },
        { $group: { _id: null, total: { $sum: '$stats.plays' } } }
      ])
    };
    
    res.json({ ...user.toObject(), stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.username = req.body.username || user.username;
    user.bio = req.body.bio || user.bio;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Like a song
// @route   POST /api/users/save-song/:songId
// @access  Private
const saveSong = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const song = await Song.findById(req.params.songId);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    const alreadySaved = user.savedSongs.includes(req.params.songId);
    
    if (alreadySaved) {
      user.savedSongs = user.savedSongs.filter(id => id.toString() !== req.params.songId);
      song.stats.likes = Math.max(0, song.stats.likes - 1);
    } else {
      user.savedSongs.push(req.params.songId);
      song.stats.likes += 1;
    }
    
    await user.save();
    await song.save();
    
    res.json({ saved: !alreadySaved, likes: song.stats.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to artist
// @route   POST /api/users/subscribe/:artistId
// @access  Private
const subscribeToArtist = async (req, res) => {
  try {
    const artist = await User.findById(req.params.artistId);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    const existingSubscription = await Subscription.findOne({
      subscriberId: req.user._id,
      artistId: req.params.artistId
    });
    
    if (existingSubscription) {
      await existingSubscription.deleteOne();
      
      // Remove from user's subscribedArtists
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { subscribedArtists: req.params.artistId }
      });
      
      res.json({ subscribed: false });
    } else {
      const subscription = await Subscription.create({
        subscriberId: req.user._id,
        artistId: req.params.artistId
      });
      
      // Add to user's subscribedArtists
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { subscribedArtists: req.params.artistId }
      });
      
      res.json({ subscribed: true, subscription });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's uploaded songs
// @route   GET /api/users/my-songs
// @access  Private
const getMySongs = async (req, res) => {
  try {
    const songs = await Song.find({ artistId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  saveSong,
  subscribeToArtist,
  getMySongs
};