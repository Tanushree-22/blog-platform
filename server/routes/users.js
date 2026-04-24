const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updatePassword,
  getUserPosts,
  toggleSavePost,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/:id', getUserProfile);
router.get('/:id/posts', getUserPosts);

// Protected
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/save/:postId', protect, toggleSavePost);

module.exports = router;
