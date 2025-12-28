import { spawn } from 'child_process';

async function testMCPService() {
  console.log('🚀 开始测试MCP服务...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动MCP服务...');
    const mcpService = spawn('node', ['../../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 检查服务是否还在运行
    if (!mcpService.killed) {
      console.log('✅ MCP服务启动成功');
      
      // 发送初始化消息
      console.log('📤 发送初始化消息...');
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
      
      // 等待响应
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 发送列出工具请求
      console.log('🔧 请求列出工具...');
      const listToolsMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      
      mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
      
      // 等待响应
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 停止服务
      console.log('🛑 停止MCP服务...');
      mcpService.kill();
      console.log('✅ MCP服务测试完成');
      
    } else {
      console.log('❌ MCP服务启动失败');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testMCPService().catch(console.error);