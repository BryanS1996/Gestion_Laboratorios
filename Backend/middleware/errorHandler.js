const errorLogger = require('../config/error.logger');

/// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  errorLogger.error(
    `Unhandled error | method=${req.method} url=${req.originalUrl}`,
    { requestId: req.requestId, stack: err.stack }
  );

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
