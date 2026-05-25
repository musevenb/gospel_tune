const Documentary = require('../models/Documentary');
const Song = require('../models/Song');

// @desc    Get documentary for a song
// @route   GET /api/documentary/:songId
// @access  Public
const getDocumentaryBySong = async (req, res) => {
  try {
    const documentary = await Documentary.findOne({ songId: req.params.songId })
      .populate('writtenBy', 'username')
      .populate('songId', 'title artist');
    
    if (!documentary) {
      return res.status(404).json({ 
        message: 'No documentary found for this song yet' 
      });
    }
    
    res.json(documentary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create documentary for a song
// @route   POST /api/documentary
// @access  Private/Admin
const createDocumentary = async (req, res) => {
  try {
    const { songId, title, historicalBackground, sermonNotes, relatedScripture, videoUrl, audioSermonUrl, theologianNotes } = req.body;
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Check if documentary already exists
    const existingDoc = await Documentary.findOne({ songId });
    if (existingDoc) {
      return res.status(400).json({ message: 'Documentary already exists for this song' });
    }
    
    const documentary = await Documentary.create({
      songId,
      title,
      historicalBackground,
      sermonNotes,
      relatedScripture,
      videoUrl,
      audioSermonUrl,
      theologianNotes,
      writtenBy: req.user._id
    });
    
    res.status(201).json(documentary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update documentary
// @route   PUT /api/documentary/:id
// @access  Private/Admin
const updateDocumentary = async (req, res) => {
  try {
    const documentary = await Documentary.findById(req.params.id);
    
    if (!documentary) {
      return res.status(404).json({ message: 'Documentary not found' });
    }
    
    const updatedDoc = await Documentary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete documentary
// @route   DELETE /api/documentary/:id
// @access  Private/Admin
const deleteDocumentary = async (req, res) => {
  try {
    const documentary = await Documentary.findById(req.params.id);
    
    if (!documentary) {
      return res.status(404).json({ message: 'Documentary not found' });
    }
    
    await documentary.deleteOne();
    res.json({ message: 'Documentary removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDocumentaryBySong,
  createDocumentary,
  updateDocumentary,
  deleteDocumentary
};