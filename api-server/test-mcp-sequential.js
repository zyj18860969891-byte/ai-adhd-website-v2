import { spawn } from 'child_process';

async function testSequentialMCP() {
  console.log('🧪 顺序MCP测试...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let messages = [];
    let requestId = 1;
    
    // 收集所有输出
    mcpService.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`📥 输出: ${output}`);
        try {
          const message = JSON.parse(output);
          messages.push({
            ...message,
            timestamp: Date.now()
          });
        } catch (e) {
          // 不是JSON
        }
      }
    });
    
    mcpService.stderr.on('data', (data) => {
      console.log(`⚠️  错误: ${data.toString().trim()}`);
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. 初始化
    console.log('\n📤 步骤1: 发送初始化消息...');
    const initMessage = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {
            listChanged: false
          },
          tools: {}
        },
        clientInfo: {
          name: 'Sequential Test',
          version: '1.0.0'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. 发送tools/list
    console.log('\n📤 步骤2: 发送tools/list请求...');
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 再次发送tools/list
    console.log('\n📤 步骤3: 再次发送tools/list请求...');
    const listToolsMessage2 = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage2) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. 发送tools/call（错误参数）
    console.log('\n📤 步骤4: 发送tools/call（错误参数）...');
    const invalidToolCallMessage = {
      jsonrpc: '2.0',
      id: requestId++,
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
    
    mcpService.stdin.write(JSON.stringify(invalidToolCallMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. 再次发送tools/call（错误参数）
    console.log('\n📤 步骤5: 再次发送tools/call（错误参数）...');
    const invalidToolCallMessage2 = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '还是太短',
          requirements: '测试',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(invalidToolCallMessage2) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 分析结果
    console.log('\n📊 详细分析:');
    console.log(`总共收到 ${messages.length} 条消息`);
    
    messages.forEach((msg, index) => {
      console.log(`\n消息 ${index + 1}:`);
      console.log(`  ID: ${msg.id || 'N/A'}`);
      console.log(`  方法: ${msg.method || 'N/A'}`);
      console.log(`  类型: ${msg.method ? 'notification' : (msg.result ? 'response' : 'error')}`);
      console.log(`  时间戳: ${msg.timestamp}`);
      
      if (msg.method === 'roots/list') {
        console.log(`  ⚠️  这是roots/list通知`);
        console.log(`  通知ID: ${msg.id}`);
        if (msg.params) {
          console.log(`  参数: ${JSON.stringify(msg.params)}`);
        }
      }
      
      if (msg.result) {
        if (msg.result.tools) {
          console.log(`  ✅ 这是工具列表响应`);
          console.log(`  工具数量: ${msg.result.tools.length}`);
        } else {
          console.log(`  📋 这是其他响应`);
        }
      }
      
      if (msg.error) {
        console.log(`  ❌ 这是错误响应`);
        console.log(`  错误代码: ${msg.error.code}`);
        console.log(`  错误消息: ${msg.error.message}`);
      }
    });
    
    // 分析消息序列
    console.log('\n🔍 消息序列分析:');
    const initResponse = messages.find(m => m.id === 1 && m.result);
    const toolsListResponse1 = messages.find(m => m.id === 2 && m.result);
    const toolsListResponse2 = messages.find(m => m.id === 3 && m.result);
    const toolCallResponse1 = messages.find(m => m.id === 4 && (m.result || m.error));
    const toolCallResponse2 = messages.find(m => m.id === 5 && (m.result || m.error));
    
    const rootsListNotifications = messages.filter(m => m.method === 'roots/list');
    
    console.log(`1. 初始化响应: ${initResponse ? '✅' : '❌'}`);
    console.log(`2. 第一次tools/list响应: ${toolsListResponse1 ? '✅' : '❌'}`);
    console.log(`3. 第二次tools/list响应: ${toolsListResponse2 ? '✅' : '❌'}`);
    console.log(`4. 第一次tools/call响应: ${toolCallResponse1 ? '✅' : '❌'}`);
    console.log(`5. 第二次tools/call响应: ${toolCallResponse2 ? '✅' : '❌'}`);
    console.log(`6. roots/list通知数量: ${rootsListNotifications.length}`);
    
    // 分析规律
    console.log('\n💡 发现规律:');
    if (rootsListNotifications.length > 0) {
      console.log('每次发送tools/list或tools/call请求后，都会收到roots/list通知');
      console.log('这可能是MCP SDK的bug，或者是我们配置的问题');
    }
    
    if (!toolsListResponse1 && !toolsListResponse2) {
      console.log('tools/list请求从未得到正确的响应');
      console.log('这确认了MCP SDK在处理tools/list请求时有问题');
    }
    
    if (!toolCallResponse1 && !toolCallResponse2) {
      console.log('tools/call请求从未得到响应（除了错误参数的情况）');
      console.log('这确认了MCP SDK在处理tools/call请求时有问题');
    }
    
    // 停止服务
    console.log('\n🛑 停止MCP服务...');
    mcpService.kill();
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testSequentialMCP().catch(console.error);