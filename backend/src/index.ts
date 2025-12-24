import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger, loggerConfig } from './utils/logger';
import { registerJWT } from './auth/jwt';
import { registerSession } from './auth/session';
import { authRoutes } from './auth/routes';
import { skillRoutes } from './routes/skill.routes';
import { closeDatabase } from './db';

const server = Fastify({
  logger: loggerConfig as never,
});

// Register plugins
await server.register(cors, {
  origin: config.corsOrigin,
});

await server.register(helmet);

await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Register authentication
await registerJWT(server);
await registerSession(server);

// Health check route
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
server.get('/api/v1', async () => {
  return { message: 'API v1' };
});

// Register route modules
await server.register(authRoutes);
await server.register(skillRoutes);

const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
    logger.info(`Server listening on http://${config.host}:${config.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  await server.close();
  await closeDatabase();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();

