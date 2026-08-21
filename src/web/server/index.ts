/**
 * Express Server Initialization
 * Sets up middleware, routes, and error handling
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import logger from '../../common/logger';
import { errorHandler, notFoundHandler } from '../../middleware';
import propertyRoutes from '../../routes';
import { requestId } from '../../middleware/request-id.middleware';
import { swaggerDocument } from '../../docs/swagger';
import { environment } from '../../config';
import { checkDatabaseConnection } from '../../database';

/**
 * Initialize Express application
 */
export const initializeApp = (app: Application): void => {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Middleware
  app.use(requestId);
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(helmet());
  app.use(cors({
    origin: environment.CORS_ORIGIN === '*'
      ? '*'
      : environment.CORS_ORIGIN.split(',').map(value => value.trim()),
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info(`${req.method} ${req.path}`, {
        requestId: res.locals.requestId,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      });
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/ready', async (_req, res) => {
    try {
      await checkDatabaseConnection();
      res.status(200).json({ status: 'ready', checks: { database: 'ok' } });
    } catch (error) {
      logger.warn('Readiness check failed', { error });
      res.status(503).json({ status: 'not_ready', checks: { database: 'failed' } });
    }
  });

  // API routes
  app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }));
  app.use('/api', propertyRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);
};

/**
 * Start the Express server
 */
export const startServer = (app: Application, port: number) => {
  const server = app.listen(port, () => {
    logger.info(`Server started successfully`, {
      port,
      environment: environment.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  server.requestTimeout = environment.API_TIMEOUT;
  server.headersTimeout = environment.API_TIMEOUT + 1_000;
  server.keepAliveTimeout = 5_000;
  return server;
};
