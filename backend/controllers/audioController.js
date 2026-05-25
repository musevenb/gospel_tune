const { upload, getFileUrl, deleteFile, getFilePath } = require('../config/localStorage');
const path = require('path');

// @desc    Upload audio file
// @route   POST /api/audio/upload
// @access  Private
const uploadAudio = (req, res) => {
  const uploadSingle = upload.single('audio');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    
    const audioUrl = `/api/audio/file/${req.file.filename}`;
    
    res.json({
      message: 'Audio file uploaded successfully',
      filename: req.file.filename,
      audioUrl: audioUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
};

// @desc    Get audio file by filename
// @route   GET /api/audio/file/:filename
// @access  Public
const getAudio = (req, res) => {
  const filePath = getFilePath(req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).json({ message: 'File not found' });
    }
  });
};

// @desc    Delete audio file
// @route   DELETE /api/audio/:filename
// @access  Private/Admin
const deleteAudio = async (req, res) => {
  try {
    const deleted = deleteFile(req.params.filename);
    if (!deleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ message: 'Audio file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadAudio,
  getAudio,
  deleteAudio
};