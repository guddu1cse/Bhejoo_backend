const { ROLES } = require('../utils/constants');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      require('fs').appendFileSync('debug_logs.txt', `\n[${new Date().toISOString()}] Role Fail: UserRole=${req.user.role} Allowed=${JSON.stringify(allowedRoles)}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

const isAdmin = authorize(ROLES.ADMIN);
const isDeliveryMan = authorize(ROLES.DELIVERY_MAN);
const isUser = authorize(ROLES.USER);
const isAdminOrDeliveryMan = authorize(ROLES.ADMIN, ROLES.DELIVERY_MAN);

module.exports = {
  authorize,
  isAdmin,
  isDeliveryMan,
  isUser,
  isAdminOrDeliveryMan
};
