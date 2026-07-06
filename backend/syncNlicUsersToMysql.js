require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { getCompanySqlPool } = require("./config/companySqlServer");
const db = require("./models");

const User = db.User;

function clean(value) {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();

  if (!text) return null;
  if (text.toLowerCase() === "null") return null;

  return text;
}

function cleanEmail(value) {
  const email = clean(value);
  if (!email) return null;

  return email.toLowerCase();
}

function isYes(value) {
  if (value === true || value === 1) return true;

  const text = String(value || "").trim().toLowerCase();

  return text === "y" || text === "yes" || text === "true" || text === "1";
}

function decideRole(row) {
  if (isYes(row.IsSysAdmin)) {
    return "admin";
  }

  if (isYes(row.IsCorpAdmin) || isYes(row.IsRegionalAdmin)) {
    return "corp_user";
  }

  if (
    isYes(row.Is_Branch_Manager) ||
    isYes(row.Is_Branch_Admin) ||
    isYes(row.Is_Sub_Branch_Admin)
  ) {
    return "subadmin";
  }

  return "user";
}

function isInactiveUser(row) {
  return (
    isYes(row.IsBlocked) ||
    isYes(row.BlockForWeb) ||
    isYes(row.IsLocked) ||
    isYes(row.Is_Resigned)
  );
}

async function sync() {
  try {
    await db.sequelize.authenticate();
    console.log("MySQL connected successfully");

    const pool = await getCompanySqlPool();
    console.log("SQL Server connected successfully");

    const result = await pool.request().query(`
      SELECT
        UserId,
        Name,
        Email,
        BrCode,
        EmpCode,
        ContactNo,
        Designation,
        IsBlocked,
        BlockForWeb,
        IsLocked,
        Is_Resigned,
        IsSysAdmin,
        IsCorpAdmin,
        IsRegionalAdmin,
        Is_Branch_Manager,
        Is_Branch_Admin,
        Is_Sub_Branch_Admin
      FROM nlicConsolidate.dbo.nlicUsers
      WHERE Email IS NOT NULL
        AND LTRIM(RTRIM(Email)) <> ''
        AND LOWER(LTRIM(RTRIM(Email))) <> 'null'
    `);

    console.log(`Total SQL users found: ${result.recordset.length}`);

    const defaultPassword = await bcrypt.hash("NepalLife@123", 10);

    let created = 0;
    let updated = 0;
    let skippedInactive = 0;
    let skippedInvalidEmail = 0;

    for (const row of result.recordset) {
      const email = cleanEmail(row.Email);

      if (!email || !email.includes("@")) {
        skippedInvalidEmail++;
        continue;
      }

      if (isInactiveUser(row)) {
        skippedInactive++;
        continue;
      }

      const sqlUserId = clean(row.UserId);
      const name = clean(row.Name) || email;
      const role = decideRole(row);

      const payload = {
        sql_user_id: sqlUserId,
        name,
        email,
        role,
        is_admin: role === "admin",
        br_code: clean(row.BrCode),
        emp_code: clean(row.EmpCode),
        mobile: clean(row.ContactNo),
        designation: clean(row.Designation),
      };

      const existing = await User.findOne({
        where: {
          [Op.or]: [
            { email },
            sqlUserId ? { sql_user_id: sqlUserId } : { email },
          ],
        },
      });

      if (existing) {
        await existing.update(payload);
        updated++;
      } else {
        await User.create({
          ...payload,
          password: defaultPassword,
        });
        created++;
      }
    }

    console.log("NLIC user sync completed");
    console.table({
      created,
      updated,
      skippedInactive,
      skippedInvalidEmail,
      totalFromSql: result.recordset.length,
    });

    process.exit(0);
  } catch (err) {
    console.error("NLIC user sync failed");
    console.error(err);
    process.exit(1);
  }
}

sync();