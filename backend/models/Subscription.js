const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  notifiedOfNewSongs: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate subscriptions
subscriptionSchema.index({ subscriberId: 1, artistId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);