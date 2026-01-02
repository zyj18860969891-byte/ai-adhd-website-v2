import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const API_PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root endpoint
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

// 健康检查 - 使用 HTTP 检查远程服务
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // 检查 ChurnFlow MCP (使用 Railway 内部 URL)
    const churnFlowUrl = process.env.MCP_CHURNFLOW_URL || 'http://churnflow-mcp:3008';
    const churnFlowHealthy = await checkUrlHealth(churnFlowUrl);
    healthStatus.services.churnFlow = {
      status: churnFlowHealthy ? 'healthy' : 'unhealthy',
      details: churnFlowHealthy ? 'Service accessible' : 'Service not accessible',
      type: 'http',
      url: churnFlowUrl
    };

    // 检查 Shrimp MCP
    const shrimpUrl = process.env.MCP_SHRIMP_URL || 'http://shrimp-task-manager:3009';
    const shrimpHealthy = await checkUrlHealth(shrimpUrl);
    healthStatus.services.shrimp = {
      status: shrimpHealthy ? 'healthy' : 'unhealthy',
      details: shrimpHealthy ? 'Service accessible' : 'Service not accessible',
      type: 'http',
      url: shrimpUrl
    };

    // 检查 Web UI
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_API_URL;
    if (webUrl) {
      const webHealthy = await checkUrlHealth(webUrl);
      healthStatus.services.webUI = {
        status: webHealthy ? 'healthy' : 'unhealthy',
        details: webHealthy ? 'URL accessible' : 'URL not accessible',
        type: 'http',
        url: webUrl
      };
    } else {
      healthStatus.services.webUI = {
        status: 'unknown',
        details: 'URL not configured',
        type: 'http'
      };
    }

    const allHealthy = Object.values(healthStatus.services).every(s => s.status === 'healthy');
    healthStatus.status = allHealthy ? 'healthy' : 'degraded';
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// MCP 健康检查端点
app.get('/api/mcp-health', async (req, res) => {
  try {
    const churnFlowUrl = process.env.MCP_CHURNFLOW_URL || 'http://churnflow-mcp:3008';
    const shrimpUrl = process.env.MCP_SHRIMP_URL || 'http://shrimp-task-manager:3009';
    
    const [churnFlowHealthy, shrimpHealthy] = await Promise.all([
      checkUrlHealth(churnFlowUrl),
      checkUrlHealth(shrimpUrl)
    ]);
    
    res.json({
      timestamp: new Date().toISOString(),
      churnFlow: { 
        status: churnFlowHealthy ? 'healthy' : 'unhealthy', 
        type: 'http',
        url: churnFlowUrl
      },     
      shrimp: { 
        status: shrimpHealthy ? 'healthy' : 'unhealthy', 
        type: 'http',
        url: shrimpUrl
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
      { name: 'ChurnFlow MCP', type: 'http', url: process.env.MCP_CHURNFLOW_URL || 'http://churnflow-mcp:3008' },
      { name: 'Shrimp Task Manager', type: 'http', url: process.env.MCP_SHRIMP_URL || 'http://shrimp-task-manager:3009' },
      { name: 'Web UI', type: 'http', url: process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_API_URL }
    ];
    
    const statusChecks = await Promise.all(services.map(async (service) => {
      if (!service.url) {
        return { ...service, status: 'unknown', details: 'URL not configured' };
      }
      const healthy = await checkUrlHealth(service.url);
      return { ...service, status: healthy ? 'running' : 'stopped' };
    }));
    
    res.json({ timestamp: new Date().toISOString(), services: statusChecks });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, timestamp: new Date().toISOString() });
  }
});

// URL 健康检查辅助函数
async function checkUrlHealth(url, timeout = 5000) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    fetch(url, { 
      method: 'GET',
      signal: controller.signal
    })
    .then(res => {
      clearTimeout(timeoutId);
      resolve(res.status >= 200 && res.status < 400);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
}

// 启动服务器
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`API服务器运行在端口 ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
