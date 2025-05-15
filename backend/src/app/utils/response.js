exports.successResponse = (res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message, statusCode = 500, error = "") => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};
