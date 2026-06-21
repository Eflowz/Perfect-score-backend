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

describe('New Backend Features', () => {
  it('should mark module as completed in progress tracking', async () => {
    const token = await generateTestToken('user-123', 'USER');
    
    mockPrisma.courseModule.findUnique.mockResolvedValueOnce({
      id: 'module-1',
      courseId: 'course-1',
      title: 'Variables',
      content: 'Content',
      order: 1,
      createdAt: new Date(),
    });

    mockPrisma.userProgress.upsert.mockResolvedValueOnce({
      id: 'progress-1',
      userId: 'user-123',
      courseId: 'course-1',
      moduleId: 'module-1',
      completed: true,
      timeSpent: 120,
    });

    const res = await request(handler)
      .post('/api/v1/progress/module/module-1/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ timeSpent: 120 });

    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });

  it('should allow submitting a quiz and calculate score', async () => {
    const token = await generateTestToken('user-123', 'USER');

    mockPrisma.quiz.findUnique.mockResolvedValueOnce({
      id: 'quiz-1',
      courseId: 'course-1',
      moduleId: 'module-1',
      title: 'Python Basics Quiz',
      passingScore: 70,
      timeLimit: 10,
      questions: [
        {
          type: 'multiple-choice',
          question: 'What is Python?',
          options: ['Language', 'Snake'],
          correctAnswer: 'Language',
          explanation: 'It is a language.',
          points: 10,
        },
      ],
    });

    mockPrisma.userQuizResult.findMany.mockResolvedValueOnce([]); // no previous results
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-123',
      xp: 0,
      level: 1,
    });

    mockPrisma.userQuizResult.create.mockResolvedValueOnce({
      id: 'result-1',
      userId: 'user-123',
      quizId: 'quiz-1',
      score: 100,
      answers: ['Language'],
      completedAt: new Date(),
    });

    mockPrisma.user.update.mockResolvedValueOnce({
      id: 'user-123',
      xp: 20,
      level: 1,
    });

    const res = await request(handler)
      .post('/api/v1/quizzes/quiz-1/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: ['Language'] });

    expect(res.status).toBe(200);
    expect(res.body.data.passed).toBe(true);
    expect(res.body.data.score).toBe(100);
    expect(res.body.data.xpAwarded).toBe(20);
  });

  it('should support posting course discussions', async () => {
    const token = await generateTestToken('user-123', 'USER');

    mockPrisma.course.findUnique.mockResolvedValueOnce({
      id: 'course-1',
      title: 'Python Basics',
    });

    mockPrisma.discussion.create.mockResolvedValueOnce({
      id: 'disc-1',
      courseId: 'course-1',
      userId: 'user-123',
      title: 'pip help',
      content: 'How to use pip?',
      createdAt: new Date(),
      user: { id: 'user-123', name: 'John Doe', email: 'j@example.com' },
    });

    const res = await request(handler)
      .post('/api/v1/courses/course-1/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'pip help', content: 'How to use pip?' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('pip help');
  });

  it('should search courses by query', async () => {
    const token = await generateTestToken('user-123', 'USER');

    mockPrisma.course.findMany.mockResolvedValueOnce([
      { id: 'course-1', title: 'Python Basics' },
    ]);

    const res = await request(handler)
      .get('/api/v1/search?q=python&type=courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Python Basics');
  });

  it('should manage notifications', async () => {
    const token = await generateTestToken('user-123', 'USER');

    mockPrisma.notification.findMany.mockResolvedValueOnce([
      { id: 'notif-1', title: 'Welcome', message: 'Hello', read: false },
    ]);

    const res = await request(handler)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Welcome');
  });
});
