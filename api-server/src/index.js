import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import net from 'net';
dotenv.config();

import StdioMCPClient from './stdio-mcp-client.js';

// 启动时不要等待MCP服务连接，让它们在后台运行
console.log('Starting API Server on port', process.env.PORT || 3003);

const app = express();
const API_PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root path handler
app.get('/', (req, res) => {
  res.json({
    message: 'AI ADHD Website API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      mcpHealth: '/api/mcp-health',
      services: '/api/services'
    }
  });
});

// API 路由

// 健康检查端点 - 检查所有MCP服务状态
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // 检查ChurnFlow MCP服务 - 使用端口检查
    try {
      const churnFlowPort = parseInt(process.env.CHURNFLOW_PORT || '3008');
      const churnFlowUrl = process.env.MCP_CHURNFLOW_URL;
      healthStatus.services.churnFlow = {
        status: isChurnFlowHealthy ? 'healthy' : 'unhealthy',
        details: isChurnFlowHealthy ? 'Port accessible' : 'Port not accessible'
      };
    } catch (error) {
      healthStatus.services.churnFlow = { status: 'unhealthy', error: error.message };
    }

    // 检查Shrimp MCP服务
    try {
      const shrimpPort = parseInt(process.env.SHRIMP_PORT || '3009');
      const shrimpUrl = process.env.MCP_SHRIMP_URL;
      healthStatus.services.shrimp = {
        status: isShrimpHealthy ? 'healthy' : 'unhealthy',
        details: isShrimpHealthy ? 'Port accessible' : 'Port not accessible'
      };
    } catch (error) {
      healthStatus.services.shrimp = { status: 'unhealthy', error: error.message };
    }

    // 检查Web UI服务
    try {
      const webUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai-adhd-web.vercel.app';
      healthStatus.services.webUI = {
        status: isWebHealthy ? 'healthy' : 'unhealthy',
        details: isWebHealthy ? 'Port accessible' : 'Port not accessible'
      };
    } catch (error) {
      healthStatus.services.webUI = { status: 'unhealthy', error: error.message };
    }

    const allHealthy = Object.values(healthStatus.services).every(s => s.status === 'healthy');
    healthStatus.status = allHealthy ? 'healthy' : 'degraded';
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// 端口健康检查辅助函数
async function checkPortHealth(port, host = 'localhost') {
  }

  // URL健康检查辅助函数（适用于多服务部署）
  async function checkUrlHealth(url, timeout = 5000) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? require('https') : require('http');
      const req = protocol.request(url, { method: 'GET', timeout: timeout }, (res) => {
        const healthy = res.statusCode >= 200 && res.statusCode < 400;
        resolve(healthy);
        res.on('data', () => {});
        res.on('end', () => {});
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    });
  }

// MCP健康检查端点
app.get('/api/mcp-health', async (req, res) => {
  try {
      const churnFlowPort = parseInt(process.env.CHURNFLOW_PORT || '3008');
      const churnFlowUrl = process.env.MCP_CHURNFLOW_URL;
    const [churnFlowHealthy, shrimpHealthy] = await Promise.all([
      checkPortHealth(churnFlowPort),
      checkPortHealth(shrimpPort)
    ]);
    res.json({
      timestamp: new Date().toISOString(),
      churnFlow: { status: churnFlowHealthy ? 'healthy' : 'unhealthy', port: churnFlowPort },
      shrimp: { status: shrimpHealthy ? 'healthy' : 'unhealthy', port: shrimpPort }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// 服务状态端点
app.get('/api/services', async (req, res) => {
  try {
    const services = [
      { name: 'ChurnFlow MCP', port: parseInt(process.env.CHURNFLOW_PORT || '3001') },
      { name: 'Shrimp Task Manager', port: parseInt(process.env.SHRIMP_PORT || '3002') },
      { name: 'Web UI', port: parseInt(process.env.WEB_PORT || '3000') }
    ];
    const statusChecks = await Promise.all(services.map(async (service) => ({
      ...service,
      status: await checkPortHealth(service.port) ? 'running' : 'stopped'
    })));
    res.json({ timestamp: new Date().toISOString(), services: statusChecks });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// 原有MCP路由保持不变
app.get('/api/mcp/churnflow', async (req, res) => {
  try {
    const port = parseInt(process.env.CHURNFLOW_PORT || '3001');
    const healthy = await checkPortHealth(port);
    res.json({ service: 'ChurnFlow MCP', status: healthy ? 'running' : 'stopped', port: port, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mcp/shrimp', async (req, res) => {
  try {
    const port = parseInt(process.env.SHRIMP_PORT || '3002');
    const healthy = await checkPortHealth(port);
    res.json({ service: 'Shrimp Task Manager', status: healthy ? 'running' : 'stopped', port: port, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有任务
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// 获取单个任务
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// 创建任务
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 更新任务
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, priority, dueDate, completed } = req.body;
  const task = tasks[taskIndex];

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (completed !== undefined) task.completed = completed;

  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// 删除任务
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// ChurnFlow MCP 服务端点
app.post('/api/mcp/churnflow', async (req, res) => {
  try {
    const { action, data } = req.body;
    const result = await handleChurnFlowAction(action, data);
    res.json(result);
  } catch (error) {
    console.error('ChurnFlow API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Shrimp MCP 服务端点
app.post('/api/mcp/shrimp', async (req, res) => {
  try {
    const { action, data } = req.body;
    const result = await handleShrimpAction(action, data);
    res.json(result);
  } catch (error) {
    console.error('Shrimp API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reminder MCP 服务端点
app.post('/api/mcp/reminder', async (req, res) => {
  try {
    const { action, data } = req.body;
    const result = await handleReminderAction(action, data);
    res.json(result);
  } catch (error) {
    console.error('Reminder API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 根路径路由 - 返回欢迎信息
app.get('/', (req, res) => {
  res.json({
    message: 'AI ADHD Website API Server',
    version: '2.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      churnflow: '/api/mcp/churnflow',
      shrimp: '/api/mcp/shrimp',
      reminder: '/api/mcp/reminder'
    }
  });
});

// 启动服务器 - 使用3003端口与Railway配置一致
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`API服务器运行在端口 ${PORT}`);
});

// 辅助函数 - 模拟MCP服务操作
async function handleChurnFlowAction(action, data) {
  // 这里应该调用实际的MCP客户端
  return { action, data, service: 'churnflow', status: 'processed' };
}

async function handleShrimpAction(action, data) {
  return { action, data, service: 'shrimp', status: 'processed' };
}

async function handleReminderAction(action, data) {
  return { action, data, service: 'reminder', status: 'processed' };
}

// 任务数据存储
let tasks = [
  {
    id: '1',
    title: '示例任务',
    description: '这是一个示例任务',
    priority: 'high',
    dueDate: null,
    completed: false,
    createdAt: new Date().toISOString()
  }
];
