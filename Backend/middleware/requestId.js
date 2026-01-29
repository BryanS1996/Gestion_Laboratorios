const crypto = require('crypto');

// Middleware to generate a unique requestId per HTTP request
const requestId = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
};

module.exports = requestId;
