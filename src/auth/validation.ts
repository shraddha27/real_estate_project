import { ValidationChain, body } from 'express-validator';

export const credentialsValidators: ValidationChain[] = [
  body('username').isString().trim().isLength({ min: 3, max: 100 }),
  body('password').isString().isLength({ min: 8, max: 200 }),
];
