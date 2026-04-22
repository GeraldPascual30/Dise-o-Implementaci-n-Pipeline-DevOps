import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  name: env.serviceName,
  level: env.logLevel,
  base: {
    service: env.serviceName,
    env: env.nodeEnv
  },
  timestamp: pino.stdTimeFunctions.isoTime
});
