const Sermon = require('../models/Sermon');
const Song = require('../models/Song');
const Notification = require('../models/Notification');

// @desc    Get all sermons
// @route   GET /api/sermons
// @access  Public
const getSermons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const search = req.query.search || '';
    
    let query = { status: 'approved' };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const sermons = await Sermon.find(query)
      .populate('preacherId', 'username profilePicture')
      .populate('songId', 'title artist')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Sermon.countDocuments(query);
    
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

// @desc    Get sermon by ID
// @route   GET /api/sermons/:id
// @access  Public
const getSermonById = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id)
      .populate('preacherId', 'username profilePicture bio')
      .populate('songId', 'title artist albumArt');
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    // Increment views
    sermon.stats.views += 1;
    await sermon.save();
    
    res.json(sermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create sermon
// @route   POST /api/sermons
// @access  Private (Admin/Moderator)
const createSermon = async (req, res) => {
  try {
    const sermon = await Sermon.create({
      ...req.body,
      preacherId: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    // If associated with a song, notify the song artist
    if (sermon.songId) {
      const song = await Song.findById(sermon.songId);
      if (song && song.artistId.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: song.artistId,
          type: 'new_song',
          title: 'Sermon Added to Your Song',
          message: `A sermon "${sermon.title}" has been added to your song "${song.title}"`,
          relatedId: sermon._id,
          relatedModel: 'Sermon'
        });
      }
    }
    
    res.status(201).json(sermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sermon
// @route   PUT /api/sermons/:id
// @access  Private (Admin only)
const updateSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    const updatedSermon = await Sermon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedSermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete sermon
// @route   DELETE /api/sermons/:id
// @access  Private (Admin only)
const deleteSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    await sermon.deleteOne();
    res.json({ message: 'Sermon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like sermon
// @route   POST /api/sermons/:id/like
// @access  Private
const likeSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    
    if (!sermon) {
      return res.status(404).json({ message: 'Sermon not found' });
    }
    
    sermon.stats.likes += 1;
    await sermon.save();
    
    res.json({ likes: sermon.stats.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sermons by song
// @route   GET /api/sermons/song/:songId
// @access  Public
const getSermonsBySong = async (req, res) => {
  try {
    const sermons = await Sermon.find({ 
      songId: req.params.songId,
      status: 'approved'
    }).populate('preacherId', 'username profilePicture');
    
    res.json(sermons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSermons,
  getSermonById,
  createSermon,
  updateSermon,
  deleteSermon,
  likeSermon,
  getSermonsBySong
};