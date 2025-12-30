#!/usr/bin/env node

/**
 * ChurnFlow MCP 客户端测试
 * 
 * 连接已启动的 ChurnFlow MCP 服务
 * 测试 MCP 工具调用
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testChurnFlowMCP() {
  console.log('🧪 测试 ChurnFlow MCP 客户端连接...');

  try {
    // 创建客户端传输 - 连接到已启动的服务
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      cwd: process.cwd()
    });

    // 创建 MCP 客户端
    const client = new Client(
      { name: 'churnflow-test-client', version: '1.0.0' },
      {
        capabilities: {}
      }
    );

    // 连接到服务
    console.log('📡 连接到 ChurnFlow MCP 服务...');
    await client.connect(transport);

    console.log('✅ 连接成功！');

    // 获取可用工具
    console.log('📋 获取可用工具...');
    const tools = await client.listTools({});

    console.log('🔧 可用工具:');
    tools.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // 测试 capture 工具
    console.log('\n📝 测试 capture 工具...');
    const captureResult = await client.callTool({
      name: 'capture',
      arguments: {
        text: '需要实现用户认证系统，包括登录和注册功能',
        priority: 'high',
        context: 'business'
      }
    });

    console.log('✅ capture 结果:');
    if (captureResult.content && captureResult.content.length > 0) {
      console.log(captureResult.content[0].text);
    } else {
      console.log('No content returned');
    }

    // 测试 status 工具
    console.log('\n📊 测试 status 工具...');
    const statusResult = await client.callTool({
      name: 'status',
      arguments: {}
    });

    console.log('✅ status 结果:');
    if (statusResult.content && statusResult.content.length > 0) {
      console.log(statusResult.content[0].text);
    } else {
      console.log('No content returned');
    }

    // 测试 list_trackers 工具（原名 list-contexts）
    console.log('\n📂 测试 list_trackers 工具...');
    const trackersResult = await client.callTool({
      name: 'list_trackers',
      arguments: {}
    });

    console.log('✅ list_trackers 结果:');
    if (trackersResult.content && trackersResult.content.length > 0) {
      console.log(trackersResult.content[0].text);
    } else {
      console.log('No content returned');
    }

    // 断开连接
    await client.close();
    console.log('🔌 连接已断开');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testChurnFlowMCP().catch(console.error);