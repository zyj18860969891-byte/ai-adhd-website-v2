import { spawn } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function testShrimpConnection() {
  console.log('=== 测试Shrimp MCP服务连接 ===');
  
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const workDir = resolve(__dirname, '../mcp-shrimp-task-manager');
  const entryFile = 'dist/index.js';
  
  console.log(`工作目录: ${workDir}`);
  console.log(`入口文件: ${entryFile}`);
  
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
  
  console.log(`进程PID: ${process.pid}`);
  
  // 处理stdout数据
  process.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[STDOUT] ${output}`);
  });
  
  // 处理stderr数据
  process.stderr.on('data', (data) => {
    const output = data.toString();
    console.log(`[STDERR] ${output}`);
  });
  
  // 处理进程退出
  process.on('exit', (code, signal) => {
    console.log(`[EXIT] 进程退出，代码: ${code}, 信号: ${signal}`);
  });
  
  // 处理进程错误
  process.on('error', (error) => {
    console.log(`[ERROR] 进程错误: ${error.message}`);
  });
  
  // 等待3秒让服务启动
  console.log('\n等待服务启动...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 检查进程是否仍在运行
  if (process.exitCode === null) {
    console.log('✓ 服务进程正在运行');
    
    // 发送MCP初始化请求
    console.log('\n发送MCP初始化请求...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };
    
    const initStr = JSON.stringify(initRequest) + '\n';
    console.log(`发送: ${initStr.trim()}`);
    process.stdin.write(initStr);
    
    // 等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 发送工具列表请求
    console.log('\n发送工具列表请求...');
    const listRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };
    
    const listStr = JSON.stringify(listRequest) + '\n';
    console.log(`发送: ${listStr.trim()}`);
    process.stdin.write(listStr);
    
    // 等待2秒后结束
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n=== 测试完成 ===');
    process.kill();
  } else {
    console.log('✗ 服务进程已退出');
  }
}

// 运行测试
testShrimpConnection();