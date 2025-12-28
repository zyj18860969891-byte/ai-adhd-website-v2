#!/usr/bin/env node

/**
 * Shrimp MCP服务超时问题诊断脚本
 * 专门诊断和解决split_tasks工具的超时问题
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class ShrimpTimeoutDiagnoser {
  constructor() {
    this.client = null;
    this.diagnosisResults = {
      connection: null,
      environment: null,
      openaiConfig: null,
      timeoutPattern: null,
      recommendations: []
    };
  }

  async initialize() {
    console.log('🔍 Shrimp MCP服务超时问题诊断\n');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 2,
      baseTimeout: 60000, // 1分钟测试超时
      retryDelay: 1000
    });
  }

  async runDiagnosis() {
    console.log('=== 开始诊断流程 ===\n');

    await this.diagnoseConnection();
    await this.diagnoseEnvironment();
    await this.diagnoseOpenAIConfig();
    await this.diagnoseTimeoutPattern();
    
    this.displayDiagnosisResults();
    this.provideRecommendations();
  }

  async diagnoseConnection() {
    console.log('1. 诊断服务连接...');
    
    try {
      const health = await this.client.healthCheck();
      this.diagnosisResults.connection = {
        status: 'success',
        message: '服务连接正常',
        details: health
      };
      console.log('✅ 服务连接正常');
    } catch (error) {
      this.diagnosisResults.connection = {
        status: 'failed',
        message: '服务连接失败',
        details: error.message
      };
      console.log('❌ 服务连接失败:', error.message);
    }
    console.log('');
  }

  async diagnoseEnvironment() {
    console.log('2. 诊断环境配置...');
    
    try {
      // 测试简单工具调用
      const result = await this.client.callTool('list_tasks', { status: 'all' });
      
      this.diagnosisResults.environment = {
        status: 'success',
        message: '基础工具调用正常',
        details: 'list_tasks工具响应正常'
      };
      console.log('✅ 基础环境配置正常');
      
      // 检查返回结果
      if (result && result.content) {
        console.log('  工具响应格式正确');
      }
      
    } catch (error) {
      this.diagnosisResults.environment = {
        status: 'failed',
        message: '基础工具调用失败',
        details: error.message
      };
      console.log('❌ 基础环境配置问题:', error.message);
    }
    console.log('');
  }

  async diagnoseOpenAIConfig() {
    console.log('3. 诊断OpenAI配置...');
    
    // 检查环境变量
    const envVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '已设置' : '未设置',
      OPENAI_MODEL: process.env.OPENAI_MODEL || '未设置',
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '未设置'
    };
    
    console.log('环境变量状态:');
    console.log(`  OPENAI_API_KEY: ${envVars.OPENAI_API_KEY}`);
    console.log(`  OPENAI_MODEL: ${envVars.OPENAI_MODEL}`);
    console.log(`  OPENAI_BASE_URL: ${envVars.OPENAI_BASE_URL}`);
    
    this.diagnosisResults.openaiConfig = {
      status: envVars.OPENAI_API_KEY === '已设置' ? 'configured' : 'missing',
      message: 'OpenAI配置检查完成',
      details: envVars
    };
    
    if (envVars.OPENAI_API_KEY === '未设置') {
      console.log('❌ OpenAI API密钥未设置');
      this.diagnosisResults.recommendations.push('设置OPENAI_API_KEY环境变量');
    } else {
      console.log('✅ OpenAI配置存在');
    }
    console.log('');
  }

  async diagnoseTimeoutPattern() {
    console.log('4. 诊断超时模式...');
    
    const testCases = [
      {
        name: '简单任务测试',
        task: {
          updateMode: "append",
          tasksRaw: JSON.stringify([{
            name: "简单测试任务",
            description: "这是一个简单的测试任务",
            implementationGuide: "测试用",
            dependencies: []
          }])
        }
      },
      {
        name: '中等复杂度任务',
        task: {
          updateMode: "append",
          tasksRaw: JSON.stringify([
            {
              name: "前端页面开发",
              description: "开发用户界面页面",
              implementationGuide: "使用React开发组件",
              dependencies: []
            },
            {
              name: "后端API开发",
              description: "开发后端API接口",
              implementationGuide: "使用Express开发REST API",
              dependencies: ["前端页面开发"]
            }
          ])
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n   测试: ${testCase.name}`);
      
      try {
        const startTime = Date.now();
        
        // 设置较短的超时时间以便快速诊断
        const tempClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
          cwd: '../mcp-shrimp-task-manager',
          maxRetries: 0,
          baseTimeout: 30000, // 30秒
          retryDelay: 1000
        });

        const result = await tempClient.callTool('split_tasks', testCase.task);
        const responseTime = Date.now() - startTime;
        
        await tempClient.disconnect();
        
        console.log(`   ✅ 成功 - 响应时间: ${responseTime}ms`);
        
        if (responseTime > 20000) {
          this.diagnosisResults.recommendations.push(`${testCase.name}响应时间较长(${responseTime}ms)，建议优化`);
        }
        
      } catch (error) {
        console.log(`   ❌ 失败: ${error.message.substring(0, 100)}`);
        
        if (error.message.includes('超时') || error.message.includes('timeout')) {
          this.diagnosisResults.timeoutPattern = {
            status: 'timeout',
            message: `${testCase.name}发生超时`,
            details: error.message
          };
          
          this.diagnosisResults.recommendations.push(`${testCase.name}超时，可能是OpenAI API问题`);
          this.diagnosisResults.recommendations.push('检查OpenAI API配额和网络连接');
          this.diagnosisResults.recommendations.push('考虑增加超时时间或实现重试机制');
        }
      }
    }
    
    console.log('');
  }

  displayDiagnosisResults() {
    console.log('=== 诊断结果 ===\n');
    
    console.log('1. 连接状态:');
    console.log(`   状态: ${this.diagnosisResults.connection?.status}`);
    console.log(`   消息: ${this.diagnosisResults.connection?.message}`);
    
    console.log('\n2. 环境配置:');
    console.log(`   状态: ${this.diagnosisResults.environment?.status}`);
    console.log(`   消息: ${this.diagnosisResults.environment?.message}`);
    
    console.log('\n3. OpenAI配置:');
    console.log(`   状态: ${this.diagnosisResults.openaiConfig?.status}`);
    if (this.diagnosisResults.openaiConfig?.details) {
      const details = this.diagnosisResults.openaiConfig.details;
      console.log(`   API密钥: ${details.OPENAI_API_KEY}`);
      console.log(`   模型: ${details.OPENAI_MODEL}`);
      console.log(`   基础URL: ${details.OPENAI_BASE_URL}`);
    }
    
    console.log('\n4. 超时模式:');
    if (this.diagnosisResults.timeoutPattern) {
      console.log(`   状态: ${this.diagnosisResults.timeoutPattern.status}`);
      console.log(`   消息: ${this.diagnosisResults.timeoutPattern.message}`);
    } else {
      console.log('   未检测到超时问题');
    }
  }

  provideRecommendations() {
    console.log('\n=== 修复建议 ===\n');
    
    if (this.diagnosisResults.recommendations.length === 0) {
      console.log('✅ 未发现明显问题，服务运行正常');
      return;
    }
    
    console.log('发现以下问题需要修复:\n');
    
    this.diagnosisResults.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n建议按以下优先级处理:');
    console.log('1. 检查并配置OpenAI API设置');
    console.log('2. 测试网络连接和API可用性');
    console.log('3. 增加超时时间和重试机制');
    console.log('4. 考虑使用增强版服务（已实现稳定性改进）');
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

// 主函数
async function main() {
  const diagnoser = new ShrimpTimeoutDiagnoser();
  
  try {
    await diagnoser.initialize();
    await diagnoser.runDiagnosis();
  } catch (error) {
    console.error('诊断过程出错:', error);
  } finally {
    await diagnoser.cleanup();
  }
}

// 运行诊断
main().catch(console.error);