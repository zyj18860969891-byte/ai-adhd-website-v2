#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 测试Shrimp MCP服务启动
console.log('测试Shrimp MCP服务启动...');

// 加载环境变量
config();

// 检查环境变量
console.log('检查环境变量...');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置' : '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置');
console.log('DATA_DIR:', process.env.DATA_DIR || '未设置');

// 尝试导入Shrimp MCP服务
try {
  console.log('\n尝试导入Shrimp MCP服务...');
  const modulePath = resolve(__dirname, './dist/index.js');
  console.log('模块路径:', modulePath);
  
  // 在 Windows 上需要转换为 file:// URL
  const moduleUrl = process.platform === 'win32' 
    ? `file:///${modulePath.replace(/\\/g, '/')}`
    : `file://${modulePath}`;
  
  await import(moduleUrl);
  
  console.log('导入成功，服务已启动...');
  
  // 服务已经在 dist/index.js 中自己启动了
  // 我们只需要保持进程运行
  
} catch (error) {
  console.error('导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}