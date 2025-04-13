const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

// Middleware to protect routes - only logged in users can access
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is found, return unauthorized
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');

      // If user not found
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User with this token no longer exists'
        });
      }

      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route, token invalid'
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check for admin role
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};

// Middleware to check for host role
exports.host = (req, res, next) => {
  if (req.user && req.user.role === 'host') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'You need to be a host to access this feature. Apply to become a host first.'
    });
  }
}; 