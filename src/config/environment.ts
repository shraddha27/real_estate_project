/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/postgres',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};

/**
 * Validate critical environment variables
 */
export const validateEnvironment = (): void => {
  if (!environment.PORT || isNaN(environment.PORT)) {
    throw new Error('Invalid PORT configuration');
  }
  if (!environment.JWT_SECRET || environment.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters');
  }
};
