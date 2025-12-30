#!/usr/bin/env node

/**
 * Debug test for ChurnFlow MCP service
 */

import { spawn } from 'child_process';

console.log('🧪 Debug test for ChurnFlow MCP service...');

// 启动服务
const churnflowProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  cwd: 'e:/MultiModel/ai-adhd-website/churnflow-mcp',
  stdio: ['pipe', 'pipe', 'pipe']
});

// 监听输出
churnflowProcess.stdout.on('data', (data: Buffer) => {
  const output = data.toString().trim();
  if (output) {
    console.log(`[ChurnFlow] ${output}`);
  }
});

churnflowProcess.stderr.on('data', (data: Buffer) => {
  const error = data.toString().trim();
  if (error) {
    console.error(`[ChurnFlow Error] ${error}`);
  }
});

// 监听进程退出
churnflowProcess.on('close', (code: number) => {
  console.log(`[ChurnFlow] Process exited with code: ${code}`);
});

// 设置超时
setTimeout(() => {
  console.log('⏰ Timeout reached, killing process');
  churnflowProcess.kill();
}, 10000);