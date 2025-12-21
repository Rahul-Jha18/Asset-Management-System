const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// =========================
// PROTECT ROUTE (Require Login)
// =========================
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Load user with role + is_admin
      req.user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'is_admin'],
      });

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      return next();
    } catch (error) {
      console.error('AUTH ERROR:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token');
});


// =========================
// ADMIN ONLY
// =========================
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only' });
};


// =========================
// SUB ADMIN ONLY
// =========================
const subAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'subadmin') {
    return next();
  }
  return res.status(403).json({ message: 'SubAdmins only' });
};


// =========================
// ADMIN OR SUBADMIN (YOUR MAIN NEED)
// =========================
const adminOrSubAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.role === 'subadmin')
  ) {
    return next();
  }

  return res.status(403).json({
    message: 'Only Admin or SubAdmin can perform this action',
  });
};


// =========================
// EXPORT EVERYTHING
// =========================
module.exports = {
  protect,
  adminOnly,
  subAdminOnly,
  adminOrSubAdmin,
};