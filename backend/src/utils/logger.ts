import pino from 'pino';

// Logger configuration for Fastify
const loggerConfigBase = {
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
};

// 日志脱敏序列化器（单独配置，避免类型冲突）
export const loggerConfig = loggerConfigBase;

// Standalone logger instance for use outside Fastify
export const logger = pino(loggerConfig);

