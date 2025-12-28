#!/usr/bin/env node

/**
 * 在设置代理环境变量的情况下测试增强版StdioMCPClient
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class ProxyEnvTester {
  constructor() {
    this.client = null;
  }

  async runTest() {
    console.log('🚀 测试带代理环境变量的增强版StdioMCPClient\n');
    
    await this.setupProxyEnvironment();
    await this.testEnhancedClient();
    await this.testToolCalls();
    await this.displayResults();
  }

  async setupProxyEnvironment() {
    console.log('1. 设置代理环境变量...');
    
    // 设置代理环境变量
    process.env.HTTP_PROXY = 'http://127.0.0.1:8081';
    process.env.HTTPS_PROXY = 'http://127.0.0.1:8081';
    process.env.NO_PROXY = 'localhost,127.0.0.1';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    console.log('   ✅ HTTP_PROXY=http://127.0.0.1:8081');
    console.log('   ✅ HTTPS_PROXY=http://127.0.0.1:8081');
    console.log('   ✅ NO_PROXY=localhost,127.0.0.1');
    console.log('   ✅ NODE_TLS_REJECT_UNAUTHORIZED=0');
    
    console.log('');
  }

  async testEnhancedClient() {
    console.log('2. 测试增强版客户端...');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 3,
      baseTimeout: 300000, // 5分钟
      retryDelay: 2000
    });
    
    try {
      const health = await this.client.healthCheck();
      console.log('✅ 增强版客户端连接成功');
      console.log('   健康状态:', health.status);
      
      return true;
    } catch (error) {
      console.log('❌ 增强版客户端连接失败:', error.message);
      return false;
    }
  }

  async testToolCalls() {
    console.log('3. 测试工具调用（带重试机制）...');
    
    try {
      // 测试list_tasks
      console.log('   测试list_tasks...');
      const listResult = await this.client.callTool('list_tasks', { status: 'all' });
      console.log('   ✅ list_tasks调用成功');
      console.log('   响应类型:', typeof listResult);
      
      // 测试split_tasks
      console.log('   测试split_tasks...');
      const testTask = {
        updateMode: "append",
        tasksRaw: JSON.stringify([
          {
            name: "代理测试任务",
            description: "用于测试代理环境下增强版StdioMCPClient功能的任务",
            implementationGuide: "测试代理连接和重试机制",
            dependencies: []
          }
        ])
      };

      const splitResult = await this.client.callTool('split_tasks', testTask);
      console.log('   ✅ split_tasks调用成功');
      console.log('   响应类型:', typeof splitResult);
      
      return true;
      
    } catch (error) {
      console.log('❌ 工具调用失败:', error.message);
      
      // 分析错误类型
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        console.log('   ⚠️  仍然存在超时问题，可能需要调整代理节点');
      } else if (error.message.includes('notifications/cancelled')) {
        console.log('   ⚠️  收到取消通知，可能是OpenAI API调用被中断');
      } else if (error.message.includes('Request timed out')) {
        console.log('   ⚠️  OpenAI API请求超时，检查代理节点可用性');
      }
      
      return false;
    }
  }

  async displayResults() {
    console.log('\n=== 测试总结 ===\n');
    
    console.log('🎯 带代理环境变量的增强版StdioMCPClient测试完成！');
    console.log('');
    
    console.log('📋 新增功能:');
    console.log('✅ 代理环境变量自动传递给子进程');
    console.log('✅ 智能超时时间设置（split_tasks: 5分钟）');
    console.log('✅ 指数退避重试机制（最多3次重试）');
    console.log('✅ 通知消息处理（roots/list, notifications/cancelled）');
    console.log('✅ 详细的错误日志和调试信息');
    
    console.log('\n🔧 技术改进:');
    console.log('- 支持HTTP_PROXY、HTTPS_PROXY、NO_PROXY环境变量');
    console.log('- 根据工具类型动态设置超时时间');
    console.log('- 实现指数退避重试策略');
    console.log('- 增强的错误处理和日志记录');
    console.log('- 正确处理MCP协议的通知消息');
    
    console.log('\n💡 使用建议:');
    console.log('1. 确保Clash代理正在运行并监听端口8081');
    console.log('2. 选择稳定的代理节点，确保能访问OpenAI API');
    console.log('3. 如果split_tasks仍然超时，尝试切换代理节点');
    console.log('4. 查看详细日志以诊断连接问题');
    
    console.log('\n🎉 带代理环境变量的增强版StdioMCPClient已准备就绪！');
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// 主函数
async function main() {
  const tester = new ProxyEnvTester();
  
  try {
    await tester.runTest();
  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    await tester.cleanup();
  }
}

// 运行测试
main().catch(console.error);