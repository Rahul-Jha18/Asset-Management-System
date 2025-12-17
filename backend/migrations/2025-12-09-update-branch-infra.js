const { sequelize } = require('../config/db');

/**
 * Migration script to update branch infra tables:
 * - Add new columns requested by user (scanner, projector, desktop, laptop, cctv, panel, ups)
 * - Optionally copy/backup IPs into new fields where reasonable
 * - Drop old IP columns where requested (attempts are tolerant and will continue on error)
 *
 * Usage: node backend/migrations/2025-12-09-update-branch-infra.js
 * NOTE: Make a database backup before running.
 */

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected — running infra migration');

    await sequelize.transaction(async (t) => {
      // ------- Scanners: add model, number, then drop scanner_ip -------
      try {
        await sequelize.query(`ALTER TABLE branch_scanners ADD COLUMN scanner_model VARCHAR(255)` , { transaction: t });
      } catch (err) { console.warn('scanner_model add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_scanners ADD COLUMN scanner_number VARCHAR(100)` , { transaction: t });
      } catch (err) { console.warn('scanner_number add skipped:', err.message); }
      // copy scanner_ip into scanner_number as a fallback (if non-empty)
      try {
        await sequelize.query(`UPDATE branch_scanners SET scanner_number = scanner_ip WHERE COALESCE(scanner_ip,'') <> ''`, { transaction: t });
      } catch (err) { console.warn('scanner_number update skipped:', err.message); }
      // drop old scanner_ip
      try {
        await sequelize.query(`ALTER TABLE branch_scanners DROP COLUMN scanner_ip`, { transaction: t });
      } catch (err) { console.warn('scanner_ip drop skipped:', err.message); }

      // ------- Projectors: add model, purchase_date, backup ip and drop projector_ip -------
      try {
        await sequelize.query(`ALTER TABLE branch_projectors ADD COLUMN projector_model VARCHAR(255)`, { transaction: t });
      } catch (err) { console.warn('projector_model add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_projectors ADD COLUMN projector_purchase_date DATETIME`, { transaction: t });
      } catch (err) { console.warn('projector_purchase_date add skipped:', err.message); }
      // backup old ip to a safe column before dropping
      try {
        await sequelize.query(`ALTER TABLE branch_projectors ADD COLUMN projector_old_ip VARCHAR(255)`, { transaction: t });
      } catch (err) { /* ignore */ }
      try {
        await sequelize.query(`UPDATE branch_projectors SET projector_old_ip = projector_ip WHERE COALESCE(projector_ip,'') <> ''`, { transaction: t });
      } catch (err) { console.warn('projector_old_ip update skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_projectors DROP COLUMN projector_ip`, { transaction: t });
      } catch (err) { console.warn('projector_ip drop skipped:', err.message); }

      // ------- Desktops: add purchase date & fiscal year -------
      try {
        await sequelize.query(`ALTER TABLE branch_desktops ADD COLUMN desktop_purchase_date DATETIME`, { transaction: t });
      } catch (err) { console.warn('desktop_purchase_date add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_desktops ADD COLUMN desktop_fiscal_year VARCHAR(20)`, { transaction: t });
      } catch (err) { console.warn('desktop_fiscal_year add skipped:', err.message); }

      // ------- Laptops: add purchase date & fiscal year -------
      try {
        await sequelize.query(`ALTER TABLE branch_laptops ADD COLUMN laptop_purchase_date DATETIME`, { transaction: t });
      } catch (err) { console.warn('laptop_purchase_date add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_laptops ADD COLUMN laptop_fiscal_year VARCHAR(20)`, { transaction: t });
      } catch (err) { console.warn('laptop_fiscal_year add skipped:', err.message); }

      // ------- CCTV: add camera ip and installed year -------
      try {
        await sequelize.query(`ALTER TABLE branch_cctv ADD COLUMN cctv_camera_ip VARCHAR(255)`, { transaction: t });
      } catch (err) { console.warn('cctv_camera_ip add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_cctv ADD COLUMN cctv_installed_year INT`, { transaction: t });
      } catch (err) { console.warn('cctv_installed_year add skipped:', err.message); }

      // ------- Panels (interactive panel): add name, brand, user, purchase_year -------
      try {
        await sequelize.query(`ALTER TABLE branch_panels ADD COLUMN panel_name VARCHAR(255)`, { transaction: t });
      } catch (err) { console.warn('panel_name add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_panels ADD COLUMN panel_brand VARCHAR(255)`, { transaction: t });
      } catch (err) { console.warn('panel_brand add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_panels ADD COLUMN panel_user VARCHAR(255)`, { transaction: t });
      } catch (err) { console.warn('panel_user add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_panels ADD COLUMN panel_purchase_year INT`, { transaction: t });
      } catch (err) { console.warn('panel_purchase_year add skipped:', err.message); }

      // ------- UPS / Inverter: add rating, battery_rating, purchase year -------
      try {
        await sequelize.query(`ALTER TABLE branch_infra ADD COLUMN ups_rating VARCHAR(100)`, { transaction: t });
      } catch (err) { console.warn('ups_rating add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_infra ADD COLUMN battery_rating VARCHAR(100)`, { transaction: t });
      } catch (err) { console.warn('battery_rating add skipped:', err.message); }
      try {
        await sequelize.query(`ALTER TABLE branch_infra ADD COLUMN ups_purchase_year INT`, { transaction: t });
      } catch (err) { console.warn('ups_purchase_year add skipped:', err.message); }

    });

    // Verification selects
    const [scannerRows] = await sequelize.query(`SELECT id, branchId, scanner_name, scanner_model, scanner_number FROM branch_scanners LIMIT 50`);
    const [projectorRows] = await sequelize.query(`SELECT id, branchId, projector_name, projector_model, projector_purchase_date, projector_old_ip FROM branch_projectors LIMIT 50`);
    const [desktopRows] = await sequelize.query(`SELECT id, branchId, desktop_purchase_date, desktop_fiscal_year FROM branch_desktops LIMIT 50`);
    const [laptopRows] = await sequelize.query(`SELECT id, branchId, laptop_purchase_date, laptop_fiscal_year FROM branch_laptops LIMIT 50`);
    const [cctvRows] = await sequelize.query(`SELECT id, branchId, cctv_camera_ip, cctv_installed_year FROM branch_cctv LIMIT 50`);
    const [panelRows] = await sequelize.query(`SELECT id, branchId, panel_name, panel_brand, panel_user, panel_purchase_year FROM branch_panels LIMIT 50`);
    const [infraRows] = await sequelize.query(`SELECT id, branchId, ups_rating, battery_rating, ups_purchase_year FROM branch_infra LIMIT 50`);

    console.log('\n--- Scanner sample rows ---'); console.table(scannerRows);
    console.log('\n--- Projector sample rows ---'); console.table(projectorRows);
    console.log('\n--- Desktop sample rows ---'); console.table(desktopRows);
    console.log('\n--- Laptop sample rows ---'); console.table(laptopRows);
    console.log('\n--- CCTV sample rows ---'); console.table(cctvRows);
    console.log('\n--- Panel sample rows ---'); console.table(panelRows);
    console.log('\n--- Infra (UPS) sample rows ---'); console.table(infraRows);

    console.log('Infra migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Infra migration failed:', err);
    process.exit(1);
  }
})();
