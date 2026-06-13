import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createDIContainer } from '../src/container/index.js';
import { mockPrisma } from './setup.js';
import { createAdaptorServer } from '@hono/node-server';
import { SignJWT } from 'jose';
import { env } from '../src/config/env.js';

const container = createDIContainer();
const app = createApp(container);
const handler = createAdaptorServer(app);

async function generateTestToken(userId: string, role: string) {
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime('15m')
    .sign(secret);
}

describe('Courses Module', () => {
  it('should list all courses publicly', async () => {
    mockPrisma.course.findMany.mockResolvedValueOnce([
      { id: 'course-1', title: 'Python Basics', level: 'BEGINNER', order: 1 },
    ]);

    const res = await request(handler).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Python Basics');
  });

  it('should reject course creation by non-admin user', async () => {
    const userToken = await generateTestToken('user-123', 'USER');

    const res = await request(handler)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Advanced React',
        description: 'Deep dive into hooks and state.',
        level: 'ADVANCED',
        order: 2,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ForbiddenError');
  });

  it('should allow course creation by super admin', async () => {
    const adminToken = await generateTestToken('admin-123', 'SUPER_ADMIN');
    mockPrisma.course.create.mockResolvedValueOnce({
      id: 'course-2',
      title: 'Advanced React',
      level: 'ADVANCED',
      order: 2,
      modules: [],
    });

    const res = await request(handler)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Advanced React',
        description: 'Deep dive into hooks and state.',
        level: 'ADVANCED',
        order: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Advanced React');
  });
});
