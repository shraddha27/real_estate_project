import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isAuthUser, AuthUser } from './auth.types';
import { environment } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', statusCode: 401, message: 'Authentication required' } });
    return;
  }

  try {
    const payload = jwt.verify(token, environment.JWT_SECRET);
    if (!isAuthUser(payload)) {
      res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', statusCode: 401, message: 'Invalid or expired token' } });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', statusCode: 401, message: 'Invalid or expired token' } });
  }
};
