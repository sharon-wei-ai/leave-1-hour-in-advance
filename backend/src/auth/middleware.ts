import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from './jwt';

// 扩展 FastifyRequest 以包含用户信息
export interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

/**
 * JWT 认证中间件
 */
export async function authenticateJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    // 将解码后的 payload 赋值给 user
    (request as AuthenticatedRequest).user = request.user as JWTPayload;
  } catch {
    reply.code(401).send({ error: 'Unauthorized: Invalid token' });
  }
}

/**
 * 权限检查装饰器
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as AuthenticatedRequest).user;
    if (!user) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
  };
}

/**
 * SSO 占位中间件（后续实现）
 */
export async function authenticateSSO(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // TODO: 实现 SSO 认证
  // 当前为占位实现
  reply.code(501).send({ error: 'SSO authentication not implemented yet' });
}

