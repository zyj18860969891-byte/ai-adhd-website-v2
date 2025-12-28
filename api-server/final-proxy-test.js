#!/usr/bin/env node

/**
 * 最终代理测试脚本
 * 直接测试Shrimp MCP服务在代理环境下的表现
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

class FinalProxyTester {
  constructor() {
    this.shrimpDir = join(process.cwd(), '../mcp-shrimp-task-manager');
    this.envFile = join(this.shrimpDir, '.env');
  }

  async runTest() {
    console.log('🚀 最终代理测试 - Shrimp MCP服务\n');
    
    await this.checkEnvironment();
    await this.startShrimpService();
    await this.testServiceConnection();
    await this.testOpenAIAPI();
  }

  async checkEnvironment() {
    console.log('1. 检查环境配置...');
    
    // 检查Clash代理
    console.log('   检查Clash代理状态...');
    try {
      const { stdout } = await execAsync('netstat -an | findstr :8081');
      if (stdout.includes('8081')) {
        console.log('   ✅ Clash代理端口8081正在监听');
      } else {
        console.log('   ⚠️  Clash代理端口8081未监听');
      }
    } catch (error) {
      console.log('   ⚠️  无法检查Clash状态');
    }
    
    // 检查环境变量配置
    if (existsSync(this.envFile)) {
      const envContent = readFileSync(this.envFile, 'utf8');
      const hasProxy = envContent.includes('HTTP_PROXY=http://127.0.0.1:8081');
      console.log(`   代理配置: ${hasProxy ? '✅' : '❌'}`);
    }
    
    console.log('');
  }

  async startShrimpService() {
    console.log('2. 启动Shrimp MCP服务...');
    
    // 确保服务目录存在
    if (!existsSync(this.shrimpDir)) {
      console.log('❌ Shrimp MCP服务目录不存在');
      return;
    }
    
    // 检查package.json是否有start-proxy脚本
    const packageJsonFile = join(this.shrimpDir, 'package.json');
    if (existsSync(packageJsonFile)) {
      const packageJson = JSON.parse(readFileSync(packageJsonFile, 'utf8'));
      const hasStartProxy = packageJson.scripts && packageJson.scripts['start-proxy'];
      
      if (hasStartProxy) {
        console.log('   使用npm run start-proxy启动服务...');
        const startCommand = `cd ${this.shrimpDir} && npm run start-proxy`;
        
        try {
          // 启动服务
          const child = await execAsync(startCommand, { timeout: 15000 });
          console.log('   ✅ 服务启动成功');
          console.log('   输出:', child.stdout.substring(0, 200));
        } catch (error) {
          console.log('   ❌ 服务启动失败:', error.message);
        }
      } else {
        console.log('   使用直接启动方式...');
        const startCommand = `cd ${this.shrimpDir} && node start-with-proxy.js`;
        
        try {
          const child = await execAsync(startCommand, { timeout: 15000 });
          console.log('   ✅ 服务启动成功');
          console.log('   输出:', child.stdout.substring(0, 200));
        } catch (error) {
          console.log('   ❌ 服务启动失败:', error.message);
        }
      }
    }
    
    console.log('');
  }

  async testServiceConnection() {
    console.log('3. 测试服务连接...');
    
    // 等待服务启动
    console.log('   等待服务启动...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 测试API服务器连接Shrimp MCP服务
    console.log('   测试API服务器连接...');
    
    const testScript = `
import StdioMCPClient from './src/stdio-mcp-client.js';

async function testConnection() {
  console.log('测试Shrimp MCP服务连接...');
  
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
      return true;
    } else {
      console.log('❌ 服务连接异常');
      return false;
    }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message);
    return false;
  } finally {
    await client.disconnect();
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});
`;

    const testFile = join(process.cwd(), 'test-connection.js');
    writeFileSync(testFile, testScript);
    
    try {
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

  async testOpenAIAPI() {
    console.log('4. 测试OpenAI API连接...');
    
    // 创建一个简单的OpenAI API测试
    const testScript = `
import https from 'https';

async function testOpenAI() {
  console.log('测试OpenAI API连接...');
  
  // 检查环境变量
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  console.log('代理URL:', proxyUrl || '未设置');
  
  if (!proxyUrl) {
    console.log('❌ 未设置代理环境变量');
    return false;
  }
  
  try {
    // 使用代理测试OpenAI连接
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      method: 'GET',
      path: '/v1/models',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
      console.log('✅ OpenAI API连接成功');
      return true;
    } else {
      console.log(\`❌ OpenAI API连接失败: \${result.error}\`);
      return false;
    }
    
  } catch (error) {
    console.log(\`❌ OpenAI API测试异常: \${error.message}\`);
    return false;
  }
}

testOpenAI().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});
`;

    const testFile = join(process.cwd(), 'test-openai.js');
    writeFileSync(testFile, testScript);
    
    try {
      const { stdout, stderr } = await execAsync(`node ${testFile}`);
      console.log('   测试结果:');
      console.log(stdout);
      if (stderr) console.log('   错误:', stderr);
      
      // 清理测试文件
      await execAsync(`del ${testFile}`);
      
    } catch (error) {
      console.log('   ❌ OpenAI API测试失败:', error.message);
    }
    
    console.log('');
  }
}

// 主函数
async function main() {
  const tester = new FinalProxyTester();
  await tester.runTest();
  
  console.log('=== 测试完成 ===\n');
  console.log('📋 下一步操作:');
  console.log('1. 如果测试成功，Shrimp MCP服务应该可以正常工作');
  console.log('2. 访问前端页面测试完整功能:');
  console.log('   https://ai-adhd-web.vercel.app/mcp/shrimp');
  console.log('3. 如果仍有问题，检查:');
  console.log('   - Clash是否选择了可用的代理节点');
  console.log('   - 代理规则是否包含api.openai.com');
  console.log('   - 防火墙是否允许连接');
}

// 运行测试
main().catch(console.error);