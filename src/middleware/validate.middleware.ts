import { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../common/app-error';

export type ValidatedRequest<TBody = unknown, TQuery = unknown, TParams = Record<string, string>> =
  Request<TParams, unknown, TBody, TQuery>;

export const validate = <T extends z.ZodTypeAny>(schema: T, source: 'body' | 'query'): RequestHandler =>
  (req, _res, next): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(AppError(result.error.issues.map(issue => issue.message).join(', '), 400, 'VALIDATION_ERROR'));
      return;
    }

    req[source] = result.data;
    next();
  };
