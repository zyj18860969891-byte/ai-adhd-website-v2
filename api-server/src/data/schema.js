/**
 * 🏗️ 数据层重构 - 支持 A2UI + Agent 系统
 * 
 * 架构分层：
 * 1. 数据层 (当前) - 核心数据模型
 * 2. 上下文层 - Agent 能力与 Skill 注册
 * 3. 工具层 + A2A层 - 工具调用与 Agent 协作
 * 4. 交互层 A2UI - 用户界面与交互
 */

import { sqliteTable, text, integer, real, json } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// 📊 核心数据模型 (Data Layer)
// ============================================================================

export const generateId = () => createId();

// ============================================================================
// 1. 用户与会话 (User & Session)
// ============================================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  email: text('email').unique(),
  name: text('name'),
  
  // 用户偏好
  preferences: text('preferences', { mode: 'json' }).$type<{
    theme?: 'light' | 'dark';
    language?: 'zh' | 'en';
    timezone?: string;
    notifications?: boolean;
  }>(),
  
  // A2UI 配置
  a2uiConfig: text('a2ui_config', { mode: 'json' }).$type<{
    allowedComponents?: string[];
    theme?: Record<string, any>;
    securityLevel?: 'strict' | 'balanced' | 'permissive';
  }>(),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id),
  
  // 会话类型
  type: text('type', { 
    enum: ['chat', 'task', 'capture', 'review'] 
  }).default('chat'),
  
  // 上下文快照
  contextSnapshot: text('context_snapshot', { mode: 'json' }).$type<{
    activeSkills?: string[];
    availableTools?: string[];
    currentAgent?: string;
  }>(),
  
  // 会话状态
  status: text('status', {
    enum: ['active', 'paused', 'completed', 'archived']
  }).default('active'),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 2. 核心捕获与任务 (Core Capture & Tasks)
// ============================================================================

export const captures = sqliteTable('captures', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id').references(() => sessions.id),
  
  // 核心内容
  content: text('content').notNull(),
  rawInput: text('raw_input'),
  
  // AI 分析
  analysis: text('analysis', { mode: 'json' }).$type<{
    intent?: string;
    entities?: string[];
    confidence?: number;
    reasoning?: string;
    suggestedAction?: string;
  }>(),
  
  // 分类与路由
  category: text('category', {
    enum: ['action', 'note', 'journal', 'link', 'someday', 'reminder', 'project']
  }),
  
  priority: text('priority', {
    enum: ['critical', 'high', 'medium', 'low']
  }),
  
  status: text('status', {
    enum: ['active', 'completed', 'cancelled', 'archived', 'pending']
  }).default('active'),
  
  // 上下文关联
  contextId: text('context_id').references(() => contexts.id),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  
  // 时间管理
  dueDate: text('due_date'),
  reminderDate: text('reminder_date'),
  completedAt: text('completed_at'),
  
  // 评审系统
  lastReviewedAt: text('last_reviewed_at'),
  reviewScore: real('review_score'),
  reviewNotes: text('review_notes'),
  
  // 来源追踪
  source: text('source', {
    enum: ['manual', 'ai', 'voice', 'api', 'import', 'a2ui']
  }).default('manual'),
  
  // A2UI 元数据（如果这个捕获来自 A2UI 交互）
  a2uiMetadata: text('a2ui_metadata', { mode: 'json' }).$type<{
    uiIntent?: string;  // e.g., 'form', 'list', 'card', 'dialog'
    components?: any[]; // A2UI 组件数组
    interactionId?: string;
  }>(),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 3. 上下文与分类 (Contexts & Categories)
// ============================================================================

export const contexts = sqliteTable('contexts', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id),
  
  // 上下文定义
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  
  // AI 学习
  keywords: text('keywords', { mode: 'json' }).$type<string[]>(),
  patterns: text('patterns', { mode: 'json' }).$type<string[]>(),
  
  // UI 主题
  color: text('color'),
  icon: text('icon'),
  
  // 元数据
  active: integer('active', { mode: 'boolean' }).default(true),
  priority: integer('priority').default(0),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 4. AI 学习与反馈 (Learning & Feedback)
// ============================================================================

export const learningPatterns = sqliteTable('learning_patterns', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id),
  
  // 输入特征
  inputKeywords: text('input_keywords', { mode: 'json' }).$type<string[]>(),
  inputLength: integer('input_length'),
  inputPatterns: text('input_patterns', { mode: 'json' }).$type<string[]>(),
  
  // AI 决策
  chosenContextId: text('chosen_context_id').references(() => contexts.id),
  chosenCategory: text('chosen_category', {
    enum: ['action', 'note', 'journal', 'link', 'someday', 'reminder', 'project']
  }),
  originalConfidence: real('original_confidence'),
  
  // 用户反馈
  wasCorrect: integer('was_correct', { mode: 'boolean' }),
  userCorrectedContextId: text('user_corrected_context_id').references(() => contexts.id),
  userCorrectedCategory: text('user_corrected_category', {
    enum: ['action', 'note', 'journal', 'link', 'someday', 'reminder', 'project']
  }),
  
  // 学习权重
  weight: real('weight').default(1.0),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 5. Agent 交互日志 (Agent Interaction Logs)
// ============================================================================

export const agentLogs = sqliteTable('agent_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  sessionId: text('session_id').references(() => sessions.id),
  userId: text('user_id').references(() => users.id),
  
  // Agent 信息
  agentName: text('agent_name').notNull(),
  agentVersion: text('agent_version'),
  
  // 请求与响应
  request: text('request', { mode: 'json' }).$type<any>(),
  response: text('response', { mode: 'json' }).$type<any>(),
  
  // A2UI 响应（如果涉及 UI 交互）
  a2uiResponse: text('a2ui_response', { mode: 'json' }).$type<{
    type: 'ui';
    ui: {
      components: any[];
      layout?: string;
      metadata?: Record<string, any>;
    };
  }>(),
  
  // 工具调用
  toolsCalled: text('tools_called', { mode: 'json' }).$type<{
    name: string;
    args: any;
    result: any;
    duration: number;
  }[]>(),
  
  // 性能指标
  duration: integer('duration'), // ms
  tokensUsed: integer('tokens_used'),
  cost: real('cost'),
  
  // 状态
  status: text('status', {
    enum: ['success', 'error', 'pending', 'cancelled']
  }).default('success'),
  
  error: text('error'),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 6. 工具注册表 (Tool Registry) - 工具层
// ============================================================================

export const tools = sqliteTable('tools', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  
  // 工具定义
  name: text('name').unique().notNull(),
  description: text('description'),
  
  // 参数 schema (JSON Schema)
  parameters: text('parameters', { mode: 'json' }).$type<{
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  }>(),
  
  // 执行配置
  executor: text('executor', {
    enum: ['mcp', 'internal', 'external', 'a2a']
  }).default('internal'),
  
  // MCP 相关
  mcpServer: text('mcp_server'), // e.g., 'churnflow', 'shrimp'
  mcpToolName: text('mcp_tool_name'),
  
  // A2A 相关 (Agent-to-Agent)
  a2aEndpoint: text('a2a_endpoint'),
  a2aProtocol: text('a2a_protocol', {
    enum: ['json-rpc', 'rest', 'websocket']
  }),
  
  // 权限与安全
  permissionLevel: text('permission_level', {
    enum: ['read', 'write', 'admin', 'system']
  }).default('read'),
  
  // 元数据
  category: text('category', {
    enum: ['task', 'capture', 'search', 'analysis', 'ui', 'a2a']
  }),
  
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 7. Skill 注册表 (Skill Registry) - 上下文层
// ============================================================================

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  
  // Skill 定义
  name: text('name').unique().notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  
  // 能力描述 (用于 AI 选择)
  capabilities: text('capabilities', { mode: 'json' }).$type<{
    intents: string[];  // e.g., ['capture', 'schedule', 'analyze']
    domains: string[];  // e.g., ['productivity', 'task', 'note']
    confidence: number; // 0-1
  }>(),
  
  // 关联工具
  toolIds: text('tool_ids', { mode: 'json' }).$type<string[]>(),
  
  // 执行流程
  workflow: text('workflow', { mode: 'json' }).$type<{
    steps: {
      tool: string;
      condition?: string;
      fallback?: string;
    }[];
  }>(),
  
  // A2UI 集成
  uiComponents: text('ui_components', { mode: 'json' }).$type<{
    intent: string;  // e.g., 'form', 'list', 'dashboard'
    components: any[]; // A2UI 组件定义
    layout?: string;
  }>(),
  
  // 权限
  permissionLevel: text('permission_level', {
    enum: ['read', 'write', 'admin', 'system']
  }).default('read'),
  
  // 状态
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 8. A2UI 交互会话 (A2UI Interaction Sessions)
// ============================================================================

export const a2uiSessions = sqliteTable('a2ui_sessions', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id').references(() => sessions.id),
  
  // A2UI 交互状态
  state: text('state', {
    enum: ['idle', 'generating', 'rendering', 'awaiting_input', 'completed', 'error']
  }).default('idle'),
  
  // 当前 UI 意图
  currentIntent: text('current_intent', {
    enum: ['form', 'list', 'card', 'dialog', 'dashboard', 'wizard']
  }),
  
  // UI 组件栈
  componentStack: text('component_stack', { mode: 'json' }).$type<{
    id: string;
    type: string;
    props: Record<string, any>;
    children?: any[];
  }[]>(),
  
  // 用户输入历史
  inputHistory: text('input_history', { mode: 'json' }).$type<{
    timestamp: string;
    input: any;
    source: 'user' | 'agent';
  }[]>(),
  
  // 安全审计
  securityAudit: text('security_audit', { mode: 'json' }).$type<{
    allowedComponents: string[];
    blockedComponents: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }>(),
  
  // 元数据
  metadata: text('metadata', { mode: 'json' }).$type<{
    agentName?: string;
    skillName?: string;
    toolName?: string;
    originalRequest?: string;
  }>(),
  
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ============================================================================
// 关系定义 (Relations)
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  captures: many(captures),
  contexts: many(contexts),
  learningPatterns: many(learningPatterns),
  agentLogs: many(agentLogs),
  a2uiSessions: many(a2uiSessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  captures: many(captures),
  agentLogs: many(agentLogs),
  a2uiSessions: many(a2uiSessions),
}));

export const capturesRelations = relations(captures, ({ one }) => ({
  user: one(users, { fields: [captures.userId], references: [users.id] }),
  session: one(sessions, { fields: [captures.sessionId], references: [sessions.id] }),
  context: one(contexts, { fields: [captures.contextId], references: [contexts.id] }),
}));

export const contextsRelations = relations(contexts, ({ one, many }) => ({
  user: one(users, { fields: [contexts.userId], references: [users.id] }),
  captures: many(captures),
  learningPatterns: many(learningPatterns),
}));

export const learningPatternsRelations = relations(learningPatterns, ({ one }) => ({
  user: one(users, { fields: [learningPatterns.userId], references: [users.id] }),
  chosenContext: one(contexts, { 
    fields: [learningPatterns.chosenContextId], 
    references: [contexts.id] 
  }),
  correctedContext: one(contexts, { 
    fields: [learningPatterns.userCorrectedContextId], 
    references: [contexts.id] 
  }),
}));

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  session: one(sessions, { fields: [agentLogs.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [agentLogs.userId], references: [users.id] }),
}));

export const a2uiSessionsRelations = relations(a2uiSessions, ({ one }) => ({
  user: one(users, { fields: [a2uiSessions.userId], references: [users.id] }),
  session: one(sessions, { fields: [a2uiSessions.sessionId], references: [sessions.id] }),
}));

// ============================================================================
// 类型导出 (Type Exports)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Capture = typeof captures.$inferSelect;
export type NewCapture = typeof captures.$inferInsert;

export type Context = typeof contexts.$inferSelect;
export type NewContext = typeof contexts.$inferInsert;

export type LearningPattern = typeof learningPatterns.$inferSelect;
export type NewLearningPattern = typeof learningPatterns.$inferInsert;

export type AgentLog = typeof agentLogs.$inferSelect;
export type NewAgentLog = typeof agentLogs.$inferInsert;

export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type A2UISession = typeof a2uiSessions.$inferSelect;
export type NewA2UISession = typeof a2uiSessions.$inferInsert;
