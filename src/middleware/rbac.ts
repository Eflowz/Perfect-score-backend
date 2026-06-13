import { Context, Next } from 'hono';
import { UserRole } from '@prisma/client';
import { ForbiddenError, AuthError } from '../utils/errors.js';

export function requireRole(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) {
      throw new AuthError('Authentication required');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    await next();
  };
}
