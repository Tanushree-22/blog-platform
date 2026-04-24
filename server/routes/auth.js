const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidators,
  loginValidators,
  validate,
} = require('../middleware/validators');

// POST /api/auth/register
router.post('/register', registerValidators, validate, register);

// POST /api/auth/login
router.post('/login', loginValidators, validate, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
