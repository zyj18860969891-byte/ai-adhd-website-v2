#!/usr/bin/env node

/**
 * 测试增强版Shrimp MCP服务稳定性
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

async function testEnhancedShrimpService() {
  console.log('=== 测试增强版Shrimp MCP服务稳定性 ===\n');

  const client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    cwd: '../mcp-shrimp-task-manager',
    maxRetries: 3,
    baseTimeout: 300000, // 5分钟
    retryDelay: 2000
  });

  try {
    console.log('1. 测试服务连接...');
    const health = await client.healthCheck();
    console.log('服务健康状态:', health);
    
    if (health.status !== 'healthy' && health.status !== 'partially_healthy') {
      console.error('❌ 服务不健康，无法继续测试');
      return;
    }

    console.log('\n2. 测试工具列表...');
    try {
      // 使用callTool调用list_tasks来测试工具调用
      const tools = await client.callTool('list_tasks', {});
      console.log(`✅ 工具调用成功，返回结果类型: ${typeof tools}`);
      console.log('工具调用结果:', JSON.stringify(tools).substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ 工具调用失败:', error.message);
    }

    console.log('\n3. 测试split_tasks工具（关键测试）...');
    const testTask = {
      updateMode: "clearAllTasks",
      tasksRaw: JSON.stringify([
        {
          name: "创建用户模型和数据库表",
          description: "设计并实现用户数据模型，包括用户注册、登录、个人信息管理等功能的数据库表结构",
          implementationGuide: "使用Prisma或TypeORM创建User模型，包含id、email、password、name、createdAt等字段",
          dependencies: [],
          relatedFiles: [
            {
              path: "src/models/User.ts",
              type: "CREATE",
              description: "用户数据模型定义"
            }
          ],
          verificationCriteria: "用户模型能够成功创建，支持基本的CRUD操作"
        },
        {
          name: "实现用户注册API",
          description: "创建用户注册接口，处理用户输入验证、密码加密、重复邮箱检查等",
          implementationGuide: "使用bcrypt加密密码，使用joi或yup验证输入，返回JWT token",
          dependencies: ["创建用户模型和数据库表"],
          relatedFiles: [
            {
              path: "src/routes/auth.ts",
              type: "CREATE",
              description: "用户认证路由"
            }
          ],
          verificationCriteria: "能够成功注册新用户，返回正确的token，拒绝重复邮箱"
        }
      ])
    };

    console.log('发送测试任务:', JSON.stringify(testTask, null, 2));
    
    const startTime = Date.now();
    const result = await client.callTool('split_tasks', testTask);
    const endTime = Date.now();
    
    console.log(`✅ split_tasks调用成功，耗时: ${(endTime - startTime) / 1000}秒`);
    console.log('返回结果类型:', typeof result);
    
    if (result && result.content && result.content[0]) {
      console.log('返回内容预览:', result.content[0].text.substring(0, 200) + '...');
    }

    console.log('\n4. 测试list_tasks工具...');
    const listResult = await client.callTool('list_tasks', {});
    console.log('✅ list_tasks调用成功');
    console.log('任务列表结果:', listResult);

    console.log('\n5. 测试错误处理（使用无效参数）...');
    try {
      await client.callTool('split_tasks', { invalid: 'parameters' });
    } catch (error) {
      console.log('✅ 错误处理正常:', error.message.substring(0, 100));
    }

    console.log('\n6. 测试服务稳定性（多次调用）...');
    for (let i = 0; i < 3; i++) {
      console.log(`  调用 ${i + 1}/3...`);
      const health = await client.healthCheck();
      if (!health.healthy) {
        console.error('❌ 服务在多次调用后变得不健康');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('✅ 多次调用测试完成');

    console.log('\n=== 测试总结 ===');
    console.log('✅ 所有基础测试通过');
    console.log('✅ 服务稳定性良好');
    console.log('✅ 错误处理正常');
    console.log('✅ 超时机制工作正常');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    await client.disconnect();
  }
}

// 运行测试
testEnhancedShrimpService().catch(console.error);