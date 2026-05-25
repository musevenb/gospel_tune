const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a song title'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Please add artist name'],
    trim: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  album: {
    type: String,
    default: 'Single'
  },
  genre: {
    type: String,
    enum: ['Gospel', 'Worship', 'Praise', 'Contemporary Gospel', 'Traditional Gospel'],
    default: 'Gospel'
  },
  duration: {
    type: Number,
    default: 0
  },
  audioUrl: {
    type: String,
    required: [true, 'Please add audio URL']
  },
  albumArt: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=Gospel+Tune'
  },
  subtitles: [{
    language: String,
    fileUrl: String,
    content: String, // LRC or VTT format
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved: { type: Boolean, default: false }
  }],
  lyrics: {
    type: String,
    default: null
  },
  lyricsType: {
    type: String,
    enum: ['lrc', 'plain', 'vtt', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'featured'],
    default: 'pending'
  },
  moderationNote: String,
  releaseDate: {
    type: Date,
    default: Date.now
  },
  stats: {
    likes: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  tags: [String],
  language: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true
});

// Create text index for search
songSchema.index({ title: 'text', artist: 'text', tags: 'text' });

module.exports = mongoose.model('Song', songSchema);