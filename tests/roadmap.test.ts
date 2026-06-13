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

describe('Roadmap Module', () => {
  it('should reject roadmap requests without authentication', async () => {
    const res = await request(handler).get('/api/v1/roadmap');
    expect(res.status).toBe(401);
  });

  it('should accept roadmap generation request and return job ID', async () => {
    const userToken = await generateTestToken('user-123', 'USER');
    mockPrisma.roadmap.findUnique.mockResolvedValueOnce({ id: 'roadmap-1' });

    const res = await request(handler)
      .post('/api/v1/roadmap/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        goals: ['Master Python', 'Understand backend scalability'],
      });

    expect(res.status).toBe(202);
    expect(res.body.data).toHaveProperty('jobId');
  });
});
