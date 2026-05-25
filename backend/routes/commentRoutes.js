const express = require('express');
const router = express.Router();
const {
  getComments,
  addComment,
  likeComment,
  replyToComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:songId', getComments);
router.post('/:songId', protect, addComment);
router.post('/:id/like', protect, likeComment);
router.post('/:id/reply', protect, replyToComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;