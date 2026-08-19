import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../common/app-error';

export const handleValidationErrors: RequestHandler = (req, _res, next): void => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  next(new AppError(result.array().map(error => error.msg).join(', '), 400, 'VALIDATION_ERROR'));
};
