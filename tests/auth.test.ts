import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDIContainer } from '../src/container/index.js';
import { mockPrisma } from './setup.js';
import { createAdaptorServer } from '@hono/node-server';
import bcrypt from 'bcrypt';

const container = createDIContainer();
const app = createApp(container);
const handler = createAdaptorServer(app);

describe('Auth Module', () => {
  it('should register a new user successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'USER',
      xp: 0,
      level: 1,
      streakDays: 0,
    });
    mockPrisma.refreshToken.create.mockResolvedValueOnce({
      token: 'refresh-token-123',
    });

    const res = await request(handler)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        name: 'John Doe',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should return 400 validation error for invalid email/password', async () => {
    const res = await request(handler)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        name: 'John',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ValidationError');
  });

  it('should login successfully with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'John Doe',
      role: 'USER',
      xp: 0,
      level: 1,
      streakDays: 0,
    });
    mockPrisma.user.update.mockResolvedValueOnce({});
    mockPrisma.refreshToken.create.mockResolvedValueOnce({});

    const res = await request(handler)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
