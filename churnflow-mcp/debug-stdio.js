#!/usr/bin/env node

/**
 * 调试 stdio 传输问题
 */

console.log('🧪 调试 stdio 传输问题...');

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

console.log('📡 创建 MCP 服务器...');

const server = new Server({
  name: 'debug-server',
  version: '0.1.0',
  capabilities: {
    tools: {},
  },
});

console.log('📡 设置请求处理器...');

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('📡 收到工具列表请求');
  return { tools: [] };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log('📡 收到工具调用请求:', request);
  return {
    content: [{ type: 'text', text: 'Debug response' }],
    isError: false,
  };
});

console.log('📡 创建 stdio 传输...');

const transport = new StdioServerTransport();

console.log('📡 连接服务器...');

server.connect(transport).then(() => {
  console.log('✅ 服务器连接成功');
  console.log('📡 服务器运行中...');
  
  // 保持进程运行
  setInterval(() => {
    console.log('📡 服务器心跳...');
  }, 5000);
  
}).catch(error => {
  console.error('❌ 服务器连接失败:', error);
  process.exit(1);
});

// 处理进程退出
process.on('exit', () => {
  console.log('📡 进程退出');
});

process.on('SIGINT', () => {
  console.log('📡 收到 SIGINT，正在关闭...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📡 收到 SIGTERM，正在关闭...');
  process.exit(0);
});