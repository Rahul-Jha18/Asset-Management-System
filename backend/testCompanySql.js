require("dotenv").config();

console.log("HOST:", process.env.COMPANY_SQL_HOST);
console.log("DB:", process.env.COMPANY_SQL_DB);
console.log("USER:", process.env.COMPANY_SQL_USER);
console.log("PASSWORD LOADED:", process.env.COMPANY_SQL_PASSWORD ? "YES" : "NO");

const { getCompanySqlPool } = require("./config/companySqlServer");

async function test() {
  try {
    const pool = await getCompanySqlPool();

    const result = await pool.request().query(`
      SELECT 
        @@SERVERNAME AS ServerName,
        DB_NAME() AS CurrentDatabase,
        SYSTEM_USER AS SystemUser
    `);

    console.log("SQL Server connected successfully");
    console.log(result.recordset);

    process.exit(0);
  } catch (err) {
    console.error("SQL Server connection failed");
    console.error(err.message);
    process.exit(1);
  }
}

test();