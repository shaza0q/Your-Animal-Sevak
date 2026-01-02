const winston = require('winston');

// Simple logger with console output
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'animal-management' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Helper methods for easy usage
module.exports = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
    logger.info(message);
  },
  error: (message) => {
    console.error(`[ERROR] ${message}`);
    logger.error(message);
  },
  warn: (message) => {
    console.warn(`[WARN] ${message}`);
    logger.warn(message);
  },
  debug: (message) => {
    console.log(`[DEBUG] ${message}`);
    logger.debug(message);
  }
};
