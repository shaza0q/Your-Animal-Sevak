import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: 'animal-management' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const logger = {
  info:  (msg: string) => winstonLogger.info(msg),
  error: (msg: string) => winstonLogger.error(msg),
  warn:  (msg: string) => winstonLogger.warn(msg),
  debug: (msg: string) => winstonLogger.debug(msg),
};

export default logger;
