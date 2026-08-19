import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';

export const requestId: RequestHandler = (req, res, next): void => {
  const id = req.header('x-request-id') || randomUUID();
  res.setHeader('x-request-id', id);
  res.locals.requestId = id;
  next();
};
