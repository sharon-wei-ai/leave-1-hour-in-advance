import session from '@fastify/session';
import cookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import { config } from '../config';

export async function registerSession(fastify: FastifyInstance) {
  await fastify.register(cookie);
  await fastify.register(session, {
    secret: config.sessionSecret,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    },
  });
}

