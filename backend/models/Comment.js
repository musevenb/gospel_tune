const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userAvatar: String,
  text: {
    type: String,
    required: [true, 'Please add comment text'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  likes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  replies: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    userAvatar: String,
    text: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
commentSchema.index({ songId: 1, createdAt: -1 });
commentSchema.index({ songId: 1, likeCount: -1 });

module.exports = mongoose.model('Comment', commentSchema);