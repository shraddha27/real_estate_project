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

/**
 * Initialize Express application
 */
export const initializeApp = (app: Application): void => {
  // Middleware
  app.use(requestId);
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(value => value.trim()) || '*' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      requestId: res.locals.requestId,
      query: req.query,
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
  return app.listen(port, () => {
    logger.info(`Server started successfully`, {
      port,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });
};
