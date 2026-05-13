const bcrypt = require("bcryptjs");
const User = require("../models/User");

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "subadmin" || value === "sub_admin" || value === "sub-admin") {
    return "subadmin";
  }

  return "user";
};

exports.bulkImportUsers = async (req, res) => {
  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  try {
    const validUsers = users.filter((u) => u.name && u.email && u.password);

    if (!validUsers.length) {
      return res.status(400).json({ message: "No valid users found." });
    }

    const uniqueMap = new Map();
    validUsers.forEach((u) => {
      uniqueMap.set(String(u.email).trim().toLowerCase(), u);
    });
    const uniqueUsers = Array.from(uniqueMap.values());

    const emails = uniqueUsers.map((u) => String(u.email).trim().toLowerCase());

    const existingUsers = await User.findAll({
      where: { email: emails },
      attributes: ["email"],
    });

    const existingSet = new Set(
      existingUsers.map((u) => String(u.email).trim().toLowerCase())
    );

    const usersToInsert = uniqueUsers.filter(
      (u) => !existingSet.has(String(u.email).trim().toLowerCase())
    );

    if (!usersToInsert.length) {
      return res.status(400).json({
        message: "All users already exist.",
      });
    }

    const hashedData = await Promise.all(
      usersToInsert.map(async (u) => ({
        name: String(u.name).trim(),
        email: String(u.email).trim().toLowerCase(),
        password: await bcrypt.hash(String(u.password), 10),
        role: normalizeRole(u.role),
        is_admin: normalizeRole(u.role) === "admin",
        service_station_id:
          u.service_station_id === undefined || u.service_station_id === null || u.service_station_id === ""
            ? null
            : Number.isNaN(Number(u.service_station_id))
            ? null
            : Number(u.service_station_id),
      }))
    );

    await User.bulkCreate(hashedData);

    res.json({
      message: `${hashedData.length} users imported successfully.`,
    });
  } catch (err) {
    console.error("Bulk import error:", err);
    res.status(500).json({ message: err.message || "Import failed." });
  }
};