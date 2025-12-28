import StdioMCPClient from './src/stdio-mcp-client.js';

async function testLongTimeout() {
  console.log('=== 测试长超时时间（5分钟） ===');
  
  const mcpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: {
      log: (...args) => console.log('[LOG]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args),
      info: (...args) => console.info('[INFO]', ...args)
    },
    requestTimeout: 300000 // 5分钟超时，给AI足够时间处理复杂任务
  });

  try {
    console.log('1. 连接MCP服务...');
    await mcpClient.connect();
    console.log('✅ MCP客户端连接成功');

    // 构造简单的结构化任务数据
    const structuredTasks = JSON.stringify([
      {
        "name": "测试任务分解",
        "description": "创建一个简单的用户注册功能",
        "implementationGuide": "1. 设计数据库表\n2. 创建后端API\n3. 开发前端界面",
        "notes": "这是一个测试任务",
        "dependencies": [],
        "relatedFiles": [],
        "verificationCriteria": "功能完整可用"
      }
    ]);

    console.log('\n2. 准备调用split_tasks工具...');
    console.log('结构化任务数据:', structuredTasks);

    // 调用split_tasks工具
    console.log('\n3. 调用split_tasks工具（可能需要几分钟）...');
    const startTime = Date.now();
    const result = await mcpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: structuredTasks,
      globalAnalysisResult: ''
    });
    const endTime = Date.now();
    
    console.log(`\n✅ API调用成功（耗时: ${Math.round((endTime - startTime) / 1000)}秒）:`);
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.log('\n❌ API调用失败:');
    console.log(error.message);
    console.log('完整错误:');
    console.log(error);
  } finally {
    await mcpClient.disconnect();
    console.log('\n测试完成');
  }
}

testLongTimeout();