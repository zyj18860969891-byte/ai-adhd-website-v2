/**
 * 🎨 A2UI API 路由
 * 
 * 暴露 Agent 功能为 API 端点
 */

import { Router, Request, Response } from 'express';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { AgentFactory } from '../agent/agent-core.js';
import { StdioMCPClient } from '../stdio-mcp-client.js';

// ============================================================================
// 创建路由
// ============================================================================

export function createA2UIRoutes(db: DatabaseManager, mcpClients: Map<string, StdioMCPClient>): Router {
  const router = Router();

  // 初始化 Agent
  const mainAgent = AgentFactory.create('MainAgent', db, {
    version: '2.0.0',
    capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui', 'collaboration'],
    permissionLevel: 'write',
  });

  // 注册 MCP 客户端
  mcpClients.forEach((client, name) => {
    mainAgent.registerMCPClient(name, client);
  });

  // 初始化系统
  mainAgent.initializeSystem().catch(console.error);

  // ============================================================================
  // 1. Agent 核心处理端点
  // ============================================================================

  /**
   * POST /api/agent/process
   * 处理用户输入，返回 Agent 响应
   * 
   * 请求体:
   * {
   *   "userId": "user123",
   *   "input": "捕获一个任务：明天下午3点开会",
   *   "sessionId": "optional"
   * }
   */
  router.post('/agent/process', async (req: Request, res: Response) => {
    try {
      const { userId, input, sessionId } = req.body;

      if (!userId || !input) {
        return res.status(400).json({ error: 'userId and input are required' });
      }

      const result = await mainAgent.process(userId, input, sessionId);

      res.json({
        success: true,
        ...result,
      });

    } catch (error: any) {
      console.error('[A2UI] Process error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // 2. A2UI 交互端点
  // ============================================================================

  /**
   * POST /api/a2ui/start
   * 启动 A2UI 交互流程
   * 
   * 请求体:
   * {
   *   "userId": "user123",
   *   "intent": "capture" | "task" | "review" | "dashboard" | "wizard"
   * }
   */
  router.post('/a2ui/start', async (req: Request, res: Response) => {
    try {
      const { userId, intent } = req.body;

      if (!userId || !intent) {
        return res.status(400).json({ error: 'userId and intent are required' });
      }

      const result = await mainAgent.startA2UIInteraction(userId, intent);

      res.json({
        success: true,
        sessionId: result.sessionId,
        ui: result.response.ui,
      });

    } catch (error: any) {
      console.error('[A2UI] Start error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/a2ui/input
   * 处理 A2UI 用户输入
   * 
   * 请求体:
   * {
   *   "sessionId": "session123",
   *   "input": { "content": "测试任务", "priority": "high" }
   * }
   */
  router.post('/a2ui/input', async (req: Request, res: Response) => {
    try {
      const { sessionId, input } = req.body;

      if (!sessionId || !input) {
        return res.status(400).json({ error: 'sessionId and input are required' });
      }

      const result = await mainAgent.handleA2UIInput(sessionId, input);

      res.json({
        success: result.success,
        ...result,
      });

    } catch (error: any) {
      console.error('[A2UI] Input error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/a2ui/cancel
   * 取消 A2UI 交互
   */
  router.post('/a2ui/cancel', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      // 取消交互
      // await mainAgent.cancelA2UIInteraction(sessionId);

      res.json({ success: true, message: '交互已取消' });

    } catch (error: any) {
      console.error('[A2UI] Cancel error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // 3. Agent 协作端点
  // ============================================================================

  /**
   * POST /api/agent/collaborate
   * Agent 间协作
   * 
   * 请求体:
   * {
   *   "agents": ["agent1", "agent2"],
   *   "task": "完成复杂任务",
   *   "strategy": "sequential" | "parallel" | "competitive"
   * }
   */
  router.post('/agent/collaborate', async (req: Request, res: Response) => {
    try {
      const { agents, task, strategy } = req.body;

      if (!agents || !task) {
        return res.status(400).json({ error: 'agents and task are required' });
      }

      const result = await mainAgent.collaborate(agents, task, strategy);

      res.json({
        success: true,
        results: result,
      });

    } catch (error: any) {
      console.error('[A2UI] Collaboration error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // 4. 状态查询端点
  // ============================================================================

  /**
   * GET /api/agent/status
   * 获取 Agent 系统状态
   */
  router.get('/agent/status', async (req: Request, res: Response) => {
    try {
      const status = await mainAgent.getSystemStatus();

      res.json({
        success: true,
        agent: {
          name: 'MainAgent',
          version: '2.0.0',
        },
        system: status,
      });

    } catch (error: any) {
      console.error('[A2UI] Status error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/agent/skills
   * 获取所有可用 Skills
   */
  router.get('/agent/skills', async (req: Request, res: Response) => {
    try {
      const skills = mainAgent['skillRegistry'].getAllSkills();

      res.json({
        success: true,
        count: skills.length,
        skills: skills.map(s => ({
          name: s.name,
          displayName: s.displayName,
          description: s.description,
          capabilities: s.capabilities,
          permissionLevel: s.permissionLevel,
        })),
      });

    } catch (error: any) {
      console.error('[A2UI] Skills error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * GET /api/agent/tools
   * 获取所有可用 Tools
   */
  router.get('/agent/tools', async (req: Request, res: Response) => {
    try {
      const tools = mainAgent['toolRegistry'].getAllTools();

      res.json({
        success: true,
        count: tools.length,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          executor: t.executor,
          category: t.category,
          permissionLevel: t.permissionLevel,
        })),
      });

    } catch (error: any) {
      console.error('[A2UI] Tools error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // 5. 快捷端点（兼容现有 API）
  // ============================================================================

  /**
   * POST /api/agent/capture
   * 快捷捕获端点
   */
  router.post('/agent/capture', async (req: Request, res: Response) => {
    try {
      const { userId, content, category, priority } = req.body;

      if (!userId || !content) {
        return res.status(400).json({ error: 'userId and content are required' });
      }

      const result = await mainAgent.process(userId, content);

      res.json({
        success: true,
        data: result.response,
        metadata: result.metadata,
      });

    } catch (error: any) {
      console.error('[A2UI] Capture error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/agent/task
   * 快捷任务端点
   */
  router.post('/agent/task', async (req: Request, res: Response) => {
    try {
      const { userId, title, description } = req.body;

      if (!userId || !title) {
        return res.status(400).json({ error: 'userId and title are required' });
      }

      const input = `创建任务：${title}${description ? ' - ' + description : ''}`;
      const result = await mainAgent.process(userId, input);

      res.json({
        success: true,
        data: result.response,
        metadata: result.metadata,
      });

    } catch (error: any) {
      console.error('[A2UI] Task error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * POST /api/agent/review
   * 快捷评审端点
   */
  router.post('/agent/review', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const result = await mainAgent.process(userId, '开始评审');

      res.json({
        success: true,
        data: result.response,
        metadata: result.metadata,
      });

    } catch (error: any) {
      console.error('[A2UI] Review error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
