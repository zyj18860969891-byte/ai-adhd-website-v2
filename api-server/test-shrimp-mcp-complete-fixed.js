import { spawn } from 'child_process';

async function testShrimpMCPServiceComplete() {
  console.log('🚀 开始完整测试Shrimp MCP服务调用...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动Shrimp MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let responses = [];
    let responseCount = 0;
    
    // 处理服务输出
    mcpService.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        responses.push(response);
        responseCount++;
        console.log(`📥 收到响应 ${responseCount}:`, JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('📥 收到数据:', data.toString());
      }
    });
    
    mcpService.stderr.on('data', (data) => {
      console.log('📥 错误输出:', data.toString());
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 1. 发送初始化消息
    console.log('\n📤 发送初始化消息...');
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {
            listChanged: true
          }
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. 列出可用工具
    console.log('\n🔧 列出可用工具...');
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. 测试plan_task（使用正确的参数）
    console.log('\n🎯 测试plan_task（正确参数）...');
    const planTaskMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '创建一个简单的测试任务',
          requirements: '任务应该包含基本的功能实现'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(planTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. 测试list_tasks（使用正确的参数）
    console.log('\n📋 测试list_tasks（正确参数）...');
    const listTasksMessage = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {
          status: 'all'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(listTasksMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. 测试analyze_task（使用正确的参数）
    console.log('\n🔍 测试analyze_task（正确参数）...');
    const analyzeTaskMessage = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'analyze_task',
        arguments: {
          summary: '测试任务摘要',
          initialConcept: '测试初始概念',
          taskDescription: '测试任务描述'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(analyzeTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. 测试reflect_task（使用正确的参数）
    console.log('\n💭 测试reflect_task（正确参数）...');
    const reflectTaskMessage = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'reflect_task',
        arguments: {
          summary: '测试任务摘要',
          initialConcept: '测试初始概念',
          taskDescription: '测试任务描述'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(reflectTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. 测试split_tasks（使用正确的参数）
    console.log('\n✂️ 测试split_tasks（正确参数）...');
    const splitTasksMessage = {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'split_tasks',
        arguments: {
          taskDescription: '创建一个复杂的项目，包含前端、后端和数据库设计',
          splitStrategy: 'logical'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(splitTasksMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 8. 测试execute_task（使用正确的参数）
    console.log('\n🚀 测试execute_task（正确参数）...');
    const executeTaskMessage = {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'execute_task',
        arguments: {
          taskId: 'test-task-id',
          executionMode: 'dry_run'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(executeTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 9. 测试verify_task（使用正确的参数）
    console.log('\n✅ 测试verify_task（正确参数）...');
    const verifyTaskMessage = {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'verify_task',
        arguments: {
          taskId: 'test-task-id',
          verificationCriteria: ['completeness', 'correctness']
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(verifyTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 10. 测试query_task（使用正确的参数）
    console.log('\n🔎 测试query_task（正确参数）...');
    const queryTaskMessage = {
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'query_task',
        arguments: {
          query: 'test',
          filters: {
            status: ['pending', 'in_progress']
          }
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(queryTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 11. 测试get_task_detail（使用正确的参数）
    console.log('\n📄 测试get_task_detail（正确参数）...');
    const getTaskDetailMessage = {
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'get_task_detail',
        arguments: {
          taskId: 'test-task-id'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(getTaskDetailMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 12. 测试process_thought（使用正确的参数）
    console.log('\n🤔 测试process_thought（正确参数）...');
    const processThoughtMessage = {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'process_thought',
        arguments: {
          thought: '我需要先分析当前网站的性能瓶颈',
          context: 'performance_optimization'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(processThoughtMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 13. 测试init_project_rules（无参数）
    console.log('\n📋 测试init_project_rules（无参数）...');
    const initProjectRulesMessage = {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: {
        name: 'init_project_rules',
        arguments: {}
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initProjectRulesMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 14. 测试research_mode（使用正确的参数）
    console.log('\n🔬 测试research_mode（正确参数）...');
    const researchModeMessage = {
      jsonrpc: '2.0',
      id: 14,
      method: 'tools/call',
      params: {
        name: 'research_mode',
        arguments: {
          researchTopic: '前端性能优化',
          researchDepth: 'comprehensive'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(researchModeMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 15. 测试delete_task（使用正确的参数）
    console.log('\n❌ 测试delete_task（正确参数）...');
    const deleteTaskMessage = {
      jsonrpc: '2.0',
      id: 15,
      method: 'tools/call',
      params: {
        name: 'delete_task',
        arguments: {
          taskId: 'test-task-id',
          deleteReason: '测试完成'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(deleteTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 16. 测试clear_all_tasks（使用正确的参数）
    console.log('\n🗑️ 测试clear_all_tasks（正确参数）...');
    const clearAllTasksMessage = {
      jsonrpc: '2.0',
      id: 16,
      method: 'tools/call',
      params: {
        name: 'clear_all_tasks',
        arguments: {
          confirm: true
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(clearAllTasksMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 17. 测试update_task（使用正确的参数）
    console.log('\n✏️ 测试update_task（正确参数）...');
    const updateTaskMessage = {
      jsonrpc: '2.0',
      id: 17,
      method: 'tools/call',
      params: {
        name: 'update_task',
        arguments: {
          taskId: 'test-task-id',
          newContent: '更新后的任务内容',
          updateReason: '需求变更'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(updateTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 18. 测试不存在的工具
    console.log('\n❌ 测试不存在的工具...');
    const nonexistentToolMessage = {
      jsonrpc: '2.0',
      id: 18,
      method: 'tools/call',
      params: {
        name: 'nonexistent_tool',
        arguments: {
          param: 'test'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(nonexistentToolMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 总结测试结果
    console.log('\n📊 测试结果总结:');
    console.log(`总共发送了 18 个请求`);
    console.log(`收到了 ${responses.length} 个响应`);
    
    const successResponses = responses.filter(r => !r.error && r.result && r.result.content);
    const errorResponses = responses.filter(r => r.error || (r.result && r.result.content && r.result.content[0] && r.result.content[0].text.includes('Error')));
    
    console.log(`成功响应: ${successResponses.length}`);
    console.log(`错误响应: ${errorResponses.length}`);
    
    if (errorResponses.length > 0) {
      console.log('\n❌ 错误响应详情:');
      errorResponses.forEach((response, index) => {
        console.log(`${index + 1}. ID: ${response.id}`);
        if (response.error) {
          console.log(`   错误: ${response.error.message}`);
        } else if (response.result && response.result.content) {
          console.log(`   内容: ${response.result.content[0].text.substring(0, 100)}...`);
        }
      });
    }
    
    if (successResponses.length > 0) {
      console.log('\n✅ 成功响应详情:');
      successResponses.forEach((response, index) => {
        console.log(`${index + 1}. ID: ${response.id}`);
        if (response.result && response.result.content) {
          console.log(`   内容: ${response.result.content[0].text.substring(0, 100)}...`);
        }
      });
    }
    
    // 分析工具调用成功率
    console.log('\n📈 工具调用成功率分析:');
    const toolCalls = [
      'plan_task', 'list_tasks', 'analyze_task', 'reflect_task', 'split_tasks',
      'execute_task', 'verify_task', 'query_task', 'get_task_detail', 'process_thought',
      'init_project_rules', 'research_mode', 'delete_task', 'clear_all_tasks', 'update_task'
    ];
    
    toolCalls.forEach((toolName, index) => {
      const response = responses.find(r => r.id === index + 3); // 从第3个请求开始
      if (response) {
        const isSuccess = !response.error && response.result && response.result.content && !response.result.content[0].text.includes('Error');
        console.log(`${toolName}: ${isSuccess ? '✅ 成功' : '❌ 失败'}`);
      } else {
        console.log(`${toolName}: ❌ 无响应`);
      }
    });
    
    // 停止服务
    console.log('\n🛑 停止Shrimp MCP服务...');
    mcpService.kill();
    console.log('✅ Shrimp MCP服务测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testShrimpMCPServiceComplete().catch(console.error);