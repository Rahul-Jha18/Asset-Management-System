// backend/migrations/[TIMESTAMP]-create-asset-history.js
// Replace [TIMESTAMP] with current timestamp like 20260209100000
// Run with: npx sequelize-cli db:migrate

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("asset_history", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        index: true,
      },
      assetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        index: true,
      },
      assetType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "e.g., laptop, desktop, printer, software, etc.",
      },
      changeType: {
        type: Sequelize.ENUM("CREATE", "UPDATE", "DELETE", "TRANSFER", "MAINTENANCE"),
        defaultValue: "UPDATE",
      },
      fieldName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "The field that was changed",
      },
      oldValue: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
        comment: "Previous value (serialized if needed)",
      },
      newValue: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
        comment: "New value (serialized if needed)",
      },
      changedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "User ID who made the change",
      },
      changedByName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Human-readable description of the change",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Additional metadata about the change",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });

    // Create composite index for common queries
    await queryInterface.addIndex("asset_history", ["branchId", "assetId"], {
      name: "idx_branch_asset",
    });

    // Index for type-based queries
    await queryInterface.addIndex("asset_history", ["assetType", "changeType"], {
      name: "idx_type_change",
    });

    // Index for time-based queries
    await queryInterface.addIndex("asset_history", ["createdAt"], {
      name: "idx_created",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("asset_history");
  },
};
