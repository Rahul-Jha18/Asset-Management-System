/**
 * Response formatter for consistent API responses
 */

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, statusCode = 400, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const sendPaginated = (res, data, page, limit, total, message = 'Success') => {
  res.json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
