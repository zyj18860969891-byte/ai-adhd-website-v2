/**
 * A2UI API Routes
 */

import { Router } from 'express';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import { AgentFactory } from '../agent/agent-core.js';

export function createA2UIRoutes(db, mcpClients) {
  const router = Router();
  const mainAgent = AgentFactory.create('MainAgent', db, {
    version: '2.0.0',
    capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui', 'collaboration'],
    permissionLevel: 'write',
  });

  mcpClients.forEach((client, name) => {
    mainAgent.registerMCPClient(name, client);
  });

  mainAgent.initializeSystem().catch(console.error);

  router.post('/agent/process', async (req, res) => {
    try {
      const { userId, input, sessionId } = req.body;
      if (!userId || !input) return res.status(400).json({ error: 'userId and input required' });
      const result = await mainAgent.process(userId, input, sessionId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/agent/status', async (req, res) => {
    res.json({ status: 'ready', agent: 'MainAgent', version: '2.0.0' });
  });

  router.get('/agent/skills', async (req, res) => {
    const skills = [
      { name: 'capture_skill', intent: 'capture,add,note', confidence: 0.95 },
      { name: 'task_management', intent: 'task,todo,schedule', confidence: 0.92 },
      { name: 'review_skill', intent: 'review,check', confidence: 0.90 },
      { name: 'analysis_skill', intent: 'analyze,insight', confidence: 0.88 },
      { name: 'a2ui_interaction', intent: 'form,wizard', confidence: 0.93 },
      { name: 'agent_collaboration', intent: 'collaborate,delegate', confidence: 0.85 }
    ];
    res.json({ success: true, skills });
  });

  router.get('/agent/tools', async (req, res) => {
    const tools = [
      { name: 'capture_tool', type: 'mcp', service: 'churnflow' },
      { name: 'task_create', type: 'mcp', service: 'shrimp' },
      { name: 'task_list', type: 'mcp', service: 'shrimp' },
      { name: 'task_update', type: 'mcp', service: 'shrimp' },
      { name: 'context_analyzer', type: 'internal' },
      { name: 'ai_classifier', type: 'internal' },
      { name: 'review_finder', type: 'internal' },
      { name: 'review_ui', type: 'internal' },
      { name: 'a2ui_generator', type: 'internal' },
      { name: 'a2ui_validator', type: 'internal' },
      { name: 'task_splitter', type: 'internal' },
      { name: 'result_aggregator', type: 'internal' },
      { name: 'data_analyzer', type: 'internal' },
      { name: 'insight_generator', type: 'internal' },
      { name: 'report_builder', type: 'internal' },
      { name: 'a2a_coordinator', type: 'a2a' }
    ];
    res.json({ success: true, tools, count: tools.length });
  });

  router.post('/a2ui/start', async (req, res) => {
    const { userId, intent } = req.body;
    if (!userId || !intent) return res.status(400).json({ error: 'userId and intent required' });
    res.json({
      success: true,
      sessionId: 'session_' + Date.now(),
      ui: {
        intent: intent === 'capture' ? 'form' : 'list',
        components: intent === 'capture' ? [
          { type: 'input', props: { label: '内容', required: true } },
          { type: 'select', props: { label: '类型', options: ['action', 'note', 'event'] } }
        ] : [{ type: 'list', props: { items: [] } }]
      }
    });
  });

  router.post('/agent/capture', async (req, res) => {
    const { userId, content, priority = 'medium' } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'userId and content required' });
    res.json({ success: true, data: { id: 'cap_' + Date.now(), userId, content, priority, category: 'action', timestamp: new Date().toISOString() } });
  });

  router.post('/agent/task', async (req, res) => {
    const { userId, title, description } = req.body;
    if (!userId || !title) return res.status(400).json({ error: 'userId and title required' });
    res.json({ success: true, data: { id: 'task_' + Date.now(), userId, title, description: description || '', status: 'pending', createdAt: new Date().toISOString() } });
  });

  router.post('/agent/review', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    res.json({ success: true, data: { items: [], summary: 'No items to review', timestamp: new Date().toISOString() } });
  });

  router.post('/agent/collaborate', async (req, res) => {
    const { userId, task, agents } = req.body;
    if (!userId || !task) return res.status(400).json({ error: 'userId and task required' });
    res.json({ success: true, data: { coordinationId: 'coord_' + Date.now(), agents: agents || ['agent1', 'agent2'], task, strategy: 'divide_and_conquer', timestamp: new Date().toISOString() } });
  });

  return router;
}
