import { vi } from 'vitest';
import RedisMock from 'ioredis-mock';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: RedisMock,
    Redis: RedisMock,
  };
});

// Mock BullMQ
vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation(() => ({
      add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
      getFailed: vi.fn().mockResolvedValue([]),
    })),
    Worker: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: vi.fn(),
    })),
  };
});

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  courseModule: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  roadmap: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  roadmapCourse: {
    deleteMany: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  submission: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  certificate: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  userProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
  quiz: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  userQuizResult: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  discussion: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  discussionReply: {
    create: vi.fn(),
  },
  bookmark: {
    upsert: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  notification: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  courseEnrollment: {
    upsert: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  achievement: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  userAchievement: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('../src/config/prisma.js', () => {
  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

export { mockPrisma };
