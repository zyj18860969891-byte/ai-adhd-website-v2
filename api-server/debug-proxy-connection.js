#!/usr/bin/env node

/**
 * 调试代理连接问题
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class ProxyConnectionDebugger {
  constructor() {
    this.client = null;
  }

  async runDebug() {
    console.log('🔍 调试代理连接问题\n');
    
    await this.setupEnvironment();
    await this.debugConnection();
    await this.debugToolCall();
  }

  async setupEnvironment() {
    console.log('1. 设置环境变量...');
    
    // 设置代理环境变量
    process.env.HTTP_PROXY = 'http://127.0.0.1:8081';
    process.env.HTTPS_PROXY = 'http://127.0.0.1:8081';
    process.env.NO_PROXY = 'localhost,127.0.0.1';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    console.log('   ✅ 代理环境变量已设置');
    console.log('');
  }

  async debugConnection() {
    console.log('2. 调试连接过程...');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 1,
      baseTimeout: 60000,
      retryDelay: 1000
    });
    
    try {
      const health = await this.client.healthCheck();
      console.log('✅ 连接成功');
      console.log('   健康状态:', health.status);
      console.log('   消息:', health.message);
    } catch (error) {
      console.log('❌ 连接失败:', error.message);
      console.log('   错误类型:', error.constructor.name);
      console.log('   错误堆栈:', error.stack);
    }
    console.log('');
  }

  async debugToolCall() {
    console.log('3. 调试工具调用...');
    
    try {
      console.log('   发送list_tasks请求...');
      
      // 直接调用callTool，捕获详细错误
      const result = await this.client.callTool('list_tasks', { status: 'all' });
      
      console.log('   ✅ 工具调用成功');
      console.log('   结果类型:', typeof result);
      console.log('   结果内容:', JSON.stringify(result, null, 2).substring(0, 500));
      
    } catch (error) {
      console.log('   ❌ 工具调用失败');
      console.log('   错误消息:', error.message);
      console.log('   错误类型:', error.constructor.name);
      console.log('   错误堆栈:', error.stack);
      
      // 详细分析错误
      if (error.message.includes('null')) {
        console.log('   🔍 错误分析: 检测到null值错误');
        console.log('   可能原因: 响应处理中的null引用');
      }
      
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        console.log('   🔍 错误分析: 超时问题');
        console.log('   可能原因: 代理连接慢或OpenAI API响应慢');
      }
      
      if (error.message.includes('notifications/cancelled')) {
        console.log('   🔍 错误分析: 请求被取消');
        console.log('   可能原因: OpenAI API调用被中断');
      }
      
      console.log('   错误堆栈:', error.stack);
    }
    
    console.log('');
  }
}

// 主函数
async function main() {
  const debuggerInstance = new ProxyConnectionDebugger();
  
  try {
    await debuggerInstance.runDebug();
  } catch (error) {
    console.error('调试过程出错:', error);
  }
}

// 运行调试
main().catch(console.error);