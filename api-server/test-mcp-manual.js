#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('启动ChurnFlow MCP服务...');

// 启动ChurnFlow MCP服务
const process = spawn('node', ['dist/index.js'], {
  cwd: resolve(__dirname, '../churnflow-mcp'),
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

// 处理stdout数据
process.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  console.log('STDOUT:', text.trim());
});

// 处理stderr数据
process.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString().trim());
});

// 等待服务启动
setTimeout(() => {
  console.log('\n发送JSON-RPC请求...');
  
  // 发送list_trackers请求 - 尝试不同的方法名
  const methodsToTry = [
    'callTool',
    'tools/call',
    'tool/call',
    'tool.call',
    'tools.call',
    'call_tool',
    'tools/callTool'
  ];
  
  let methodIndex = 0;
  
  function sendNextRequest() {
    if (methodIndex >= methodsToTry.length) {
      console.log('所有方法名都尝试完毕，没有找到正确的方法');
      process.kill();
      return;
    }
    
    const method = methodsToTry[methodIndex];
    const request = {
      jsonrpc: '2.0',
      id: methodIndex + 1,
      method: method,
      params: {
        name: 'list_trackers',
        arguments: {}
      }
    };
    
    console.log(`\n尝试方法: ${method}`);
    console.log('请求内容:', JSON.stringify(request));
    process.stdin.write(JSON.stringify(request) + '\n');
    
    methodIndex++;
    
    // 3秒后尝试下一个方法
    setTimeout(sendNextRequest, 3000);
  }
  
  sendNextRequest();
  
  // 这行代码是多余的，删除它
  
  // 等待响应
  setTimeout(() => {
    console.log('\n当前缓冲区内容:', buffer);
    console.log('终止进程...');
    process.kill();
  }, 5000);
  
}, 5000);

// 超时关闭
setTimeout(() => {
  console.log('测试超时');
  process.kill();
  process.exit(1);
}, 15000);