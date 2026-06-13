import { Context } from 'hono';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number, isOperational = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, true);
  }
}

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.constructor.name,
          message: err.message,
          details: err.details,
        },
      },
      err.statusCode as any
    );
  }

  // Handle default Hono / generic errors
  console.error('Unhandled server error:', err);
  const statusCode = c.res?.status && c.res.status >= 400 ? c.res.status : 500;
  return c.json(
    {
      error: {
        code: 'InternalServerError',
        message: err.message || 'An unexpected error occurred',
      },
    },
    statusCode as any
  );
};
