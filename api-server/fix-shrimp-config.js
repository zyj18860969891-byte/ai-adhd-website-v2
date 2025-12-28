#!/usr/bin/env node

/**
 * Shrimp MCP服务配置修复脚本
 * 快速修复OpenAI配置和环境变量问题
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class ShrimpConfigFixer {
  constructor() {
    this.shrimpDir = join(process.cwd(), '../mcp-shrimp-task-manager');
    this.envFile = join(this.shrimpDir, '.env');
    this.fixesApplied = [];
  }

  async runFixes() {
    console.log('🔧 Shrimp MCP服务配置修复\n');
    
    await this.checkCurrentConfig();
    await this.fixEnvironmentVariables();
    await this.createSetupScript();
    await this.provideInstructions();
  }

  async checkCurrentConfig() {
    console.log('1. 检查当前配置...');
    
    const requiredVars = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_BASE_URL'];
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length === 0) {
      console.log('✅ 所有必需的环境变量都已设置');
      console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : '未设置'}`);
      console.log(`   OPENAI_MODEL: ${process.env.OPENAI_MODEL || '未设置'}`);
      console.log(`   OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || '未设置'}`);
    } else {
      console.log('❌ 缺少以下环境变量:', missingVars.join(', '));
    }
    
    console.log('');
  }

  async fixEnvironmentVariables() {
    console.log('2. 修复环境变量配置...');
    
    // 检查.env文件是否存在
    if (!existsSync(this.envFile)) {
      console.log('   ❌ .env文件不存在');
      console.log('   📝 创建.env文件...');
      
      const envTemplate = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Service Configuration
DATA_DIR=./data/shrimp
ENABLE_GUI=false

# Optional: Custom OpenAI endpoint
# OPENAI_BASE_URL=https://your-custom-endpoint.com/v1
`;
      
      writeFileSync(this.envFile, envTemplate, 'utf8');
      this.fixesApplied.push('创建.env文件');
      console.log('   ✅ .env文件已创建');
    } else {
      console.log('   ✅ .env文件已存在');
      
      // 读取现有配置
      const envContent = readFileSync(this.envFile, 'utf8');
      const lines = envContent.split('\n');
      
      // 检查必需的变量
      const requiredVars = {
        'OPENAI_API_KEY': 'your_openai_api_key_here',
        'OPENAI_MODEL': 'gpt-4o-mini',
        'OPENAI_BASE_URL': 'https://api.openai.com/v1'
      };
      
      let updatedContent = envContent;
      let varsAdded = 0;
      
      for (const [varName, defaultValue] of Object.entries(requiredVars)) {
        if (!envContent.includes(`${varName}=`)) {
          console.log(`   📝 添加缺失的变量: ${varName}`);
          updatedContent += `\n${varName}=${defaultValue}`;
          varsAdded++;
        }
      }
      
      if (varsAdded > 0) {
        writeFileSync(this.envFile, updatedContent, 'utf8');
        this.fixesApplied.push(`添加${varsAdded}个环境变量`);
        console.log(`   ✅ 已添加${varsAdded}个环境变量`);
      } else {
        console.log('   ✅ 所有必需变量都已配置');
      }
    }
    
    console.log('');
  }

  async createSetupScript() {
    console.log('3. 创建配置验证脚本...');
    
    const setupScript = `#!/usr/bin/env node

/**
 * Shrimp MCP服务配置验证脚本
 */

console.log('🔍 验证Shrimp MCP服务配置...\\n');

// 检查环境变量
const requiredVars = ['OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_BASE_URL'];
let allSet = true;

console.log('环境变量检查:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value && value !== 'your_openai_api_key_here') {
    console.log(\`  ✅ \${varName}: \${varName.includes('KEY') ? '***' + value.slice(-4) : value}\`);
  } else {
    console.log(\`  ❌ \${varName}: 未设置或使用默认值\`);
    allSet = false;
  }
}

if (!allSet) {
  console.log('\\n❌ 配置不完整，请按照以下步骤操作:');
  console.log('1. 编辑 .env 文件');
  console.log('2. 设置有效的 OPENAI_API_KEY');
  console.log('3. 根据需要调整 OPENAI_MODEL 和 OPENAI_BASE_URL');
  console.log('4. 重新运行此脚本验证配置');
  process.exit(1);
}

console.log('\\n✅ 所有配置正确，服务可以启动');
console.log('\\n启动命令:');
console.log('  npm start          # 启动原版服务');
console.log('  npm run enhanced   # 启动增强版服务（推荐）');
`;

    const scriptPath = join(this.shrimpDir, 'check-config.js');
    writeFileSync(scriptPath, setupScript, 'utf8');
    
    this.fixesApplied.push('创建配置验证脚本');
    console.log('   ✅ 配置验证脚本已创建: check-config.js');
    console.log('');
  }

  async provideInstructions() {
    console.log('=== 修复完成 ===\n');
    
    if (this.fixesApplied.length === 0) {
      console.log('✅ 配置已经正确，无需修复');
      return;
    }
    
    console.log('已应用的修复措施:');
    this.fixesApplied.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix}`);
    });
    
    console.log('\n📋 下一步操作:');
    console.log('1. 编辑 .env 文件，设置你的 OpenAI API 密钥:');
    console.log('   OPENAI_API_KEY=sk-your_actual_api_key_here');
    console.log('');
    console.log('2. 验证配置:');
    console.log('   cd ../mcp-shrimp-task-manager');
    console.log('   node check-config.js');
    console.log('');
    console.log('3. 启动增强版服务:');
    console.log('   npm run enhanced');
    console.log('');
    console.log('4. 测试服务稳定性:');
    console.log('   cd ../api-server');
    console.log('   node stability-test.js');
    
    console.log('\n💡 提示:');
    console.log('- 增强版服务包含超时处理、重试机制和错误恢复功能');
    console.log('- 如果遇到问题，查看 logs/ 目录中的日志文件');
    console.log('- 可以使用 shrimp-monitor.js 实时监控服务状态');
  }
}

// 主函数
async function main() {
  const fixer = new ShrimpConfigFixer();
  await fixer.runFixes();
}

// 运行修复
main().catch(console.error);