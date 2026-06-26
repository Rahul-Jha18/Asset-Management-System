// backend/config/companySqlServer.js
const sql = require("mssql");
require("dotenv").config();

const companySqlConfig = {
  user: process.env.COMPANY_SQL_USER,
  password: process.env.COMPANY_SQL_PASSWORD,
  server: process.env.COMPANY_SQL_HOST,
  database: process.env.COMPANY_SQL_DB || "nlicConsolidate",
  options: {
    encrypt: String(process.env.COMPANY_SQL_ENCRYPT || "false") === "true",
    trustServerCertificate: String(process.env.COMPANY_SQL_TRUST_CERT || "true") === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
};

let poolPromise = null;

const getCompanySqlPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(companySqlConfig);
  }

  return poolPromise;
};

module.exports = {
  sql,
  getCompanySqlPool,
};