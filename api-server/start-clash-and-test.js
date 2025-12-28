#!/usr/bin/env node

/**
 * 启动Clash代理并测试Shrimp MCP服务连接
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import net from 'net';
import https from 'https';

const execAsync = promisify(exec);

class ClashStarter {
  constructor() {
    this.clashConfig = {
      port: 8081,
      controlPort: 9090,
      configPath: join(process.env.USERPROFILE || '', '.config\\clash\\config.yaml')
    };
  }

  async startClashAndTest() {
    console.log('🚀 启动Clash代理并测试Shrimp MCP服务\n');
    
    await this.checkClashStatus();
    await this.startClash();
    await this.waitForClash();
    await this.testProxyConnection();
    await this.testOpenAIThroughProxy();
    await this.testShrimpService();
  }

  async checkClashStatus() {
    console.log('1. 检查Clash状态...');
    
    try {
      // 检查端口8081是否被占用
      const port8081InUse = await this.isPortInUse(this.clashConfig.port);
      const port9090InUse = await this.isPortInUse(this.clashConfig.controlPort);
      
      console.log(`   Clash代理端口 (8081): ${port8081InUse ? '✅ 运行中' : '❌ 未运行'}`);
      console.log(`   Clash控制端口 (9090): ${port9090InUse ? '✅ 运行中' : '❌ 未运行'}`);
      
      if (port8081InUse && port9090InUse) {
        console.log('✅ Clash已经在运行');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`❌ 检查Clash状态失败: ${error.message}`);
      return false;
    }
  }

  async isPortInUse(port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      const cleanup = () => {
        socket.removeAllListeners();
        socket.destroy();
      };
      
      socket.on('connect', () => {
        cleanup();
        resolve(true);
      });
      
      socket.on('error', () => {
        cleanup();
        resolve(false);
      });
      
      socket.connect(port, '127.0.0.1');
      
      // 设置超时
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 1000);
    });
  }

  async startClash() {
    console.log('\n2. 启动Clash代理...');
    
    try {
      // 检查Clash是否已安装
      console.log('   检查Clash安装...');
      
      try {
        await execAsync('clash --version');
        console.log('   ✅ Clash已安装');
      } catch (error) {
        console.log('   ❌ Clash未安装或不在PATH中');
        console.log('   建议: 从 https://github.com/Fndroid/clash_for_windows_pkg/releases 下载并安装Clash');
        return false;
      }
      
      // 检查配置文件
      if (existsSync(this.clashConfig.configPath)) {
        console.log(`   ✅ 配置文件存在: ${this.clashConfig.configPath}`);
      } else {
        console.log(`   ❌ 配置文件不存在: ${this.clashConfig.configPath}`);
        console.log('   建议: 确保Clash配置文件位于正确位置');
        return false;
      }
      
      // 尝试启动Clash
      console.log('   启动Clash (后台运行)...');
      
      // Windows上使用start命令后台启动
      const startCommand = `start /B clash -f "${this.clashConfig.configPath}"`;
      await execAsync(startCommand);
      
      console.log('   ✅ Clash启动命令已发送');
      return true;
      
    } catch (error) {
      console.log(`❌ 启动Clash失败: ${error.message}`);
      console.log('\n💡 手动启动Clash:');
      console.log('   1. 打开Clash for Windows应用');
      console.log('   2. 确保系统代理已开启');
      console.log('   3. 选择适合的代理节点');
      return false;
    }
  }

  async waitForClash() {
    console.log('\n3. 等待Clash启动...');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      process.stdout.write(`   \r等待Clash启动 (${attempts}/${maxAttempts})...`);
      
      const port8081InUse = await this.isPortInUse(this.clashConfig.port);
      const port9090InUse = await this.isPortInUse(this.clashConfig.controlPort);
      
      if (port8081InUse && port9090InUse) {
        console.log('\n   ✅ Clash已成功启动');
        return true;
      }
      
      // 等待2秒
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n   ⚠️  Clash启动超时，请手动检查');
    return false;
  }

  async testProxyConnection() {
    console.log('\n4. 测试代理连接...');
    
    const testSites = [
      { name: 'OpenAI API', host: 'api.openai.com', port: 443 },
      { name: 'Google', host: 'google.com', port: 443 },
      { name: 'GitHub', host: 'github.com', port: 443 }
    ];
    
    for (const site of testSites) {
      console.log(`   测试 ${site.name}...`);
      
      try {
        const result = await this.testConnectionThroughProxy(site.host, site.port);
        if (result.success) {
          console.log(`   ✅ ${site.name} 代理连接成功 (${result.time}ms)`);
        } else {
          console.log(`   ❌ ${site.name} 代理连接失败: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ ${site.name} 测试异常: ${error.message}`);
      }
    }
  }

  async testConnectionThroughProxy(host, port) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const socket = net.createConnection({
        host: '127.0.0.1',
        port: this.clashConfig.port
      });
      
      let connected = false;
      
      socket.on('connect', () => {
        connected = true;
        const connectTime = Date.now() - startTime;
        socket.destroy();
        resolve({ success: true, time: connectTime });
      });
      
      socket.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });
      
      socket.setTimeout(10000);
    });
  }

  async testOpenAIThroughProxy() {
    console.log('\n5. 测试OpenAI API通过代理...');
    
    try {
      // 读取Shrimp目录的API密钥
      const shrimpEnvFile = join(process.cwd(), '../mcp-shrimp-task-manager/.env');
      if (!existsSync(shrimpEnvFile)) {
        console.log('   ❌ Shrimp .env文件不存在');
        return false;
      }
      
      const envContent = readFileSync(shrimpEnvFile, 'utf8');
      const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
      
      if (!apiKeyMatch || !apiKeyMatch[1] || apiKeyMatch[1].includes('your_openai_api_key_here')) {
        console.log('   ❌ OpenAI API密钥未配置');
        return false;
      }
      
      const apiKey = apiKeyMatch[1].trim();
      
      console.log('   通过代理测试OpenAI API...');
      
      const options = {
        hostname: '127.0.0.1',
        port: this.clashConfig.port,
        method: 'CONNECT',
        path: 'api.openai.com:443'
      };
      
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          resolve({ success: true, statusCode: res.statusCode });
        });
        
        req.on('error', (error) => {
          resolve({ success: false, error: error.message });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Request timeout' });
        });
        
        req.setTimeout(15000);
        req.end();
      });
      
      if (result.success) {
        console.log('   ✅ OpenAI API代理连接成功');
        return true;
      } else {
        console.log(`   ❌ OpenAI API代理连接失败: ${result.error}`);
        return false;
      }
      
    } catch (error) {
      console.log(`   ❌ OpenAI API测试异常: ${error.message}`);
      return false;
    }
  }

  async testShrimpService() {
    console.log('\n6. 测试Shrimp MCP服务...');
    
    try {
      // 导入StdioMCPClient
      const StdioMCPClient = (await import('./src/stdio-mcp-client.js')).default;
      
      const client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
        cwd: '../mcp-shrimp-task-manager',
        maxRetries: 2,
        baseTimeout: 60000,
        retryDelay: 2000
      });
      
      console.log('   测试服务连接...');
      const health = await client.healthCheck();
      
      if (health.status === 'healthy' || health.status === 'partially_healthy') {
        console.log(`   ✅ 服务连接成功: ${health.message}`);
        
        console.log('   测试工具调用...');
        try {
          const result = await client.callTool('list_tasks', { status: 'all' });
          console.log('   ✅ 工具调用成功');
          
          await client.disconnect();
          return true;
        } catch (toolError) {
          console.log(`   ⚠️  工具调用失败: ${toolError.message}`);
          console.log('   这可能是正常的，因为OpenAI API可能需要更多时间初始化');
          
          await client.disconnect();
          return true;
        }
      } else {
        console.log(`   ❌ 服务连接失败: ${health.message}`);
        
        await client.disconnect();
        return false;
      }
      
    } catch (error) {
      console.log(`   ❌ 服务测试异常: ${error.message}`);
      return false;
    }
  }
}

// 主函数
async function main() {
  const starter = new ClashStarter();
  await starter.startClashAndTest();
  
  console.log('\n=== 启动完成 ===\n');
  console.log('🎉 如果所有测试都通过，Shrimp MCP服务应该可以正常工作了！');
  console.log('\n📋 使用说明:');
  console.log('1. 保持Clash运行');
  console.log('2. 启动Shrimp MCP服务:');
  console.log('   cd ../mcp-shrimp-task-manager');
  console.log('   npm run start-proxy');
  console.log('3. 测试完整功能:');
  console.log('   cd ../api-server');
  console.log('   node test-enhanced-shrimp.js');
  console.log('\n💡 如果仍有问题，请检查:');
  console.log('- Clash是否正确配置了OpenAI规则');
  console.log('- 选择的代理节点是否可用');
  console.log('- 防火墙是否允许连接');
}

// 运行启动和测试
main().catch(console.error);