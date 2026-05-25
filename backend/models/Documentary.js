const mongoose = require('mongoose');

const documentarySchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    unique: true // One documentary per song
  },
  title: {
    type: String,
    required: [true, 'Please add a documentary title']
  },
  historicalBackground: {
    type: String,
    required: [true, 'Please add historical background']
  },
  sermonNotes: {
    type: String,
    default: ''
  },
  relatedScripture: [{
    type: String,
    default: []
  }],
  videoUrl: {
    type: String, // YouTube or Vimeo embed URL
    default: null
  },
  audioSermonUrl: {
    type: String,
    default: null
  },
  theologianNotes: {
    type: String,
    default: ''
  },
  writtenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Documentary', documentarySchema);