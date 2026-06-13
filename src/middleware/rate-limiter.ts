import { Context, Next } from 'hono';
import { redis } from '../config/redis.js';
import { RateLimitError } from '../utils/errors.js';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimiter(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const identifier = user ? user.id : c.req.header('x-forwarded-for') || 'ip-fallback';
    const key = `rate_limit:${identifier}:${c.req.path}`;
    const now = Date.now();
    const clearBefore = now - options.windowMs;

    const pipeline = redis.multi();
    pipeline.zremrangebyscore(key, '-inf', clearBefore);
    pipeline.zcard(key);
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    pipeline.expire(key, Math.ceil(options.windowMs / 1000));

    const results = await pipeline.exec();
    if (!results) {
      await next();
      return;
    }

    const zcardResult = results[1];
    if (zcardResult && zcardResult[1] !== undefined) {
      const count = zcardResult[1] as number;
      if (count >= options.maxRequests) {
        throw new RateLimitError();
      }
    }

    await next();
  };
}
