const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/mysql/User.model');
const fs = require('fs');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      require('fs').appendFileSync('debug_logs.txt', `\n[${new Date().toISOString()}] Auth: No Token`);
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    require('fs').appendFileSync('debug_logs.txt', `\n[${new Date().toISOString()}] Auth Decoded: ${JSON.stringify(decoded)}`);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid token.'
    });
  }
};

module.exports = authenticate;
