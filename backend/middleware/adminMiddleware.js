// backend/middleware/adminMiddleware.js

// Normalize role so "Admin", "sub-admin", "SUBADMIN" all work
const normRole = (role) => (role || "").toLowerCase().replace(/-/g, "").trim();

exports.adminOrSubadmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const role = normRole(req.user.role);

  if (role === "admin" || role === "subadmin") {
    return next();
  }

  return res.status(403).json({ message: "Access denied (Admin/SubAdmin only)" });
};

exports.adminOnlyDelete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const role = normRole(req.user.role);

  if (role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Only admin can delete" });
};

exports.allowRoles = (...roles) => {
  // roles passed should be normalized already like: 'admin', 'subadmin'
  const allowed = roles.map(normRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const role = normRole(req.user.role);

    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
