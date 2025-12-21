// backend/models/Request.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("./User");
const Branch = require("./Branch");

const Request = sequelize.define(
  "Request",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // maps to user_id
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ✅ NEW columns (as per your DB)
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    sub_category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "sub_category",
    },

    asset: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
      allowNull: false,
      defaultValue: "Medium",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ✅ allow more statuses if you want (recommended)
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Approved", "Rejected", "Completed", "Done"),
      allowNull: false,
      defaultValue: "Pending",
    },

    // ✅ MUST NOT be null (matches DB constraint)
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "branch_id",
    },

    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "device_id",
    },
  },
  {
    tableName: "requests",
    timestamps: true,
    underscored: true, // created_at, updated_at
  }
);

/* Associations */
Request.belongsTo(User, { foreignKey: "userId", as: "user" });
Request.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

User.hasMany(Request, { foreignKey: "userId", as: "requests" });
Branch.hasMany(Request, { foreignKey: "branchId", as: "requests" });

module.exports = Request;
