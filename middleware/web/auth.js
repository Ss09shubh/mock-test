const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Ensure user is authenticated for web routes
exports.ensureAuthenticated = async (req, res, next) => {
  try {
    // Check if token exists in cookies
    const token = req.cookies.token;
    
    if (!token) {
      req.flash('error_msg', 'Please log in to access this resource');
      return res.redirect('/auth/login');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/auth/login');
    }
    
    // Set user in request
    req.user = user;
    res.locals.user = user;
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    req.flash('error_msg', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
};

// Ensure user is an admin
exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  req.flash('error_msg', 'Access denied. Admin privileges required.');
  res.redirect('/dashboard');
};

// Ensure user is a member
exports.ensureMember = (req, res, next) => {
  if (req.user && req.user.role === 'member') {
    return next();
  }
  
  req.flash('error_msg', 'Access denied. Member privileges required.');
  res.redirect('/dashboard');
};

// Redirect if authenticated
exports.redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return next();
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        res.clearCookie('token');
        return next();
      }
      
      try {
        // Check if user exists
        const user = await User.findById(decoded.id);
        if (user) {
          return res.redirect('/dashboard');
        }
        next();
      } catch (error) {
        console.error('Auth middleware error:', error);
        next();
      }
    });
  } catch (err) {
    console.error('Auth redirect error:', err);
    next();
  }
};