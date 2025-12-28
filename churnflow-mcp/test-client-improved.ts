#!/usr/bin/env node

/**
 * 改进的 ChurnFlow MCP 客户端测试
 * 正确处理服务启动日志和连接
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testChurnFlowMCP() {
  console.log('🧪 测试 ChurnFlow MCP 客户端连接...');

  try {
    // 创建客户端传输 - 直接连接到已启动的服务进程
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

    // 连接到服务 - 添加超时处理
    console.log('📡 连接到 ChurnFlow MCP 服务...');
    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) => setTimeout(() => reject(new Error('连接超时')), 5000))
    ]);

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

    console.log('✅ capture 结果:', captureResult.content);

    // 测试 status 工具
    console.log('\n📊 测试 status 工具...');
    const statusResult = await client.callTool({
      name: 'status',
      arguments: {}
    });

    console.log('✅ status 结果:', statusResult.content);

    // 测试 list_trackers 工具（注意：不是 list-contexts）
    console.log('\n📂 测试 list_trackers 工具...');
    const trackersResult = await client.callTool({
      name: 'list_trackers',
      arguments: {}
    });

    console.log('✅ list_trackers 结果:', trackersResult.content);

    // 断开连接
    await client.close();
    console.log('🔌 连接已断开');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    
    // 如果连接失败，尝试重新启动服务并连接
    if (error.message.includes('Connection closed') || error.message.includes('timeout')) {
      console.log('\n🔄 尝试重新启动服务并连接...');
      
      // 创建新的传输，直接连接到服务进程
      const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/index.js'],
        cwd: 'e:/MultiModel/ai-adhd-website/churnflow-mcp'
      });

      const client = new Client(
        { name: 'churnflow-test-client', version: '1.0.0' },
        { capabilities: {} }
      );

      try {
        await client.connect(transport);
        console.log('✅ 重新连接成功！');
        
        // 获取工具列表
        const tools = await client.listTools({});
        console.log('🔧 可用工具:', tools.tools.map((t: any) => t.name).join(', '));
        
        await client.close();
        console.log('🔌 连接已断开');
        
      } catch (retryError) {
        console.error('❌ 重新连接失败:', retryError);
      }
    }
  }
}

// 运行测试
testChurnFlowMCP().catch(console.error);