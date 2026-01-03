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

// 全局 MCP 客户端实例（在文件底部初始化）
let churnFlowClient = null;
let shrimpClient = null;

// 健康检查端点 - 检查所有服务状态
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // 检查ChurnFlow MCP服务 - 检查客户端连接状态
    try {
      const churnFlowHealthy = churnFlowClient && churnFlowClient.state.isConnected;
      healthStatus.services.churnFlow = {
        status: churnFlowHealthy ? 'healthy' : 'unhealthy',
        details: churnFlowHealthy ? 'MCP client connected' : 'MCP client disconnected',
        type: 'stdio',
        connectionState: churnFlowClient ? churnFlowClient.state : { error: 'Client not initialized' }
      };
    } catch (error) {
      healthStatus.services.churnFlow = { status: 'unhealthy', error: error.message, details: 'Exception during check' };
    }

    // 检查Shrimp MCP服务
    try {
      const shrimpHealthy = shrimpClient && shrimpClient.state.isConnected;
      healthStatus.services.shrimp = {
        status: shrimpHealthy ? 'healthy' : 'unhealthy',
        details: shrimpHealthy ? 'MCP client connected' : 'MCP client disconnected',
        type: 'stdio',
        connectionState: shrimpClient ? shrimpClient.state : { error: 'Client not initialized' }
      };
    } catch (error) {
      healthStatus.services.shrimp = { status: 'unhealthy', error: error.message, details: 'Exception during check' };
    }

    // 检查Web UI服务
    try {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_API_URL;
      if (!webUrl) {
        healthStatus.services.webUI = {
          status: 'unknown',
          details: 'Web UI URL not configured',
          type: 'http',
          note: 'Set NEXT_PUBLIC_WEB_URL environment variable'
        };
      } else {
        const webHealthy = await checkUrlHealth(webUrl);
        healthStatus.services.webUI = {
          status: webHealthy ? 'healthy' : 'unhealthy',
          details: webHealthy ? 'URL accessible' : 'URL not accessible',
          type: 'http',
          url: webUrl
        };
      }
    } catch (error) {
      healthStatus.services.webUI = { status: 'unhealthy', error: error.message, details: 'Check failed' };
    }

    const allHealthy = Object.values(healthStatus.services).every(s => s.status === 'healthy');   
    healthStatus.status = allHealthy ? 'healthy' : 'degraded';
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});// MCP 进程健康检查（通过检查进程是否存在）
async function checkMCPProcessHealth(serviceName) {
  return new Promise((resolve) => {
    try {
      // 使用 ps 命令检查进程是否存在
      const { exec } = require('child_process');
      const command = process.platform === 'win32' 
        ? `tasklist /FI "IMAGENAME eq node.exe" /FO TABLE`
        : `ps aux | grep "${serviceName}" | grep -v grep`;
      
      exec(command, (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }
        
        // 检查输出中是否包含服务名称
        const output = stdout.toLowerCase();
        const isRunning = output.includes(serviceName.toLowerCase()) || 
                         output.includes('churnflow') ||
                         output.includes('shrimp');
        
        resolve(isRunning);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

// 端口健康检查辅助函数（备用）
async function checkPortHealth(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.setTimeout(5000);
  });
}

// URL健康检查辅助函数（适用于多服务部署）
async function checkUrlHealth(url, timeout = 5000) {
  return new Promise((resolve) => {
    // 使用 fetch API（Node.js 18+ 内置）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    fetch(url, { 
      method: 'GET',
      signal: controller.signal
    })
    .then(res => {
      clearTimeout(timeoutId);
      const healthy = res.status >= 200 && res.status < 400;
      resolve(healthy);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
}

// MCP健康检查端点
app.get('/api/mcp-health', async (req, res) => {
  try {
    res.json({
      timestamp: new Date().toISOString(),
      churnFlow: { 
        status: churnFlowClient?.state.isConnected ? 'healthy' : 'unhealthy', 
        type: 'stdio',
        state: churnFlowClient?.state || 'not initialized'
      },     
      shrimp: { 
        status: shrimpClient?.state.isConnected ? 'healthy' : 'unhealthy', 
        type: 'stdio',
        state: shrimpClient?.state || 'not initialized'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// 服务状态端点
app.get('/api/services', async (req, res) => {
  try {
    const services = [
      { 
        name: 'ChurnFlow MCP', 
        type: 'stdio', 
        status: churnFlowClient?.state.isConnected ? 'running' : 'stopped',
        state: churnFlowClient?.state || 'not initialized'
      },
      { 
        name: 'Shrimp Task Manager', 
        type: 'stdio', 
        status: shrimpClient?.state.isConnected ? 'running' : 'stopped',
        state: shrimpClient?.state || 'not initialized'
      },
      { 
        name: 'Web UI', 
        type: 'http', 
        url: process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_API_URL || 'https://ai-adhd-web.vercel.app',
        status: 'external'  // 外部服务，无法直接检测
      }
    ];
    res.json({ timestamp: new Date().toISOString(), services });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// 原有MCP路由保持不变
app.get('/api/mcp/churnflow', async (req, res) => {
  try {
    res.json({ 
      service: 'ChurnFlow MCP', 
      status: churnFlowClient?.state.isConnected ? 'running' : 'stopped', 
      type: 'stdio',
      state: churnFlowClient?.state || 'not initialized',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mcp/shrimp', async (req, res) => {
  try {
    res.json({ 
      service: 'Shrimp Task Manager', 
      status: shrimpClient?.state.isConnected ? 'running' : 'stopped', 
      type: 'stdio',
      state: shrimpClient?.state || 'not initialized',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});// 获取所有任务
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

  // 直接 capture 端点（更简单的接口）
  app.post('/api/mcp/capture', async (req, res) => {
    try {
      if (!churnFlowClient || !churnFlowClient.state.isConnected) {
        return res.status(503).json({ 
          error: 'ChurnFlow MCP service not available',
          status: 'disconnected'
        });
      }

      const { text, priority = 'medium', context } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'text is required' });
      }

      // 使用 sendRequest 直接调用
      const result = await churnFlowClient.sendRequest('tools/call', {
        name: 'capture',
        arguments: {
          text,
          priority,
          context
        }
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Capture API error:', error);
      res.status(500).json({ 
        error: error.message,
        details: 'Failed to process capture request'
      });
    }
  });// Shrimp MCP 服务端点
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

  // 辅助函数 - 调用实际MCP服务
  async function handleChurnFlowAction(action, data) {
    if (!churnFlowClient || !churnFlowClient.state.isConnected) {
      throw new Error('ChurnFlow MCP client not connected');
    }

    try {
      // 直接发送 MCP 请求，使用正确的参数格式
      const result = await churnFlowClient.sendRequest('tools/call', {
        name: action,
        arguments: data
      });
      
      return {
        success: true,
        service: 'churnflow',
        action: action,
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MCP call failed:', error);
      throw new Error(`ChurnFlow error: ${error.message}`);
    }
  }async function handleShrimpAction(action, data) {
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

// 初始化 MCP 客户端（在服务器启动后）
async function initializeMCPClients() {
  console.log('🔄 Starting MCP client initialization...');
  
  try {
    // 动态导入（避免 ESM 问题）
    const { default: StdioMCPClient } = await import('./stdio-mcp-client.js');
    
    // ChurnFlow MCP 客户端（容器内路径）
    churnFlowClient = new StdioMCPClient('./churnflow-mcp/dist/index.js', {
      timeout: { connection: 15000, request: 30000 }
    });
    
    churnFlowClient.on('error', (error) => {
      console.error('❌ ChurnFlow MCP Client error:', error.message);
      churnFlowClient.state.isConnected = false;
    });
    
    churnFlowClient.on('disconnected', () => {
      console.log('⚠️ ChurnFlow MCP Client disconnected');
      churnFlowClient.state.isConnected = false;
    });
    
    churnFlowClient.on('connected', () => {
      console.log('✅ ChurnFlow MCP Client connected');
      churnFlowClient.state.isConnected = true;
    });
    
    // Shrimp MCP 客户端（容器内路径）
    shrimpClient = new StdioMCPClient('./mcp-shrimp-task-manager/dist/custom-mcp-server.js', {
      timeout: { connection: 15000, request: 30000 }
    });
    
    shrimpClient.on('error', (error) => {
      console.error('❌ Shrimp MCP Client error:', error.message);
      shrimpClient.state.isConnected = false;
    });
    
    shrimpClient.on('disconnected', () => {
      console.log('⚠️ Shrimp MCP Client disconnected');
      shrimpClient.state.isConnected = false;
    });
    
    shrimpClient.on('connected', () => {
      console.log('✅ Shrimp MCP Client connected');
      shrimpClient.state.isConnected = true;
    });
    
    // 并行连接
    console.log('🔄 Connecting to ChurnFlow MCP...');
    const churnFlowPromise = churnFlowClient.connect().catch((error) => {
      console.error('❌ ChurnFlow connection failed:', error.message);
    });
    
    console.log('🔄 Connecting to Shrimp MCP...');
    const shrimpPromise = shrimpClient.connect().catch((error) => {
      console.error('❌ Shrimp connection failed:', error.message);
    });
    
    await Promise.all([churnFlowPromise, shrimpPromise]);
    
    console.log('🎯 MCP client initialization complete');
    console.log(`   - ChurnFlow: ${churnFlowClient.state.isConnected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   - Shrimp: ${shrimpClient.state.isConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize MCP clients:', error.message);
    console.error(error.stack);
  }
}

// 服务器启动后初始化客户端
setTimeout(() => {
  initializeMCPClients();
}, 3000);
