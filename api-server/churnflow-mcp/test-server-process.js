#!/usr/bin/env node

/**
 * 测试服务器进程的详细行为
 */

console.log('🧪 测试服务器进程详细行为...');

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 启动服务器进程
const serverProcess = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdoutData = '';
let stderrData = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdoutData += output;
  console.log(`[STDOUT] ${output.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderrData += output;
  console.log(`[STDERR] ${output.trim()}`);
});

serverProcess.on('close', (code, signal) => {
  console.log(`\n📊 进程关闭信息:`);
  console.log(`   退出码: ${code}`);
  console.log(`   信号: ${signal}`);
  console.log(`   总输出长度: ${stdoutData.length}`);
  console.log(`   错误输出长度: ${stderrData.length}`);
  
  if (code === 0) {
    console.log('✅ 进程正常退出');
  } else {
    console.log('❌ 进程异常退出');
  }
  
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('❌ 进程启动失败:', error);
  process.exit(1);
});

// 设置超时
setTimeout(() => {
  console.log('\n⏰ 30秒超时，强制终止进程');
  serverProcess.kill('SIGTERM');
}, 30000);