import StdioMCPClient from './src/stdio-mcp-client.js';

async function testMinimal() {
  console.log('=== 测试最简单的Shrimp MCP调用 ===');
  
  const mcpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: {
      log: (...args) => console.log('[LOG]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args),
      info: (...args) => console.info('[INFO]', ...args)
    },
    requestTimeout: 300000 // 5分钟超时
  });

  try {
    console.log('1. 连接MCP服务...');
    await mcpClient.connect();
    console.log('✅ MCP客户端连接成功');

    // 测试list_tasks工具（最简单的工具）
    console.log('\n2. 测试list_tasks工具...');
    const listResult = await mcpClient.callTool('list_tasks', { status: 'all' });
    console.log('✅ list_tasks调用成功:');
    console.log(JSON.stringify(listResult, null, 2));

    // 如果list_tasks成功，再测试split_tasks
    console.log('\n3. 测试split_tasks工具（简单任务）...');
    const structuredTasks = JSON.stringify([
      {
        "name": "测试任务",
        "description": "Create a simple test function",
        "implementationGuide": "1. Write function\n2. Test it\n3. Done",
        "notes": "This is a test",
        "dependencies": [],
        "relatedFiles": [],
        "verificationCriteria": "Function works"
      }
    ]);

    const splitResult = await mcpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: structuredTasks,
      globalAnalysisResult: ''
    });

    console.log('✅ split_tasks调用成功:');
    console.log(JSON.stringify(splitResult, null, 2));

  } catch (error) {
    console.log('❌ 测试失败:');
    console.log(error.message);
    console.log('完整错误:');
    console.log(error);
  } finally {
    await mcpClient.disconnect();
    console.log('\n测试完成');
  }
}

testMinimal();