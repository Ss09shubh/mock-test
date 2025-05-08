const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, gender, phone, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ 
        success: false,
        errors: [{ msg: 'User already exists' }] 
      });
    }

    // Create user
    user = new User({
      name,
      email,
      gender,
      phone,
      password,
      role: role || 'member'
    });

    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error' }]
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        errors: [{ msg: 'Invalid credentials' }] 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        errors: [{ msg: 'Invalid credentials' }] 
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error' }]
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error' }]
    });
  }
};