// backend/models/AssetMaintenanceLog.js
module.exports = (sequelize, DataTypes) => {
  const AssetMaintenanceLog = sequelize.define(
    "AssetMaintenanceLog",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      branchId: { type: DataTypes.INTEGER, allowNull: false, field: "branch_id" },
      section: { type: DataTypes.STRING(60), allowNull: false, field: "section" },
      assetId: { type: DataTypes.INTEGER, allowNull: false, field: "asset_id" },

      sub_category_code: { type: DataTypes.STRING(10), allowNull: true, field: "sub_category_code" },

      maintenance_type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "Repair", field: "maintenance_type" },
      issue_title: { type: DataTypes.STRING(255), allowNull: true, field: "issue_title" },
      issue_details: { type: DataTypes.TEXT, allowNull: true, field: "issue_details" },
      action_taken: { type: DataTypes.TEXT, allowNull: true, field: "action_taken" },

      vendor_name: { type: DataTypes.STRING(150), allowNull: true, field: "vendor_name" },
      ticket_no: { type: DataTypes.STRING(100), allowNull: true, field: "ticket_no" },

      start_date: { type: DataTypes.DATEONLY, allowNull: true, field: "start_date" },
      end_date: { type: DataTypes.DATEONLY, allowNull: true, field: "end_date" },
      downtime_hours: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "downtime_hours" },
      cost: { type: DataTypes.DECIMAL(14, 2), allowNull: true, field: "cost" },

      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "Open", field: "status" },

      created_by: { type: DataTypes.STRING(150), allowNull: true, field: "created_by" },
      remarks: { type: DataTypes.TEXT, allowNull: true, field: "remarks" },
    },
    {
      tableName: "asset_maintenance_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_asset_lookup", fields: ["branch_id", "section", "asset_id"] },
        { name: "idx_status", fields: ["status"] },
        { name: "idx_ticket", fields: ["ticket_no"] },
      ],
    }
  );

  AssetMaintenanceLog.associate = (models) => {
    AssetMaintenanceLog.belongsTo(models.Branch, { foreignKey: "branchId", as: "branch" });
  };

  return AssetMaintenanceLog;
};
