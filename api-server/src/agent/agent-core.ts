/**
 * 🧠 Agent 核心引擎
 * 
 * 整合所有层：
 * 1. 数据层 - Repository
 * 2. 上下文层 - Skill Registry
 * 3. 工具层 - Tool Orchestrator
 * 4. 交互层 - A2UI Renderer
 */

import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { RepositoryFactory } from '../data/repository.js';
import { SkillRegistry, ContextManager } from '../skill/skill-registry.js';
import { ToolRegistry, ToolExecutor, A2ACoordinator } from '../tools/tool-orchestrator.js';
import { A2UIRenderer, A2UIInteractionManager, A2UIResponse } from '../a2ui/a2ui-renderer.js';
import { StdioMCPClient } from '../stdio-mcp-client.js';

// ============================================================================
// Agent 配置
// ============================================================================

export interface AgentConfig {
  name: string;
  version: string;
  capabilities: string[];
  permissionLevel: 'read' | 'write' | 'admin' | 'system';
}

// ============================================================================
// Agent 核心类
// ============================================================================

export class AgentCore {
  // 基础设施
  private db: DatabaseManager;
  private repositoryFactory: RepositoryFactory;

  // 注册表
  private skillRegistry: SkillRegistry;
  private toolRegistry: ToolRegistry;
  private contextManager: ContextManager;

  // 执行器
  private toolExecutor: ToolExecutor;
  private a2aCoordinator: A2ACoordinator;
  private a2uiRenderer: A2UIRenderer;
  private a2uiInteractionManager: A2UIInteractionManager;

  // 配置
  private config: AgentConfig;

  // MCP 客户端
  private mcpClients: Map<string, StdioMCPClient> = new Map();

  constructor(db: DatabaseManager, config: AgentConfig) {
    this.db = db;
    this.config = config;
    this.repositoryFactory = RepositoryFactory.getInstance(db);

    // 初始化各层
    this.skillRegistry = new SkillRegistry(db);
    this.toolRegistry = new ToolRegistry(db);
    this.contextManager = new ContextManager(db);

    // 初始化执行器
    this.toolExecutor = new ToolExecutor(db);
    this.a2aCoordinator = new A2ACoordinator(db, this.toolExecutor);
    this.a2uiRenderer = new A2UIRenderer(db);
    this.a2uiInteractionManager = new A2UIInteractionManager(db);
  }

  // 注册 MCP 客户端
  registerMCPClient(name: string, client: StdioMCPClient): void {
    this.mcpClients.set(name, client);
    this.toolExecutor.registerMCPClient(name, client);
  }

  // ============================================================================
  // 核心处理流程
  // ============================================================================

  /**
   * 处理用户输入
   * @param userId 用户ID
   * @param input 用户输入
   * @param sessionId 可选的会话ID
   */
  async process(
    userId: string,
    input: string,
    sessionId?: string
  ): Promise<{
    response: any;
    type: 'text' | 'ui' | 'error';
    metadata?: any;
  }> {
    const startTime = Date.now();

    try {
      // 1. 分析上下文和意图
      const contextAnalysis = await this.analyzeContext(userId, input);
      
      // 2. 路由到合适的 Skill
      const skillMatch = await this.skillRegistry.routeSkill(userId, input, contextAnalysis.context?.name);
      
      if (!skillMatch) {
        return {
          type: 'text',
          response: '抱歉，我无法处理这个请求。请尝试更具体的描述。',
        };
      }

      const { skill, confidence, reason } = skillMatch;

      // 3. 检查权限
      if (!this.skillRegistry.validatePermission(skill.name, this.config.permissionLevel)) {
        return {
          type: 'text',
          response: `权限不足。需要 ${skill.permissionLevel} 权限，当前为 ${this.config.permissionLevel}`,
        };
      }

      // 4. 执行 Skill 工作流
      const result = await this.executeSkillWorkflow(skill, userId, input, contextAnalysis);

      // 5. 记录 Agent 日志
      await this.repositoryFactory.repositories.agentLog.create({
        sessionId: sessionId || 'system',
        userId,
        agentName: this.config.name,
        request: { input, context: contextAnalysis },
        response: result,
        duration: Date.now() - startTime,
        status: 'success',
        toolsCalled: result.toolsCalled,
        a2uiResponse: result.type === 'ui' ? result.response : undefined,
      } as any);

      // 6. 返回响应
      return {
        response: result.response,
        type: result.type,
        metadata: {
          skill: skill.name,
          confidence,
          reason,
          duration: Date.now() - startTime,
        },
      };

    } catch (error: any) {
      // 记录错误日志
      await this.repositoryFactory.repositories.agentLog.create({
        sessionId: sessionId || 'system',
        userId,
        agentName: this.config.name,
        request: { input },
        response: { error: error.message },
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message,
      } as any);

      return {
        type: 'error',
        response: `处理失败: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  // 分析上下文
  private async analyzeContext(userId: string, input: string): Promise<{
    context?: any;
    intent: string;
    entities: string[];
  }> {
    const contextMatch = await this.contextManager.matchContext(userId, input);
    
    // 简化的意图分析
    const lower = input.toLowerCase();
    let intent = 'capture';
    if (lower.match(/任务|todo|schedule/)) intent = 'task';
    if (lower.match(/评审|review/)) intent = 'review';
    if (lower.match(/分析|stats/)) intent = 'analyze';

    return {
      context: contextMatch?.context,
      intent,
      entities: [],
    };
  }

  // 执行 Skill 工作流
  private async executeSkillWorkflow(
    skill: any,
    userId: string,
    input: string,
    contextAnalysis: any
  ): Promise<{
    response: any;
    type: 'text' | 'ui';
    toolsCalled?: any[];
  }> {
    const toolsCalled: any[] = [];

    // 遍历工作流步骤
    for (const step of skill.workflow.steps) {
      const toolName = step.tool;
      
      // 执行工具
      const toolResult = await this.toolExecutor.execute(
        toolName,
        this.prepareToolArgs(toolName, userId, input, contextAnalysis),
        userId,
        this.config.permissionLevel
      );

      toolsCalled.push({
        tool: toolName,
        result: toolResult,
      });

      if (!toolResult.success) {
        // 如果有回退，执行回退
        if (step.fallback) {
          const fallbackResult = await this.toolExecutor.execute(
            step.fallback,
            this.prepareToolArgs(step.fallback, userId, input, contextAnalysis),
            userId,
            this.config.permissionLevel
          );
          toolsCalled.push({
            tool: step.fallback,
            result: fallbackResult,
          });
          
          if (fallbackResult.success) {
            continue;
          }
        }

        throw new Error(`工具 ${toolName} 执行失败: ${toolResult.error}`);
      }

      // 如果工具返回 A2UI 响应，直接返回
      if (toolResult.result?.type === 'ui') {
        return {
          response: toolResult.result,
          type: 'ui',
          toolsCalled,
        };
      }
    }

    // 检查是否需要生成 A2UI
    if (skill.uiComponents) {
      const a2uiResponse: A2UIResponse = {
        type: 'ui',
        ui: {
          intent: skill.uiComponents.intent,
          components: skill.uiComponents.components,
          layout: skill.uiComponents.layout,
          metadata: {
            skill: skill.name,
            agentName: this.config.name,
          },
        },
      };

      return {
        response: a2uiResponse,
        type: 'ui',
        toolsCalled,
      };
    }

    // 默认返回文本
    return {
      response: `已执行 ${skill.displayName}，使用工具: ${toolsCalled.map(t => t.tool).join(', ')}`,
      type: 'text',
      toolsCalled,
    };
  }

  // 准备工具参数
  private prepareToolArgs(toolName: string, userId: string, input: string, contextAnalysis: any): any {
    switch (toolName) {
      case 'capture_tool':
        return { content: input, category: contextAnalysis.intent, priority: 'medium' };
      
      case 'context_analyzer':
        return { input, userId };
      
      case 'ai_classifier':
        return { content: input, categories: ['action', 'note', 'journal', 'link', 'someday', 'reminder'] };
      
      case 'task_create':
        return { title: input, description: '', priority: 'medium' };
      
      case 'review_finder':
        return { userId, days: 7 };
      
      case 'a2ui_generator':
        return {
          intent: contextAnalysis.intent === 'capture' ? 'form' : 'list',
          components: [],
          layout: 'vertical',
          metadata: { agentName: this.config.name },
        };
      
      default:
        return { userId, input, ...contextAnalysis };
    }
  }

  // ============================================================================
  // 高级功能
  // ============================================================================

  // Agent 协作
  async collaborate(agents: string[], task: string, strategy?: 'sequential' | 'parallel' | 'competitive'): Promise<any> {
    return this.a2aCoordinator.coordinate(agents, task, strategy);
  }

  // 启动 A2UI 交互
  async startA2UIInteraction(userId: string, intent: string): Promise<{
    response: A2UIResponse;
    sessionId: string;
  }> {
    return this.a2uiInteractionManager.startInteraction(userId, intent, {
      agentName: this.config.name,
    });
  }

  // 处理 A2UI 用户输入
  async handleA2UIInput(sessionId: string, userInput: any): Promise<any> {
    return this.a2uiInteractionManager.handleUserResponse(sessionId, userInput);
  }

  // 初始化系统（首次运行）
  async initializeSystem(): Promise<void> {
    console.log(`[${this.config.name}] 初始化系统...`);

    // 持久化 Skills
    await this.skillRegistry.persistToDatabase();
    console.log(`[${this.config.name}] Skills 已持久化`);

    // 持久化 Tools
    await this.toolRegistry.persistToDatabase();
    console.log(`[${this.config.name}] Tools 已持久化`);

    // 创建默认上下文
    const contextManager = new ContextManager(this.db);
    const userId = 'system';

    const defaultContexts = [
      { name: 'work', displayName: '工作', keywords: ['工作', '项目', '会议', '任务'], color: '#3b82f6' },
      { name: 'personal', displayName: '个人', keywords: ['个人', '生活', '家庭', '娱乐'], color: '#10b981' },
      { name: 'learning', displayName: '学习', keywords: ['学习', '阅读', '课程', '研究'], color: '#f59e0b' },
    ];

    for (const ctx of defaultContexts) {
      const existing = await this.repositoryFactory.repositories.context.findByName(userId, ctx.name);
      if (!existing) {
        await contextManager.createContext(userId, ctx);
        console.log(`[${this.config.name}] 创建上下文: ${ctx.displayName}`);
      }
    }

    console.log(`[${this.config.name}] 系统初始化完成！`);
  }

  // 获取系统状态
  async getSystemStatus(): Promise<{
    skills: number;
    tools: number;
    contexts: number;
    logs: number;
    mcpClients: string[];
  }> {
    const skills = await this.repositoryFactory.repositories.skill.findAll();
    const tools = await this.repositoryFactory.repositories.tool.findAll();
    const contexts = await this.repositoryFactory.repositories.context.findAll();
    const logs = await this.repositoryFactory.repositories.agentLog.findAll();

    return {
      skills: skills.length,
      tools: tools.length,
      contexts: contexts.length,
      logs: logs.length,
      mcpClients: Array.from(this.mcpClients.keys()),
    };
  }
}

// ============================================================================
// Agent 工厂
// ============================================================================

export class AgentFactory {
  private static agents: Map<string, AgentCore> = new Map();

  static create(name: string, db: DatabaseManager, config?: Partial<AgentConfig>): AgentCore {
    const defaultConfig: AgentConfig = {
      name,
      version: '1.0.0',
      capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui'],
      permissionLevel: 'write',
      ...config,
    };

    const agent = new AgentCore(db, defaultConfig);
    this.agents.set(name, agent);
    return agent;
  }

  static get(name: string): AgentCore | undefined {
    return this.agents.get(name);
  }

  static getAll(): AgentCore[] {
    return Array.from(this.agents.values());
  }
}
