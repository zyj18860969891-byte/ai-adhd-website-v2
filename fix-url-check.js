const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api-server', 'src', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

// 查找替换位置
const startIdx = content.indexOf('// 端口健康检查辅助函数');
const endIdx = content.indexOf('// MCP健康检查端点');

if (startIdx === -1 || endIdx === -1) {
  console.log('❌ 未找到替换位置');
  process.exit(1);
}

// 新的函数定义
const newFunctions = `// 端口健康检查辅助函数（适用于单容器部署）
async function checkPortHealth(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const cleanup = () => { try { socket.destroy(); } catch (e) {} };
    
    socket.setTimeout(2000, () => { cleanup(); resolve(false); });
    socket.on('connect', () => { cleanup(); resolve(true); });
    socket.on('error', () => { cleanup(); resolve(false); });
    socket.on('timeout', () => { cleanup(); resolve(false); });
    
    try {
      socket.connect(port, host);
    } catch (error) {
      cleanup();
      resolve(false);
    }
  });
}

// URL健康检查辅助函数（适用于多服务部署）
async function checkUrlHealth(url, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    
    const req = protocol.request(url, {
      method: 'GET',
      timeout: timeout
    }, (res) => {
      // 只要收到响应就认为健康（2xx, 3xx状态码）
      const healthy = res.statusCode >= 200 && res.statusCode < 400;
      resolve(healthy);
      
      // 消耗响应体
      res.on('data', () => {});
      res.on('end', () => {});
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// MCP健康检查端点`;

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);
const newContent = before + newFunctions + after;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ 已添加 URL 健康检查函数');
