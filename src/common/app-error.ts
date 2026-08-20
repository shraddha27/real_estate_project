export type ErrorCode =
  | 'AUTHENTICATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR';

export interface AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  isOperational: boolean;
}

export function AppError(
  message: string,
  statusCode: number,
  code: ErrorCode = 'INTERNAL_ERROR',
  isOperational = true,
): AppError {
  const error = new Error(message) as AppError;
  error.name = 'AppError';
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = isOperational;
  return error;
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof Error && error.name === 'AppError' && 'statusCode' in error && 'code' in error;
