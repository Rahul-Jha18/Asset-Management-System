const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SupportReply = sequelize.define(
  "SupportReply",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sender_role: {
      type: DataTypes.ENUM("user", "support", "subadmin", "admin"),
      allowNull: false,
      defaultValue: "support",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "support_replies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = SupportReply;