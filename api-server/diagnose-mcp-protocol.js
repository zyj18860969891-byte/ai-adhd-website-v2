import { spawn } from 'child_process';
import { createInterface } from 'readline';

async function diagnoseMCPProtocol() {
  console.log('🔍 诊断MCP协议问题...');
  
  try {
    // 启动MCP服务
    console.log('📡 启动MCP服务进行诊断...');
    const mcpService = spawn('node', ['../mcp-shrimp-task-manager/dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 20000
    });
    
    let rawOutput = '';
    let messages = [];
    let requestId = 1;
    
    // 收集所有输出
    mcpService.stdout.on('data', (data) => {
      const output = data.toString();
      rawOutput += output;
      console.log(`📥 原始输出: ${output.trim()}`);
      
      // 尝试解析JSON消息
      const lines = output.trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            messages.push({
              id: message.id || 'unknown',
              method: message.method || 'response',
              type: message.method ? 'notification' : (message.result ? 'response' : 'error'),
              data: message
            });
            console.log(`📊 解析消息: ID=${message.id || 'N/A'}, Method=${message.method || 'N/A'}, Type=${message.method ? 'notification' : (message.result ? 'response' : 'error')}`);
          } catch (e) {
            // 不是JSON，可能是日志
            if (line.includes('[DEBUG]') || line.includes('[ERROR]')) {
              console.log(`📝 服务日志: ${line}`);
            }
          }
        }
      });
    });
    
    mcpService.stderr.on('data', (data) => {
      console.log(`⚠️  错误输出: ${data.toString().trim()}`);
    });
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 1. 发送初始化消息
    console.log('\n📤 发送初始化消息...');
    const initMessage = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: {
            listChanged: true
          },
          tools: {}
        },
        clientInfo: {
          name: 'Diagnostic Client',
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
      id: requestId++,
      method: 'tools/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 发送roots/list请求（如果有）
    console.log('\n📤 发送roots/list请求...');
    const listRootsMessage = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'roots/list',
      params: {}
    };
    
    mcpService.stdin.write(JSON.stringify(listRootsMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. 发送tools/call请求（正确参数）
    console.log('\n📤 发送tools/call请求（正确参数）...');
    const toolCallMessage = {
      jsonrpc: '2.0',
      id: requestId++,
      method: 'tools/call',
      params: {
        name: 'plan_task',
        arguments: {
          description: '这是一个详细的测试任务描述，用于验证MCP服务的工具调用功能。任务需要详细描述以确保参数验证通过。这个描述足够长以满足验证要求。',
          requirements: '这是一个测试任务，用于验证修复后的MCP服务功能',
          existingTasksReference: false
        }
      }
    };
    
    mcpService.stdin.write(JSON.stringify(toolCallMessage) + '\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 分析结果
    console.log('\n📊 诊断结果分析:');
    console.log(`总共收到 ${messages.length} 条消息`);
    
    console.log('\n📋 消息详情:');
    messages.forEach((msg, index) => {
      console.log(`\n消息 ${index + 1}:`);
      console.log(`  ID: ${msg.id}`);
      console.log(`  方法: ${msg.method}`);
      console.log(`  类型: ${msg.type}`);
      if (msg.data.result) {
        console.log(`  结果类型: ${msg.data.result.tools ? '工具列表' : '其他结果'}`);
        if (msg.data.result.tools) {
          console.log(`  工具数量: ${msg.data.result.tools.length}`);
        }
      }
      if (msg.data.error) {
        console.log(`  错误: ${JSON.stringify(msg.data.error)}`);
      }
    });
    
    // 检查特定消息
    const initResponse = messages.find(m => m.id === 1 && m.type === 'response');
    const toolsListResponse = messages.find(m => m.id === 2 && m.type === 'response');
    const rootsListResponse = messages.find(m => m.id === 3 && m.type === 'response');
    const toolCallResponse = messages.find(m => m.id === 4 && m.type === 'response');
    
    const rootsListNotifications = messages.filter(m => m.method === 'roots/list' && m.type === 'notification');
    
    console.log('\n✅ 检查结果:');
    console.log(`1. 初始化响应: ${initResponse ? '✅ 收到' : '❌ 未收到'}`);
    console.log(`2. tools/list响应: ${toolsListResponse ? '✅ 收到' : '❌ 未收到'}`);
    console.log(`3. roots/list响应: ${rootsListResponse ? '✅ 收到' : '❌ 未收到'}`);
    console.log(`4. tools/call响应: ${toolCallResponse ? '✅ 收到' : '❌ 未收到'}`);
    console.log(`5. roots/list通知数量: ${rootsListNotifications.length}`);
    
    if (rootsListNotifications.length > 0) {
      console.log('\n⚠️  发现roots/list通知:');
      rootsListNotifications.forEach((notification, index) => {
        console.log(`  通知 ${index + 1}: ID=${notification.id}`);
      });
    }
    
    // 分析可能的问题
    console.log('\n🔍 问题分析:');
    if (!toolsListResponse && rootsListNotifications.length > 0) {
      console.log('❌ 问题: tools/list请求被错误地处理为roots/list通知');
      console.log('💡 可能原因: MCP SDK可能错误地将某些请求转换为通知');
    }
    
    if (!toolCallResponse) {
      console.log('❌ 问题: tools/call请求没有响应');
      console.log('💡 可能原因:');
      console.log('  1. 工具函数执行时出错但没有被捕获');
      console.log('  2. MCP协议处理有问题');
      console.log('  3. 工具函数返回了undefined或null');
    }
    
    // 检查原始输出中的线索
    console.log('\n🔍 原始输出分析:');
    const lines = rawOutput.split('\n');
    const errorLines = lines.filter(line => 
      line.includes('Error') || 
      line.includes('error') || 
      line.includes('ERROR') ||
      line.includes('throw')
    );
    
    if (errorLines.length > 0) {
      console.log('发现错误信息:');
      errorLines.slice(0, 5).forEach(line => {
        console.log(`  ${line.substring(0, 100)}...`);
      });
    }
    
    // 停止服务
    console.log('\n🛑 停止MCP服务...');
    mcpService.kill();
    
    console.log('\n✅ 诊断完成！');
    
    return {
      messages,
      initResponse: !!initResponse,
      toolsListResponse: !!toolsListResponse,
      toolCallResponse: !!toolCallResponse,
      rootsListNotifications: rootsListNotifications.length,
      errors: errorLines.length
    };
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

// 运行诊断
diagnoseMCPProtocol().then(results => {
  if (results) {
    console.log('\n🎯 诊断总结:');
    console.log(`初始化: ${results.initResponse ? '✅ 正常' : '❌ 有问题'}`);
    console.log(`tools/list: ${results.toolsListResponse ? '✅ 正常' : '❌ 有问题'}`);
    console.log(`tools/call: ${results.toolCallResponse ? '✅ 正常' : '❌ 有问题'}`);
    console.log(`roots/list通知数量: ${results.rootsListNotifications}`);
    console.log(`错误数量: ${results.errors}`);
    
    if (!results.toolsListResponse || results.rootsListNotifications > 0) {
      console.log('\n⚠️  主要问题:');
      console.log('1. tools/list请求可能被错误地处理为roots/list通知');
      console.log('2. 这可能是一个MCP SDK的bug或配置问题');
      console.log('3. 需要检查MCP SDK的版本和实现');
    }
    
    if (!results.toolCallResponse) {
      console.log('\n⚠️  次要问题:');
      console.log('1. tools/call请求没有响应');
      console.log('2. 可能是工具函数执行问题或协议处理问题');
    }
  }
}).catch(console.error);