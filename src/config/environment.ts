/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_VERSION: z.string().min(1).default('1.0.0'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  API_TIMEOUT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url().default('postgresql://postgres:root@localhost:5432/postgres'),
  JWT_SECRET: z.string().default(''),
  JWT_EXPIRES_IN: z.string().min(1).default('1h'),
  CORS_ORIGIN: z.string().default('*'),
});

export const environment = environmentSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_VERSION: process.env.APP_VERSION,
  LOG_LEVEL: process.env.LOG_LEVEL,
  API_TIMEOUT: process.env.API_TIMEOUT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

/**
 * Validate critical environment variables
 */
export const validateEnvironment = (): void => {
  if (environment.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters');
  }

  if (environment.NODE_ENV === 'production' && (
    environment.JWT_SECRET.length < 32 ||
    environment.JWT_SECRET === 'replace-this-with-a-long-random-secret'
  )) {
    throw new Error('Production JWT_SECRET must be a unique random value of at least 32 characters');
  }
};
