import { FastifyInstance, FastifyRequest } from 'fastify';
import { skillService } from '../services/skill.service';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../auth/middleware';

export async function skillRoutes(fastify: FastifyInstance) {
  // 创建 Skill
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      version?: string;
      knowledgeGraph?: unknown;
      rules?: unknown;
      tags?: string[];
      projectId?: string;
      parentSkillId?: string;
    };
  }>(
    '/api/v1/skills',
    {
      preHandler: [authenticateJWT, requireRole('admin', 'manager', 'developer')],
    },
    async (request: FastifyRequest, reply) => {
      const authRequest = request as AuthenticatedRequest;
      if (!authRequest.user) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
      }

      const body = request.body as {
        name: string;
        description?: string;
        version?: string;
        knowledgeGraph?: unknown;
        rules?: unknown;
        tags?: string[];
        projectId?: string;
        parentSkillId?: string;
      };
      const skill = await skillService.create({
        ...body,
        createdBy: authRequest.user.userId,
      });

      reply.code(201).send({ skill });
    }
  );

  // 获取 Skill 列表
  fastify.get<{
    Querystring: {
      projectId?: string;
      status?: string;
      tags?: string;
      search?: string;
      page?: string;
      limit?: string;
    };
  }>(
    '/api/v1/skills',
    { preHandler: [authenticateJWT] },
    async (request, reply) => {
      const query = {
        projectId: request.query.projectId,
        status: request.query.status,
        tags: request.query.tags ? request.query.tags.split(',') : undefined,
        search: request.query.search,
        page: request.query.page ? parseInt(request.query.page, 10) : undefined,
        limit: request.query.limit ? parseInt(request.query.limit, 10) : undefined,
      };

      const result = await skillService.list(query);
      reply.send(result);
    }
  );

  // 获取 Skill 详情
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/skills/:id',
    { preHandler: [authenticateJWT] },
    async (request, reply) => {
      const skill = await skillService.getById((request.params as { id: string }).id);
      if (!skill) {
        reply.code(404).send({ error: 'Skill not found' });
        return;
      }
      reply.send({ skill });
    }
  );

  // 更新 Skill
  fastify.patch<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      version?: string;
      knowledgeGraph?: unknown;
      rules?: unknown;
      tags?: string[];
      status?: 'draft' | 'published' | 'archived';
    };
  }>(
    '/api/v1/skills/:id',
    {
      preHandler: [authenticateJWT, requireRole('admin', 'manager', 'developer')],
    },
    async (request: FastifyRequest, reply) => {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
      }

      const authRequest = request as AuthenticatedRequest;
      const skill = await skillService.update(
        (request.params as { id: string }).id,
        request.body as never,
        authRequest.user.userId
      );
      reply.send({ skill });
    }
  );

  // 删除 Skill
  fastify.delete<{ Params: { id: string } }>(
    '/api/v1/skills/:id',
    {
      preHandler: [authenticateJWT, requireRole('admin', 'manager')],
    },
    async (request: FastifyRequest, reply) => {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
      }

      const authRequest = request as AuthenticatedRequest;
      await skillService.delete(
        (request.params as { id: string }).id,
        authRequest.user.userId
      );
      reply.code(204).send();
    }
  );

  // 发布 Skill
  fastify.post<{ Params: { id: string } }>(
    '/api/v1/skills/:id/publish',
    {
      preHandler: [authenticateJWT, requireRole('admin', 'manager')],
    },
    async (request: FastifyRequest, reply) => {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
      }

      const authRequest = request as AuthenticatedRequest;
      const skill = await skillService.publish(
        (request.params as { id: string }).id,
        authRequest.user.userId
      );
      reply.send({ skill });
    }
  );

  // 获取 Skill 引用
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/skills/:id/references',
    { preHandler: [authenticateJWT] },
    async (request, reply) => {
      const references = await skillService.getReferences((request.params as { id: string }).id);
      reply.send({ references });
    }
  );
}

