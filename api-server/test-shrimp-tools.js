import { spawn } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function testShrimpTools() {
  console.log('=== 测试Shrimp MCP工具调用 ===');
  
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const workDir = resolve(__dirname, '../mcp-shrimp-task-manager');
  const entryFile = 'dist/index.js';
  
  // 启动Shrimp MCP服务进程
  const process = spawn('node', [entryFile], {
    cwd: workDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { 
      ...global.process.env, 
      NODE_ENV: 'production',
      OPENAI_API_KEY: global.process.env.OPENAI_API_KEY || '',
      OPENAI_MODEL: global.process.env.OPENAI_MODEL || 'gpt-5-mini-2025-08-07',
      OPENAI_BASE_URL: global.process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      DATA_DIR: global.process.env.DATA_DIR || './data/shrimp'
    }
  });
  
  let responseBuffer = '';
  
  // 处理stdout数据
  process.stdout.on('data', (data) => {
    responseBuffer += data.toString();
    
    // 尝试解析JSON响应
    const lines = responseBuffer.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const response = JSON.parse(line);
          console.log(`[响应] ${JSON.stringify(response, null, 2)}`);
        } catch (e) {
          console.log(`[原始响应] ${line}`);
        }
      }
    }
    responseBuffer = lines[lines.length - 1]; // 保留未完成的片段
  });
  
  // 处理stderr数据
  process.stderr.on('data', (data) => {
    console.log(`[错误] ${data.toString()}`);
  });
  
  // 等待服务启动
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (process.exitCode !== null) {
    console.log('✗ 服务进程已退出');
    return;
  }
  
  // 1. 发送初始化请求
  console.log('\n1. 初始化MCP连接...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  process.stdin.write(JSON.stringify(initRequest) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. 发送工具列表请求
  console.log('\n2. 获取工具列表...');
  const listRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  process.stdin.write(JSON.stringify(listRequest) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. 测试getAllTasks工具
  console.log('\n3. 调用getAllTasks工具...');
  const getAllTasksRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'getAllTasks',
      arguments: {}
    }
  };
  process.stdin.write(JSON.stringify(getAllTasksRequest) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. 测试splitTasksRaw工具
  console.log('\n4. 调用splitTasksRaw工具...');
  const splitTasksRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'splitTasksRaw',
      arguments: {
        tasksRaw: '创建一个简单的用户登录功能',
        globalAnalysisResult: 'React前端项目'
      }
    }
  };
  process.stdin.write(JSON.stringify(splitTasksRequest) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n=== 测试完成 ===');
  process.kill();
}

// 运行测试
testShrimpTools();