import { spawn } from 'child_process';

async function debugMCPProtocol() {
  console.log('🔍 调试MCP协议通信...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动Shrimp MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let messages = [];
    
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
          console.log(`📥 收到消息: ${JSON.stringify(message, null, 2)}`);
        } catch (error) {
          console.log(`📥 收到非JSON数据: ${output}`);
          messages.push({
            type: 'raw',
            data: output
          });
        }
      }
    });
    
    // 处理错误输出
    mcpService.stderr.on('data', (data) => {
      console.log(`📥 错误输出: ${data.toString()}`);
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
          name: 'Debug Client',
          version: '1.0.0'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. 发送tools/list请求
    console.log('\n📤 发送tools/list请求...');
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 发送tools/call请求
    console.log('\n📤 发送tools/call请求...');
    const toolCallMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '测试任务规划功能',
          requirements: '这是一个测试任务',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(toolCallMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 分析消息
    console.log('\n📊 消息分析:');
    console.log(`总共收到 ${messages.length} 条消息`);
    
    messages.forEach((msg, index) => {
      console.log(`\n消息 ${index + 1}:`);
      console.log(`类型: ${msg.type}`);
      if (msg.type === 'response') {
        const data = msg.data;
        console.log(`JSON-RPC ID: ${data.id || '无ID'}`);
        console.log(`方法: ${data.method || '响应'}`);
        console.log(`结果类型: ${data.result ? 'result' : data.error ? 'error' : 'notification'}`);
        
        if (data.method === 'roots/list') {
          console.log('⚠️  这是一个通知，不是对请求的响应');
        }
      }
    });
    
    // 检查是否有正确的响应
    const initResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 1 && m.data.result
    );
    const toolsListResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 2 && m.data.result
    );
    const toolCallResponse = messages.find(m => 
      m.type === 'response' && m.data.id === 3 && m.data.result
    );
    
    console.log('\n✅ 初始化响应:', initResponse ? '收到' : '未收到');
    console.log('✅ tools/list响应:', toolsListResponse ? '收到' : '未收到');
    console.log('✅ tools/call响应:', toolCallResponse ? '收到' : '未收到');
    
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
debugMCPProtocol().catch(console.error);