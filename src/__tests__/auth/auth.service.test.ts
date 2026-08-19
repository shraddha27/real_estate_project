import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { login, register } from '../../auth/auth.service';
import { environment } from '../../config';
import { UserRecord } from '../../database/models';

jest.mock('../../database', () => ({
  withTransaction: jest.fn(async (operation: (transaction: object) => Promise<unknown>) => operation({})),
}));
jest.mock('../../database/models', () => ({
  UserRecord: { create: jest.fn(), findOne: jest.fn() },
}));

describe('Auth service', () => {
  const create = UserRecord.create as jest.Mock;
  const findOne = UserRecord.findOne as jest.Mock;

  beforeEach(() => {
    create.mockReset();
    findOne.mockReset();
  });

  it('registers a user with a hashed password and returns a JWT', async () => {
    create.mockResolvedValue({});

    const result = await register('alice', 'password123');
    const decoded = jwt.verify(result.token, environment.JWT_SECRET) as jwt.JwtPayload;
    const attributes = create.mock.calls[0][0];

    expect(result.user.username).toBe('alice');
    expect(decoded.username).toBe('alice');
    expect(attributes).toMatchObject({ id: result.user.id, username: 'alice' });
    expect(await bcrypt.compare('password123', attributes.passwordHash)).toBe(true);
  });

  it('converts duplicate usernames into a useful error', async () => {
    create.mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });

    await expect(register('alice', 'password123')).rejects.toThrow('Username already exists');
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    findOne.mockResolvedValue({ id: 'user-1', username: 'alice', passwordHash });

    const result = await login('alice', 'password123');

    expect(result.user).toEqual({ id: 'user-1', username: 'alice' });
    expect(result.token).toEqual(expect.any(String));
    expect(findOne).toHaveBeenCalledWith({ where: { username: 'alice' } });
  });

  it('rejects invalid login credentials', async () => {
    findOne.mockResolvedValue(undefined);

    await expect(login('alice', 'wrong-password')).rejects.toThrow('Invalid username or password');
  });
});
