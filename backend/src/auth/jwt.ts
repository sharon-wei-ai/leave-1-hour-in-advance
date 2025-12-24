import jwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// 扩展 Fastify JWT 类型
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

export async function registerJWT(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: '7d',
    },
  });
}

export async function generateToken(
  fastify: FastifyInstance,
  payload: JWTPayload
): Promise<string> {
  return fastify.jwt.sign(payload);
}

export async function verifyToken(
  fastify: FastifyInstance,
  token: string
): Promise<JWTPayload> {
  return fastify.jwt.verify<JWTPayload>(token);
}

