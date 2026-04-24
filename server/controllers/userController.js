const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

/**
 * @route  GET /api/users/:id
 * @desc   Get public user profile
 * @access Public
 */
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -savedPosts');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get user's published posts count
  const postCount = await Post.countDocuments({ author: user._id, isPublished: true });

  res.json({
    success: true,
    data: { ...user.toObject(), postCount },
  });
};

/**
 * @route  PUT /api/users/profile
 * @desc   Update current user's profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
    },
  });
};

/**
 * @route  PUT /api/users/password
 * @desc   Update password
 * @access Private
 */
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
};

/**
 * @route  GET /api/users/:id/posts
 * @desc   Get all posts by a specific user
 * @access Public
 */
const getUserPosts = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find({ author: req.params.id, isPublished: true })
      .populate('author', 'name avatar')
      .select('-content -comments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments({ author: req.params.id, isPublished: true }),
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

/**
 * @route  POST /api/users/save/:postId
 * @desc   Save or unsave a post
 * @access Private
 */
const toggleSavePost = async (req, res) => {
  const user = await User.findById(req.user._id);
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  const isSaved = user.savedPosts.map((id) => id.toString()).includes(postId);

  if (isSaved) {
    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
  } else {
    user.savedPosts.push(postId);
  }

  await user.save();

  res.json({
    success: true,
    message: isSaved ? 'Post unsaved' : 'Post saved',
    isSaved: !isSaved,
  });
};

module.exports = {
  getUserProfile,
  updateProfile,
  updatePassword,
  getUserPosts,
  toggleSavePost,
};
