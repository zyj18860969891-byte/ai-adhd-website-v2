/**
 * 🛠️ 工具层 + A2A层 (Agent-to-Agent)
 * 
 * 职责：
 * 1. 工具调用机制
 * 2. MCP 工具集成
 * 3. Agent 间协作协议 (A2A)
 * 4. 工具执行与编排
 */

import { RepositoryFactory } from '../data/repository.js';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { StdioMCPClient } from '../stdio-mcp-client.js';
import type { Tool, NewTool } from '../data/schema.js';

// ============================================================================
// 工具定义接口
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  
  // 执行器类型
  executor: 'mcp' | 'internal' | 'external' | 'a2a';
  
  // MCP 相关
  mcpServer?: string;
  mcpToolName?: string;
  
  // A2A 相关
  a2aEndpoint?: string;
  a2aProtocol?: 'json-rpc' | 'rest' | 'websocket';
  
  // 权限
  permissionLevel: 'read' | 'write' | 'admin' | 'system';
  
  // 分类
  category: 'task' | 'capture' | 'search' | 'analysis' | 'ui' | 'a2a';
}

// ============================================================================
// 预定义工具
// ============================================================================

export const PREDEFINED_TOOLS: ToolDefinition[] = [
  // 1. 捕获工具 (MCP: ChurnFlow)
  {
    name: 'capture_tool',
    description: '捕获用户输入并存储到数据库',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '捕获内容' },
        category: { type: 'string', enum: ['action', 'note', 'journal', 'link', 'someday', 'reminder'] },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        contextId: { type: 'string', description: '上下文ID' },
        dueDate: { type: 'string', description: '截止日期 (ISO)' },
      },
      required: ['content'],
    },
    executor: 'mcp',
    mcpServer: 'churnflow',
    mcpToolName: 'capture',
    permissionLevel: 'write',
    category: 'capture',
  },

  // 2. 上下文分析工具 (Internal)
  {
    name: 'context_analyzer',
    description: '分析输入内容，提取上下文和意图',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string', description: '待分析的输入' },
        userId: { type: 'string', description: '用户ID' },
      },
      required: ['input', 'userId'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'analysis',
  },

  // 3. AI 分类工具 (Internal)
  {
    name: 'ai_classifier',
    description: '使用 AI 分类内容',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '待分类内容' },
        categories: { type: 'array', items: { type: 'string' } },
      },
      required: ['content', 'categories'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'analysis',
  },

  // 4. 任务创建工具 (MCP: Shrimp)
  {
    name: 'task_create',
    description: '创建新任务',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '任务标题' },
        description: { type: 'string', description: '任务描述' },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        dueDate: { type: 'string', description: '截止日期' },
      },
      required: ['title'],
    },
    executor: 'mcp',
    mcpServer: 'shrimp',
    mcpToolName: 'create_task',
    permissionLevel: 'write',
    category: 'task',
  },

  // 5. 任务列表工具 (MCP: Shrimp)
  {
    name: 'task_list',
    description: '列出所有任务',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'completed', 'all'] },
        limit: { type: 'number' },
      },
      required: [],
    },
    executor: 'mcp',
    mcpServer: 'shrimp',
    mcpToolName: 'list_tasks',
    permissionLevel: 'read',
    category: 'task',
  },

  // 6. 任务更新工具 (MCP: Shrimp)
  {
    name: 'task_update',
    description: '更新任务',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '任务ID' },
        title: { type: 'string' },
        completed: { type: 'boolean' },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
      },
      required: ['id'],
    },
    executor: 'mcp',
    mcpServer: 'shrimp',
    mcpToolName: 'update_task',
    permissionLevel: 'write',
    category: 'task',
  },

  // 7. 评审查找工具 (Internal)
  {
    name: 'review_finder',
    description: '查找需要评审的项目',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        days: { type: 'number', description: '回顾天数' },
      },
      required: ['userId'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'analysis',
  },

  // 8. 评审 UI 工具 (A2UI)
  {
    name: 'review_ui',
    description: '生成评审界面',
    parameters: {
      type: 'object',
      properties: {
        items: { type: 'array', description: '待评审项目' },
        mode: { type: 'string', enum: ['quick', 'detailed'] },
      },
      required: ['items'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'ui',
  },

  // 9. A2UI 生成器 (A2UI)
  {
    name: 'a2ui_generator',
    description: '生成 A2UI 组件',
    parameters: {
      type: 'object',
      properties: {
        intent: { type: 'string', enum: ['form', 'list', 'card', 'dialog', 'dashboard', 'wizard'] },
        components: { type: 'array', description: '组件定义' },
        layout: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['intent', 'components'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'ui',
  },

  // 10. A2UI 验证器 (A2UI)
  {
    name: 'a2ui_validator',
    description: '验证 A2UI 响应的安全性',
    parameters: {
      type: 'object',
      properties: {
        uiResponse: { type: 'object', description: 'A2UI 响应' },
        allowedComponents: { type: 'array', description: '允许的组件类型' },
      },
      required: ['uiResponse'],
    },
    executor: 'internal',
    permissionLevel: 'admin',
    category: 'ui',
  },

  // 11. A2A 协调器 (Agent-to-Agent)
  {
    name: 'a2a_coordinator',
    description: '协调多个 Agent 协作',
    parameters: {
      type: 'object',
      properties: {
        agents: { type: 'array', items: { type: 'string' } },
        task: { type: 'string' },
        strategy: { type: 'string', enum: ['sequential', 'parallel', 'competitive'] },
      },
      required: ['agents', 'task'],
    },
    executor: 'a2a',
    a2aProtocol: 'json-rpc',
    permissionLevel: 'admin',
    category: 'a2a',
  },

  // 12. 任务拆分器 (Internal)
  {
    name: 'task_splitter',
    description: '拆分复杂任务为子任务',
    parameters: {
      type: 'object',
      properties: {
        task: { type: 'string', description: '复杂任务描述' },
        maxSubtasks: { type: 'number', default: 5 },
      },
      required: ['task'],
    },
    executor: 'internal',
    permissionLevel: 'write',
    category: 'task',
  },

  // 13. 结果聚合器 (Internal)
  {
    name: 'result_aggregator',
    description: '聚合多个 Agent 的结果',
    parameters: {
      type: 'object',
      properties: {
        results: { type: 'array', description: '各 Agent 的结果' },
        strategy: { type: 'string', enum: ['merge', 'best', 'vote'] },
      },
      required: ['results'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'a2a',
  },

  // 14. 数据分析器 (Internal)
  {
    name: 'data_analyzer',
    description: '分析用户数据',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        metrics: { type: 'array', items: { type: 'string' } },
        timeRange: { type: 'string', enum: ['day', 'week', 'month', 'all'] },
      },
      required: ['userId'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'analysis',
  },

  // 15. 洞见生成器 (Internal)
  {
    name: 'insight_generator',
    description: '生成数据洞察',
    parameters: {
      type: 'object',
      properties: {
        data: { type: 'object', description: '分析数据' },
        context: { type: 'string' },
      },
      required: ['data'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'analysis',
  },

  // 16. 报告构建器 (A2UI)
  {
    name: 'report_builder',
    description: '构建可视化报告',
    parameters: {
      type: 'object',
      properties: {
        insights: { type: 'array', description: '洞察列表' },
        format: { type: 'string', enum: ['dashboard', 'chart', 'table'] },
      },
      required: ['insights'],
    },
    executor: 'internal',
    permissionLevel: 'read',
    category: 'ui',
  },
];

// ============================================================================
// 工具执行器
// ============================================================================

export class ToolExecutor {
  private mcpClients: Map<string, StdioMCPClient> = new Map();
  private repositoryFactory: RepositoryFactory;

  constructor(db: DatabaseManager) {
    this.repositoryFactory = RepositoryFactory.getInstance(db);
  }

  // 注册 MCP 客户端
  registerMCPClient(name: string, client: StdioMCPClient): void {
    this.mcpClients.set(name, client);
  }

  // 执行工具
  async execute(
    toolName: string,
    args: any,
    userId: string,
    permission: string
  ): Promise<{
    success: boolean;
    result: any;
    duration: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // 1. 获取工具定义
      const toolRepo = this.repositoryFactory.repositories.tool;
      const tools = await toolRepo.findWhere([
        eq((toolRepo as any).table.name, toolName),
        eq((toolRepo as any).table.enabled, true)
      ]);

      if (tools.length === 0) {
        throw new Error(`Tool ${toolName} not found or disabled`);
      }

      const tool = tools[0];

      // 2. 验证权限
      if (!this.validatePermission(tool.permissionLevel, permission)) {
        throw new Error(`Permission denied: need ${tool.permissionLevel}, got ${permission}`);
      }

      // 3. 根据执行器类型执行
      let result: any;

      switch (tool.executor) {
        case 'mcp':
          result = await this.executeMCP(tool, args);
          break;
        case 'internal':
          result = await this.executeInternal(toolName, args, userId);
          break;
        case 'a2a':
          result = await this.executeA2A(tool, args);
          break;
        case 'external':
          result = await this.executeExternal(tool, args);
          break;
        default:
          throw new Error(`Unknown executor: ${tool.executor}`);
      }

      const duration = Date.now() - startTime;

      // 4. 记录日志
      await this.repositoryFactory.repositories.agentLog.logToolCall(
        'system', // session ID
        userId,
        'ToolExecutor',
        toolName,
        args,
        result,
        duration
      );

      return {
        success: true,
        result,
        duration,
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        result: null,
        duration,
        error: error.message,
      };
    }
  }

  // 执行 MCP 工具
  private async executeMCP(tool: Tool, args: any): Promise<any> {
    if (!tool.mcpServer || !tool.mcpToolName) {
      throw new Error('MCP tool missing server or tool name');
    }

    const client = this.mcpClients.get(tool.mcpServer);
    if (!client) {
      throw new Error(`MCP client ${tool.mcpServer} not connected`);
    }

    return client.callTool(tool.mcpToolName, args);
  }

  // 执行内部工具
  private async executeInternal(toolName: string, args: any, userId: string): Promise<any> {
    switch (toolName) {
      case 'context_analyzer':
        return this.analyzeContext(args.input, userId);
      
      case 'ai_classifier':
        return this.classifyContent(args.content, args.categories);
      
      case 'review_finder':
        return this.findReviews(args.userId, args.days);
      
      case 'review_ui':
        return this.generateReviewUI(args.items, args.mode);
      
      case 'a2ui_generator':
        return this.generateA2UI(args.intent, args.components, args.layout, args.metadata);
      
      case 'a2ui_validator':
        return this.validateA2UI(args.uiResponse, args.allowedComponents);
      
      case 'task_splitter':
        return this.splitTask(args.task, args.maxSubtasks);
      
      case 'result_aggregator':
        return this.aggregateResults(args.results, args.strategy);
      
      case 'data_analyzer':
        return this.analyzeData(args.userId, args.metrics, args.timeRange);
      
      case 'insight_generator':
        return this.generateInsights(args.data, args.context);
      
      case 'report_builder':
        return this.buildReport(args.insights, args.format);
      
      default:
        throw new Error(`Internal tool ${toolName} not implemented`);
    }
  }

  // 执行 A2A 工具
  private async executeA2A(tool: Tool, args: any): Promise<any> {
    // A2A 协议实现
    if (tool.a2aProtocol === 'json-rpc') {
      return this.executeJsonRPC(tool.a2aEndpoint!, args);
    }
    
    throw new Error(`A2A protocol ${tool.a2aProtocol} not implemented`);
  }

  // 执行外部工具
  private async executeExternal(tool: Tool, args: any): Promise<any> {
    // 外部 API 调用
    throw new Error('External tool execution not implemented');
  }

  // 权限验证
  private validatePermission(toolPermission: string, userPermission: string): boolean {
    const levels = ['read', 'write', 'admin', 'system'];
    return levels.indexOf(userPermission) >= levels.indexOf(toolPermission);
  }

  // ============================================================================
  // 内部工具实现
  // ============================================================================

  private async analyzeContext(input: string, userId: string): Promise<{
    intent: string;
    entities: string[];
    confidence: number;
  }> {
    // 简化的上下文分析
    const lower = input.toLowerCase();
    let intent = 'capture';
    
    if (lower.match(/任务|todo|schedule/)) intent = 'task';
    if (lower.match(/评审|review/)) intent = 'review';
    if (lower.match(/分析|stats/)) intent = 'analysis';

    return {
      intent,
      entities: [],
      confidence: 0.8,
    };
  }

  private async classifyContent(content: string, categories: string[]): Promise<{
    category: string;
    confidence: number;
    reasoning: string;
  }> {
    // 简化的分类逻辑
    const lower = content.toLowerCase();
    
    if (lower.match(/完成|done|check/)) {
      return { category: 'action', confidence: 0.9, reasoning: '包含完成动词' };
    }
    
    if (lower.match(/链接|http|www/)) {
      return { category: 'link', confidence: 0.95, reasoning: '包含 URL' };
    }

    return { category: 'note', confidence: 0.7, reasoning: '默认分类' };
  }

  private async findReviews(userId: string, days: number = 7): Promise<any[]> {
    const repo = this.repositoryFactory.repositories.capture;
    return repo.findNeedsReview(userId, days);
  }

  private async generateReviewUI(items: any[], mode: string): Promise<any> {
    return {
      type: 'ui',
      ui: {
        intent: 'card',
        components: items.map(item => ({
          type: 'card',
          content: item.content,
          metadata: {
            priority: item.priority,
            dueDate: item.dueDate,
            lastReviewedAt: item.lastReviewedAt,
          },
          actions: ['approve', 'reject', 'edit', 'snooze'],
        })),
        layout: mode === 'detailed' ? 'vertical' : 'horizontal',
      },
    };
  }

  private async generateA2UI(intent: string, components: any[], layout?: string, metadata?: any): Promise<any> {
    return {
      type: 'ui',
      ui: {
        intent,
        components,
        layout: layout || 'vertical',
        metadata,
      },
    };
  }

  private async validateA2UI(uiResponse: any, allowedComponents?: string[]): Promise<{
    valid: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    blocked?: string[];
  }> {
    const components = uiResponse.ui?.components || [];
    const blocked: string[] = [];

    if (allowedComponents) {
      components.forEach((comp: any) => {
        if (!allowedComponents.includes(comp.type)) {
          blocked.push(comp.type);
        }
      });
    }

    return {
      valid: blocked.length === 0,
      riskLevel: blocked.length > 0 ? 'high' : 'low',
      blocked: blocked.length > 0 ? blocked : undefined,
    };
  }

  private async splitTask(task: string, maxSubtasks: number = 5): Promise<{
    subtasks: string[];
    reasoning: string;
  }> {
    // 简化的任务拆分
    const keywords = task.split(/[,，.。;；]/).filter(k => k.trim());
    
    return {
      subtasks: keywords.slice(0, maxSubtasks),
      reasoning: '基于标点符号拆分',
    };
  }

  private async aggregateResults(results: any[], strategy: string): Promise<any> {
    switch (strategy) {
      case 'merge':
        return { merged: results };
      case 'best':
        return results.reduce((best, curr) => 
          (curr.confidence || 0) > (best.confidence || 0) ? curr : best
        );
      case 'vote':
        // 简单的投票逻辑
        return results[0];
      default:
        return results;
    }
  }

  private async analyzeData(userId: string, metrics: string[], timeRange: string): Promise<any> {
    const repo = this.repositoryFactory.repositories.capture;
    const captures = await repo.findByStatus(userId, 'completed');

    return {
      total: captures.length,
      byDay: captures.length,
      metrics: metrics,
      timeRange,
    };
  }

  private async generateInsights(data: any, context: string): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    return {
      insights: ['数据分布均匀', '趋势向上'],
      recommendations: ['继续保持', '关注低优先级任务'],
    };
  }

  private async buildReport(insights: any[], format: string): Promise<any> {
    return {
      type: 'report',
      format,
      insights,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeJsonRPC(endpoint: string, args: any): Promise<any> {
    // JSON-RPC 实现
    throw new Error('JSON-RPC not implemented');
  }
}

// ============================================================================
// A2A 协调器 (Agent-to-Agent)
// ============================================================================

export class A2ACoordinator {
  private toolExecutor: ToolExecutor;
  private repositoryFactory: RepositoryFactory;

  constructor(db: DatabaseManager, toolExecutor: ToolExecutor) {
    this.toolExecutor = toolExecutor;
    this.repositoryFactory = RepositoryFactory.getInstance(db);
  }

  // 协调多个 Agent 完成任务
  async coordinate(
    agents: string[],
    task: string,
    strategy: 'sequential' | 'parallel' | 'competitive' = 'sequential'
  ): Promise<any> {
    const results = [];

    switch (strategy) {
      case 'sequential':
        for (const agent of agents) {
          const result = await this.executeAgentTask(agent, task);
          results.push({ agent, result });
        }
        break;

      case 'parallel':
        const promises = agents.map(agent => this.executeAgentTask(agent, task));
        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults.map((result, i) => ({ agent: agents[i], result })));
        break;

      case 'competitive':
        // 竞争模式：返回最快/最好的结果
        const raceResults = await Promise.race(
          agents.map(agent => this.executeAgentTask(agent, task))
        );
        results.push({ agent: 'winner', result: raceResults });
        break;
    }

    // 记录协作日志
    await this.repositoryFactory.repositories.agentLog.create({
      sessionId: 'system',
      userId: 'system',
      agentName: 'A2ACoordinator',
      request: { agents, task, strategy },
      response: { results },
      duration: 0,
      status: 'success',
      toolsCalled: [{
        name: 'a2a_coordinator',
        args: { agents, task, strategy },
        result: results,
        duration: 0,
      }],
    } as any);

    return results;
  }

  private async executeAgentTask(agent: string, task: string): Promise<any> {
    // 模拟 Agent 执行
    // 实际中会调用对应的 Agent 服务
    return {
      agent,
      task,
      status: 'completed',
      result: `Agent ${agent} completed task: ${task}`,
    };
  }
}

// ============================================================================
// 工具注册表
// ============================================================================

export class ToolRegistry {
  private repositoryFactory: RepositoryFactory;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(db: DatabaseManager) {
    this.repositoryFactory = RepositoryFactory.getInstance(db);
    this.initializeDefaultTools();
  }

  private initializeDefaultTools(): void {
    PREDEFINED_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  // 持久化到数据库
  async persistToDatabase(): Promise<void> {
    const toolRepo = this.repositoryFactory.repositories.tool;
    
    for (const tool of this.tools.values()) {
      const existing = await toolRepo.findWhere([
        eq((toolRepo as any).table.name, tool.name)
      ]);
      
      if (existing.length === 0) {
        await toolRepo.create({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
          executor: tool.executor,
          mcpServer: tool.mcpServer,
          mcpToolName: tool.mcpToolName,
          a2aEndpoint: tool.a2aEndpoint,
          a2aProtocol: tool.a2aProtocol,
          permissionLevel: tool.permissionLevel,
          category: tool.category,
          enabled: true,
        } as any);
      }
    }
  }

  // 从数据库加载
  async loadFromDatabase(): Promise<void> {
    const toolRepo = this.repositoryFactory.repositories.tool;
    const dbTools = await toolRepo.findEnabled();
    
    dbTools.forEach(tool => {
      this.tools.set(tool.name, {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as any,
        executor: tool.executor as any,
        mcpServer: tool.mcpServer,
        mcpToolName: tool.mcpToolName,
        a2aEndpoint: tool.a2aEndpoint,
        a2aProtocol: tool.a2aProtocol as any,
        permissionLevel: tool.permissionLevel as any,
        category: tool.category as any,
      });
    });
  }
}
