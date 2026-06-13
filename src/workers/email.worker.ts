import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const workerRedis = createRedisConnection();

export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, body } = job.data;
    logger.info({ to, subject }, `[Mock Email Dispatch] Content: ${body}`);
  },
  { connection: workerRedis as any }
);
