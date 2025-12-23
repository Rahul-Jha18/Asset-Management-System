// backend/models/Request.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("./User");
const Branch = require("./Branch");

const Request = sequelize.define(
  "Request",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },

    type: { type: DataTypes.STRING, allowNull: false },

    title: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },

    sub_category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "sub_category",
    },

    asset: { type: DataTypes.STRING, allowNull: true },

    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
      allowNull: false,
      defaultValue: "Medium",
    },

    description: { type: DataTypes.TEXT, allowNull: false },

    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Approved", "Rejected", "Completed", "Done"),
      allowNull: false,
      defaultValue: "Pending",
    },

    branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branch_id" },
    deviceId: { type: DataTypes.INTEGER, allowNull: true, field: "device_id" },

    // ✅ NEW PROFESSIONAL FIELDS (mapped to DB columns)
    requestedByName: { type: DataTypes.STRING, allowNull: true, field: "requested_by_name" },
    requestedByContact: { type: DataTypes.STRING, allowNull: true, field: "requested_by_contact" },

    purchaseDate: { type: DataTypes.DATEONLY, allowNull: true, field: "purchase_date" },
    warrantyExpiry: { type: DataTypes.DATEONLY, allowNull: true, field: "warranty_expiry" },

    invoiceNo: { type: DataTypes.STRING, allowNull: true, field: "invoice_no" },
    vendorName: { type: DataTypes.STRING, allowNull: true, field: "vendor_name" },

    province: { type: DataTypes.STRING, allowNull: true },
    district: { type: DataTypes.STRING, allowNull: true },
    localLevel: { type: DataTypes.STRING, allowNull: true, field: "local_level" },
    fiscalYear: { type: DataTypes.STRING, allowNull: true, field: "fiscal_year" },

    agreeAccuracy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "agree_accuracy",
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
