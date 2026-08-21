import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { UserRecord } from '../database/models';
import { withTransaction } from '../database';
import { environment } from '../config';
import { AppError } from '../common/app-error';
import { AuthUser } from './auth.types';

export type { AuthUser } from './auth.types';

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const signToken = (user: AuthUser): string =>
  jwt.sign(user, environment.JWT_SECRET, {
    expiresIn: environment.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

const hasDatabaseErrorCode = (error: unknown, code: string): boolean =>
  typeof error === 'object' && error !== null &&
  (('code' in error && error.code === code) || ('name' in error && error.name === 'SequelizeUniqueConstraintError'));

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const passwordHash = await bcrypt.hash(password, 12);
  const user: AuthUser = { id: randomUUID(), username };

  try {
    await withTransaction(transaction => UserRecord.create(
      { id: user.id, username: user.username, passwordHash },
      { transaction }
    ).then(() => undefined));
  } catch (error) {
    if (hasDatabaseErrorCode(error, '23505')) {
      throw AppError('Username already exists', 409, 'CONFLICT');
    }
    throw error;
  }

  return { token: signToken(user), user };
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const record = await UserRecord.findOne({ where: { username } });

  if (!record || !(await bcrypt.compare(password, record.passwordHash))) {
    throw AppError('Invalid username or password', 401, 'AUTHENTICATION_ERROR');
  }

  const user: AuthUser = { id: record.id, username: record.username };
  return { token: signToken(user), user };
};
