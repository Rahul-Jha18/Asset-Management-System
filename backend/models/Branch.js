const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Branch = sequelize.define(
  "Branch",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    name: { 
      type: DataTypes.STRING(255), 
      allowNull: false, 
      unique: true 
    },
    manager_name: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
    gateway: { 
      type: DataTypes.STRING(45), 
      allowNull: true 
    },
    contact: { 
      type: DataTypes.STRING(20), 
      allowNull: true 
    },
    branch_code: {  // ✅ Make sure this exists
      type: DataTypes.STRING(20), 
      allowNull: true,
      unique: true  // Optional: if you want it unique
    },
    region: {
      type: DataTypes.ENUM(
        "Koshi Pradesh",
        "Madhesh Pradesh",
        "Bagmati Pradesh",
        "Gandaki Pradesh",
        "Lumbini Pradesh",
        "Karnali Pradesh",
        "Sudurpashchim Pradesh"
      ),
      allowNull: false,
    },
    remarks: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    service_station_id: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    excel_id: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
  },
  {
    tableName: "branches",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Branch;