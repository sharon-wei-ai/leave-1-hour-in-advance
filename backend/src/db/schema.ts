import { pgTable, text, timestamp, uuid, varchar, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// 枚举类型
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'developer', 'viewer']);
export const functionStatusEnum = pgEnum('function_status', ['draft', 'published', 'archived']);
export const skillStatusEnum = pgEnum('skill_status', ['draft', 'published', 'archived']);
export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'update',
  'delete',
  'publish',
  'archive',
  'execute',
  'share',
]);

// 用户表
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  departmentId: uuid('department_id').references(() => departments.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 部门表
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id'),
  level: integer('level').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 项目表
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  departmentId: uuid('department_id').references(() => departments.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Skill 表
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }).notNull().default('1.0.0'),
  status: skillStatusEnum('status').notNull().default('draft'),
  knowledgeGraph: jsonb('knowledge_graph'), // 知识图谱数据
  rules: jsonb('rules'), // 规则数据
  tags: jsonb('tags').$type<string[]>(), // 标签数组
  createdBy: uuid('created_by').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  parentSkillId: uuid('parent_skill_id'), // 引用父 Skill
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Function 表
export const functions = pgTable('functions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }).notNull().default('1.0.0'),
  status: functionStatusEnum('status').notNull().default('draft'),
  runtime: varchar('runtime', { length: 50 }).notNull(), // python, node, java
  code: text('code'), // 功能代码
  dependencies: jsonb('dependencies').$type<Record<string, string>>(), // 依赖包
  inputSchema: jsonb('input_schema'), // 输入定义
  outputSchema: jsonb('output_schema'), // 输出定义
  resourceQuota: jsonb('resource_quota'), // 资源配额 {cpu, memory, timeout, concurrency}
  skillIds: jsonb('skill_ids').$type<string[]>(), // 关联的 Skill IDs
  createdBy: uuid('created_by').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  isFrozen: boolean('is_frozen').notNull().default(false), // 是否已固化
  frozenAt: timestamp('frozen_at'), // 固化时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 共享表（功能/Skill 的共享权限）
export const shares = pgTable('shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // 'function' | 'skill'
  resourceId: uuid('resource_id').notNull(),
  sharedWithUserId: uuid('shared_with_user_id').references(() => users.id),
  sharedWithProjectId: uuid('shared_with_project_id').references(() => projects.id),
  sharedWithDepartmentId: uuid('shared_with_department_id').references(() => departments.id),
  permission: varchar('permission', { length: 50 }).notNull().default('read'), // read, execute, manage
  sharedBy: uuid('shared_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 使用日志表
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  functionId: uuid('function_id').references(() => functions.id),
  skillId: uuid('skill_id').references(() => skills.id),
  action: varchar('action', { length: 50 }).notNull(), // execute, view, share
  inputData: jsonb('input_data'), // 输入数据（脱敏后）
  outputData: jsonb('output_data'), // 输出数据（脱敏后）
  cost: jsonb('cost'), // 成本信息 {model, tokens, amount}
  duration: integer('duration'), // 执行耗时（毫秒）
  status: varchar('status', { length: 50 }).notNull(), // success, error, timeout
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 执行任务表
export const executionTasks = pgTable('execution_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  functionId: uuid('function_id').notNull().references(() => functions.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  inputData: jsonb('input_data').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, running, completed, failed, timeout
  runtimeContainerId: varchar('runtime_container_id', { length: 255 }),
  outputData: jsonb('output_data'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 审计日志表
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: auditActionEnum('action').notNull(),
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // function, skill, user, project
  resourceId: uuid('resource_id'),
  oldData: jsonb('old_data'), // 变更前数据（脱敏）
  newData: jsonb('new_data'), // 变更后数据（脱敏）
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

