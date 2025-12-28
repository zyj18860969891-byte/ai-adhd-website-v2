import StdioMCPClient from './src/stdio-mcp-client.js';

async function testShrimpCall() {
  console.log('=== 测试Shrimp MCP工具调用 ===');
  
  const shrimpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: console,
    requestTimeout: 60000
  });
  
  try {
    console.log('1. 连接Shrimp MCP服务...');
    await shrimpClient.connect();
    console.log('✅ 连接成功');
    
    console.log('\n2. 调用split_tasks工具...');
    const result = await shrimpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: '创建一个用户注册系统，包含前端React组件和后端API',
      globalAnalysisResult: ''
    });
    
    console.log('✅ split_tasks调用成功:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ 调用失败:');
    console.log(error.message);
    console.log('完整错误:');
    console.log(error);
  } finally {
    await shrimpClient.disconnect();
    console.log('\n测试完成');
  }
}

testShrimpCall();