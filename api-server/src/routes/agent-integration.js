/**
 * 🎯 Agent 集成路由
 * 
 * 将新的 A2UI 框架集成到现有 API 服务器
 * 保持向后兼容，同时提供增强功能
 */

import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { initializeAgentManager, getAgentManager } from '../agent/agent-manager.js';

// 全局变量
let agentManager = null;
let dbManager = null;

// ============================================================================
// 初始化函数（在服务器启动时调用）
// ============================================================================

export async function initializeAgentSystem() {
  try {
    console.log('[Agent Integration] Initializing Agent System...');
    
    // 获取或创建数据库管理器
    if (!dbManager) {
      dbManager = new DatabaseManager();
      await dbManager.initialize();
      console.log('[Agent Integration] ✅ Database initialized');
    }

    // 初始化 Agent 管理器
    agentManager = await initializeAgentManager(dbManager);
    console.log('[Agent Integration] ✅ Agent Manager initialized');
    
    return true;
  } catch (error) {
    console.error('[Agent Integration] ❌ Initialization failed:', error.message);
    return false;
  }
}

// ============================================================================
// 路由注册函数
// ============================================================================

export function registerAgentRoutes(app) {
  console.log('[Agent Integration] Registering Agent routes...');

  // 1. Agent 状态检查
  app.get('/api/agent/status', async (req, res) => {
    try {
      if (!agentManager) {
        return res.json({ success: false, error: 'Agent system not initialized' });
      }

      const status = await agentManager.getSystemStatus();
      res.json({ success: true, ...status });

    } catch (error) {
      console.error('[Agent] Status error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Agent 核心处理（支持自然语言）
  app.post('/api/agent/process', async (req, res) => {
    try {
      const { userId, input, sessionId } = req.body;

      if (!userId || !input) {
        return res.status(400).json({ error: 'userId and input are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const result = await agentManager.handleRequest(userId, input, 'process', { sessionId });

      res.json({
        success: true,
        response: result.response,
        type: result.type,
        metadata: result.metadata,
      });

    } catch (error) {
      console.error('[Agent] Process error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. A2UI 交互启动
  app.post('/api/a2ui/start', async (req, res) => {
    try {
      const { userId, intent } = req.body;

      if (!userId || !intent) {
        return res.status(400).json({ error: 'userId and intent are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const agent = agentManager.getMainAgent();
      const result = await agent.startA2UIInteraction(userId, intent);

      res.json({
        success: true,
        sessionId: result.sessionId,
        ui: result.response.ui,
      });

    } catch (error) {
      console.error('[A2UI] Start error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. A2UI 用户输入处理
  app.post('/api/a2ui/input', async (req, res) => {
    try {
      const { sessionId, input } = req.body;

      if (!sessionId || !input) {
        return res.status(400).json({ error: 'sessionId and input are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const agent = agentManager.getMainAgent();
      const result = await agent.handleA2UIInput(sessionId, input);

      res.json(result);

    } catch (error) {
      console.error('[A2UI] Input error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. 快捷捕获（兼容现有 API）
  app.post('/api/agent/capture', async (req, res) => {
    try {
      const { userId, content, category, priority } = req.body;

      if (!userId || !content) {
        return res.status(400).json({ error: 'userId and content are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const input = category ? `${content} [${category}]` : content;
      const result = await agentManager.handleRequest(userId, input, 'process');

      res.json({
        success: true,
        data: result.response,
        metadata: result.metadata,
      });

    } catch (error) {
      console.error('[Agent] Capture error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6. 快捷任务创建
  app.post('/api/agent/task', async (req, res) => {
    try {
      const { userId, title, description } = req.body;

      if (!userId || !title) {
        return res.status(400).json({ error: 'userId and title are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const input = `创建任务：${title}${description ? ' - ' + description : ''}`;
      const result = await agentManager.handleRequest(userId, input, 'process');

      res.json({
        success: true,
        data: result.response,
        metadata: result.metadata,
      });

    } catch (error) {
      console.error('[Agent] Task error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 7. Agent 协作
  app.post('/api/agent/collaborate', async (req, res) => {
    try {
      const { userId, agents, task, strategy } = req.body;

      if (!userId || !agents || !task) {
        return res.status(400).json({ error: 'userId, agents, and task are required' });
      }

      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const result = await agentManager.handleRequest(userId, task, 'collaborate', {
        agents,
        strategy: strategy || 'sequential',
      });

      res.json({
        success: true,
        results: result,
      });

    } catch (error) {
      console.error('[Agent] Collaboration error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 8. 获取所有 Skills
  app.get('/api/agent/skills', async (req, res) => {
    try {
      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const agent = agentManager.getMainAgent();
      const skills = agent['skillRegistry'].getAllSkills();

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

    } catch (error) {
      console.error('[Agent] Skills error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 9. 获取所有 Tools
  app.get('/api/agent/tools', async (req, res) => {
    try {
      if (!agentManager) {
        return res.status(503).json({ error: 'Agent system not ready' });
      }

      const agent = agentManager.getMainAgent();
      const tools = agent['toolRegistry'].getAllTools();

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

    } catch (error) {
      console.error('[Agent] Tools error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 10. 增强的健康检查（包含 Agent 状态）
  app.get('/api/agent/health', async (req, res) => {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'ok',
        services: {},
      };

      if (agentManager) {
        const status = await agentManager.getSystemStatus();
        health.services = {
          agent: 'healthy',
          database: status.system ? 'healthy' : 'unknown',
          mcpClients: status.system?.mcpClients || [],
        };
      } else {
        health.services.agent = 'initializing';
        health.status = 'degraded';
      }

      res.json(health);

    } catch (error) {
      console.error('[Agent] Health error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log('[Agent Integration] ✅ All Agent routes registered');
}

// ============================================================================
// 导出供 index.js 使用
// ============================================================================

export { initializeAgentSystem, registerAgentRoutes };
