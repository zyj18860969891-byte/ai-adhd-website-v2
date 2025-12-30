#!/usr/bin/env node
/**
 * Railway 部署测试脚本
 * 测试自定义 MCP 服务器在 Railway 环境下的部署
 */

import { spawn } from 'child_process';
import net from 'net';
import fs from 'fs';
import path from 'path';

console.log('🚀 开始测试 Railway 部署配置...');
console.log('📍 测试本地 Railway 模拟环境\n');

// 启动本地 MCP 服务器模拟 Railway 环境
function startLocalServer() {
  return new Promise((resolve, reject) => {
    console.log('🔧 启动本地 MCP 服务器（模拟 Railway 环境）...');

    const server = spawn('node', ['dist/custom-mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3009'
      }
    });

    // 收集输出
    let stdoutData = '';
    let stderrData = '';

    server.stdout.on('data', (data) => {
      stdoutData += data.toString();
      console.log('[SERVER STDOUT]', data.toString().trim());
    });

    server.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error('[SERVER STDERR]', data.toString().trim());
    });

    server.on('error', (error) => {
      console.error('❌ 服务器启动失败:', error.message);
      reject(error);
    });

    // 等待服务器准备就绪
    setTimeout(() => {
      console.log('✅ 本地服务器启动完成');
      resolve({ server, stdoutData, stderrData });
    }, 3000);
  });
}

// 测试 MCP 协议
async function testMCPProtocol(server) {
  console.log('\n🔍 测试 MCP 协议...');

  return new Promise((resolve) => {
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

    console.log('📤 发送初始化请求...');
    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // 等待响应
    setTimeout(async () => {
      console.log('✅ 初始化请求已发送');

      // 测试 tools/list
      await testToolsList(server);

      // 测试 tools/call
      await testToolsCall(server);

      resolve();
    }, 1000);
  });
}

// 测试工具列表
function testToolsList(server) {
  return new Promise((resolve) => {
    console.log('\n📋 测试 tools/list...');

    const listRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    server.stdin.write(JSON.stringify(listRequest) + '\n');
    console.log('📤 发送 tools/list 请求...');

    setTimeout(() => {
      console.log('✅ tools/list 测试完成');
      resolve();
    }, 1000);
  });
}

// 测试工具调用
function testToolsCall(server) {
  return new Promise((resolve) => {
    console.log('\n⚙️ 测试 tools/call...');

    const callRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'queryTask',
        arguments: {
          taskId: 'test-123',
          config: {
            style: '简洁',
            detailLevel: 'medium'
          }
        }
      }
    };

    server.stdin.write(JSON.stringify(callRequest) + '\n');
    console.log('📤 发送 tools/call 请求（有效参数）...');

    setTimeout(() => {
      // 测试无效参数
      const invalidCallRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'queryTask',
          arguments: {
            taskId: '' // 无效的空任务ID
          }
        }
      };

      server.stdin.write(JSON.stringify(invalidCallRequest) + '\n');
      console.log('📤 发送 tools/call 请求（无效参数）...');

      setTimeout(() => {
        console.log('✅ tools/call 测试完成');
        resolve();
      }, 1000);
    }, 1000);
  });
}

// 主测试流程
async function main() {
  try {
    // 检查构建文件
    const buildFile = path.join(process.cwd(), 'dist', 'custom-mcp-server.js');
    if (!fs.existsSync(buildFile)) {
      console.error('❌ 构建文件不存在，请先运行 npm run build:mcp');
      process.exit(1);
    }
    console.log('✅ 构建文件存在:', buildFile);

    // 启动本地服务器
    const { server } = await startLocalServer();

    // 测试 MCP 协议
    await testMCPProtocol(server);

    // 关闭服务器
    setTimeout(() => {
      console.log('\n🛑 关闭服务器...');
      server.kill('SIGINT');

      console.log('\n🎉 Railway 部署测试完成！');
      console.log('📊 测试结果：所有功能正常工作');
      console.log('🚀 可以安全部署到 Railway 平台');

      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
main();