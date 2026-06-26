// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "_");

exports.protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: [
        "id",
        "sql_user_id",
        "name",
        "email",
        "role",
        "is_admin",
        "service_station_id",
        "img_url",
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
});

exports.allowRoles = (...roles) => {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};