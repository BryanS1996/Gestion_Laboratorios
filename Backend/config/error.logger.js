const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Global error logger
const errorLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
]);

module.exports = errorLogger;
