/**
 * Application Entry Point
 * Main bootstrap file for the application
 */

import express from 'express';
import { environment, validateEnvironment } from '../config';
import { initializeApp, startServer } from './server';
import logger from '../common/logger';
import { checkDatabaseConnection, closeDatabase } from '../database';

const main = async (): Promise<void> => {
  try {
    // Validate environment configuration
    validateEnvironment();
    await checkDatabaseConnection();
    logger.info('Database connection verified');

    // Create Express app
    const app = express();

    // Initialize app with middleware and routes
    initializeApp(app);

    // Start server
    const server = startServer(app, environment.PORT);
    let shuttingDown = false;
    const shutdown = async (signal: string): Promise<void> => {
      if (shuttingDown) return;
      shuttingDown = true;
      logger.info(`Received ${signal}, shutting down`);
      const forceExitTimer = setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
      forceExitTimer.unref();

      try {
        await new Promise<void>((resolve, reject) => {
          server.close(error => error ? reject(error) : resolve());
        });
        await closeDatabase();
        clearTimeout(forceExitTimer);
        process.exit(0);
      } catch (error) {
        clearTimeout(forceExitTimer);
        logger.error('Graceful shutdown failed', { error });
        process.exit(1);
      }
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
