export type ErrorCode =
  | 'AUTHENTICATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode = 'INTERNAL_ERROR',
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}
