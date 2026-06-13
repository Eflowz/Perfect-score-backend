import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const logOptions: ('query' | 'info' | 'warn' | 'error')[] = 
  env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'];

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: logOptions,
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
