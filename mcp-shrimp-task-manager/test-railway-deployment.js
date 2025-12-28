#!/usr/bin/env node
/**
 * 快速测试Railway部署的MCP服务
 */

import { spawn } from 'child_process';
import net from 'net';

const RAILWAY_URL = process.env.RAILWAY_URL || 'localhost';
const RAILWAY_PORT = process.env.PORT || 3009;

console.log('🚀 测试Railway部署的MCP服务...');
console.log(`📍 目标地址: ${RAILWAY_URL}:${RAILWAY_PORT}`);

// 测试连接
const socket = net.createConnection(RAILWAY_PORT, RAILWAY_URL, () => {
  console.log('✅ 连接成功！');

  // 发送初始化请求
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'Railway Deployment Test',
        version: '1.0.0'
      }
    }
  };

  socket.write(JSON.stringify(initRequest) + '\n');

  // 发送工具列表请求
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  setTimeout(() => {
    socket.write(JSON.stringify(toolsRequest) + '\n');
  }, 1000);
});

socket.on('data', (data) => {
  const responses = data.toString().split('\n').filter(line => line.trim());
  
  responses.forEach(response => {
    try {
      const parsed = JSON.parse(response);
      console.log('📨 收到响应:', JSON.stringify(parsed, null, 2));
      
      if (parsed.id === 2 && parsed.result) {
        console.log(`🎉 成功获取 ${parsed.result.tools.length} 个工具！`);
        socket.end();
      }
    } catch (e) {
      console.log('📨 原始响应:', response);
    }
  });
});

socket.on('error', (error) => {
  console.error('❌ 连接错误:', error.message);
  console.log('\n💡 提示: 请确保Railway服务已成功部署并正在运行');
});

socket.on('end', () => {
  console.log('\n✨ 测试完成！');
});