import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://app:example@localhost:5432/app'),
  JWT_SECRET: z.string().default('change-me-in-production'),
  SESSION_SECRET: z.string().default('change-me-in-production'),
});

const env = configSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  host: env.HOST,
  corsOrigin: env.CORS_ORIGIN,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  sessionSecret: env.SESSION_SECRET,
} as const;

