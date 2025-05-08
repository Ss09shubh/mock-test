const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { redirectIfAuthenticated } = require('../../middleware/web/auth');
const { registerValidation, loginValidation } = require('../../validation');

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('pages/auth/login', {
    title: 'Login'
  });
});

// Register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('pages/auth/register', {
    title: 'Register'
  });
});

// Register handle
router.post('/register', registerValidation, async (req, res) => {
  const { name, email, gender, phone, password, role } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      req.flash('error_msg', 'Email is already registered');
      return res.render('pages/auth/register', {
        title: 'Register',
        name,
        email,
        gender,
        phone,
        role
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'member'];
    const userRole = validRoles.includes(role) ? role : 'member'; // Default to member if invalid role
    
    // Create new user
    user = new User({
      name,
      email,
      gender,
      phone,
      password,
      role: userRole
    });
    
    await user.save();
    
    // Create token and log the user in automatically
    const token = user.getSignedJwtToken();
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true
    });
    
    req.flash('success_msg', `Registration successful! Welcome to the dashboard. You are registered as ${userRole === 'admin' ? 'an admin' : 'a member'}.`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    
    // Check for specific MongoDB errors
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(err.errors).map(val => val.message);
      req.flash('error_msg', messages[0]);
    } else if (err.code === 11000) {
      // Duplicate key error
      req.flash('error_msg', 'Email already exists');
    } else {
      // Generic error
      req.flash('error_msg', 'Registration failed. Please try again.');
    }
    
    res.render('pages/auth/register', {
      title: 'Register',
      name,
      email,
      gender,
      phone,
      role
    });
  }
});

// Login handle
router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');
      return res.render('pages/auth/login', {
        title: 'Login',
        email
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.render('pages/auth/login', {
        title: 'Login',
        email
      });
    }
    
    // Create token
    const token = user.getSignedJwtToken();
    
    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true
    });
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'Login failed. Please try again.');
    res.render('pages/auth/login', {
      title: 'Login',
      email
    });
  }
});

// Logout handle
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success_msg', 'You are logged out');
  res.redirect('/auth/login');
});

module.exports = router;