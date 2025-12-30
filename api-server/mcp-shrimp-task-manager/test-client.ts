#!/usr/bin/env node

/**
 * Shrimp MCP 客户端测试
 * 
 * 连接已启动的 Shrimp Task Manager MCP 服务
 * 测试 MCP 工具调用
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testShrimpMCP() {
  console.log('🧪 测试 Shrimp MCP 客户端连接...');

  try {
    // 创建客户端传输
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      cwd: 'e:/MultiModel/ai-adhd-website/mcp-shrimp-task-manager'
    });

    // 创建 MCP 客户端
    const client = new Client(
      { name: 'shrimp-test-client', version: '1.0.0' },
      {
        capabilities: {}
      }
    );

    // 连接到服务
    console.log('📡 连接到 Shrimp MCP 服务...');
    await client.connect(transport);

    console.log('✅ 连接成功！');

    // 获取可用工具
    console.log('📋 获取可用工具...');
    const tools = await client.listTools({});

    console.log('🔧 可用工具:');
    tools.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // 测试 plan_task 工具
    console.log('\n📝 测试 plan_task 工具...');
    const planResult = await client.callTool({
      name: 'plan_task',
      arguments: {
        task: '实现用户认证系统',
        description: '创建用户注册、登录和权限管理功能'
      }
    });

    console.log('✅ plan_task 结果:', planResult.content);

    // 测试 list_tasks 工具
    console.log('\n📋 测试 list_tasks 工具...');
    const listResult = await client.callTool({
      name: 'list_tasks',
      arguments: {
        limit: 5
      }
    });

    console.log('✅ list_tasks 结果:', listResult.content);

    // 断开连接
    await client.close();
    console.log('🔌 连接已断开');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testShrimpMCP().catch(console.error);