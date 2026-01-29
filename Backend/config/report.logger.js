const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Reports logger
const reportLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/reports.log',
  }),
]);

module.exports = reportLogger;
