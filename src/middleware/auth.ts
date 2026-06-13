import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { AuthError } from '../utils/errors.js';
import { UserRole } from '@prisma/client';

export interface JWTPayload {
  sub: string;
  role: UserRole;
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    throw new AuthError('Invalid or expired token');
  }
}

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);

  c.set('user', { id: payload.sub, role: payload.role });
  await next();
}

export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = await verifyJWT(token);
      c.set('user', { id: payload.sub, role: payload.role });
    } catch {
      // Ignore invalid token
    }
  }
  await next();
}
