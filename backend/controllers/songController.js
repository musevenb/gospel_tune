const Song = require('../models/Song');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { deleteAudioFile } = require('../config/gridfs');

// @desc    Get all songs (with filters)
// @route   GET /api/songs
// @access  Public
const getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const status = req.query.status || 'approved';
    
    let query = { status };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (genre && genre !== 'all') {
      query.genre = genre;
    }
    
    const songs = await Song.find(query)
      .populate('artistId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Song.countDocuments(query);
    
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

// @desc    Get single song
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artistId', 'username profilePicture bio');
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Increment play count
    song.stats.plays += 1;
    await song.save();
    
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new song with local audio file
// @route   POST /api/songs/with-audio
// @access  Private
const createSongWithAudio = async (req, res) => {
  try {
    const { title, artist, album, genre, albumArt, lyrics, lyricsType } = req.body;
    
    // Validate Gospel genre
    const gospelGenres = ['Gospel', 'Worship', 'Praise', 'Contemporary Gospel', 'Traditional Gospel'];
    if (!gospelGenres.includes(genre)) {
      return res.status(400).json({ 
        message: 'This app only accepts Gospel music. Please select a Gospel genre.' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }
    
    const audioUrl = `/api/audio/file/${req.file.filename}`;
    
    const song = await Song.create({
      title,
      artist,
      artistId: req.user._id,
      album,
      genre,
      audioUrl,
      audioFilename: req.file.filename,
      storageType: 'local',
      albumArt,
      lyrics,
      lyricsType,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    // Add to user's uploaded songs
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedSongs: song._id }
    });
    
    // Notify admins about new song (if pending)
    if (song.status === 'pending') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'song_approved',
          title: 'New Song Pending Review',
          message: `${req.user.username} uploaded "${title}"`,
          relatedId: song._id,
          relatedModel: 'Song'
        });
      }
    }
    
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new song (User upload - pending approval)
// @route   POST /api/songs
// @access  Private
const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, audioUrl, albumArt, lyrics, lyricsType, storageType, youtubeUrl } = req.body;
    
    // Validate Gospel genre
    const gospelGenres = ['Gospel', 'Worship', 'Praise', 'Contemporary Gospel', 'Traditional Gospel'];
    if (!gospelGenres.includes(genre)) {
      return res.status(400).json({ 
        message: 'This app only accepts Gospel music. Please select a Gospel genre.' 
      });
    }
    
    // Determine final audio URL based on source type
    let finalAudioUrl = audioUrl;
    let finalStorageType = storageType || 'url';
    
    if (storageType === 'youtube' && youtubeUrl) {
      finalAudioUrl = youtubeUrl;
    }
    
    const song = await Song.create({
      title,
      artist,
      artistId: req.user._id,
      album,
      genre,
      audioUrl: finalAudioUrl,
      storageType: finalStorageType,
      albumArt,
      lyrics,
      lyricsType,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    // Add to user's uploaded songs
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedSongs: song._id }
    });
    
    // Notify admins about new song (if pending)
    if (song.status === 'pending') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'song_approved',
          title: 'New Song Pending Review',
          message: `${req.user.username} uploaded "${title}"`,
          relatedId: song._id,
          relatedModel: 'Song'
        });
      }
    }
    
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update song
// @route   PUT /api/songs/:id
// @access  Private (Artist or Admin)
const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Check if user is artist or admin
    if (song.artistId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private (Artist or Admin)
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Check if user is artist or admin
    if (song.artistId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete local audio file if exists
    if (song.storageType === 'local' && song.audioFilename) {
      await deleteAudioFile(song.audioFilename);
    }
    
    await song.deleteOne();
    
    // Remove from user's uploaded songs
    await User.findByIdAndUpdate(song.artistId, {
      $pull: { uploadedSongs: req.params.id }
    });
    
    res.json({ message: 'Song removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share song (increment share count)
// @route   POST /api/songs/:id/share
// @access  Public
const shareSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    song.stats.shares += 1;
    await song.save();
    
    res.json({ shares: song.stats.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add subtitle to song
// @route   POST /api/songs/:id/subtitles
// @access  Private
const addSubtitle = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    const { language, content } = req.body;
    
    song.subtitles.push({
      language,
      content,
      uploadedBy: req.user._id,
      approved: req.user.role === 'admin'
    });
    
    await song.save();
    
    res.json({ message: 'Subtitle added successfully', subtitles: song.subtitles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve subtitle (Admin only)
// @route   PUT /api/songs/:songId/subtitles/:subtitleId/approve
// @access  Private/Admin
const approveSubtitle = async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    const subtitle = song.subtitles.id(req.params.subtitleId);
    if (!subtitle) {
      return res.status(404).json({ message: 'Subtitle not found' });
    }
    
    subtitle.approved = true;
    await song.save();
    
    // Notify the uploader
    await Notification.create({
      userId: subtitle.uploadedBy,
      type: 'song_approved',
      title: 'Subtitle Approved',
      message: `Your ${subtitle.language} subtitle for "${song.title}" has been approved`,
      relatedId: song._id,
      relatedModel: 'Song'
    });
    
    res.json({ message: 'Subtitle approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve song (Admin/Moderator)
// @route   PUT /api/songs/:id/approve
// @access  Private/Admin
const approveSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    song.status = req.body.status || 'approved';
    song.moderationNote = req.body.note || '';
    await song.save();
    
    // Notify the artist
    await Notification.create({
      userId: song.artistId,
      type: 'song_approved',
      title: song.status === 'approved' ? 'Song Approved!' : 'Song Rejected',
      message: song.status === 'approved' 
        ? `Your song "${song.title}" has been approved and is now live!`
        : `Your song "${song.title}" was rejected. Reason: ${req.body.note || 'Please check content guidelines'}`,
      relatedId: song._id,
      relatedModel: 'Song'
    });
    
    res.json({ message: `Song ${song.status}`, song });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};