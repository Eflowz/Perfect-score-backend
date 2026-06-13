import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validateBody(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.format());
      }
      c.set('body', parsed.data);
      await next();
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new ValidationError('Invalid request body JSON');
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const parsed = schema.safeParse(query);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }
    c.set('query', parsed.data);
    await next();
  };
}

export function validateParams(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const parsed = schema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.format());
    }
    c.set('params', parsed.data);
    await next();
  };
}
