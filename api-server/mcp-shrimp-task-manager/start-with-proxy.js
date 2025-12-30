#!/usr/bin/env node

/**
 * 带代理支持的Shrimp MCP服务启动脚本
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
function loadEnvironmentVariables() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envFile = join(__dirname, '.env');
  
  if (existsSync(envFile)) {
    console.log('📝 加载环境变量...');
    
    const envContent = readFileSync(envFile, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过注释和空行
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // 解析环境变量
      const equalsIndex = trimmedLine.indexOf('=');
      if (equalsIndex !== -1) {
        const key = trimmedLine.substring(0, equalsIndex).trim();
        const value = trimmedLine.substring(equalsIndex + 1).trim();
        
        // 移除引号
        const cleanValue = value.replace(/^['"]|['"]$/g, '');
        
        // 设置环境变量
        process.env[key] = cleanValue;
        console.log(`   ${key}=${key.includes('KEY') ? '***' + cleanValue.slice(-4) : cleanValue}`);
      }
    }
    
    console.log('✅ 环境变量加载完成\n');
  } else {
    console.log('⚠️  .env文件不存在，使用系统环境变量\n');
  }
}

// 验证环境配置
function validateEnvironment() {
  console.log('🔍 验证环境配置...');
  
  const requiredVars = ['OPENAI_API_KEY', 'OPENAI_MODEL'];
  let allValid = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'your_openai_api_key_here') {
      console.log(`❌ ${varName}: 未设置或使用默认值`);
      allValid = false;
    } else {
      console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
    }
  }
  
  // 检查代理设置
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    console.log('✅ 代理设置已配置');
    console.log(`   HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
    console.log(`   HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);
  } else {
    console.log('⚠️  代理设置未配置，可能无法访问OpenAI API');
  }
  
  if (!allValid) {
    console.log('\n❌ 环境配置不完整，请检查.env文件');
    process.exit(1);
  }
  
  console.log('✅ 环境配置验证通过\n');
}

// 启动服务
async function startService() {
  try {
    console.log('🚀 启动带代理支持的Shrimp MCP服务...\n');
    
    // 加载环境变量
    loadEnvironmentVariables();
    
    // 验证环境配置
    validateEnvironment();
    
    // 导入并启动服务
    const serviceModule = await import('./dist/enhanced-index.js');
    
    console.log('✅ 增强版Shrimp MCP服务已启动');
    console.log('🔧 代理支持已启用');
    console.log('📊 服务监控已激活');
    console.log('🛡️  全局异常处理已启用');
    console.log('⏰ 超时和重试机制已配置');
    console.log('💾 资源监控运行中');
    console.log('\n按 Ctrl+C 停止服务\n');
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n🛑 收到停止信号，正在优雅关闭服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在优雅关闭服务...');
  process.exit(0);
});

// 启动服务
startService().catch(console.error);
