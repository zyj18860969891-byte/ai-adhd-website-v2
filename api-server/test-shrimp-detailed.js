import { spawn } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function testShrimpMCPDetailed() {
  console.log('=== 详细测试Shrimp MCP服务 ===');
  
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
      OPENAI_API_KEY: global.process.env.OPENAI_API_KEY,
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
    if (code !== 0) {
      console.log('进程异常退出');
    }
  });
  
  // 处理进程错误
  process.on('error', (error) => {
    console.log(`[ERROR] 进程错误: ${error.message}`);
  });
  
  // 等待一段时间后发送测试请求
  setTimeout(async () => {
    if (process.exitCode === null) {
      console.log('\n=== 尝试发送测试请求 ===');
      
      // 发送JSON-RPC请求
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };
      
      const requestStr = JSON.stringify(request) + '\n';
      console.log(`发送请求: ${requestStr.trim()}`);
      
      try {
        process.stdin.write(requestStr);
        console.log('请求已发送');
      } catch (error) {
        console.log(`发送请求失败: ${error.message}`);
      }
      
      // 再等待一段时间后结束测试
      setTimeout(() => {
        if (process.exitCode === null) {
          console.log('\n=== 测试结束，终止进程 ===');
          process.kill();
        }
      }, 5000);
    }
  }, 3000);
}

// 运行测试
testShrimpMCPDetailed();