#!/usr/bin/env node

/**
 * Shrimp MCP服务稳定性综合测试
 * 测试超时处理、错误恢复、资源管理等功能
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class StabilityTestSuite {
  constructor() {
    this.client = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async initialize() {
    console.log('🔧 初始化稳定性测试套件...\n');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 3,
      baseTimeout: 300000,
      retryDelay: 2000
    });

    console.log('✅ 测试客户端初始化完成');
  }

  async runAllTests() {
    console.log('🧪 开始运行稳定性测试套件...\n');

    await this.testBasicConnection();
    await this.testToolCalls();
    await this.testErrorHandling();
    await this.testTimeoutHandling();
    await this.testResourceManagement();
    await this.testRecoveryMechanism();
    await this.testPerformanceUnderLoad();

    this.displayResults();
  }

  async testBasicConnection() {
    console.log('📡 测试1: 基本连接和健康检查');
    
    try {
      const health = await this.client.healthCheck();
      this.recordResult('basic_connection', true, '健康检查通过', health);
      console.log('✅ 基本连接测试通过');
    } catch (error) {
      this.recordResult('basic_connection', false, '健康检查失败', error.message);
      console.log('❌ 基本连接测试失败:', error.message);
    }
    console.log('');
  }

  async testToolCalls() {
    console.log('🛠️  测试2: 工具调用测试');
    
    // 测试list_tasks
    try {
      const result = await this.client.callTool('list_tasks', {});
      this.recordResult('tool_list_tasks', true, 'list_tasks调用成功', result);
      console.log('✅ list_tasks调用成功');
    } catch (error) {
      this.recordResult('tool_list_tasks', false, 'list_tasks调用失败', error.message);
      console.log('❌ list_tasks调用失败:', error.message);
    }

    // 测试split_tasks（关键测试）
    try {
      const testTask = {
        updateMode: "clearAllTasks",
        tasksRaw: JSON.stringify([
          {
            name: "稳定性测试任务1",
            description: "用于测试服务稳定性的任务",
            implementationGuide: "这是一个测试任务",
            dependencies: []
          },
          {
            name: "稳定性测试任务2", 
            description: "另一个测试任务",
            implementationGuide: "这也是一个测试任务",
            dependencies: ["稳定性测试任务1"]
          }
        ])
      };

      const result = await this.client.callTool('split_tasks', testTask);
      this.recordResult('tool_split_tasks', true, 'split_tasks调用成功', '任务分解完成');
      console.log('✅ split_tasks调用成功');
    } catch (error) {
      this.recordResult('tool_split_tasks', false, 'split_tasks调用失败', error.message);
      console.log('❌ split_tasks调用失败:', error.message);
    }
    console.log('');
  }

  async testErrorHandling() {
    console.log('⚠️  测试3: 错误处理测试');
    
    // 测试无效参数
    try {
      await this.client.callTool('split_tasks', { invalid: 'parameters' });
      this.recordResult('error_handling', false, '应该抛出错误但没有', '预期错误处理未生效');
      console.log('❌ 错误处理测试失败: 应该抛出错误但没有');
    } catch (error) {
      this.recordResult('error_handling', true, '错误处理正常', error.message);
      console.log('✅ 错误处理测试通过: 正确捕获错误');
    }
    console.log('');
  }

  async testTimeoutHandling() {
    console.log('⏰ 测试4: 超时处理测试');
    
    // 创建一个会超时的请求（使用极短的超时时间测试）
    const tempClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 1,
      baseTimeout: 1000, // 1秒超时
      retryDelay: 500
    });

    try {
      await tempClient.callTool('split_tasks', {
        updateMode: "append",
        tasksRaw: JSON.stringify([{
          name: "超时测试任务",
          description: "用于测试超时处理的任务",
          implementationGuide: "测试超时",
          dependencies: []
        }])
      });
      this.recordResult('timeout_handling', false, '应该超时但没有', '超时机制未生效');
      console.log('❌ 超时处理测试失败: 应该超时但没有');
    } catch (error) {
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        this.recordResult('timeout_handling', true, '超时处理正常', error.message);
        console.log('✅ 超时处理测试通过: 正确触发超时');
      } else {
        this.recordResult('timeout_handling', false, '超时处理异常', error.message);
        console.log('❌ 超时处理测试失败: 非预期错误', error.message);
      }
    }

    await tempClient.disconnect();
    console.log('');
  }

  async testResourceManagement() {
    console.log('💾 测试5: 资源管理测试');
    
    try {
      // 多次调用测试内存泄漏
      const initialHealth = await this.client.healthCheck();
      const initialMemory = initialHealth.memoryUsage.heapUsed;
      
      console.log(`初始内存: ${initialMemory}MB`);
      
      // 进行多次调用
      for (let i = 0; i < 5; i++) {
        await this.client.callTool('list_tasks', {});
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const finalHealth = await this.client.healthCheck();
      const finalMemory = finalHealth.memoryUsage.heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`最终内存: ${finalMemory}MB`);
      console.log(`内存增长: ${memoryIncrease}MB`);
      
      // 如果内存增长超过50MB，认为有内存泄漏
      if (memoryIncrease < 50) {
        this.recordResult('resource_management', true, '资源管理正常', `内存增长: ${memoryIncrease}MB`);
        console.log('✅ 资源管理测试通过: 内存增长在合理范围内');
      } else {
        this.recordResult('resource_management', false, '可能存在内存泄漏', `内存增长: ${memoryIncrease}MB`);
        console.log('⚠️  资源管理测试警告: 内存增长较大');
      }
      
    } catch (error) {
      this.recordResult('resource_management', false, '资源管理测试失败', error.message);
      console.log('❌ 资源管理测试失败:', error.message);
    }
    console.log('');
  }

  async testRecoveryMechanism() {
    console.log('🔄 测试6: 恢复机制测试');
    
    try {
      // 测试服务在错误后的恢复能力
      const health1 = await this.client.healthCheck();
      console.log(`错误前健康状态: ${health1.healthy ? '健康' : '不健康'}`);
      
      // 故意触发一个错误
      try {
        await this.client.callTool('nonexistent_tool', {});
      } catch (error) {
        console.log('✅ 成功触发错误（预期行为）');
      }
      
      // 等待服务恢复
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 测试恢复后的功能
      const health2 = await this.client.healthCheck();
      const result = await this.client.callTool('list_tasks', {});
      
      if (health2.healthy && result) {
        this.recordResult('recovery_mechanism', true, '恢复机制正常', '服务在错误后正常恢复');
        console.log('✅ 恢复机制测试通过: 服务在错误后正常恢复');
      } else {
        this.recordResult('recovery_mechanism', false, '恢复机制异常', '服务在错误后未能恢复');
        console.log('❌ 恢复机制测试失败: 服务在错误后未能恢复');
      }
      
    } catch (error) {
      this.recordResult('recovery_mechanism', false, '恢复机制测试失败', error.message);
      console.log('❌ 恢复机制测试失败:', error.message);
    }
    console.log('');
  }

  async testPerformanceUnderLoad() {
    console.log('⚡ 测试7: 负载性能测试');
    
    try {
      const startTime = Date.now();
      const concurrentRequests = 3;
      
      // 并发请求测试
      const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
        try {
          return await this.client.callTool('list_tasks', {});
        } catch (error) {
          throw new Error(`请求${index + 1}失败: ${error.message}`);
        }
      });
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const successCount = results.filter(r => r !== null).length;
      const avgResponseTime = totalTime / concurrentRequests;
      
      console.log(`并发请求数: ${concurrentRequests}`);
      console.log(`成功请求数: ${successCount}`);
      console.log(`总耗时: ${totalTime}ms`);
      console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      
      if (successCount === concurrentRequests && avgResponseTime < 10000) {
        this.recordResult('performance_load', true, '负载性能良好', `平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
        console.log('✅ 负载性能测试通过: 并发处理能力正常');
      } else {
        this.recordResult('performance_load', false, '负载性能不足', `成功率: ${successCount}/${concurrentRequests}, 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
        console.log('⚠️  负载性能测试警告: 并发处理能力不足');
      }
      
    } catch (error) {
      this.recordResult('performance_load', false, '负载性能测试失败', error.message);
      console.log('❌ 负载性能测试失败:', error.message);
    }
    console.log('');
  }

  recordResult(testName, passed, message, details) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.details.push({
      test: testName,
      passed,
      message,
      details: typeof details === 'string' ? details : JSON.stringify(details, null, 2)
    });
  }

  displayResults() {
    console.log('📊 稳定性测试结果');
    console.log('==================');
    console.log(`总测试数: ${this.testResults.total}`);
    console.log(`通过: ${this.testResults.passed} ✅`);
    console.log(`失败: ${this.testResults.failed} ❌`);
    console.log(`成功率: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);
    console.log('');
    
    if (this.testResults.failed > 0) {
      console.log('❌ 失败的测试:');
      this.testResults.details
        .filter(detail => !detail.passed)
        .forEach((detail, index) => {
          console.log(`${index + 1}. ${detail.test}: ${detail.message}`);
          console.log(`   详情: ${detail.details.substring(0, 100)}...`);
        });
    }
    
    console.log('');
    
    if (this.testResults.passed === this.testResults.total) {
      console.log('🎉 所有测试通过！Shrimp MCP服务稳定性良好！');
    } else if (this.testResults.passed >= this.testResults.total * 0.7) {
      console.log('⚠️  大部分测试通过，但存在一些问题需要改进');
    } else {
      console.log('❌ 较多测试失败，需要重点关注服务稳定性');
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// 主函数
async function main() {
  const testSuite = new StabilityTestSuite();
  
  try {
    await testSuite.initialize();
    await testSuite.runAllTests();
  } catch (error) {
    console.error('测试套件执行失败:', error);
  } finally {
    await testSuite.cleanup();
  }
}

// 运行测试
main().catch(console.error);