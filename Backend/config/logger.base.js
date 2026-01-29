const winston = require('winston');

const { combine, timestamp, printf, errors } = winston.format;

// Base log format
const logFormat = printf(({ level, message, timestamp, stack, requestId }) => {
  const reqId = requestId ? `[req=${requestId}] ` : '';
  return `${timestamp} ${reqId}[${level}]: ${stack || message}`;
});


// Base logger configuration
function createBaseLogger(transports) {
  return winston.createLogger({
    level: 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
    transports,
  });
}

module.exports = {
  createBaseLogger,
};
