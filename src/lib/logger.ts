// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  // you can add custom fields via mixin
  mixin: () => ({ service: 'my-nextjs-app' }),
});

export default logger;

