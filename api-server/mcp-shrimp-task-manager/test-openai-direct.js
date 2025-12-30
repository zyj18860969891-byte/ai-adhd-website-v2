#!/usr/bin/env node

/**
 * 直接测试OpenAI API调用能力
 * 验证Shrimp MCP服务的AI功能是否正常
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// 加载环境变量
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  config({ path: envPath });
  console.log('✅ 已加载.env文件');
} else {
  console.log('⚠️  .env文件不存在');
}

console.log('🔍 OpenAI API 直接测试\n');

// 检查环境变量
console.log('环境变量状态:');
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-8) : '未设置'}`);
console.log(`OPENAI_MODEL: ${process.env.OPENAI_MODEL || '未设置'}`);
console.log(`OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || '未设置'}`);
console.log('');

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
  console.error('❌ OpenAI API密钥未正确配置');
  process.exit(1);
}

try {
  console.log('📡 测试OpenAI API连接...');
  
  // 动态导入openai库
  const openaiModule = await import('openai');
  const OpenAI = openaiModule.default;
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  // 测试简单的API调用
  console.log('🧪 发送测试请求...');
  const startTime = Date.now();
  
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的任务分解助手。请用中文回复。'
      },
      {
        role: 'user',
        content: '请将以下任务分解为3-5个子任务：开发一个简单的待办事项应用。每个子任务用一句话描述。'
      }
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  console.log(`✅ OpenAI API调用成功!`);
  console.log(`响应时间: ${responseTime}ms`);
  console.log(`模型: ${response.model}`);
  console.log(`Token使用: ${response.usage?.total_tokens || '未知'}`);
  console.log('');
  console.log('AI回复:');
  console.log(response.choices[0]?.message?.content || '无回复内容');
  console.log('');
  console.log('🎉 OpenAI API配置正确，可以正常工作！');

} catch (error) {
  console.error('❌ OpenAI API调用失败:');
  console.error('错误类型:', error.constructor.name);
  console.error('错误消息:', error.message);
  
  if (error.response) {
    console.error('HTTP状态:', error.response.status);
    console.error('错误代码:', error.code);
  }
  
  if (error.message.includes('401')) {
    console.log('\n🔧 建议: 检查API密钥是否正确');
  } else if (error.message.includes('429')) {
    console.log('\n🔧 建议: 检查API配额或速率限制');
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    console.log('\n🔧 建议: 检查网络连接和OPENAI_BASE_URL配置');
  } else if (error.message.includes('model')) {
    console.log('\n🔧 建议: 检查OPENAI_MODEL名称是否正确');
  }
  
  process.exit(1);
}