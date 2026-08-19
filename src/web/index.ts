/**
 * Application Entry Point
 * Main bootstrap file for the application
 */

import express from 'express';
import { environment, validateEnvironment } from '../config';
import { initializeApp, startServer } from './server';
import logger from '../common/logger';
import { closeDatabase } from '../database';

const main = async (): Promise<void> => {
  try {
    // Validate environment configuration
    validateEnvironment();

    // Create Express app
    const app = express();

    // Initialize app with middleware and routes
    initializeApp(app);

    // Start server
    const server = startServer(app, environment.PORT);
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  process.exit(1);
});

// Start application
main().catch(error => {
  logger.error('Fatal error', { error });
  process.exit(1);
});
