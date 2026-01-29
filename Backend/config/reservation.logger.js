const winston = require('winston');
const { createBaseLogger } = require('./logger.base');

// Reservation logger
const reservationLogger = createBaseLogger([
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/reservations.log',
  }),
]);

module.exports = reservationLogger;
