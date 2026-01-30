const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Server startup logger
const serverLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/server.log',
  }),
]);

module.exports = serverLogger;