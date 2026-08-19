/**
 * Error Handling Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../common/logger';
import { AppError } from '../common/app-error';
import { ApiErrorResponse } from '../models';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const appError = error instanceof AppError ? error : undefined;
  const statusCode = appError?.statusCode || 500;
  const message = appError?.isOperational ? appError.message : 'Internal Server Error';
  const code = appError?.code || 'INTERNAL_ERROR';

  logger.error('Unhandled error', {
    requestId: res.locals.requestId,
    statusCode,
    message,
    stack: error.stack,
  });

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      statusCode,
      message,
    },
  };
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      statusCode: 404,
      message: 'Route not found',
    },
  });
};
