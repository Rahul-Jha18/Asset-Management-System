const { sequelize } = require('../config/db');


(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected — running migration');

    await sequelize.transaction(async (t) => {
      // 1) Add new columns (if not exists)
      await sequelize.query(`
        ALTER TABLE branch_printers
        ADD COLUMN IF NOT EXISTS printer_type ENUM('USB','Network') DEFAULT 'USB',
        ADD COLUMN IF NOT EXISTS printer_status ENUM('Active','Down') DEFAULT 'Active';
      `, { transaction: t });

      // 2) Populate based on old data
      await sequelize.query(`
        UPDATE branch_printers
        SET 
          printer_type = CASE 
            WHEN COALESCE(printer_ip, '') <> '' THEN 'Network'
            ELSE 'USB'
          END,
          printer_status = CASE 
            WHEN COALESCE(remarks, '') LIKE '%Down%' THEN 'Down'
            ELSE 'Active'
          END;
      `, { transaction: t });

      // 3) Drop old columns if they exist
      // Note: MySQL doesn't support DROP COLUMN IF EXISTS prior to v8; we'll attempt drops safely.
      const dropStatements = [
        "ALTER TABLE branch_printers DROP COLUMN printer_3in1",
        "ALTER TABLE branch_printers DROP COLUMN remarks",
        "ALTER TABLE branch_printers DROP COLUMN printer_total_no",
        "ALTER TABLE branch_printers DROP COLUMN printer_ip",
      ];

      for (const stmt of dropStatements) {
        try {
          await sequelize.query(stmt, { transaction: t });
        } catch (err) {
          // If column doesn't exist, ignore the error
          console.warn('Could not run:', stmt, ' — ', err.message);
        }
      }

    });

    // 4) Verify — simple select
    const [results] = await sequelize.query(`
      SELECT printer_id, printer_name, printer_model, printer_type, printer_status, createdAt, updatedAt
      FROM branch_printers
      LIMIT 200;
    `);

    console.log('Verification rows (showing up to 200):');
    console.table(results);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
