import jwt from 'jsonwebtoken';
import { authenticate, AuthenticatedRequest } from '../../auth/auth.middleware';
import { environment } from '../../config';

describe('authenticate middleware', () => {
  const next = jest.fn();
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  beforeEach(() => {
    next.mockReset();
    json.mockReset();
    status.mockClear();
  });

  it('rejects requests without a bearer token', () => {
    const request = { header: jest.fn().mockReturnValue(undefined) } as unknown as AuthenticatedRequest;

    authenticate(request, { status } as never, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', statusCode: 401, message: 'Authentication required' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', () => {
    const request = { header: jest.fn().mockReturnValue('Bearer invalid-token') } as unknown as AuthenticatedRequest;

    authenticate(request, { status } as never, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', statusCode: 401, message: 'Invalid or expired token' },
    });
  });

  it('attaches the authenticated user and calls next', () => {
    const user = { id: '00000000-0000-4000-8000-000000000001', username: 'alice' };
    const token = jwt.sign(user, environment.JWT_SECRET);
    const request = { header: jest.fn().mockReturnValue(`Bearer ${token}`) } as unknown as AuthenticatedRequest;

    authenticate(request, { status } as never, next);

    expect(request.user).toMatchObject(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });
});
