const Comment = require('../models/Comment');
const Song = require('../models/Song');
const Notification = require('../models/Notification');

// @desc    Get comments for a song
// @route   GET /api/comments/:songId
// @access  Public
const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'latest'; // latest, most_liked
    const skip = (page - 1) * limit;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'most_liked') {
      sortOption = { likeCount: -1, createdAt: -1 };
    }
    
    const comments = await Comment.find({ songId: req.params.songId })
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments({ songId: req.params.songId });
    
    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a song
// @route   POST /api/comments/:songId
// @access  Private
const addComment = async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    const comment = await Comment.create({
      songId: req.params.songId,
      userId: req.user._id,
      username: req.user.username,
      userAvatar: req.user.profilePicture,
      text: req.body.text
    });
    
    // Update song comment count
    song.stats.comments += 1;
    await song.save();
    
    // Notify song artist
    if (song.artistId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: song.artistId,
        type: 'comment',
        title: 'New Comment on Your Song',
        message: `${req.user.username} commented on "${song.title}"`,
        relatedId: comment._id,
        relatedModel: 'Comment',
        metadata: { songId: song._id, songTitle: song.title }
      });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const alreadyLiked = comment.likes.some(like => like.userId.toString() === req.user._id.toString());
    
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(like => like.userId.toString() !== req.user._id.toString());
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push({ userId: req.user._id, likedAt: new Date() });
      comment.likeCount += 1;
    }
    
    await comment.save();
    
    res.json({ liked: !alreadyLiked, likeCount: comment.likeCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
const replyToComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const reply = {
      userId: req.user._id,
      username: req.user.username,
      userAvatar: req.user.profilePicture,
      text: req.body.text,
      createdAt: new Date()
    };
    
    comment.replies.push(reply);
    await comment.save();
    
    // Notify original commenter
    if (comment.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: comment.userId,
        type: 'reply',
        title: 'Someone Replied to Your Comment',
        message: `${req.user.username} replied to your comment`,
        relatedId: comment._id,
        relatedModel: 'Comment'
      });
    }
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (owner or admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update song comment count
    const song = await Song.findById(comment.songId);
    if (song) {
      song.stats.comments = Math.max(0, song.stats.comments - 1);
      await song.save();
    }
    
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComments,
  addComment,
  likeComment,
  replyToComment,
  deleteComment
};