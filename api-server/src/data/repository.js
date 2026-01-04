/**
 * 📚 数据访问层 (Repository Pattern)
 * 
 * 统一的数据操作接口，支持：
 * - CRUD 操作
 * - 事务处理
 * - 查询构建
 * - 缓存策略
 */

import { and, eq, gte, lte, like, inArray, desc, asc, sql } from 'drizzle-orm';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';

import {
  users, sessions, captures, contexts, learningPatterns, agentLogs, tools, skills, a2uiSessions,
  type User, type NewUser,
  type Session, type NewSession,
  type Capture, type NewCapture,
  type Context, type NewContext,
  type LearningPattern, type NewLearningPattern,
  type AgentLog, type NewAgentLog,
  type Tool, type NewTool,
  type Skill, type NewSkill,
  type A2UISession, type NewA2UISession,
} from './schema.js';

// ============================================================================
// 🎯 Repository 基类
// ============================================================================

abstract class BaseRepository<T, NewT> {
  protected db: DatabaseManager;
  protected table: any;

  constructor(db: DatabaseManager, table: any) {
    this.db = db;
    this.table = table;
  }

  // 基础 CRUD
  async create(data: NewT): Promise<T> {
    return this.db.insert(this.table).values(data).returning().get();
  }

  async findById(id: string): Promise<T | null> {
    return this.db.select().from(this.table).where(eq(this.table.id, id)).get() || null;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.db.update(this.table).set(data as any).where(eq(this.table.id, id)).returning().get();
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.delete(this.table).where(eq(this.table.id, id)).run();
    return true;
  }

  async findAll(): Promise<T[]> {
    return this.db.select().from(this.table).all();
  }

  // 高级查询
  async findWhere(conditions: any[]): Promise<T[]> {
    return this.db.select().from(this.table).where(and(...conditions)).all();
  }
}

// ============================================================================
// 🔧 具体 Repository 实现
// ============================================================================

// 用户仓库
export class UserRepository extends BaseRepository<User, NewUser> {
  constructor(db: DatabaseManager) {
    super(db, users);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.select().from(users).where(eq(users.email, email)).get() || null;
  }
}

// 会话仓库
export class SessionRepository extends BaseRepository<Session, NewSession> {
  constructor(db: DatabaseManager) {
    super(db, sessions);
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.db.select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.status, 'active')))
      .all();
  }
}

// 捕获仓库
export class CaptureRepository extends BaseRepository<Capture, NewCapture> {
  constructor(db: DatabaseManager) {
    super(db, captures);
  }

  // 按状态查询
  async findByStatus(userId: string, status: string): Promise<Capture[]> {
    return this.db.select()
      .from(captures)
      .where(and(eq(captures.userId, userId), eq(captures.status, status)))
      .orderBy(desc(captures.createdAt))
      .all();
  }

  // 需要评审的项目
  async findNeedsReview(userId: string, days: number = 7): Promise<Capture[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return this.db.select()
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          eq(captures.status, 'active'),
          or(
            sql`${captures.lastReviewedAt} IS NULL`,
            sql`${captures.lastReviewedAt} < ${cutoffDate}`
          )
        )
      )
      .all();
  }

  // 按上下文查询
  async findByContext(userId: string, contextId: string): Promise<Capture[]> {
    return this.db.select()
      .from(captures)
      .where(and(eq(captures.userId, userId), eq(captures.contextId, contextId)))
      .all();
  }

  // 搜索
  async search(userId: string, query: string): Promise<Capture[]> {
    return this.db.select()
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          like(captures.content, `%${query}%`)
        )
      )
      .all();
  }

  // 创建捕获（带 AI 分析）
  async createWithAnalysis(data: NewCapture & { analysis?: any }): Promise<Capture> {
    const capture = await this.create(data);
    // 可以在这里触发 AI 分析
    return capture;
  }
}

// 上下文仓库
export class ContextRepository extends BaseRepository<Context, NewContext> {
  constructor(db: DatabaseManager) {
    super(db, contexts);
  }

  async findActive(userId: string): Promise<Context[]> {
    return this.db.select()
      .from(contexts)
      .where(and(eq(contexts.userId, userId), eq(contexts.active, true)))
      .orderBy(asc(contexts.priority))
      .all();
  }

  async findByName(userId: string, name: string): Promise<Context | null> {
    return this.db.select()
      .from(contexts)
      .where(and(eq(contexts.userId, userId), eq(contexts.name, name)))
      .get() || null;
  }
}

// 学习模式仓库
export class LearningPatternRepository extends BaseRepository<LearningPattern, NewLearningPattern> {
  constructor(db: DatabaseManager) {
    super(db, learningPatterns);
  }

  // 获取用户的学习统计
  async getUserStats(userId: string): Promise<{
    total: number;
    correct: number;
    accuracy: number;
  }> {
    const result = this.db.select({
      total: sql`COUNT(*)`,
      correct: sql`SUM(CASE WHEN wasCorrect = 1 THEN 1 ELSE 0 END)`,
    })
      .from(learningPatterns)
      .where(eq(learningPatterns.userId, userId))
      .get() as any;

    return {
      total: result.total || 0,
      correct: result.correct || 0,
      accuracy: result.total > 0 ? (result.correct / result.total) : 0,
    };
  }
}

// Agent 日志仓库
export class AgentLogRepository extends BaseRepository<AgentLog, NewAgentLog> {
  constructor(db: DatabaseManager) {
    super(db, agentLogs);
  }

  async findBySession(sessionId: string): Promise<AgentLog[]> {
    return this.db.select()
      .from(agentLogs)
      .where(eq(agentLogs.sessionId, sessionId))
      .orderBy(desc(agentLogs.createdAt))
      .all();
  }

  async findRecent(userId: string, limit: number = 10): Promise<AgentLog[]> {
    return this.db.select()
      .from(agentLogs)
      .where(eq(agentLogs.userId, userId))
      .orderBy(desc(agentLogs.createdAt))
      .limit(limit)
      .all();
  }

  // 记录工具调用
  async logToolCall(
    sessionId: string,
    userId: string,
    agentName: string,
    toolName: string,
    args: any,
    result: any,
    duration: number
  ): Promise<AgentLog> {
    return this.create({
      sessionId,
      userId,
      agentName,
      request: { tool: toolName, args },
      response: { result },
      toolsCalled: [{ name: toolName, args, result, duration }],
      duration,
      status: 'success',
    });
  }
}

// 工具仓库
export class ToolRepository extends BaseRepository<Tool, NewTool> {
  constructor(db: DatabaseManager) {
    super(db, tools);
  }

  async findEnabled(): Promise<Tool[]> {
    return this.db.select()
      .from(tools)
      .where(eq(tools.enabled, true))
      .all();
  }

  async findByCategory(category: string): Promise<Tool[]> {
    return this.db.select()
      .from(tools)
      .where(and(eq(tools.category, category), eq(tools.enabled, true)))
      .all();
  }

  async findByMcpServer(server: string): Promise<Tool[]> {
    return this.db.select()
      .from(tools)
      .where(and(eq(tools.mcpServer, server), eq(tools.enabled, true)))
      .all();
  }
}

// Skill 仓库
export class SkillRepository extends BaseRepository<Skill, NewSkill> {
  constructor(db: DatabaseManager) {
    super(db, skills);
  }

  async findEnabled(): Promise<Skill[]> {
    return this.db.select()
      .from(skills)
      .where(eq(skills.enabled, true))
      .all();
  }

  // 根据意图匹配 Skill
  async findByIntent(intent: string): Promise<Skill[]> {
    const allSkills = await this.findEnabled();
    return allSkills.filter(skill => {
      const caps = skill.capabilities as any;
      return caps?.intents?.includes(intent);
    });
  }

  // 根据领域匹配 Skill
  async findByDomain(domain: string): Promise<Skill[]> {
    const allSkills = await this.findEnabled();
    return allSkills.filter(skill => {
      const caps = skill.capabilities as any;
      return caps?.domains?.includes(domain);
    });
  }
}

// A2UI 会话仓库
export class A2UISessionRepository extends BaseRepository<A2UISession, NewA2UISession> {
  constructor(db: DatabaseManager) {
    super(db, a2uiSessions);
  }

  async findActiveByUserId(userId: string): Promise<A2UISession | null> {
    return this.db.select()
      .from(a2uiSessions)
      .where(and(eq(a2uiSessions.userId, userId), eq(a2uiSessions.state, 'awaiting_input')))
      .get() || null;
  }

  async updateState(id: string, state: string, componentStack?: any[]): Promise<A2UISession> {
    const updateData: any = { state, updatedAt: new Date().toISOString() };
    if (componentStack) {
      updateData.componentStack = componentStack;
    }
    return this.update(id, updateData);
  }

  // 记录用户输入
  async addInput(id: string, input: any, source: 'user' | 'agent' = 'user'): Promise<A2UISession> {
    const session = await this.findById(id);
    if (!session) throw new Error('Session not found');

    const history = session.inputHistory || [];
    history.push({
      timestamp: new Date().toISOString(),
      input,
      source,
    });

    return this.update(id, { inputHistory: history });
  }
}

// ============================================================================
// 🏭 Repository 工厂
// ============================================================================

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private db: DatabaseManager;

  private constructor(db: DatabaseManager) {
    this.db = db;
  }

  static getInstance(db: DatabaseManager): RepositoryFactory {
    if (!this.instance) {
      this.instance = new RepositoryFactory(db);
    }
    return this.instance;
  }

  // 获取所有仓库
  get repositories() {
    return {
      user: new UserRepository(this.db),
      session: new SessionRepository(this.db),
      capture: new CaptureRepository(this.db),
      context: new ContextRepository(this.db),
      learningPattern: new LearningPatternRepository(this.db),
      agentLog: new AgentLogRepository(this.db),
      tool: new ToolRepository(this.db),
      skill: new SkillRepository(this.db),
      a2uiSession: new A2UISessionRepository(this.db),
    };
  }

  // 事务包装器
  async transaction<T>(fn: (repos: ReturnType<typeof this.repositories>) => Promise<T>): Promise<T> {
    // Drizzle 的事务支持
    return this.db.transaction(fn as any);
  }
}
