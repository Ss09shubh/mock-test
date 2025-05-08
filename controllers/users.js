const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Create a new member (by admin)
// @route   POST /api/users
// @access  Private/Admin
exports.createMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, gender, phone, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user with member role
    user = new User({
      name,
      email,
      gender,
      phone,
      password,
      role: 'member',
      createdBy: req.user.id // Set the admin who created this member
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all members
// @route   GET /api/users/members
// @access  Private/Admin
exports.getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single member
// @route   GET /api/users/members/:id
// @access  Private/Admin
exports.getMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if user is a member
    if (member.role !== 'member') {
      return res.status(400).json({
        success: false,
        message: 'User is not a member'
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};