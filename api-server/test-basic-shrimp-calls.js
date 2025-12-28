import StdioMCPClient from './src/stdio-mcp-client.js';

async function testBasicShrimpCalls() {
  console.log('🚀 开始测试基本Shrimp MCP调用...');
  
  try {
    // 创建客户端实例
    const mcpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      timeout: {
        connection: 15000,
        request: 30000,
        toolCall: 60000
      },
      retry: {
        maxRetries: 2,
        retryDelay: 1000
      }
    });
    
    // 连接到服务
    console.log('🔗 连接到Shrimp MCP服务...');
    await mcpClient.connect();
    console.log('✅ 连接成功');
    
    // 等待连接稳定
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. 测试健康检查
    console.log('\n🏥 测试健康检查...');
    try {
      const health = await mcpClient.healthCheck();
      console.log('✅ 健康检查结果:', health);
    } catch (error) {
      console.log('⚠️ 健康检查失败:', error.message);
    }
    
    // 2. 测试列出工具
    console.log('\n🔧 测试列出可用工具...');
    try {
      const tools = await mcpClient.callTool('list_tools', {});
      console.log('✅ 可用工具数量:', tools.tools ? tools.tools.length : '未知');
      if (tools.tools && tools.tools.length > 0) {
        console.log('工具列表:', tools.tools.map(t => t.name).join(', '));
      }
    } catch (error) {
      console.log('⚠️ 列出工具失败:', error.message);
    }
    
    // 3. 测试echo工具
    console.log('\n📢 测试echo工具...');
    try {
      const echoResult = await mcpClient.callTool('echo', { 
        message: 'Hello from Shrimp MCP Service!',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Echo结果:', echoResult);
    } catch (error) {
      console.log('⚠️ Echo工具调用失败:', error.message);
    }
    
    // 4. 测试多个工具调用
    console.log('\n🔧 测试多个工具调用...');
    const testCalls = [
      { tool: 'echo', args: { message: '第一个测试' } },
      { tool: 'echo', args: { message: '第二个测试' } },
      { tool: 'echo', args: { message: '第三个测试' } }
    ];
    
    for (let i = 0; i < testCalls.length; i++) {
      try {
        const result = await mcpClient.callTool(testCalls[i].tool, testCalls[i].args);
        console.log(`✅ 调用 ${i + 1} 成功:`, result);
      } catch (error) {
        console.log(`❌ 调用 ${i + 1} 失败:`, error.message);
      }
      
      // 添加延迟避免过快调用
      if (i < testCalls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 5. 测试错误处理
    console.log('\n❌ 测试错误处理...');
    try {
      const errorResult = await mcpClient.callTool('nonexistent_tool', { param: 'test' });
      console.log('❌ 意外成功:', errorResult);
    } catch (error) {
      console.log('✅ 错误处理正常:', error.message);
    }
    
    // 断开连接
    console.log('\n🔌 断开连接...');
    await mcpClient.disconnect();
    console.log('✅ 连接已断开');
    
    console.log('\n🎉 基本Shrimp MCP调用测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testBasicShrimpCalls().catch(console.error);