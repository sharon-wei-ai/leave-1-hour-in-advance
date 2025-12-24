import { db } from '../db';
import { skills } from '../db/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { auditLogs } from '../db/schema';
import { sanitizeLog } from '../utils/logSanitizer';

export interface CreateSkillInput {
  name: string;
  description?: string;
  version?: string;
  knowledgeGraph?: unknown;
  rules?: unknown;
  tags?: string[];
  projectId?: string;
  parentSkillId?: string;
  createdBy: string;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string;
  version?: string;
  knowledgeGraph?: unknown;
  rules?: unknown;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface SkillQuery {
  projectId?: string;
  status?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export class SkillService {
  /**
   * 创建 Skill
   */
  async create(input: CreateSkillInput) {
    const result = await db
      .insert(skills)
      .values({
        name: input.name,
        description: input.description,
        version: input.version || '1.0.0',
        knowledgeGraph: input.knowledgeGraph,
        rules: input.rules,
        tags: input.tags || [],
        createdBy: input.createdBy,
        projectId: input.projectId || null,
        parentSkillId: input.parentSkillId || null,
        status: 'draft',
      })
      .returning();

    const skill = result[0];
    if (!skill) {
      throw new Error('Failed to create skill');
    }

    // 记录审计日志
    await this.logAudit({
      userId: input.createdBy,
      action: 'create',
      resourceType: 'skill',
      resourceId: skill.id,
      newData: sanitizeLog(skill),
    });

    return skill;
  }

  /**
   * 更新 Skill
   */
  async update(skillId: string, input: UpdateSkillInput, userId: string) {
    // 获取旧数据
    const [oldSkill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    if (!oldSkill) {
      throw new Error('Skill not found');
    }

    // 更新数据
    const [updatedSkill] = await db
      .update(skills)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId))
      .returning();

    // 记录审计日志
    await this.logAudit({
      userId,
      action: 'update',
      resourceType: 'skill',
      resourceId: skillId,
      oldData: sanitizeLog(oldSkill),
      newData: sanitizeLog(updatedSkill),
    });

    return updatedSkill;
  }

  /**
   * 删除 Skill
   */
  async delete(skillId: string, userId: string) {
    const [skill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    if (!skill) {
      throw new Error('Skill not found');
    }

    await db.delete(skills).where(eq(skills.id, skillId));

    // 记录审计日志
    await this.logAudit({
      userId,
      action: 'delete',
      resourceType: 'skill',
      resourceId: skillId,
      oldData: sanitizeLog(skill),
    });
  }

  /**
   * 获取 Skill 详情
   */
  async getById(skillId: string) {
    const [skill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    return skill || null;
  }

  /**
   * 查询 Skill 列表
   */
  async list(query: SkillQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.projectId) {
      conditions.push(eq(skills.projectId, query.projectId));
    }

    if (query.status) {
      conditions.push(eq(skills.status, query.status as 'draft' | 'published' | 'archived'));
    }

    if (query.search) {
      conditions.push(
        or(
          like(skills.name, `%${query.search}%`),
          like(skills.description, `%${query.search}%`)
        )!
      );
    }

    if (query.tags && query.tags.length > 0) {
      // 使用 JSONB 查询标签
      conditions.push(
        sql`${skills.tags} @> ${JSON.stringify(query.tags)}::jsonb`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(skills)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(skills.createdAt);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(skills)
      .where(whereClause);

    return {
      items: results,
      total: Number(countResult?.count || 0),
      page,
      limit,
    };
  }

  /**
   * 发布 Skill（变更状态为 published）
   */
  async publish(skillId: string, userId: string) {
    const [skill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    if (!skill) {
      throw new Error('Skill not found');
    }

    const [publishedSkill] = await db
      .update(skills)
      .set({
        status: 'published',
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId))
      .returning();

    // 记录审计日志
    await this.logAudit({
      userId,
      action: 'publish',
      resourceType: 'skill',
      resourceId: skillId,
      oldData: sanitizeLog(skill),
      newData: sanitizeLog(publishedSkill),
    });

    return publishedSkill;
  }

  /**
   * 获取 Skill 的引用（子 Skill）
   */
  async getReferences(skillId: string) {
    return db
      .select()
      .from(skills)
      .where(eq(skills.parentSkillId, skillId));
  }

  /**
   * 记录审计日志
   */
  private async logAudit(data: {
    userId: string;
    action: 'create' | 'update' | 'delete' | 'publish' | 'archive';
    resourceType: string;
    resourceId: string;
    oldData?: unknown;
    newData?: unknown;
  }) {
    await db.insert(auditLogs).values({
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      oldData: data.oldData as never,
      newData: data.newData as never,
    });
  }
}

export const skillService = new SkillService();

