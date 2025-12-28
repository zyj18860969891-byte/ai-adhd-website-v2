import { spawn } from 'child_process';

async function testMinimalMCP() {
  console.log('🧪 最小化MCP测试...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动MCP服务...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    
    let messages = [];
    
    // 收集所有输出
    mcpService.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`📥 输出: ${output}`);
        try {
          const message = JSON.parse(output);
          messages.push(message);
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
    
    // 只发送初始化消息，看看服务是否会发送roots/list通知
    console.log('\n📤 只发送初始化消息...');
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {
            listChanged: false  // 设置为false，看看是否还会收到通知
        },
          tools: {}
        },
        clientInfo: {
          name: 'Minimal Test',
          version: '1.0.0'
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(initMessage) + '\n');
    
    // 等待10秒，观察是否有自发通知
    console.log('\n⏳ 等待10秒观察自发通知...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 分析结果
    console.log('\n📊 分析结果:');
    console.log(`总共收到 ${messages.length} 条消息`);
    
    messages.forEach((msg, index) => {
      console.log(`\n消息 ${index + 1}:`);
      console.log(`  ID: ${msg.id || 'N/A'}`);
      console.log(`  方法: ${msg.method || 'N/A'}`);
      if (msg.method === 'roots/list') {
        console.log(`  ⚠️  这是roots/list通知`);
        if (msg.params) {
          console.log(`  参数: ${JSON.stringify(msg.params)}`);
        }
      }
      if (msg.result) {
        console.log(`  结果类型: ${msg.result.tools ? '工具列表' : '其他'}`);
      }
      if (msg.error) {
        console.log(`  错误: ${JSON.stringify(msg.error)}`);
      }
    });
    
    const rootsListNotifications = messages.filter(m => m.method === 'roots/list');
    console.log(`\n📈 roots/list通知数量: ${rootsListNotifications.length}`);
    
    if (rootsListNotifications.length > 0) {
      console.log('\n🔍 分析:');
      console.log('MCP服务在初始化后自发发送了roots/list通知');
      console.log('这可能表明:');
      console.log('1. MCP SDK有bug，错误地发送通知');
      console.log('2. 服务配置有问题');
      console.log('3. 这是MCP协议的正常行为，但客户端没有正确处理');
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
testMinimalMCP().catch(console.error);