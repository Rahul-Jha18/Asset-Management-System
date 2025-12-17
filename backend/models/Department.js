// backend/models/Department.js
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    "Department",
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "departments",
      timestamps: false,
    }
  );

  Department.associate = (models) => {
    Department.hasMany(models.Asset, {
      foreignKey: "departmentId",
      as: "assets",
    });
  };

  return Department;
};
