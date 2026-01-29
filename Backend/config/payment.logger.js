const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Payments logger
const paymentLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/payments.log',
  }),
]);

module.exports = paymentLogger;
