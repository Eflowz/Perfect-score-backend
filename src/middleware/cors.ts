import { cors } from 'hono/cors';
import { env } from '../config/env.js';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
});
