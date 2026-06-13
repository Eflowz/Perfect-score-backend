import { Worker } from 'bullmq';
import { prisma } from '../config/prisma.js';
import { createRedisConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const workerRedis = createRedisConnection();

export const roadmapWorker = new Worker(
  'roadmap-generation',
  async (job) => {
    const { userId, goals } = job.data;
    logger.info({ userId, goals }, 'Generating AI Roadmap for user...');

    const roadmap = await prisma.roadmap.findUnique({
      where: { userId },
    });

    if (!roadmap) {
      throw new Error(`Roadmap for user ${userId} not found`);
    }

    // Clean existing courses
    await prisma.roadmapCourse.deleteMany({
      where: { roadmapId: roadmap.id },
    });

    // Match all available courses for simplicity (mock AI recommendation engine)
    const courses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < courses.length; i++) {
      await prisma.roadmapCourse.create({
        data: {
          roadmapId: roadmap.id,
          courseId: courses[i].id,
          order: i + 1,
          status: i === 0 ? 'IN_PROGRESS' : 'PENDING',
        },
      });
    }

    logger.info({ userId }, 'AI Roadmap generated and assigned successfully');
  },
  { connection: workerRedis as any }
);
