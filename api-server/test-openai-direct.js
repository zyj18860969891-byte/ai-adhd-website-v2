#!/usr/bin/env node

/**
 * 直接测试Shrimp MCP服务的OpenAI API调用能力
 * 隔离问题，确定是否是OpenAI集成的问题
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

class OpenAIDirectTester {
  constructor() {
    this.shrimpDir = join(process.cwd(), '../mcp-shrimp-task-manager');
    this.envFile = join(this.shrimpDir, '.env');
    this.openai = null;
  }

  loadEnvironment() {
    console.log('🔧 加载环境变量...\n');
    
    try {
      const envContent = readFileSync(this.envFile, 'utf8');
      const lines = envContent.split('\n');
      
      const envVars = {};
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const equalsIndex = trimmedLine.indexOf('=');
          if (equalsIndex !== -1) {
            const key = trimmedLine.substring(0, equalsIndex).trim();
            const value = trimmedLine.substring(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            envVars[key] = value;
          }
        }
      }
      
      // 设置环境变量
      process.env.OPENAI_API_KEY = envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      process.env.OPENAI_MODEL = envVars.OPENAI_MODEL || process.env.OPENAI_MODEL;
      process.env.OPENAI_BASE_URL = envVars.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL;
      
      console.log('环境变量:');
      console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : '未设置'}`);
      console.log(`  OPENAI_MODEL: ${process.env.OPENAI_MODEL || '未设置'}`);
      console.log(`  OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || '未设置'}`);
      console.log('');
      
      return true;
    } catch (error) {
      console.error('❌ 加载环境变量失败:', error.message);
      return false;
    }
  }

  async initializeOpenAI() {
    console.log('🚀 初始化OpenAI客户端...\n');
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY未设置');
      }
      
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      });
      
      console.log('✅ OpenAI客户端初始化成功');
      return true;
    } catch (error) {
      console.error('❌ OpenAI客户端初始化失败:', error.message);
      return false;
    }
  }

  async testOpenAIConnection() {
    console.log('\n🔍 测试OpenAI API连接...\n');
    
    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的任务分析师。请用一句话回复，确认API连接正常。'
          },
          {
            role: 'user',
            content: '测试连接'
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log('✅ OpenAI API连接测试成功');
      console.log(`   响应时间: ${responseTime}ms`);
      console.log(`   模型: ${response.model}`);
      console.log(`   回复: ${response.choices[0]?.message?.content || '无回复'}`);
      
      return true;
    } catch (error) {
      console.error('❌ OpenAI API连接测试失败:', error.message);
      console.error('   错误类型:', error.constructor.name);
      
      if (error.statusCode) {
        console.error('   状态码:', error.statusCode);
      }
      
      if (error.error) {
        console.error('   错误详情:', error.error.message || error.error);
      }
      
      return false;
    }
  }

  async testTaskAnalysis() {
    console.log('\n📝 测试任务分析功能（模拟split_tasks场景）...\n');
    
    try {
      const testTask = {
        name: "创建用户注册系统",
        description: "实现用户注册、登录、个人信息管理功能",
        implementationGuide: "使用React + Node.js + MongoDB实现"
      };
      
      const prompt = `你是一个专业的ADHD任务分析师。请分析以下任务并将其分解为更小的子任务：

任务名称: ${testTask.name}
任务描述: ${testTask.description}
实现指南: ${testTask.implementationGuide}

请提供：
1. 任务分解（3-5个子任务）
2. 每个子任务的预估时间
3. 任务依赖关系
4. 实施优先级

请用JSON格式返回结果。`;
      
      console.log('发送任务分析请求...');
      const startTime = Date.now();
      
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的ADHD任务分析师，擅长将复杂任务分解为可管理的小任务。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log('✅ 任务分析测试成功');
      console.log(`   响应时间: ${responseTime}ms`);
      console.log(`   使用token: ${response.usage?.total_tokens || '未知'}`);
      
      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log('   分析结果预览:');
        console.log('   ' + content.substring(0, 200).replace(/\n/g, '\n   ') + '...');
        
        // 尝试解析JSON结果
        try {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            const jsonResult = JSON.parse(jsonMatch[1]);
            console.log('   JSON解析成功，包含字段:', Object.keys(jsonResult).join(', '));
          }
        } catch (parseError) {
          console.log('   JSON解析失败，但文本分析成功');
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ 任务分析测试失败:', error.message);
      console.error('   错误类型:', error.constructor.name);
      
      if (error.statusCode) {
        console.error('   状态码:', error.statusCode);
      }
      
      return false;
    }
  }

  async testPerformance() {
    console.log('\n⚡ 测试性能（多个小请求）...\n');
    
    const testCount = 3;
    const results = [];
    
    for (let i = 0; i < testCount; i++) {
      try {
        console.log(`   测试 ${i + 1}/${testCount}...`);
        const startTime = Date.now();
        
        const response = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'user', content: `简单测试 ${i + 1}: 请回复"OK"` }
          ],
          max_tokens: 10,
          temperature: 0.1
        });
        
        const responseTime = Date.now() - startTime;
        results.push({ success: true, time: responseTime });
        
        console.log(`     ✅ 成功 (${responseTime}ms)`);
        
      } catch (error) {
        results.push({ success: false, error: error.message });
        console.log(`     ❌ 失败: ${error.message.substring(0, 50)}`);
      }
      
      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const successCount = results.filter(r => r.success).length;
    const avgTime = results.filter(r => r.success).reduce((sum, r) => sum + r.time, 0) / successCount || 0;
    
    console.log(`\n性能测试结果: ${successCount}/${testCount} 成功`);
    console.log(`平均响应时间: ${avgTime.toFixed(0)}ms`);
    
    return successCount === testCount;
  }

  async runAllTests() {
    console.log('🧪 OpenAI API 直接测试\n');
    console.log('=====================\n');
    
    // 1. 加载环境
    if (!this.loadEnvironment()) {
      console.log('❌ 环境加载失败，测试终止');
      return;
    }
    
    // 2. 初始化OpenAI
    if (!await this.initializeOpenAI()) {
      console.log('❌ OpenAI初始化失败，测试终止');
      return;
    }
    
    // 3. 测试连接
    const connectionTest = await this.testOpenAIConnection();
    
    // 4. 测试任务分析
    let analysisTest = false;
    if (connectionTest) {
      analysisTest = await this.testTaskAnalysis();
    }
    
    // 5. 性能测试
    let performanceTest = false;
    if (analysisTest) {
      performanceTest = await this.testPerformance();
    }
    
    // 显示总结
    this.displaySummary({
      connection: connectionTest,
      analysis: analysisTest,
      performance: performanceTest
    });
  }

  displaySummary(results) {
    console.log('\n=== 测试总结 ===\n');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`总体结果: ${passedTests}/${totalTests} 测试通过 (${successRate}%)\n`);
    
    console.log('详细结果:');
    console.log(`  ${results.connection ? '✅' : '❌'} OpenAI连接测试`);
    console.log(`  ${results.analysis ? '✅' : '❌'} 任务分析测试`);
    console.log(`  ${results.performance ? '✅' : '❌'} 性能测试`);
    
    console.log('\n结论:');
    if (passedTests === totalTests) {
      console.log('🎉 OpenAI API完全正常！问题可能出在Shrimp MCP服务内部实现');
      console.log('建议检查:');
      console.log('  1. Shrimp MCP服务的AIInferenceEngine实现');
      console.log('  2. 工具调用的参数传递');
      console.log('  3. JSON-RPC协议实现');
    } else if (passedTests >= 2) {
      console.log('⚠️  OpenAI API基本正常，但可能存在性能或配置问题');
      console.log('建议检查:');
      console.log('  1. API配额和限制');
      console.log('  2. 网络连接质量');
      console.log('  3. 模型可用性');
    } else {
      console.log('❌ OpenAI API存在问题，需要先解决API层面的问题');
      console.log('建议检查:');
      console.log('  1. API密钥有效性');
      console.log('  2. API服务可用性');
      console.log('  3. 网络连接');
    }
  }
}

// 主函数
async function main() {
  const tester = new OpenAIDirectTester();
  await tester.runAllTests();
}

// 运行测试
main().catch(console.error);