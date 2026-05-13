exports.adminOrSubadminOrSupport = (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin" || role === "subadmin" || role === "support") {
    return next();
  }

  return res.status(403).json({ message: "Not authorized" });
};
