const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'reply', 'subscription', 'song_approved', 'song_rejected', 'new_song'],
    required: true
  },
  title: String,
  message: String,
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Song', 'Comment', 'User']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);