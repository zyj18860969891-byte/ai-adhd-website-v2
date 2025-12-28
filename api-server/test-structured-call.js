import StdioMCPClient from './src/stdio-mcp-client.js';

async function testStructuredCall() {
  console.log('=== 测试结构化任务格式 ===');
  
  const mcpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: console,
    requestTimeout: 120000 // 2分钟超时
  });

  try {
    await mcpClient.connect();
    console.log('✅ MCP客户端连接成功');

    // 构造结构化的任务数据
    const taskDescription = "创建一个用户注册系统，包含前端React组件和后端API";
    const structuredTasks = JSON.stringify([
      {
        "name": "用户需求分析与系统设计",
        "description": taskDescription,
        "implementationGuide": "根据用户需求进行系统分析和架构设计",
        "notes": "需要综合考虑技术栈选择、系统架构和用户体验",
        "dependencies": [],
        "relatedFiles": [],
        "verificationCriteria": "设计方案完整且符合用户需求"
      }
    ]);

    console.log(`\n结构化任务数据: ${structuredTasks}`);

    // 调用split_tasks工具
    console.log('\n调用split_tasks工具...');
    const result = await mcpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: structuredTasks,
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

testStructuredCall();