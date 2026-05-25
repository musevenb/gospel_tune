const User = require('../models/User');
const Song = require('../models/Song');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Sermon = require('../models/Sermon');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    const totalSermons = await Sermon.countDocuments();
    const pendingSongs = await Song.countDocuments({ status: 'pending' });
    const pendingSermons = await Sermon.countDocuments({ status: 'pending' });
    const totalComments = await Comment.countDocuments();
    
    const totalPlaysResult = await Song.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.plays' } } }
    ]);
    const totalPlays = totalPlaysResult[0]?.total || 0;
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentSongs = await Song.find().populate('artistId', 'username').sort({ createdAt: -1 }).limit(5);
    const recentSermons = await Sermon.find().populate('preacherId', 'username').sort({ createdAt: -1 }).limit(5);
    
    res.json({
      stats: {
        totalUsers,
        totalSongs,
        totalSermons,
        pendingSongs,
        pendingSermons,
        totalComments,
        totalPlays
      },
      recentUsers,
      recentSongs,
      recentSermons
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get song and sermon counts for each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const uploadedSongs = await Song.countDocuments({ artistId: user._id });
      const uploadedSermons = await Sermon.countDocuments({ preacherId: user._id });
      return {
        ...user.toObject(),
        uploadedSongs,
        uploadedSermons
      };
    }));
    
    const total = await User.countDocuments();
    
    res.json({
      users: usersWithCounts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    user.role = role;
    await user.save();
    
    // Notify user
    await Notification.create({
      userId: user._id,
      type: 'subscription',
      title: 'Role Updated',
      message: `Your account role has been updated to ${role}`,
      metadata: { newRole: role }
    });
    
    res.json({ message: 'User role updated', user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending songs
// @route   GET /api/admin/pending-songs
// @access  Private/Admin
const getPendingSongs = async (req, res) => {
  try {
    const songs = await Song.find({ status: 'pending' })
      .populate('artistId', 'username email profilePicture')
      .sort({ createdAt: 1 });
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending sermons
// @route   GET /api/admin/pending-sermons
// @access  Private/Admin
const getPendingSermons = async (req, res) => {
  try {
    const sermons = await Sermon.find({ status: 'pending' })
      .populate('preacherId', 'username email profilePicture')
      .sort({ createdAt: 1 });
    
    res.json(sermons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all songs
// @route   GET /api/admin/songs
// @access  Private/Admin
const getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const songs = await Song.find()
      .populate('artistId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Song.countDocuments();
    
    res.json({
      songs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSongs: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sermons
// @route   GET /api/admin/sermons
// @access  Private/Admin
const getAllSermons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const sermons = await Sermon.find()
      .populate('preacherId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Sermon.countDocuments();
    
    res.json({
      sermons,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSermons: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete user's songs
    await Song.deleteMany({ artistId: user._id });
    
    // Delete user's sermons
    await Sermon.deleteMany({ preacherId: user._id });
    
    // Delete user's comments
    await Comment.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Feature a song
// @route   PUT /api/admin/songs/:id/feature
// @access  Private/Admin
const featureSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    song.status = song.status === 'featured' ? 'approved' : 'featured';
    await song.save();
    
    // Notify artist
    if (song.status === 'featured') {
      await Notification.create({
        userId: song.artistId,
        type: 'song_approved',
        title: 'Your Song is Featured! 🎉',
        message: `Congratulations! "${song.title}" has been featured on the homepage.`,
        relatedId: song._id,
        relatedModel: 'Song'
      });
    }
    
    res.json({ message: `Song ${song.status === 'featured' ? 'featured' : 'unfeatured'}`, song });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve sermon
// @route   PUT /api/admin/sermons/:id/approve
// @access  Private/Admin
const approveSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    sermon.status = req.body.status || 'approved';
    sermon.moderationNote = req.body.note || '';
    await sermon.save();
    
    // Notify preacher
    await Notification.create({
      userId: sermon.preacherId,
      type: 'song_approved',
      title: sermon.status === 'approved' ? 'Sermon Approved! ✅' : 'Sermon Needs Revision',
      message: sermon.status === 'approved' 
        ? `Your sermon "${sermon.title}" has been approved and published.`
        : `Your sermon "${sermon.title}" needs revision. Reason: ${req.body.note || 'Please check guidelines'}`,
      relatedId: sermon._id,
      relatedModel: 'Sermon'
    });
    
    res.json({ message: `Sermon ${sermon.status}`, sermon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Feature a sermon
// @route   PUT /api/admin/sermons/:id/feature
// @access  Private/Admin
const featureSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    sermon.status = sermon.status === 'featured' ? 'approved' : 'featured';
    await sermon.save();
    
    // Notify preacher
    if (sermon.status === 'featured') {
      await Notification.create({
        userId: sermon.preacherId,
        type: 'song_approved',
        title: 'Your Sermon is Featured! 🌟',
        message: `Congratulations! "${sermon.title}" has been featured on the homepage.`,
        relatedId: sermon._id,
        relatedModel: 'Sermon'
      });
    }
    
    res.json({ message: `Sermon ${sermon.status === 'featured' ? 'featured' : 'unfeatured'}`, sermon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete sermon
// @route   DELETE /api/admin/sermons/:id
// @access  Private/Admin
const deleteSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    await sermon.deleteOne();
    res.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};