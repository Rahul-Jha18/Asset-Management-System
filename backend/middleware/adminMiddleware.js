// backend/middleware/adminMiddleware.js

// Normalize role so "Admin", "sub-admin", "SUB ADMIN", "sub_admin" all work
const normRole = (role) =>
  String(role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "") // remove spaces, underscores, hyphens
    .trim();

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
