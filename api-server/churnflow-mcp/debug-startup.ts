#!/usr/bin/env node

// 直接启动服务并查看详细日志
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 启动 ChurnFlow MCP 服务调试模式...');
console.log('📁 工作目录:', process.cwd());
console.log('📄 服务路径:', resolve(__dirname, 'dist/index.js'));

const child = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'inherit', 'inherit'],
  shell: true
});

child.on('exit', (code, signal) => {
  console.log(`\n🏁 进程退出 - 代码: ${code}, 信号: ${signal}`);
});

child.on('error', (error) => {
  console.error('❌ 启动失败:', error);
});

console.log('⚡ 服务启动中...');