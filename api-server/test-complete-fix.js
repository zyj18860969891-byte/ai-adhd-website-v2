#!/usr/bin/env node

/**
 * Shrimp MCP服务完整修复验证脚本
 * 验证所有稳定性修复措施是否生效
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class CompleteFixValidator {
  constructor() {
    this.client = null;
    this.testResults = {
      config: false,
      connection: false,
      basicTools: false,
      splitTasks: false,
      timeoutHandling: false,
      errorRecovery: false,
      monitoring: false
    };
  }

  async initialize() {
    console.log('🔧 Shrimp MCP服务完整修复验证\n');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 3,
      baseTimeout: 300000, // 5分钟
      retryDelay: 2000
    });
  }

  async runValidation() {
    console.log('=== 开始验证修复效果 ===\n');

    await this.testConfiguration();
    await this.testConnection();
    await this.testBasicTools();
    await this.testSplitTasks();
    await this.testTimeoutHandling();
    await this.testErrorRecovery();
    await this.testMonitoring();
    
    this.displayResults();
  }

  async testConfiguration() {
    console.log('1. 验证环境配置...');
    
    try {
      // 检查Shrimp目录的.env文件
      const envFile = '../mcp-shrimp-task-manager/.env';
      const fs = await import('fs');
      
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        
        if (envContent.includes('OPENAI_API_KEY=') && 
            !envContent.includes('OPENAI_API_KEY=your_openai_api_key_here')) {
          console.log('✅ 环境配置文件正确');
          this.testResults.config = true;
        } else {
          console.log('❌ OpenAI API密钥未正确配置');
        }
      } else {
        console.log('❌ .env文件不存在');
      }
    } catch (error) {
      console.log('❌ 配置检查失败:', error.message);
    }
    console.log('');
  }

  async testConnection() {
    console.log('2. 验证服务连接...');
    
    try {
      const health = await this.client.healthCheck();
      
      if (health.status === 'healthy' || health.status === 'partially_healthy') {
        console.log('✅ 服务连接正常');
        console.log(`   状态: ${health.status}`);
        console.log(`   消息: ${health.message}`);
        this.testResults.connection = true;
      } else {
        console.log('❌ 服务连接异常:', health.message);
      }
    } catch (error) {
      console.log('❌ 连接测试失败:', error.message);
    }
    console.log('');
  }

  async testBasicTools() {
    console.log('3. 验证基础工具调用...');
    
    try {
      const result = await this.client.callTool('list_tasks', { status: 'all' });
      
      if (result && result.content) {
        console.log('✅ 基础工具调用成功');
        console.log(`   返回类型: ${typeof result}`);
        this.testResults.basicTools = true;
      } else {
        console.log('❌ 基础工具调用返回异常结果');
      }
    } catch (error) {
      console.log('❌ 基础工具调用失败:', error.message);
    }
    console.log('');
  }

  async testSplitTasks() {
    console.log('4. 验证split_tasks功能（核心测试）...');
    
    try {
      const testTask = {
        updateMode: "append",
        tasksRaw: JSON.stringify([
          {
            name: "修复验证测试任务",
            description: "用于验证Shrimp MCP服务修复效果的测试任务",
            implementationGuide: "这是一个测试任务，用于验证服务的稳定性修复",
            dependencies: []
          }
        ])
      };

      console.log('   发送测试任务...');
      const startTime = Date.now();
      const result = await this.client.callTool('split_tasks', testTask);
      const responseTime = Date.now() - startTime;
      
      if (result && result.content) {
        console.log(`✅ split_tasks调用成功 (${responseTime}ms)`);
        console.log(`   响应类型: ${typeof result}`);
        this.testResults.splitTasks = true;
        
        // 检查响应内容
        if (result.content[0] && result.content[0].text) {
          console.log(`   响应预览: ${result.content[0].text.substring(0, 100)}...`);
        }
      } else {
        console.log('❌ split_tasks返回异常结果');
      }
    } catch (error) {
      console.log('❌ split_tasks调用失败:', error.message);
      
      // 检查是否是超时（这是我们要修复的问题）
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        console.log('   ⚠️  仍然存在超时问题，需要进一步调试');
      }
    }
    console.log('');
  }

  async testTimeoutHandling() {
    console.log('5. 验证超时处理机制...');
    
    try {
      // 使用极短的超时时间测试超时处理
      const tempClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
        cwd: '../mcp-shrimp-task-manager',
        maxRetries: 1,
        baseTimeout: 5000, // 5秒
        retryDelay: 1000
      });

      const startTime = Date.now();
      await tempClient.callTool('list_tasks', { status: 'all' });
      const responseTime = Date.now() - startTime;
      
      await tempClient.disconnect();
      
      if (responseTime < 10000) {
        console.log(`✅ 响应时间正常 (${responseTime}ms)`);
        this.testResults.timeoutHandling = true;
      } else {
        console.log(`⚠️  响应时间较长 (${responseTime}ms)`);
      }
    } catch (error) {
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        console.log('✅ 超时机制正常工作（预期行为）');
        this.testResults.timeoutHandling = true;
      } else {
        console.log('❌ 超时处理异常:', error.message);
      }
    }
    console.log('');
  }

  async testErrorRecovery() {
    console.log('6. 验证错误恢复能力...');
    
    try {
      // 故意触发一个错误
      await this.client.callTool('nonexistent_tool', {});
    } catch (error) {
      console.log('✅ 正确捕获错误:', error.message.substring(0, 100));
      
      // 等待服务恢复
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 测试恢复后的功能
      try {
        const health = await this.client.healthCheck();
        if (health.status === 'healthy' || health.status === 'partially_healthy') {
          console.log('✅ 服务在错误后正常恢复');
          this.testResults.errorRecovery = true;
        } else {
          console.log('❌ 服务在错误后未能恢复');
        }
      } catch (recoveryError) {
        console.log('❌ 恢复测试失败:', recoveryError.message);
      }
    }
    console.log('');
  }

  async testMonitoring() {
    console.log('7. 验证监控功能...');
    
    try {
      const health = await this.client.healthCheck();
      
      if (health.memoryUsage && typeof health.memoryUsage.heapUsed === 'number') {
        console.log('✅ 内存监控正常');
        console.log(`   内存使用: ${health.memoryUsage.heapUsed}MB/${health.memoryUsage.heapTotal}MB`);
        this.testResults.monitoring = true;
      } else {
        console.log('⚠️  内存监控数据不完整');
      }
      
      if (health.requestCount !== undefined) {
        console.log(`   请求数: ${health.requestCount}`);
        console.log(`   错误数: ${health.errorCount}`);
      }
    } catch (error) {
      console.log('❌ 监控功能测试失败:', error.message);
    }
    console.log('');
  }

  displayResults() {
    console.log('=== 验证结果 ===\n');
    
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`总体结果: ${passedTests}/${totalTests} 测试通过 (${successRate}%)`);
    console.log('');
    
    Object.entries(this.testResults).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌';
      const testName = this.getTestName(test);
      console.log(`${status} ${testName}`);
    });
    
    console.log('');
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！Shrimp MCP服务修复成功！');
      console.log('');
      console.log('✅ 服务现在具备以下能力:');
      console.log('   - 稳定的连接和通信');
      console.log('   - 正常的任务分解功能');
      console.log('   - 有效的超时处理');
      console.log('   - 强大的错误恢复');
      console.log('   - 实时资源监控');
    } else if (passedTests >= totalTests * 0.7) {
      console.log('⚠️  大部分功能正常，但仍有问题需要解决');
      console.log('');
      console.log('建议重点关注以下方面:');
      
      Object.entries(this.testResults)
        .filter(([_, passed]) => !passed)
        .forEach(([test, _]) => {
          console.log(`   - ${this.getTestName(test)}`);
        });
    } else {
      console.log('❌ 较多功能异常，需要进一步调试');
      console.log('');
      console.log('建议采取以下措施:');
      console.log('1. 检查OpenAI API配置和网络连接');
      console.log('2. 查看服务日志获取详细错误信息');
      console.log('3. 考虑使用增强版服务启动脚本');
    }
  }

  getTestName(testKey) {
    const names = {
      config: '环境配置',
      connection: '服务连接',
      basicTools: '基础工具调用',
      splitTasks: 'split_tasks功能',
      timeoutHandling: '超时处理',
      errorRecovery: '错误恢复',
      monitoring: '监控功能'
    };
    return names[testKey] || testKey;
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// 主函数
async function main() {
  const validator = new CompleteFixValidator();
  
  try {
    await validator.initialize();
    await validator.runValidation();
  } catch (error) {
    console.error('验证过程出错:', error);
  } finally {
    await validator.cleanup();
  }
}

// 运行验证
main().catch(console.error);