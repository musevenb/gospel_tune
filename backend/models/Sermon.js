const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a sermon title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  preacher: {
    type: String,
    required: [true, 'Please add preacher name']
  },
  preacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    default: null
  },
  type: {
    type: String,
    enum: ['sermon', 'documentary', 'song_history', 'bible_study', 'testimony'],
    default: 'sermon'
  },
  audioUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Sermon'
  },
  content: {
    type: String,
    required: [true, 'Please add sermon content'],
    maxlength: 5000
  },
  scriptureReferences: [{
    book: String,
    chapter: Number,
    verse: String,
    text: String
  }],
  duration: {
    type: Number,
    default: 0
  },
  tags: [String],
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'featured'],
    default: 'pending'
  },
  language: {
    type: String,
    default: 'English'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create text index for search
sermonSchema.index({ title: 'text', description: 'text', preacher: 'text' });

module.exports = mongoose.model('Sermon', sermonSchema);