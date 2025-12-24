import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from './jwt';
import { authenticateJWT, AuthenticatedRequest } from './middleware';

export async function authRoutes(fastify: FastifyInstance) {
  // 注册
  fastify.post<{
    Body: { email: string; username: string; password: string };
  }>('/api/v1/auth/register', async (request, reply) => {
    const { email, username, password } = request.body;

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      reply.code(409).send({ error: 'User already exists' });
      return;
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        passwordHash,
        role: 'viewer',
      })
      .returning();

    // 生成 token
    const token = await generateToken(fastify, {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    reply.send({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      token,
    });
  });

  // 登录
  fastify.post<{
    Body: { email: string; password: string };
  }>('/api/v1/auth/login', async (request, reply) => {
    const { email, password } = request.body;

    // 查找用户
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) {
      reply.code(401).send({ error: 'Invalid credentials' });
      return;
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      reply.code(401).send({ error: 'Invalid credentials' });
      return;
    }

    // 生成 token
    const token = await generateToken(fastify, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    reply.send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  });

  // 获取当前用户信息
  fastify.get(
    '/api/v1/auth/me',
    { preHandler: [authenticateJWT] },
    async (request: FastifyRequest, reply) => {
      const authRequest = request as AuthenticatedRequest;
      if (!authRequest.user) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
      }

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          role: users.role,
          departmentId: users.departmentId,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, authRequest.user.userId))
        .limit(1);

      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      reply.send({ user });
    }
  );

  // SSO 登录占位
  fastify.post('/api/v1/auth/sso', async (_request, reply) => {
    reply.code(501).send({ error: 'SSO authentication not implemented yet' });
  });
}

