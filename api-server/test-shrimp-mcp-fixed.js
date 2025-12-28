import { spawn } from 'child_process';

async function testShrimpMCPServiceFixed() {
  console.log('🚀 开始测试Shrimp MCP服务调用（修正版）...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动Shrimp MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
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
    
    // 等待初始化响应
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
    
    // 等待工具列表响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. 测试列出任务（修正参数）
    console.log('\n📋 测试列出任务...');
    const listTasksMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {
          status: 'all'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(listTasksMessage) + '\n');
    
    // 等待任务列表响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. 测试规划任务
    console.log('\n🎯 测试规划任务...');
    const planTaskMessage = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          taskDescription: '创建一个简单的测试任务',
          priority: 'medium',
          deadline: new Date(Date.now() + 86400000).toISOString()
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(planTaskMessage) + '\n');
    
    // 等待任务规划响应
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 5. 测试分析任务
    console.log('\n🔍 测试分析任务...');
    const analyzeTaskMessage = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'analyze_task',
        arguments: {
          taskId: 'test-task-id',
          analysisType: 'comprehensive'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(analyzeTaskMessage) + '\n');
    
    // 等待任务分析响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. 测试反思任务
    console.log('\n💭 测试反思任务...');
    const reflectTaskMessage = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'reflect_task',
        arguments: {
          taskId: 'test-task-id',
          reflectionType: 'process'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(reflectTaskMessage) + '\n');
    
    // 等待任务反思响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. 测试分割任务
    console.log('\n✂️ 测试分割任务...');
    const splitTasksMessage = {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'split_tasks_raw',
        arguments: {
          taskDescription: '创建一个复杂的项目，包含前端、后端和数据库设计',
          splitStrategy: 'logical'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(splitTasksMessage) + '\n');
    
    // 等待任务分割响应
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 8. 测试执行任务
    console.log('\n🚀 测试执行任务...');
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
    
    // 等待任务执行响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 9. 测试验证任务
    console.log('\n✅ 测试验证任务...');
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
    
    // 等待任务验证响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 10. 测试查询任务
    console.log('\n🔎 测试查询任务...');
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
    
    // 等待任务查询响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 11. 测试获取任务详情
    console.log('\n📄 测试获取任务详情...');
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
    
    // 等待任务详情响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 12. 测试智能任务分析
    console.log('\n🧠 测试智能任务分析...');
    const intelligentAnalysisMessage = {
      jsonrpc: '2.0',
      id: 12,
      method: 'tools/call',
      params: {
        name: 'intelligent_task_analysis',
        arguments: {
          taskDescription: '优化网站性能',
          analysisDepth: 'deep'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(intelligentAnalysisMessage) + '\n');
    
    // 等待智能分析响应
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 13. 测试处理思路
    console.log('\n🤔 测试处理思路...');
    const processThoughtMessage = {
      jsonrpc: '2.0',
      id: 13,
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
    
    // 等待思路处理响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 14. 测试研究模式
    console.log('\n🔬 测试研究模式...');
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
    
    // 等待研究模式响应
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 15. 测试初始化项目规则
    console.log('\n📋 测试初始化项目规则...');
    const initProjectRulesMessage = {
      jsonrpc: '2.0',
      id: 15,
      method: 'tools/call',
      params: {
        name: 'init_project_rules',
        arguments: {
          projectType: 'web_application',
          framework: 'react'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initProjectRulesMessage) + '\n');
    
    // 等待项目规则初始化响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 16. 测试清空所有任务
    console.log('\n🗑️ 测试清空所有任务...');
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
    
    // 等待清空任务响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 17. 测试更新任务内容
    console.log('\n✏️ 测试更新任务内容...');
    const updateTaskContentMessage = {
      jsonrpc: '2.0',
      id: 17,
      method: 'tools/call',
      params: {
        name: 'update_task_content',
        arguments: {
          taskId: 'test-task-id',
          newContent: '更新后的任务内容',
          updateReason: '需求变更'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(updateTaskContentMessage) + '\n');
    
    // 等待任务更新响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 18. 测试删除任务
    console.log('\n❌ 测试删除任务...');
    const deleteTaskMessage = {
      jsonrpc: '2.0',
      id: 18,
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
    
    // 等待任务删除响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 总结测试结果
    console.log('\n📊 测试结果总结:');
    console.log(`总共发送了 18 个请求`);
    console.log(`收到了 ${responses.length} 个响应`);
    
    const successResponses = responses.filter(r => !r.error);
    const errorResponses = responses.filter(r => r.error);
    
    console.log(`成功响应: ${successResponses.length}`);
    console.log(`错误响应: ${errorResponses.length}`);
    
    if (errorResponses.length > 0) {
      console.log('\n❌ 错误响应详情:');
      errorResponses.forEach((response, index) => {
        console.log(`${index + 1}. ID: ${response.id}, 错误: ${response.error.message}`);
      });
    }
    
    // 分析响应内容
    console.log('\n📋 响应内容分析:');
    const toolResponses = responses.filter(r => r.result && r.result.content);
    toolResponses.forEach((response, index) => {
      const content = response.result.content[0];
      if (content.type === 'text') {
        console.log(`请求 ${response.id}: ${content.text.substring(0, 100)}...`);
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
testShrimpMCPServiceFixed().catch(console.error);