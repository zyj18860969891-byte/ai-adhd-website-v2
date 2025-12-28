#!/usr/bin/env node
/**
 * 部署状态检查脚本
 * 检查所有部署组件的状态和配置
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 部署状态检查');
console.log('==========================================\n');

// 检查计数器
let checksPassed = 0;
let checksFailed = 0;
let totalChecks = 0;

function check(name, condition, details = '') {
  totalChecks++;
  if (condition) {
    checksPassed++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    checksFailed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

try {
  console.log('📋 阶段 1: 项目结构检查\n');

  // 检查项目结构
  check('项目根目录存在', fs.existsSync('.'));
  check('package.json 存在', fs.existsSync('package.json'));
  check('web-ui 目录存在', fs.existsSync('web-ui'));
  check('api-server 目录存在', fs.existsSync('api-server'));
  check('mcp-shrimp-task-manager 目录存在', fs.existsSync('mcp-shrimp-task-manager'));
  check('churnflow-mcp 目录存在', fs.existsSync('churnflow-mcp'));

  console.log('\n📋 阶段 2: 配置文件检查\n');

  // 检查配置文件
  check('vercel.json 存在', fs.existsSync('vercel.json'));
  check('railway.toml 存在', fs.existsSync('railway.toml'));
  check('api-server/railway.toml 存在', fs.existsSync('api-server/railway.toml'));
  check('mcp-shrimp-task-manager/railway.toml 存在', fs.existsSync('mcp-shrimp-task-manager/railway.toml'));

  console.log('\n📋 阶段 3: 构建文件检查\n');

  // 检查构建文件
  check('web-ui/.next 存在', fs.existsSync('web-ui/.next'), 'Next.js 构建输出');
  check('mcp-shrimp-task-manager/dist 存在', fs.existsSync('mcp-shrimp-task-manager/dist'), 'MCP 构建输出');
  check('mcp-shrimp-task-manager/dist/custom-mcp-server.js 存在',
    fs.existsSync('mcp-shrimp-task-manager/dist/custom-mcp-server.js'),
    '自定义 MCP 服务器');

  console.log('\n📋 阶段 4: Git 状态检查\n');

  try {
    // 检查 git 状态
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    check('Git 工作区干净', gitStatus.trim() === '', '有未提交的更改');
  } catch (error) {
    check('Git 状态检查', false, error.message);
  }

  try {
    // 检查远程仓库
    const gitRemote = execSync('git remote -v', { encoding: 'utf8' });
    check('Git 远程仓库配置正确',
      gitRemote.includes('github.com/zyj18860969891-byte/ai-adhd-website.git'),
      '远程仓库: zyj18860969891-byte/ai-adhd-website.git');
  } catch (error) {
    check('Git 远程仓库检查', false, error.message);
  }

  console.log('\n📋 阶段 5: 文档检查\n');

  // 检查文档
  check('DEPLOYMENT_EXECUTION_PLAN.md 存在', fs.existsSync('DEPLOYMENT_EXECUTION_PLAN.md'));
  check('PROJECT_DEPLOYMENT_ARCHITECTURE_ANALYSIS.md 存在', fs.existsSync('PROJECT_DEPLOYMENT_ARCHITECTURE_ANALYSIS.md'));
  check('MCP_DEPLOYMENT_TEST_REPORT.md 存在', fs.existsSync('MCP_DEPLOYMENT_TEST_REPORT.md'));

  console.log('\n📋 阶段 6: 环境变量检查\n');

  // 检查环境变量文件
  check('web-ui/.env.local 存在', fs.existsSync('web-ui/.env.local'));
  check('web-ui/.env.production 存在', fs.existsSync('web-ui/.env.production'));
  check('api-server/.env 存在', fs.existsSync('api-server/.env'));

  console.log('\n==========================================');
  console.log('📊 检查报告');
  console.log('==========================================');
  console.log(`总检查数: ${totalChecks}`);
  console.log(`通过: ${checksPassed} ✅`);
  console.log(`失败: ${checksFailed} ❌`);
  console.log(`成功率: ${((checksPassed / totalChecks) * 100).toFixed(1)}%`);
  console.log('==========================================\n');

  // 部署建议
  if (checksFailed === 0) {
    console.log('🎉 所有检查通过！项目已准备好部署。\n');
    console.log('🚀 下一步操作:');
    console.log('1. 运行: pwsh deploy.ps1');
    console.log('2. 在 Railway 控制台部署服务');
    console.log('3. 在 Vercel 控制台更新环境变量');
    console.log('4. 验证部署功能');
    process.exit(0);
  } else {
    console.log('⚠️ 部分检查失败，请修复问题后再部署。\n');
    console.log('🔧 建议操作:');
    console.log('1. 检查并修复失败的检查项');
    console.log('2. 确保所有配置文件正确');
    console.log('3. 确保构建文件存在');
    console.log('4. 提交所有更改到 Git');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ 检查过程出错:', error.message);
  process.exit(1);
}