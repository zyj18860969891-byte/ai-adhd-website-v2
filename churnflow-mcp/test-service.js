#!/usr/bin/env node

/**
 * 测试 ChurnFlow MCP 服务是否正常运行
 */

console.log('🧪 测试 ChurnFlow MCP 服务...');

import { spawn } from 'child_process';
import path from 'path';

// 启动服务进程
const serviceProcess = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdoutData = '';
let stderrData = '';

console.log('📡 启动 ChurnFlow MCP 服务...');

serviceProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdoutData += output;
  console.log(`[STDOUT] ${output.trim()}`);
});

serviceProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderrData += output;
  console.log(`[STDERR] ${output.trim()}`);
});

serviceProcess.on('close', (code, signal) => {
  console.log(`\n📊 服务进程关闭:`);
  console.log(`   退出码: ${code}`);
  console.log(`   信号: ${signal}`);
  console.log(`   输出长度: ${stdoutData.length}`);
  console.log(`   错误输出长度: ${stderrData.length}`);
  
  if (code === 0) {
    console.log('✅ 服务正常退出');
  } else {
    console.log('❌ 服务异常退出');
  }
});

serviceProcess.on('error', (error) => {
  console.error('❌ 服务启动失败:', error);
});

// 等待5秒后终止服务
setTimeout(() => {
  console.log('\n⏰ 5秒测试时间结束，终止服务...');
  serviceProcess.kill('SIGTERM');
}, 5000);