// backend/models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      userId: { type: DataTypes.INTEGER, allowNull: true, field: "user_id" },

      title: { type: DataTypes.STRING(200), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },

      type: {
        type: DataTypes.ENUM("expiry", "info", "warning", "success", "error"),
        allowNull: false,
        defaultValue: "info",
      },

      entityType: { type: DataTypes.STRING(50), allowNull: true, field: "entity_type" },
      entityId: { type: DataTypes.INTEGER, allowNull: true, field: "entity_id" },
      expiryDate: { type: DataTypes.DATEONLY, allowNull: true, field: "expiry_date" },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true, field: "due_date" },
      uniqKey: { type: DataTypes.STRING(120), allowNull: true, unique: true, field: "uniq_key" },

      is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

      meta: { type: DataTypes.JSON, allowNull: true },
      link: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: "notifications",
      timestamps: true,
      underscored: true,
    }
  );

  return Notification;
};
