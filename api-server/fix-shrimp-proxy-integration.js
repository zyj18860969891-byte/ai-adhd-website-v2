#!/usr/bin/env node

/**
 * 修复Shrimp MCP服务代理集成问题
 * 确保Shrimp MCP服务正确使用Clash代理
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

class ShrimpProxyFixer {
  constructor() {
    this.shrimpDir = join(process.cwd(), '../mcp-shrimp-task-manager');
    this.envFile = join(this.shrimpDir, '.env');
  }

  async runFix() {
    console.log('🔧 修复Shrimp MCP服务代理集成\n');
    
    await this.checkCurrentProxyConfig();
    await this.fixShrimpProxyIntegration();
    await this.restartShrimpService();
    await this.testFixedConnection();
  }

  async checkCurrentProxyConfig() {
    console.log('1. 检查当前代理配置...');
    
    if (existsSync(this.envFile)) {
      const envContent = readFileSync(this.envFile, 'utf8');
      
      const hasHttpProxy = envContent.includes('HTTP_PROXY=http://127.0.0.1:8081');
      const hasHttpsProxy = envContent.includes('HTTPS_PROXY=http://127.0.0.1:8081');
      const hasNoProxy = envContent.includes('NO_PROXY=localhost,127.0.0.1');
      const hasTlsReject = envContent.includes('NODE_TLS_REJECT_UNAUTHORIZED=0');
      
      console.log(`  HTTP_PROXY: ${hasHttpProxy ? '✅' : '❌'}`);
      console.log(`  HTTPS_PROXY: ${hasHttpsProxy ? '✅' : '❌'}`);
      console.log(`  NO_PROXY: ${hasNoProxy ? '✅' : '❌'}`);
      console.log(`  TLS设置: ${hasTlsReject ? '✅' : '❌'}`);
      
      if (hasHttpProxy && hasHttpsProxy) {
        console.log('✅ 代理环境变量已正确配置');
      } else {
        console.log('❌ 代理环境变量配置不完整');
      }
    } else {
      console.log('❌ .env文件不存在');
    }
    console.log('');
  }

  async fixShrimpProxyIntegration() {
    console.log('2. 修复Shrimp MCP服务代理集成...');
    
    // 检查Shrimp MCP服务是否正确加载环境变量
    console.log('   检查Shrimp MCP服务的环境变量加载...');
    
    // 创建一个测试脚本来验证环境变量
    const testScript = `
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Shrimp MCP服务环境变量检查');
console.log('================================');

// 检查进程环境变量
console.log('进程环境变量:');
console.log('  HTTP_PROXY:', process.env.HTTP_PROXY || '未设置');
console.log('  HTTPS_PROXY:', process.env.HTTPS_PROXY || '未设置');
console.log('  NO_PROXY:', process.env.NO_PROXY || '未设置');
console.log('  NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED || '未设置');

// 检查.env文件
const envFile = join(process.cwd(), '.env');
if (require('fs').existsSync(envFile)) {
  const envContent = require('fs').readFileSync(envFile, 'utf8');
  console.log('\\n.env文件内容:');
  console.log(envContent);
} else {
  console.log('\\n❌ .env文件不存在');
}

// 测试代理连接
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

async function testProxyConnection() {
  try {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (!proxyUrl) {
      console.log('\\n❌ 未设置代理环境变量');
      return;
    }
    
    console.log('\\n📡 测试代理连接...');
    const agent = new HttpsProxyAgent(proxyUrl);
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      method: 'GET',
      path: '/v1/models',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      agent: agent,
      timeout: 5000
    };
    
    const result = await new Promise((resolve) => {
      const req = https.request(options, (res) => {
        resolve({ status: 'success', statusCode: res.statusCode });
      });
      
      req.on('error', (error) => {
        resolve({ status: 'error', error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'timeout', error: 'Request timeout' });
      });
      
      req.end();
    });
    
    if (result.status === 'success') {
      console.log('✅ 代理连接测试成功');
    } else {
      console.log(\`❌ 代理连接测试失败: \${result.error}\`);
    }
    
  } catch (error) {
    console.log(\`❌ 代理测试异常: \${error.message}\`);
  }
}

testProxyConnection();
`;

    const testScriptFile = join(this.shrimpDir, 'test-proxy.js');
    writeFileSync(testScriptFile, testScript);
    
    console.log('   创建代理测试脚本...');
    console.log('   运行测试脚本...');
    
    try {
      const { stdout, stderr } = await execAsync(`cd ${this.shrimpDir} && node test-proxy.js`);
      console.log('   测试结果:');
      console.log(stdout);
      if (stderr) console.log('   错误:', stderr);
      
      // 清理测试文件
      await execAsync(`del ${testScriptFile}`);
      
    } catch (error) {
      console.log('   测试脚本执行失败:', error.message);
    }
    
    console.log('');
  }

  async restartShrimpService() {
    console.log('3. 重启Shrimp MCP服务...');
    
    try {
      // 停止可能运行的服务
      console.log('   停止现有服务...');
      await execAsync(`cd ${this.shrimpDir} && taskkill /F /IM node.exe /T`, { timeout: 5000 });
      console.log('   ✅ 现有服务已停止');
    } catch (error) {
      console.log('   ⚠️  停止服务时出错（可能没有运行的服务）');
    }
    
    // 启动带代理的服务
    console.log('   启动带代理的Shrimp MCP服务...');
    const startCommand = `cd ${this.shrimpDir} && npm run start-proxy`;
    
    try {
      const { stdout, stderr } = await execAsync(startCommand, { timeout: 10000 });
      console.log('   ✅ 服务启动成功');
      console.log('   输出:', stdout.substring(0, 200));
    } catch (error) {
      console.log('   ❌ 服务启动失败:', error.message);
    }
    
    console.log('');
  }

  async testFixedConnection() {
    console.log('4. 测试修复后的连接...');
    
    // 等待服务启动
    console.log('   等待服务启动...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 测试服务连接
    console.log('   测试Shrimp MCP服务连接...');
    
    try {
      const testScript = `
import StdioMCPClient from './src/stdio-mcp-client.js';

async function testConnection() {
  const client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    cwd: '../mcp-shrimp-task-manager',
    maxRetries: 2,
    baseTimeout: 60000,
    retryDelay: 1000
  });
  
  try {
    const health = await client.healthCheck();
    console.log('服务健康状态:', health);
    
    if (health.status === 'healthy' || health.status === 'partially_healthy') {
      console.log('✅ 服务连接正常');
      
      // 测试工具调用
      console.log('测试工具调用...');
      const result = await client.callTool('list_tasks', { status: 'all' });
      console.log('工具调用结果:', typeof result);
      
      if (result && result.content) {
        console.log('✅ 工具调用成功');
      } else {
        console.log('⚠️  工具调用返回异常结果');
      }
    } else {
      console.log('❌ 服务连接异常');
    }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message);
  } finally {
    await client.disconnect();
  }
}

testConnection().catch(console.error);
`;

      const testFile = join(process.cwd(), 'test-shrimp-connection.js');
      writeFileSync(testFile, testScript);
      
      const { stdout, stderr } = await execAsync(`node ${testFile}`);
      console.log('   测试结果:');
      console.log(stdout);
      if (stderr) console.log('   错误:', stderr);
      
      // 清理测试文件
      await execAsync(`del ${testFile}`);
      
    } catch (error) {
      console.log('   ❌ 连接测试失败:', error.message);
    }
    
    console.log('');
  }
}

// 主函数
async function main() {
  const fixer = new ShrimpProxyFixer();
  await fixer.runFix();
}

// 运行修复
main().catch(console.error);