// backend/controllers/authController.js
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validate } = require('../utils/validators');
const { sendSuccess, sendError } = require('../utils/response');

// REGISTER USER
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, is_admin = 0 } = req.body || {};

  // Validate input
  const { isValid, errors } = validate.registerInput(name, email, password);
  if (!isValid) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return sendError(res, 'User already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    is_admin: !!is_admin,
  });

  console.log('✅ User registered:', user.email);

  return sendSuccess(
    res,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    },
    'User registered successfully',
    201
  );
});

// LOGIN USER
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  // Validate input
  const { isValid, errors } = validate.loginInput(email, password);
  if (!isValid) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  console.log('✅ Login successful:', user.email);

  return sendSuccess(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user.id, user.role),
  }, 'Login successful');
});