import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志文件
const logFile = fs.createWriteStream('test-custom-mcp-simple.log', { flags: 'w' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logFile.write(logMessage);
  console.log(logMessage.trim());
}

log('Starting Custom MCP Server Simple Test');

// 启动自定义MCP服务器
const serverProcess = spawn('node', ['dist/custom-mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

log('Custom MCP Server started');

// 处理服务器输出
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  log(`Server stdout: ${output.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  log(`Server stderr: ${output.trim()}`);
});

serverProcess.on('close', (code) => {
  log(`Server process exited with code ${code}`);
});

// 发送初始化请求
const initializeRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "Test Client",
      version: "1.0.0"
    }
  }
};

log('Sending initialize request...');
serverProcess.stdin.write(JSON.stringify(initializeRequest) + '\n');

// 等待1秒后发送tools/list请求
setTimeout(() => {
  const toolsListRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };
  
  log('Sending tools/list request...');
  serverProcess.stdin.write(JSON.stringify(toolsListRequest) + '\n');
}, 1000);

// 等待2秒后发送tools/call请求
setTimeout(() => {
  const toolsCallRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "plan_task",
      arguments: {
        description: "创建一个简单的待办事项应用",
        requirements: "使用React和Node.js实现",
        existingTasksReference: false
      }
    }
  };
  
  log('Sending tools/call request...');
  serverProcess.stdin.write(JSON.stringify(toolsCallRequest) + '\n');
}, 2000);

// 等待5秒后关闭服务器
setTimeout(() => {
  log('Test completed, shutting down server...');
  serverProcess.kill('SIGINT');
  logFile.end();
}, 5000);