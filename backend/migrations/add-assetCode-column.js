// Migration to add assetCode column to asset_transfers table
const db = require("../models");

async function addAssetCodeColumn() {
  try {
    console.log("🔧 Starting migration: Add assetCode column...");

    const queryInterface = db.sequelize.getQueryInterface();
    
    // Add the column if it doesn't exist
    try {
      await queryInterface.addColumn("asset_transfers", "assetCode", {
        type: db.Sequelize.STRING(50),
        allowNull: true,
        comment: "Unique asset code: FORMAT-ID (e.g., LAPTOP-1, DESKTOP-5)",
      });
      console.log("✅ assetCode column added");
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("Duplicate")) {
        console.log("✅ assetCode column already exists");
      } else {
        throw err;
      }
    }

    // Populate assetCode for existing records without codes
    console.log("📝 Populating assetCode for existing records...");
    const transfers = await db.AssetTransfer.findAll({
      where: { assetCode: null },
    });

    let updated = 0;
    for (const transfer of transfers) {
      const code = `${transfer.section?.toUpperCase() || "UNKNOWN"}-${transfer.assetId}`;
      await transfer.update({ assetCode: code });
      updated++;
    }

    if (updated > 0) {
      console.log(`✅ Populated assetCode for ${updated} records`);
    } else {
      console.log("✅ All records already have assetCode");
    }
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    // Don't crash - just log and continue
  }
}

module.exports = { addAssetCodeColumn };

