/**
 * 🎯 Agent 管理器 - 统一集成所有层
 * 
 * 负责：
 * 1. 初始化数据库层
 * 2. 注册 Skills 和 Tools
 * 3. 创建 Agent 实例
 * 4. 集成 MCP 客户端
 * 5. 提供统一的 API 接口
 */

import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { RepositoryFactory } from '../data/repository.js';
import { AgentFactory, AgentCore } from './agent-core.js';
import { StdioMCPClient } from '../stdio-mcp-client.js';

// ============================================================================
// Agent 管理器
// ============================================================================

export class AgentManager {
  private db: DatabaseManager;
  private agents: Map<string, AgentCore> = new Map();
  private mcpClients: Map<string, StdioMCPClient> = new Map();
  private isInitialized = false;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  // 初始化整个系统
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[AgentManager] Already initialized');
      return;
    }

    console.log('[AgentManager] Starting initialization...');

    // 1. 初始化 MCP 客户端
    await this.initializeMCPClients();

    // 2. 创建主 Agent
    const mainAgent = AgentFactory.create('MainAgent', this.db, {
      version: '2.0.0',
      capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui', 'collaboration'],
      permissionLevel: 'write',
    });

    // 3. 注册 MCP 客户端到 Agent
    this.mcpClients.forEach((client, name) => {
      mainAgent.registerMCPClient(name, client);
    });

    // 4. 初始化系统数据
    await mainAgent.initializeSystem();

    // 5. 存储 Agent
    this.agents.set('main', mainAgent);

    this.isInitialized = true;
    console.log('[AgentManager] Initialization complete!');
  }

  // 初始化 MCP 客户端
  private async initializeMCPClients(): Promise<void> {
    console.log('[AgentManager] Initializing MCP clients...');

    // ChurnFlow MCP
    const churnFlowClient = new StdioMCPClient('./churnflow-mcp/dist/index.js', {
      timeout: { connection: 15000, request: 30000 }
    });

    // Shrimp MCP
    const shrimpClient = new StdioMCPClient('./mcp-shrimp-task-manager/dist/custom-mcp-server.js', {
      timeout: { connection: 15000, request: 30000 }
    });

    // 连接并存储
    try {
      await churnFlowClient.connect();
      this.mcpClients.set('churnflow', churnFlowClient);
      console.log('[AgentManager] ✅ ChurnFlow MCP connected');
    } catch (error: any) {
      console.error('[AgentManager] ❌ ChurnFlow MCP failed:', error.message);
    }

    try {
      await shrimpClient.connect();
      this.mcpClients.set('shrimp', shrimpClient);
      console.log('[AgentManager] ✅ Shrimp MCP connected');
    } catch (error: any) {
      console.error('[AgentManager] ❌ Shrimp MCP failed:', error.message);
    }
  }

  // 获取主 Agent
  getMainAgent(): AgentCore | undefined {
    return this.agents.get('main');
  }

  // 获取所有 Agent
  getAllAgents(): AgentCore[] {
    return Array.from(this.agents.values());
  }

  // 获取系统状态
  async getSystemStatus(): Promise<any> {
    const agent = this.getMainAgent();
    if (!agent) {
      return { error: 'Agent not initialized' };
    }

    const status = await agent.getSystemStatus();
    const repoFactory = RepositoryFactory.getInstance(this.db);

    // 获取更多统计
    const captures = await repoFactory.repositories.capture.findAll();
    const sessions = await repoFactory.repositories.session.findAll();

    return {
      agent: {
        name: 'MainAgent',
        version: '2.0.0',
        status: 'running',
      },
      system: status,
      stats: {
        totalCaptures: captures.length,
        totalSessions: sessions.length,
        mcpClients: Array.from(this.mcpClients.keys()),
      },
    };
  }

  // 处理请求（统一入口）
  async handleRequest(
    userId: string,
    input: string,
    type: 'process' | 'a2ui' | 'collaborate' = 'process',
    options?: any
  ): Promise<any> {
    const agent = this.getMainAgent();
    if (!agent) {
      throw new Error('Agent not initialized');
    }

    switch (type) {
      case 'process':
        return agent.process(userId, input, options?.sessionId);

      case 'a2ui':
        if (options?.action === 'start') {
          return agent.startA2UIInteraction(userId, input);
        } else if (options?.action === 'input') {
          return agent.handleA2UIInput(options.sessionId, input);
        }
        break;

      case 'collaborate':
        return agent.collaborate(options.agents, input, options.strategy);

      default:
        throw new Error(`Unknown request type: ${type}`);
    }
  }
}

// ============================================================================
// 全局实例
// ============================================================================

let globalAgentManager: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!globalAgentManager) {
    throw new Error('AgentManager not initialized');
  }
  return globalAgentManager;
}

export async function initializeAgentManager(db: DatabaseManager): Promise<AgentManager> {
  globalAgentManager = new AgentManager(db);
  await globalAgentManager.initialize();
  return globalAgentManager;
}
