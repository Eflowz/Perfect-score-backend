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

describe('Submissions Module', () => {
  it('should accept code submission and return submission details', async () => {
    const userToken = await generateTestToken('user-123', 'USER');
    mockPrisma.course.findUnique.mockResolvedValueOnce({ id: 'course-1' });
    mockPrisma.submission.create.mockResolvedValueOnce({
      id: 'submission-123',
      userId: 'user-123',
      courseId: 'course-1',
      code: 'print("hello")',
      language: 'python',
      status: 'SUBMITTED',
    });

    const res = await request(handler)
      .post('/api/v1/submissions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        courseId: 'course-1',
        code: 'print("hello")',
        language: 'python',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('submission-123');
    expect(res.body.data.status).toBe('SUBMITTED');
  });
});
