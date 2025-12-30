#!/usr/bin/env node

/**
 * ChurnFlow MCP 客户端连接测试
 * 
 * 测试连接到已启动的 ChurnFlow MCP 服务
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testChurnFlowConnection() {
  console.log('🧪 测试 ChurnFlow MCP 客户端连接...');

  try {
    // 创建客户端传输 - 连接到已启动的服务
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      cwd: 'e:/MultiModel/ai-adhd-website/churnflow-mcp'
    });

    // 创建 MCP 客户端
    const client = new Client(
      { name: 'churnflow-test-client', version: '1.0.0' },
      {
        capabilities: {}
      }
    );

    // 连接到传输
    await client.connect(transport);
    console.log('✅ 成功连接到 ChurnFlow MCP 服务!');

    // 列出可用工具
    console.log('📋 获取可用工具列表...');
    const toolsResult = await client.listTools();
    console.log('🛠️ 可用工具:');
    toolsResult.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // 测试状态工具
    console.log('\n🔍 测试状态工具...');
    const statusResult = await client.callTool({
      name: 'status',
      arguments: {}
    });
    console.log('📊 状态结果:');
    console.log(statusResult.content[0].text);

    // 测试列出追踪器工具
    console.log('\n📚 测试列出追踪器工具...');
    const trackersResult = await client.callTool({
      name: 'list_trackers',
      arguments: {}
    });
    console.log('📋 追踪器列表:');
    console.log(trackersResult.content[0].text);

    // 测试捕获工具
    console.log('\n🎯 测试捕获工具...');
    const captureResult = await client.callTool({
      name: 'capture',
      arguments: {
        text: '需要完成项目报告',
        context: 'personal'
      }
    });
    console.log('📝 捕获结果:');
    console.log(captureResult.content[0].text);

    console.log('\n✅ 所有测试完成!');

    // 关闭连接
    await client.close();
    console.log('🔌 连接已关闭');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testChurnFlowConnection().catch(console.error);