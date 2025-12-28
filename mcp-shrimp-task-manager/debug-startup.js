#!/usr/bin/env node
import "dotenv/config";

console.log('=== Shrimp MCP 服务调试启动 ===');

// 检查环境变量
console.log('\n1. 检查环境变量...');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置' : '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置');
console.log('DATA_DIR:', process.env.DATA_DIR || '未设置');

// 检查依赖
console.log('\n2. 检查依赖...');
try {
  const fs = await import('fs');
  console.log('fs: 正常');
} catch (error) {
  console.log('fs 导入失败:', error.message);
}

try {
  const path = await import('path');
  console.log('path: 正常');
} catch (error) {
  console.log('path 导入失败:', error.message);
}

try {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  console.log('MCP Server: 正常');
} catch (error) {
  console.log('MCP Server 导入失败:', error.message);
}

try {
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  console.log('StdioServerTransport: 正常');
} catch (error) {
  console.log('StdioServerTransport 导入失败:', error.message);
}

// 检查数据目录
console.log('\n3. 检查数据目录...');
try {
  const fs = await import('fs');
  const path = await import('path');
  const dataDir = process.env.DATA_DIR || './data/shrimp';
  const fullDataDir = path.resolve(dataDir);
  console.log('数据目录路径:', fullDataDir);
  
  if (!fs.existsSync(fullDataDir)) {
    console.log('数据目录不存在，尝试创建...');
    fs.mkdirSync(fullDataDir, { recursive: true });
    console.log('数据目录创建成功');
  } else {
    console.log('数据目录已存在');
  }
} catch (error) {
  console.log('数据目录检查失败:', error.message);
}

// 尝试导入Shrimp MCP服务
console.log('\n4. 尝试导入Shrimp MCP服务...');
try {
  const { loadPromptFromTemplate } = await import('./dist/prompts/loader.js');
  console.log('loadPromptFromTemplate: 正常');
} catch (error) {
  console.log('loadPromptFromTemplate 导入失败:', error.message);
}

try {
  const { setGlobalServer } = await import('./dist/utils/paths.js');
  console.log('setGlobalServer: 正常');
} catch (error) {
  console.log('setGlobalServer 导入失败:', error.message);
}

try {
  const { planTask } = await import('./dist/tools/index.js');
  console.log('工具函数: 正常');
} catch (error) {
  console.log('工具函数导入失败:', error.message);
}

console.log('\n=== 调试信息收集完成 ===');
console.log('如果所有检查都正常，但服务仍然无法启动，请检查：');
console.log('1. OpenAI API Key 是否有效');
console.log('2. 网络连接是否正常');
console.log('3. Node.js 版本是否兼容');
console.log('4. 查看完整的错误日志');