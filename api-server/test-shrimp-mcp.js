import StdioMCPClient from './src/stdio-mcp-client.js';

async function testShrimpMCP() {
  console.log('开始测试Shrimp MCP服务...');
  
  try {
    // 创建Shrimp MCP客户端
    const shrimpClient = new StdioMCPClient('../../mcp-shrimp-task-manager');
    
    console.log('1. 测试连接...');
    await shrimpClient.connect();
    console.log('连接成功');
    
    console.log('\n2. 测试健康检查...');
    const healthStatus = await shrimpClient.healthCheck();
    console.log('健康检查结果:', healthStatus);
    
    console.log('\n3. 测试getAllTasks工具...');
    try {
      const tasksResult = await shrimpClient.callTool('getAllTasks', {});
      console.log('getAllTasks结果:', JSON.stringify(tasksResult, null, 2));
    } catch (error) {
      console.log('调用getAllTasks失败:', error.message);
    }
    
    console.log('\n4. 测试splitTasksRaw工具...');
    try {
      const splitResult = await shrimpClient.callTool('splitTasksRaw', {
        tasksRaw: '创建一个用户注册系统，包含前端React组件和后端API',
        globalAnalysisResult: '这是一个用户注册系统项目'
      });
      console.log('splitTasksRaw结果:', JSON.stringify(splitResult, null, 2));
    } catch (error) {
      console.log('调用splitTasksRaw失败:', error.message);
    }
    
    console.log('\n5. 测试plan_task工具...');
    try {
      const planResult = await shrimpClient.callTool('plan_task', {
        task: '创建一个用户注册系统'
      });
      console.log('plan_task结果:', JSON.stringify(planResult, null, 2));
    } catch (error) {
      console.log('调用plan_task失败:', error.message);
    }
    
    console.log('\n测试完成！');
    
    // 断开连接
    await shrimpClient.disconnect();
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testShrimpMCP();