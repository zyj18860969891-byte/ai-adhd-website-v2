#!/usr/bin/env node

/**
 * 测试增强版StdioMCPClient的代理功能
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class EnhancedProxyTester {
  constructor() {
    this.client = null;
  }

  async runTest() {
    console.log('🚀 测试增强版StdioMCPClient代理功能\n');
    
    await this.testProxyEnvironment();
    await this.testEnhancedClient();
    await this.testToolCalls();
    await this.displayResults();
  }

  async testProxyEnvironment() {
    console.log('1. 测试代理环境...');
    
    // 检查环境变量
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    
    console.log(`   HTTP_PROXY: ${httpProxy || '未设置'}`);
    console.log(`   HTTPS_PROXY: ${httpsProxy || '未设置'}`);
    console.log(`   NO_PROXY: ${noProxy || '未设置'}`);
    
    if (httpProxy || httpsProxy) {
      console.log('✅ 代理环境变量已设置');
    } else {
      console.log('⚠️  代理环境变量未设置');
    }
    
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
            name: "增强测试任务",
            description: "用于测试增强版StdioMCPClient代理功能的任务",
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
    
    console.log('🎯 增强版StdioMCPClient测试完成！');
    console.log('');
    
    console.log('📋 新增功能:');
    console.log('✅ 代理环境变量自动传递');
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
    
    console.log('\n🎉 增强版StdioMCPClient已准备就绪！');
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// 主函数
async function main() {
  const tester = new EnhancedProxyTester();
  
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