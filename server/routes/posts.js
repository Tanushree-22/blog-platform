const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPopularTags,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { postValidators, commentValidator, validate } = require('../middleware/validators');

// Public routes
router.get('/', getPosts);
router.get('/tags/popular', getPopularTags);
router.get('/:slug', optionalAuth, getPostBySlug);

// Protected routes
router.post('/', protect, postValidators, validate, createPost);
router.put('/:id', protect, postValidators, validate, updatePost);
router.delete('/:id', protect, deletePost);

// Like
router.post('/:id/like', protect, toggleLike);

// Comments
router.post('/:id/comments', protect, commentValidator, validate, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
