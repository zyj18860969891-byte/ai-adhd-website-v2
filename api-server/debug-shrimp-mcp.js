import { spawn } from 'child_process';

async function debugShrimpMCPService() {
  console.log('🔍 调试Shrimp MCP服务...');
  
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
    
    // 处理错误输出
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
    
    // 3. 测试一个简单的工具调用
    console.log('\n🎯 测试plan_task（简单参数）...');
    const planTaskMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '测试任务'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(planTaskMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. 测试不存在的工具
    console.log('\n❌ 测试不存在的工具...');
    const nonexistentToolMessage = {
      jsonrpc: '2.0',
      id: 4,
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
    console.log('\n📊 调试结果总结:');
    console.log(`总共发送了 4 个请求`);
    console.log(`收到了 ${responses.length} 个响应`);
    
    responses.forEach((response, index) => {
      console.log(`\n响应 ${index + 1}:`);
      console.log(`ID: ${response.id}`);
      if (response.error) {
        console.log(`错误: ${response.error.message}`);
      } else if (response.result) {
        console.log(`结果: ${JSON.stringify(response.result, null, 2)}`);
      }
    });
    
    // 停止服务
    console.log('\n🛑 停止Shrimp MCP服务...');
    mcpService.kill();
    console.log('✅ 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行调试
debugShrimpMCPService().catch(console.error);