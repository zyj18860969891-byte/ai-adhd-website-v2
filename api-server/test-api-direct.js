import StdioMCPClient from './src/stdio-mcp-client.js';

async function testShrimpAPI() {
  console.log('=== 直接测试Shrimp MCP API（模拟前端请求） ===');
  
  const mcpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: console,
    requestTimeout: 120000 // 2分钟超时，给AI足够时间处理
  });

  try {
    await mcpClient.connect();
    console.log('✅ MCP客户端连接成功');

    // 模拟前端发送的数据
    const taskDescription = "创建一个用户注册系统，包含前端React组件和后端API";
    console.log(`\n原始任务描述: ${taskDescription}`);

    // 调用split_tasks工具
    console.log('\n调用split_tasks工具...');
    const result = await mcpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: taskDescription, // 这里应该是纯文本，但Shrimp期望JSON格式
      globalAnalysisResult: ''
    });

    console.log('✅ API调用成功:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.log('❌ API调用失败:');
    console.log(error.message);
    console.log('完整错误:');
    console.log(error);
  } finally {
    await mcpClient.disconnect();
    console.log('\n测试完成');
  }
}

testShrimpAPI();