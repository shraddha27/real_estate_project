/**
 * Logger Configuration
 * Centralized logging service
 */

import winston from 'winston';
import { environment } from '../config';

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) =>
    `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
  )
);

const logger = winston.createLogger({
  level: environment.LOG_LEVEL,
  format: environment.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
  defaultMeta: { service: 'real-estate-api' },
  transports: [new winston.transports.Console()],
});

export default logger;
