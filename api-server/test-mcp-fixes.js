import { spawn } from 'child_process';

async function testMCPFixes() {
  console.log('🧪 测试修复后的MCP服务...');
  
  try {
    // 启动修复后的MCP服务
    console.log('📡 启动修复后的Shrimp MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let messages = [];
    let testResults = {
      initialization: false,
      toolsList: false,
      toolCallSuccess: false,
      toolCallError: false,
      errorDetails: false
    };
    
    // 处理服务输出
    mcpService.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        try {
          const message = JSON.parse(output);
          messages.push({
            type: 'response',
            data: message,
            raw: output
          });
          console.log(`📥 收到响应: ${JSON.stringify(message, null, 2)}`);
        } catch (error) {
          if (output.includes('[DEBUG]') || output.includes('[ERROR]')) {
            console.log(`📥 服务日志: ${output}`);
          }
        }
      }
    });
    
    // 处理错误输出
    mcpService.stderr.on('data', (data) => {
      const errorOutput = data.toString().trim();
      console.log(`📥 错误输出: ${errorOutput}`);
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. 测试初始化
    console.log('\n📤 测试初始化...');
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
          name: 'Test Client',
          version: '1.0.0'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. 测试tools/list
    console.log('\n📤 测试tools/list...');
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 测试tools/call（正确参数）
    console.log('\n📤 测试tools/call（正确参数）...');
    const toolCallMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '这是一个测试任务，用于验证修复后的MCP服务。任务需要详细描述以确保参数验证通过。这个描述足够长以满足验证要求。',
          requirements: '这是一个测试任务，用于验证修复后的MCP服务功能',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(toolCallMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. 测试tools/call（错误参数 - 描述太短）
    console.log('\n📤 测试tools/call（错误参数 - 描述太短）...');
    const invalidToolCallMessage1 = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '太短',
          requirements: '测试',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(invalidToolCallMessage1) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. 测试tools/call（错误参数 - 缺少必需参数）
    console.log('\n📤 测试tools/call（错误参数 - 缺少必需参数）...');
    const invalidToolCallMessage2 = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          // 故意不提供description参数
          requirements: '测试',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(invalidToolCallMessage2) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. 测试不存在的工具
    console.log('\n📤 测试不存在的工具...');
    const nonexistentToolMessage = {
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
    
    mcpService.stdin.write(JSON.stringify(nonexistentToolMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 分析结果
    console.log('\n📊 测试结果分析:');
    console.log(`总共收到 ${messages.length} 条消息`);
    
    const initResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 1 && m.data.result
    );
    const toolsListResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 2 && m.data.result && m.data.result.tools
    );
    const toolCallResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 3 && m.data.result
    );
    const invalidToolCallResponse1 = messages.find(m => 
      m.type === 'response' && m.data.id === 4 && (m.data.result || m.data.error)
    );
    const invalidToolCallResponse2 = messages.find(m => 
      m.type === 'response' && m.data.id === 5 && (m.data.result || m.data.error)
    );
    const nonexistentToolResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 6 && (m.data.result || m.data.error)
    );
    
    testResults.initialization = !!initResponse;
    testResults.toolsList = !!toolsListResponse;
    testResults.toolCallSuccess = !!toolCallResponse;
    testResults.toolCallError = !!(invalidToolCallResponse1 && invalidToolCallResponse2);
    
    // 检查错误信息是否包含详细内容
    if (invalidToolCallResponse1 && invalidToolCallResponse1.data.result) {
      const errorText = invalidToolCallResponse1.data.result.content?.[0]?.text || '';
      testResults.errorDetails = errorText.includes('参数验证失败') && 
                               errorText.includes('修复建议') &&
                               errorText.includes('示例参数');
    }
    
    console.log('\n✅ 测试结果总结:');
    console.log(`1. 初始化: ${testResults.initialization ? '✅ 通过' : '❌ 失败'}`);
    console.log(`2. 工具列表获取: ${testResults.toolsList ? '✅ 通过' : '❌ 失败'}`);
    if (toolsListResponse) {
      console.log(`   可用工具数量: ${toolsListResponse.data.result.tools.length}`);
    }
    console.log(`3. 工具调用（正确参数）: ${testResults.toolCallSuccess ? '✅ 通过' : '❌ 失败'}`);
    console.log(`4. 工具调用（错误参数）: ${testResults.toolCallError ? '✅ 通过' : '❌ 失败'}`);
    console.log(`5. 错误信息详细程度: ${testResults.errorDetails ? '✅ 详细' : '❌ 不够详细'}`);
    
    // 显示错误信息示例
    if (invalidToolCallResponse1 && invalidToolCallResponse1.data.result) {
      const errorText = invalidToolCallResponse1.data.result.content?.[0]?.text || '';
      console.log('\n📋 错误信息示例:');
      console.log('='.repeat(50));
      console.log(errorText.substring(0, 500) + (errorText.length > 500 ? '...' : ''));
      console.log('='.repeat(50));
    }
    
    // 显示成功响应示例
    if (toolCallResponse && toolCallResponse.data.result) {
      const resultText = toolCallResponse.data.result.content?.[0]?.text || '';
      console.log('\n📋 成功响应示例:');
      console.log('='.repeat(50));
      console.log(resultText.substring(0, 300) + (resultText.length > 300 ? '...' : ''));
      console.log('='.repeat(50));
    }
    
    // 停止服务
    console.log('\n🛑 停止MCP服务...');
    mcpService.kill();
    
    // 生成改进建议
    console.log('\n💡 改进建议:');
    if (!testResults.toolsList) {
      console.log('1. tools/list请求可能仍然有问题，需要进一步调试');
    }
    if (!testResults.toolCallSuccess) {
      console.log('2. 正确参数的tool调用可能仍然失败，需要检查工具实现');
    }
    if (!testResults.errorDetails) {
      console.log('3. 错误信息可能需要进一步优化，提供更具体的修复建议');
    }
    
    console.log('\n✅ MCP服务测试完成！');
    
    return testResults;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

// 运行测试
testMCPFixes().then(results => {
  if (results) {
    console.log('\n🎯 最终测试结果:');
    const passedTests = Object.values(results).filter(v => v === true).length;
    const totalTests = Object.keys(results).length;
    console.log(`通过测试: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('✅ 所有测试通过！MCP服务修复成功！');
    } else {
      console.log('⚠️  部分测试失败，需要进一步调试');
    }
  }
}).catch(console.error);