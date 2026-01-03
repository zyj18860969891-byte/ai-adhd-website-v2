const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api-server', 'src', 'index.js');
const backupPath = path.join(__dirname, 'api-server', 'src', 'index.js.backup');

// 读取备份文件
const content = fs.readFileSync(backupPath, 'utf8');

// 定义新的健康检查部分
const newHealthSection = `// API 路由

// 健康检查端点 - 检查所有MCP服务状态
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // 检查ChurnFlow MCP服务 - 使用端口检查
    try {
      const churnFlowPort = parseInt(process.env.CHURNFLOW_PORT || '3001');
      const isChurnFlowHealthy = await checkPortHealth(churnFlowPort);
      healthStatus.services.churnFlow = {
        status: isChurnFlowHealthy ? 'healthy' : 'unhealthy',
        details: isChurnFlowHealthy ? 'Port accessible' : 'Port not accessible'
      };
    } catch (error) {
      healthStatus.services.churnFlow = { status: 'unhealthy', error: error.message };
    }

    // 检查Shrimp MCP服务
    try {
      const shrimpPort = parseInt(process.env.SHRIMP_PORT || '3002');
      const isShrimpHealthy = await checkPortHealth(shrimpPort);
      healthStatus.services.shrimp = {
        status: isShrimpHealthy ? 'healthy' : 'unhealthy',
        details: isShrimpHealthy ? 'Port accessible' : 'Port not accessible'
      };
    } catch (error) {
      healthStatus.services.shrimp = { status: 'unhealthy', error: error.message };
    }

    // 检查Web UI服务
    try {
      const webPort = parseInt(process.env.WEB_PORT || '3000');
      const isWebHealthy = await checkPortHealth(webPort);
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
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const cleanup = () => { try { socket.destroy(); } catch (e) {} };
    socket.setTimeout(2000, () => { cleanup(); resolve(false); });
    socket.on('connect', () => { cleanup(); resolve(true); });
    socket.on('error', () => { cleanup(); resolve(false); });
    socket.on('timeout', () => { cleanup(); resolve(false); });
    try { socket.connect(port, host); } catch (error) { cleanup(); resolve(false); }
  });
}

// MCP健康检查端点
app.get('/api/mcp-health', async (req, res) => {
  try {
    const churnFlowPort = parseInt(process.env.CHURNFLOW_PORT || '3001');
    const shrimpPort = parseInt(process.env.SHRIMP_PORT || '3002');
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
`;

// 查找替换位置
const startIdx = content.indexOf('// API 路由');
const endIdx = content.indexOf('// 获取所有任务');

if (startIdx === -1 || endIdx === -1) {
  console.log('❌ 未找到替换位置');
  process.exit(1);
}

// 构建新内容
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);
const newContent = before + newHealthSection + '\n\n' + after;

// 写入新文件
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ API服务器健康检查已完全修复');
console.log('✅ 使用端口检查替代进程启动');
console.log('✅ 添加了所有必要的路由');
