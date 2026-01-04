/**
 * A2UI Integration Script
 * 将 4层架构集成到现有的 index.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');
const backupPath = path.join(__dirname, 'index.js.backup.before-a2ui');

console.log('🚀 A2UI Integration Script');
console.log('=========================\n');

// 1. 备份当前文件
console.log('1. 备份 index.js...');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(indexPath, backupPath);
  console.log('   ✅ 备份完成: index.js.backup.before-a2ui');
} else {
  console.log('   ⚠️  备份已存在，跳过');
}

// 2. 读取当前内容
let content = fs.readFileSync(indexPath, 'utf8');

// 3. 检查是否已集成
if (content.includes('createA2UIRoutes')) {
  console.log('\n❌ 错误: A2UI 路由已集成');
  console.log('   如果需要重新集成，请恢复备份文件');
  process.exit(1);
}

// 4. 添加导入语句
console.log('\n2. 添加导入语句...');
const importLine = "import { createA2UIRoutes } from './routes/a2ui-routes.js';";
const stdioImportRegex = /import StdioMCPClient from.*\r?\n/;
content = content.replace(stdioImportRegex, `$&\n${importLine}\n`);
console.log('   ✅ 添加: createA2UIRoutes 导入');

// 5. 添加初始化函数
console.log('\n3. 添加 Agent 系统初始化函数...');
const initFunction = `

// ============================================================================
// A2UI Agent System Initialization
// ============================================================================
let agentManager = null;

async function initializeAgentSystem() {
  try {
    console.log('[Agent System] Initializing...');

    // Import DatabaseManager
    const { DatabaseManager } = await import('./churnflow-mcp/src/storage/DatabaseManager.js');
    
    const dbManager = new DatabaseManager();
    await dbManager.initialize();
    console.log('[Agent System] ✅ Database initialized');

    // Import AgentFactory
    const { AgentFactory } = await import('./agent/agent-core.js');

    // Create main agent
    const mainAgent = AgentFactory.create('MainAgent', dbManager, {
      version: '2.0.0',
      capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui', 'collaboration'],
      permissionLevel: 'write',
    });

    // Register MCP clients
    if (churnFlowClient) {
      mainAgent.registerMCPClient('churnflow', churnFlowClient);
    }
    if (shrimpClient) {
      mainAgent.registerMCPClient('shrimp', shrimpClient);
    }

    await mainAgent.initializeSystem();
    agentManager = mainAgent;

    console.log('[Agent System] ✅ Fully initialized');
    return mainAgent;
  } catch (error) {
    console.error('[Agent System] ❌ Initialization failed:', error.message);
    return null;
  }
}
`;

// 插入到 app.listen 之前
const listenRegex = /app\.listen\(PORT, \(\) => \{/;
content = content.replace(listenRegex, `${initFunction}\n\n$&`);
console.log('   ✅ 添加: initializeAgentSystem() 函数');

// 6. 修改 app.listen 回调
console.log('\n4. 修改服务器启动逻辑...');
const oldCallback = `app.listen(PORT, () => {
    console.log(\`API服务器运行在端口 \${PORT}\`);
  });`;

const newCallback = `app.listen(PORT, async () => {
    console.log(\`API服务器运行在端口 \${PORT}\`);
    
    // Initialize A2UI Agent System
    const agent = await initializeAgentSystem();
    
    // Register A2UI routes
    if (agent) {
      app.use('/api', createA2UIRoutes(dbManager, new Map([
        ['churnflow', churnFlowClient],
        ['shrimp', shrimpClient]
      ])));
      console.log('✅ A2UI routes registered at /api/agent/* and /api/a2ui/*');
    } else {
      console.log('⚠️  A2UI routes not registered (agent initialization failed)');
    }
  });`;

content = content.replace(oldCallback, newCallback);
console.log('   ✅ 更新: app.listen 回调');

// 7. 保存修改
fs.writeFileSync(indexPath, content, 'utf8');

console.log('\n✅ 集成完成！');
console.log('\n新增端点:');
console.log('  - POST /api/agent/process');
console.log('  - POST /api/a2ui/start');
console.log('  - POST /api/a2ui/input');
console.log('  - POST /api/agent/capture');
console.log('  - POST /api/agent/task');
console.log('  - POST /api/agent/review');
console.log('  - GET  /api/agent/status');
console.log('  - GET  /api/agent/skills');
console.log('  - GET  /api/agent/tools');
console.log('  - POST /api/agent/collaborate');
console.log('\n重启服务器以生效: npm start');
