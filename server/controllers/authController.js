const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
const register = async (req, res) => {
  const { name, email, password, bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  // Create user (password hashed by pre-save hook)
  const user = await User.create({ name, email, password, bio });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @route  POST /api/auth/login
 * @desc   Login user and return JWT
 * @access Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field (select: false by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @route  GET /api/auth/me
 * @desc   Get current logged-in user
 * @access Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user,
  });
};

module.exports = { register, login, getMe };
