const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Storage (Backblaze) logger
const storageLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/storage.log',
  }),
]);

module.exports = storageLogger;
