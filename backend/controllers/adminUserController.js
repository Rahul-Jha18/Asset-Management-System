const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const ServiceStation = db.ServiceStation;

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "subadmin" || value === "sub_admin" || value === "sub-admin") {
    return "subadmin";
  }
  if (value === "user") return "user";

  return null;
};

const isAdminFlagFromRole = (role) => role === "admin";

// GET all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "is_admin",
      "service_station_id",
      "created_at",
      "updated_at",
    ],
    order: [["id", "DESC"]],
  });

  res.json({ data: users });
});

// CREATE user
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user", service_station_id } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    return res.status(400).json({ message: "Invalid role. Allowed: admin, subadmin, user" });
  }

  let serviceStationId = null;
  if (service_station_id !== undefined && service_station_id !== null && service_station_id !== "") {
    serviceStationId = Number(service_station_id);
    if (Number.isNaN(serviceStationId)) {
      return res.status(400).json({ message: "Invalid service_station_id" });
    }

    const station = await ServiceStation.findByPk(serviceStationId);
    if (!station) {
      return res.status(400).json({ message: "Invalid service station" });
    }
  }

  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: normalizedRole,
    is_admin: isAdminFlagFromRole(normalizedRole),
    service_station_id: serviceStationId,
  });

  res.status(201).json({
    message: "User created",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
      service_station_id: user.service_station_id || null,
    },
  });
});

// UPDATE user
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, service_station_id } = req.body || {};

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const payload = {};

  if (name !== undefined) {
    payload.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingEmailUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmailUser && Number(existingEmailUser.id) !== Number(id)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    payload.email = normalizedEmail;
  }

  if (role !== undefined) {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return res.status(400).json({ message: "Invalid role. Allowed: admin, subadmin, user" });
    }

    payload.role = normalizedRole;
    payload.is_admin = isAdminFlagFromRole(normalizedRole);
  }

  if (service_station_id !== undefined) {
    let serviceStationId = null;
    if (service_station_id !== null && service_station_id !== "") {
      serviceStationId = Number(service_station_id);
      if (Number.isNaN(serviceStationId)) {
        return res.status(400).json({ message: "Invalid service_station_id" });
      }

      const station = await ServiceStation.findByPk(serviceStationId);
      if (!station) {
        return res.status(400).json({ message: "Invalid service station" });
      }
    }
    payload.service_station_id = serviceStationId;
  }

  if (password !== undefined && String(password).trim() !== "") {
    payload.password = await bcrypt.hash(String(password), 10);
  }

  await user.update(payload);

  res.json({
    message: "User updated",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
      service_station_id: user.service_station_id || null,
    },
  });
});

// DELETE user
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (Number(req.user?.id) === Number(id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.destroy();
  res.json({ message: "User deleted" });
});