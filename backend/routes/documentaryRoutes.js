const express = require('express');
const router = express.Router();
const {
  getDocumentaryBySong,
  createDocumentary,
  updateDocumentary,
  deleteDocumentary
} = require('../controllers/documentaryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:songId', getDocumentaryBySong);
router.post('/', protect, admin, createDocumentary);
router.put('/:id', protect, admin, updateDocumentary);
router.delete('/:id', protect, admin, deleteDocumentary);

module.exports = router;