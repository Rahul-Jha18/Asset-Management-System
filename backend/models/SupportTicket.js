const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SupportTicket = sequelize.define(
  "SupportTicket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    contact_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type: {
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
    },

    issue_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    requested_change: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    branch_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    asset_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    asset_label: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    location_note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
      allowNull: false,
      defaultValue: "Medium",
    },

    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Closed", "Forwarded"),
      allowNull: false,
      defaultValue: "Open",
    },

    assigned_to_role: {
      type: DataTypes.ENUM("support", "subadmin", "admin"),
      allowNull: false,
      defaultValue: "subadmin",
    },

    forwarded_remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    forwarded_by_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    forwarded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = SupportTicket;