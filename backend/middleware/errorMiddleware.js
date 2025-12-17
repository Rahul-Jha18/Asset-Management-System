// backend/middleware/errorMiddleware.js
const { sendError } = require('../utils/response');

exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    status: statusCode,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  sendError(
    res,
    err.message || 'Server Error',
    statusCode,
    process.env.NODE_ENV !== 'production' ? err.stack : undefined
  );
};

/**
 * Async error handler wrapper
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

