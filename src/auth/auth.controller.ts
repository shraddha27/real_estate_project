import { Request, Response, NextFunction } from 'express';
import { login, register } from './auth.service';
import { ApiSuccessResponse } from '../models';

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const result = await register(username, password);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const result = await login(username, password);
    const response: ApiSuccessResponse<typeof result> = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
