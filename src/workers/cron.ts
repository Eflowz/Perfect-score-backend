import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { aiReviewQueue } from '../queue/index.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function startCronJobs() {
  cron.schedule('*/13 * * * *', async () => {
    logger.info('Running keep-alive ping...');
    try {
      const url = `http://localhost:${env.PORT}/api/v1/health`;
      const res = await fetch(url);
      logger.info(`Keep-alive response status: ${res.status}`);
    } catch (error: any) {
      logger.info(`Keep-alive ping (expected in test environments): ${error.message}`);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    logger.info('Checking for expired streaks to reset...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await prisma.user.updateMany({
        where: {
          lastActiveAt: {
            lt: yesterday,
          },
          streakDays: {
            gt: 0,
          },
        },
        data: {
          streakDays: 0,
        },
      });
      logger.info(`Streak reset job complete. Reset ${result.count} users.`);
    } catch (error: any) {
      logger.error(`Streak reset job failed: ${error.message}`);
    }
  });

  cron.schedule('0 * * * *', async () => {
    logger.info('Cleaning expired refresh tokens...');
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      logger.info(`Cleaned ${result.count} expired refresh tokens.`);
    } catch (error: any) {
      logger.error(`Cleanup of expired refresh tokens failed: ${error.message}`);
    }
  });

  cron.schedule('*/10 * * * *', async () => {
    logger.info('Retrying failed AI review jobs...');
    try {
      const failedJobs = await aiReviewQueue.getFailed();
      let retriedCount = 0;
      for (const job of failedJobs) {
        if (job.attemptsMade < 3) {
          await job.retry();
          retriedCount++;
        }
      }
      logger.info(`Retried ${retriedCount} failed AI review jobs.`);
    } catch (error: any) {
      logger.error(`Retrying failed AI review jobs failed: ${error.message}`);
    }
  });

  logger.info('All cron jobs initialized.');
}
