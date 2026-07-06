require("dotenv").config();

console.log("HOST:", process.env.COMPANY_SQL_HOST);
console.log("DB:", process.env.COMPANY_SQL_DB);
console.log("USER:", process.env.COMPANY_SQL_USER);
console.log("PASSWORD LOADED:", process.env.COMPANY_SQL_PASSWORD ? "YES" : "NO");

const { getCompanySqlPool } = require("./config/companySqlServer");

async function test() {
  try {
    const pool = await getCompanySqlPool();

    const connectionResult = await pool.request().query(`
      SELECT 
        @@SERVERNAME AS ServerName,
        DB_NAME() AS CurrentDatabase,
        SYSTEM_USER AS SystemUser
    `);

    console.log("SQL Server connected successfully");
    console.log(connectionResult.recordset);

    const userResult = await pool.request().query(`
      SELECT TOP 10
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
      ORDER BY UserId DESC
    `);

    console.log("nlicUsers table read successfully");
    console.table(userResult.recordset);

    process.exit(0);
  } catch (err) {
    console.error("SQL Server test failed");
    console.error(err.message);
    process.exit(1);
  }
}

test();