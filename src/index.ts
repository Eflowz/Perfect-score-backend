import { serve } from '@hono/node-server';
import { WebSocketServer } from 'ws';
import { env } from './config/env.js';
import { createDIContainer } from './container/index.js';
import { createApp } from './app.js';
import { startCronJobs } from './workers/cron.js';

// Import workers to ensure they start processing
import './workers/ai-review.worker.js';
import './workers/email.worker.js';
import './workers/certificate.worker.js';
import './workers/roadmap.worker.js';

import { disconnectPrisma } from './config/prisma.js';
import { disconnectRedis } from './config/redis.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  const container = createDIContainer();
  const app = createApp(container);

  const server = serve({
    fetch: app.fetch,
    port: env.PORT,
    websocket: { server: new WebSocketServer({ noServer: true }) },
  }, (info) => {
    logger.info(`🚀 Server running on http://localhost:${info.port}`);
  });

  startCronJobs();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    
    server.close(async (err) => {
      if (err) {
        logger.error(err, 'Error during HTTP server shutdown');
      }
      
      logger.info('HTTP server closed. Disconnecting clients...');
      await disconnectPrisma();
      await disconnectRedis();
      logger.info('Graceful shutdown completed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Force shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
