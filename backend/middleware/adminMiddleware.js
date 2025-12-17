// backend/middleware/adminMiddleware.js

// Admin OR Subadmin: can create/update/etc. (no deletes)
exports.adminOrSubadmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role === 'admin' || req.user.role === 'subadmin') { // <-- no dash
    return next();
  }

  return res.status(403).json({ message: 'Access denied' });
};

// ONLY Admin: allowed to delete
exports.adminOnlyDelete = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Only admin can delete' });
};

exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
