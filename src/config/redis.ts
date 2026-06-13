import { Redis, RedisOptions } from 'ioredis';
import { env } from './env.js';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Critical for BullMQ
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 2000);
  },
};

export const redis = new Redis(env.REDIS_URL, redisOptions);

export function createRedisConnection(): Redis {
  return new Redis(env.REDIS_URL, redisOptions);
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
  } catch (error) {
    console.error('Error disconnecting Redis:', error);
  }
}
