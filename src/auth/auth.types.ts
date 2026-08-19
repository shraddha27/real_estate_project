export interface AuthUser {
  id: string;
  username: string;
}

export const isAuthUser = (value: unknown): value is AuthUser => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.username === 'string'
    && candidate.id.length > 0 && candidate.username.length >= 3 && candidate.username.length <= 100;
};
