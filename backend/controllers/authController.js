const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validate } = require("../utils/validators");
const { sendSuccess, sendError } = require("../utils/response");
const { sendMail } = require("../utils/mailer");

/* ===========================
   HELPER: Generate 6-digit OTP
=========================== */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "admin";

  if (value === "subadmin" || value === "sub_admin" || value === "sub-admin") {
    return "subadmin";
  }

  if (value === "corp_user" || value === "corpuser" || value === "corp-user" || value === "corp user") {
    return "corp_user";
  }

  if (value === "user") return "user";

  return "user";
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
   LOGIN USER
=========================== */
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const { isValid, errors } = validate.loginInput(email, password);
  if (!isValid) return sendError(res, "Validation failed", 400, errors);

  const normalizedEmail = String(email || "").trim().toLowerCase();

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) return sendError(res, "Invalid email or password", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return sendError(res, "Invalid email or password", 401);

  return sendSuccess(
    res,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      service_station_id: user.service_station_id || null,
      img_url: user.img_url,
      token: generateToken(user.id, user.role),
    },
    "Login successful"
  );
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
