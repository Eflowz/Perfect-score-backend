import { Worker } from 'bullmq';
import { createDIContainer } from '../container/index.js';
import { createRedisConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { CertificationsService } from '../modules/certifications/certifications.service.js';

const workerRedis = createRedisConnection();
const container = createDIContainer();

export const certificateWorker = new Worker(
  'certificate-generation',
  async (job) => {
    const { userId, courseId, title } = job.data;
    const certService = container.resolve<CertificationsService>('certificationsService');
    const cert = await certService.issueCertificate(userId, courseId, title);
    logger.info({ certId: cert.id, userId }, `Certificate generated and issued successfully for course ${courseId}`);
  },
  { connection: workerRedis as any }
);
