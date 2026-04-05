const errorResponder = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Unexpected error"
  });
};

module.exports = errorResponder;