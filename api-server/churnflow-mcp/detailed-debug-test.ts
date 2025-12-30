#!/usr/bin/env node

/**
 * Detailed debug test for ChurnFlow MCP service
 */

import { spawn } from 'child_process';

console.log('🧪 Detailed debug test for ChurnFlow MCP service...');

// 启动服务
const churnflowProcess = spawn('node', ['dist/index.js'], {
  cwd: 'e:/MultiModel/ai-adhd-website/churnflow-mcp',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

// 监听输出
churnflowProcess.stdout.on('data', (data: Buffer) => {
  const output = data.toString().trim();
  if (output) {
    console.log(`[ChurnFlow STDOUT] ${output}`);
  }
});

churnflowProcess.stderr.on('data', (data: Buffer) => {
  const error = data.toString().trim();
  if (error) {
    console.error(`[ChurnFlow STDERR] ${error}`);
  }
});

// 监听进程退出
churnflowProcess.on('close', (code: number, signal: string) => {
  console.log(`[ChurnFlow] Process exited with code: ${code}, signal: ${signal}`);
});

// 设置超时
setTimeout(() => {
  console.log('⏰ Timeout reached, killing process');
  churnflowProcess.kill();
}, 15000);