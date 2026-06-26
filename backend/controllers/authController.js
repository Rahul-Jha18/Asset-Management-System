// backend/controllers/authController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validate } = require("../utils/validators");
const { sendSuccess, sendError } = require("../utils/response");
const { sendMail } = require("../utils/mailer");

const { sql, getCompanySqlPool } = require("../config/companySqlServer");

/* ===========================
   HELPER: Generate 6-digit OTP
=========================== */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ===========================
   HELPER: Normalize role
=========================== */
const normalizeRole = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  if (value === "admin") return "admin";

  if (value === "subadmin" || value === "sub_admin") {
    return "subadmin";
  }

  if (value === "corp_user" || value === "corpuser") {
    return "corp_user";
  }

  if (value === "user") return "user";

  return "user";
};

/* ===========================
   HELPER: Safe SQL identifier

   This is only for table/column names from .env.
   Query values still use parameter binding.
=========================== */
const safeSqlIdentifier = (value, fallback) => {
  const v = String(value || fallback || "").trim();

  if (!/^[a-zA-Z0-9_.\[\]]+$/.test(v)) {
    return fallback;
  }

  return v;
};

/* ===========================
   HELPER: Find user from nlicConsolidate.dbo.nlicUser

   Default expected columns:
   - UserId
   - Email
   - UserName

   If actual SQL Server columns are different, update only .env:
   COMPANY_SQL_ID_COLUMN
   COMPANY_SQL_EMAIL_COLUMN
   COMPANY_SQL_NAME_COLUMN
=========================== */
const findNlicUserByEmail = async (email) => {
  const pool = await getCompanySqlPool();

  const tableName = safeSqlIdentifier(
    process.env.COMPANY_SQL_USER_TABLE,
    "dbo.nlicUser"
  );

  const idColumn = safeSqlIdentifier(
    process.env.COMPANY_SQL_ID_COLUMN,
    "UserId"
  );

  const emailColumn = safeSqlIdentifier(
    process.env.COMPANY_SQL_EMAIL_COLUMN,
    "Email"
  );

  const nameColumn = safeSqlIdentifier(
    process.env.COMPANY_SQL_NAME_COLUMN,
    "UserName"
  );

  const normalizedEmail = String(email || "").trim().toLowerCase();

  const result = await pool
    .request()
    .input("email", sql.NVarChar, normalizedEmail)
    .query(`
      SELECT TOP 1
        ${idColumn} AS SqlUserId,
        ${emailColumn} AS Email,
        ${nameColumn} AS FullName,
        *
      FROM ${tableName}
      WHERE LOWER(${emailColumn}) = LOWER(@email)
    `);

  return result.recordset[0] || null;
};

/* ===========================
   REGISTER USER
=========================== */
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, is_admin = 0, role } = req.body || {};

  const { isValid, errors } = validate.registerInput(name, email, password);
  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const normalizedEmail = String(email || "").trim().toLowerCase();

  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) return sendError(res, "User already exists", 409);

  const normalizedRole = is_admin ? "admin" : normalizeRole(role);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: normalizedRole,
    is_admin: normalizedRole === "admin",
  });

  return sendSuccess(
    res,
    {
      id: user.id,
      sql_user_id: user.sql_user_id || null,
      name: user.name,
      email: user.email,
      role: user.role,
      service_station_id: user.service_station_id || null,
      token: generateToken(user.id, user.role),
    },
    "User registered successfully",
    201
  );
});

/* ===========================
   LOGIN USER

   Flow:
   1. User enters AMS email/password
   2. AMS checks nlicConsolidate.dbo.nlicUser by email
   3. AMS gets SQL Server UserId
   4. AMS checks MySQL users.sql_user_id
   5. If sql_user_id is NULL, AMS matches by email and auto-links it
   6. Password still checks from AMS MySQL users table
   7. Role/permission still comes from AMS MySQL users table
=========================== */
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const { isValid, errors } = validate.loginInput(email, password);
  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const normalizedEmail = String(email || "").trim().toLowerCase();

  let nlicUser = null;

  try {
    nlicUser = await findNlicUserByEmail(normalizedEmail);
  } catch (err) {
    console.error("NLIC CONSOLIDATE USER LOOKUP ERROR:", err.message);

    return sendError(
      res,
      "Company user lookup failed. Please contact admin.",
      500
    );
  }

  if (!nlicUser) {
    return sendError(
      res,
      "Company user not found in nlicConsolidate.",
      401
    );
  }

  const sqlUserId = nlicUser.SqlUserId;

  if (!sqlUserId) {
    return sendError(
      res,
      "Company SQL UserId not found. Please check COMPANY_SQL_ID_COLUMN.",
      500
    );
  }

  // First try already-linked AMS user.
  let user = await User.findOne({
    where: {
      sql_user_id: sqlUserId,
    },
  });

  /*
    First-time linking:
    If old AMS user has sql_user_id = NULL,
    match by email and save SQL Server UserId into MySQL users.sql_user_id.
  */
  if (!user) {
    user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (user && !user.sql_user_id) {
      await user.update({
        sql_user_id: sqlUserId,
        name: nlicUser.FullName || user.name,
        email: String(nlicUser.Email || user.email).trim().toLowerCase(),
      });

      user.sql_user_id = sqlUserId;
      user.name = nlicUser.FullName || user.name;
      user.email = String(nlicUser.Email || user.email).trim().toLowerCase();
    }
  }

  if (!user) {
    return sendError(
      res,
      "You are not registered in AMS. Please contact admin.",
      403
    );
  }

  // AMS password still comes from MySQL users table.
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return sendError(res, "Invalid email or password", 401);

  return sendSuccess(
    res,
    {
      id: user.id,
      sql_user_id: user.sql_user_id || null,
      name: user.name,
      email: user.email,
      role: user.role,
      service_station_id: user.service_station_id || null,
      img_url: user.img_url,
      token: generateToken(user.id, user.role),

      companyUser: {
        sqlUserId: nlicUser.SqlUserId,
        fullName: nlicUser.FullName,
        email: nlicUser.Email,
      },
    },
    "Login successful"
  );
});

/* ===========================
   FORGOT PASSWORD (EMAIL OTP)
=========================== */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) return sendError(res, "Email is required", 400);

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    return sendSuccess(res, {}, "If email exists, OTP has been sent.");
  }

  const otp = generateOtp();

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await user.update({
    reset_otp: hashedOtp,
    reset_otp_expires: expires,
  });

  await sendMail({
    to: user.email,
    subject: "Password Reset OTP – Project AMS",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial; line-height:1.6">
        <h2>Password Reset</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:6px">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not request this, please ignore.</p>
      </div>
    `,
  });

  return sendSuccess(res, {}, "If email exists, OTP has been sent.");
});

/* ===========================
   RESET PASSWORD
=========================== */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body || {};

  if (!email || !otp || !newPassword) {
    return sendError(res, "Email, OTP and newPassword are required", 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) return sendError(res, "Invalid OTP", 400);

  if (!user.reset_otp || !user.reset_otp_expires) {
    return sendError(res, "OTP expired", 400);
  }

  if (new Date(user.reset_otp_expires) < new Date()) {
    return sendError(res, "OTP expired", 400);
  }

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  if (hashedOtp !== user.reset_otp) {
    return sendError(res, "Invalid OTP", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({
    password: hashedPassword,
    reset_otp: null,
    reset_otp_expires: null,
  });

  return sendSuccess(res, {}, "Password reset successful. Please login.");
});