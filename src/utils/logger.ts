import pino from 'pino';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

let transport;
if (isDev) {
  try {
    require.resolve('pino-pretty');
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    };
  } catch {
    transport = undefined;
  }
}

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport,
});
