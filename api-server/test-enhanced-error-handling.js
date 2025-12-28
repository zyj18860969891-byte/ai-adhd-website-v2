import { spawn } from 'child_process';

async function testEnhancedErrorHandling() {
  console.log('🚀 开始测试增强的错误处理和参数验证...');
  
  try {
    // 启动增强版MCP服务
    console.log('📡 启动增强版Shrimp MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index-enhanced.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let responses = [];
    
    // 处理服务输出
    mcpService.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        responses.push(response);
        console.log('📥 收到响应:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('📥 收到数据:', data.toString());
      }
    });
    
    mcpService.stderr.on('data', (data) => {
      console.log('📥 错误输出:', data.toString());
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 1. 测试plan_task - 缺少必需参数
    console.log('\n📝 测试plan_task - 缺少必需参数...');
    const planTaskMissingParam = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          // 缺少必需的description参数
          requirements: '测试要求'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(planTaskMissingParam) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. 测试list_tasks - 缺少必需参数
    console.log('\n📋 测试list_tasks - 缺少必需参数...');
    const listTasksMissingParam = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {
          // 缺少必需的status参数
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(listTasksMissingParam) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. 测试list_tasks - 无效参数值
    console.log('\n📋 测试list_tasks - 无效参数值...');
    const listTasksInvalidValue = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {
          status: 'invalid_status'  // 无效的状态值
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(listTasksInvalidValue) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. 测试analyze_task - 缺少必需参数
    console.log('\n🔍 测试analyze_task - 缺少必需参数...');
    const analyzeTaskMissingParam = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'analyze_task',
        arguments: {
          // 缺少必需的taskId参数
          analysisType: 'comprehensive'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(analyzeTaskMissingParam) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. 测试execute_task - 缺少必需参数
    console.log('\n🚀 测试execute_task - 缺少必需参数...');
    const executeTaskMissingParam = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'execute_task',
        arguments: {
          // 缺少必需的taskId参数
          executionMode: 'dry_run'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(executeTaskMissingParam) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. 测试不存在的工具
    console.log('\n❌ 测试不存在的工具...');
    const nonexistentTool = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'nonexistent_tool',
        arguments: {
          param: 'test'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(nonexistentTool) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. 测试正确的参数调用
    console.log('\n✅ 测试正确的参数调用...');
    const correctPlanTask = {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '创建一个简单的测试任务',
          requirements: '任务应该包含基本的功能实现'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(correctPlanTask) + '\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 8. 测试正确的list_tasks调用
    console.log('\n📋 测试正确的list_tasks调用...');
    const correctListTasks = {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {
          status: 'all'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(correctListTasks) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 总结测试结果
    console.log('\n📊 测试结果总结:');
    console.log(`总共发送了 8 个请求`);
    console.log(`收到了 ${responses.length} 个响应`);
    
    const errorResponses = responses.filter(r => r.result && r.result.content && r.result.content[0] && r.result.content[0].text.includes('错误'));
    const successResponses = responses.filter(r => r.result && r.result.content && r.result.content[0] && !r.result.content[0].text.includes('错误'));
    
    console.log(`错误响应: ${errorResponses.length}`);
    console.log(`成功响应: ${successResponses.length}`);
    
    if (errorResponses.length > 0) {
      console.log('\n❌ 错误响应详情:');
      errorResponses.forEach((response, index) => {
        const content = response.result.content[0];
        console.log(`${index + 1}. 请求 ${response.id}:`);
        console.log(`   ${content.text.substring(0, 200)}...`);
      });
    }
    
    if (successResponses.length > 0) {
      console.log('\n✅ 成功响应详情:');
      successResponses.forEach((response, index) => {
        const content = response.result.content[0];
        console.log(`${index + 1}. 请求 ${response.id}:`);
        console.log(`   ${content.text.substring(0, 200)}...`);
      });
    }
    
    // 分析错误处理质量
    console.log('\n🔍 错误处理质量分析:');
    errorResponses.forEach((response, index) => {
      const content = response.result.content[0];
      const text = content.text;
      
      console.log(`\n错误响应 ${index + 1}:`);
      
      // 检查是否包含错误分类
      if (text.includes('参数验证错误')) {
        console.log('✅ 包含错误分类');
      } else {
        console.log('❌ 缺少错误分类');
      }
      
      // 检查是否包含字段信息
      if (text.includes('字段')) {
        console.log('✅ 包含字段信息');
      } else {
        console.log('❌ 缺少字段信息');
      }
      
      // 检查是否包含修复建议
      if (text.includes('修复建议') || text.includes('建议')) {
        console.log('✅ 包含修复建议');
      } else {
        console.log('❌ 缺少修复建议');
      }
      
      // 检查是否包含示例
      if (text.includes('示例') || text.includes('example')) {
        console.log('✅ 包含示例');
      } else {
        console.log('❌ 缺少示例');
      }
      
      // 检查是否包含重试指导
      if (text.includes('重试') || text.includes('修正')) {
        console.log('✅ 包含重试指导');
      } else {
        console.log('❌ 缺少重试指导');
      }
    });
    
    // 停止服务
    console.log('\n🛑 停止增强版Shrimp MCP服务...');
    mcpService.kill();
    console.log('✅ 增强版Shrimp MCP服务测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testEnhancedErrorHandling().catch(console.error);