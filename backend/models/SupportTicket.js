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

    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Resolved"),
      defaultValue: "Open",
    },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false, // IMPORTANT
  }
);

module.exports = SupportTicket;
