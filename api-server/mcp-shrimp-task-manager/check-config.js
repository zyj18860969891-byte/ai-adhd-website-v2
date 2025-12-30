#!/usr/bin/env node

/**
 * Shrimp MCP服务配置验证脚本
 */

console.log('🔍 验证Shrimp MCP服务配置...\n');

// 检查环境变量
const requiredVars = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_BASE_URL'];
let allSet = true;

console.log('环境变量检查:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value && value !== 'your_openai_api_key_here') {
    console.log(`  ✅ ${varName}: ${varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`  ❌ ${varName}: 未设置或使用默认值`);
    allSet = false;
  }
}

if (!allSet) {
  console.log('\n❌ 配置不完整，请按照以下步骤操作:');
  console.log('1. 编辑 .env 文件');
  console.log('2. 设置有效的 OPENAI_API_KEY');
  console.log('3. 根据需要调整 OPENAI_MODEL 和 OPENAI_BASE_URL');
  console.log('4. 重新运行此脚本验证配置');
  process.exit(1);
}

console.log('\n✅ 所有配置正确，服务可以启动');
console.log('\n启动命令:');
console.log('  npm start          # 启动原版服务');
console.log('  npm run enhanced   # 启动增强版服务（推荐）');
