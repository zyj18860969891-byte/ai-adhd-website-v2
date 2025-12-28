#!/usr/bin/env node

/**
 * 代理解决方案测试脚本
 * 测试不同的代理配置以解决OpenAI API连接问题
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

class ProxySolutionTester {
  constructor() {
    this.apiKey = this.getApiKey();
    this.testResults = [];
  }

  getApiKey() {
    // 尝试从环境变量获取
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    
    // 尝试从Shrimp .env文件获取
    const shrimpEnvFile = join(process.cwd(), '../mcp-shrimp-task-manager/.env');
    if (existsSync(shrimpEnvFile)) {
      const envContent = readFileSync(shrimpEnvFile, 'utf8');
      const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
      if (apiKeyMatch && apiKeyMatch[1] && !apiKeyMatch[1].includes('your_openai_api_key_here')) {
        return apiKeyMatch[1].trim();
      }
    }
    
    return null;
  }

  async testDirectConnection() {
    console.log('🔍 测试直接连接...');
    
    if (!this.apiKey) {
      console.log('❌ 缺少API密钥，跳过测试');
      return false;
    }
    
    try {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        method: 'GET',
        path: '/v1/models',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };
      
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ status: 'success', statusCode: res.statusCode, data });
          });
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
      
      if (result.status === 'success' && result.statusCode === 200) {
        console.log('✅ 直接连接成功');
        this.testResults.push({ method: 'direct', status: 'success' });
        return true;
      } else {
        console.log(`❌ 直接连接失败: ${result.error || `Status ${result.statusCode}`}`);
        this.testResults.push({ method: 'direct', status: 'failed', error: result.error });
        return false;
      }
      
    } catch (error) {
      console.log(`❌ 直接连接异常: ${error.message}`);
      this.testResults.push({ method: 'direct', status: 'error', error: error.message });
      return false;
    }
  }

  async testProxyConnection(proxyUrl, name) {
    console.log(`🔍 测试${name}...`);
    
    if (!this.apiKey) {
      console.log('❌ 缺少API密钥，跳过测试');
      return false;
    }
    
    try {
      const agent = new HttpsProxyAgent(proxyUrl);
      
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        method: 'GET',
        path: '/v1/models',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        agent: agent,
        timeout: 15000
      };
      
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ status: 'success', statusCode: res.statusCode, data });
          });
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
      
      if (result.status === 'success' && result.statusCode === 200) {
        console.log(`✅ ${name}成功`);
        this.testResults.push({ method: name, status: 'success', proxy: proxyUrl });
        return true;
      } else {
        console.log(`❌ ${name}失败: ${result.error || `Status ${result.statusCode}`}`);
        this.testResults.push({ method: name, status: 'failed', error: result.error, proxy: proxyUrl });
        return false;
      }
      
    } catch (error) {
      console.log(`❌ ${name}异常: ${error.message}`);
      this.testResults.push({ method: name, status: 'error', error: error.message, proxy: proxyUrl });
      return false;
    }
  }

  async testCommonProxies() {
    console.log('\n🔧 测试常见代理服务器...\n');
    
    // 常见的免费代理服务器（需要根据实际情况调整）
    const commonProxies = [
      { 
        name: '本地代理 (127.0.0.1:1080)', 
        url: 'http://127.0.0.1:1080',
        description: '本地SOCKS/HTTP代理'
      },
      { 
        name: '本地代理 (127.0.0.1:8080)', 
        url: 'http://127.0.0.1:8080',
        description: '本地HTTP代理'
      },
      { 
        name: '本地代理 (127.0.0.1:7890)', 
        url: 'http://127.0.0.1:7890',
        description: 'Clash/V2Ray默认端口'
      }
    ];
    
    for (const proxy of commonProxies) {
      console.log(`测试: ${proxy.name}`);
      console.log(`描述: ${proxy.description}`);
      await this.testProxyConnection(proxy.url, proxy.name);
      console.log('');
    }
  }

  async testAlternativeEndpoints() {
    console.log('🌐 测试替代API端点...\n');
    
    // 一些可能的OpenAI API中转服务端点
    const endpoints = [
      {
        name: '官方API (api.openai.com)',
        hostname: 'api.openai.com',
        description: '官方OpenAI API'
      },
      {
        name: 'Cloudflare Workers代理',
        hostname: 'your-worker-name.workers.dev',
        description: '自建Cloudflare Workers代理'
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`测试: ${endpoint.name}`);
      console.log(`描述: ${endpoint.description}`);
      await this.testEndpoint(endpoint.hostname, endpoint.name);
      console.log('');
    }
  }

  async testEndpoint(hostname, name) {
    if (!this.apiKey) {
      console.log('❌ 缺少API密钥，跳过测试');
      return false;
    }
    
    try {
      const options = {
        hostname: hostname,
        port: 443,
        method: 'GET',
        path: '/v1/models',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };
      
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ status: 'success', statusCode: res.statusCode, data });
          });
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
      
      if (result.status === 'success' && result.statusCode === 200) {
        console.log(`✅ ${name}连接成功`);
        this.testResults.push({ method: `endpoint_${name}`, status: 'success', hostname });
        return true;
      } else {
        console.log(`❌ ${name}连接失败: ${result.error || `Status ${result.statusCode}`}`);
        this.testResults.push({ method: `endpoint_${name}`, status: 'failed', error: result.error, hostname });
        return false;
      }
      
    } catch (error) {
      console.log(`❌ ${name}连接异常: ${error.message}`);
      this.testResults.push({ method: `endpoint_${name}`, status: 'error', error: error.message, hostname });
      return false;
    }
  }

  displayResults() {
    console.log('=== 测试结果汇总 ===\n');
    
    const successfulMethods = this.testResults.filter(r => r.status === 'success');
    const failedMethods = this.testResults.filter(r => r.status !== 'success');
    
    console.log(`✅ 成功的方法: ${successfulMethods.length}`);
    successfulMethods.forEach(result => {
      console.log(`  - ${result.method}`);
      if (result.proxy) console.log(`    代理: ${result.proxy}`);
      if (result.hostname) console.log(`    主机: ${result.hostname}`);
    });
    
    console.log(`\n❌ 失败的方法: ${failedMethods.length}`);
    failedMethods.forEach(result => {
      console.log(`  - ${result.method}: ${result.error || 'Unknown error'}`);
    });
  }

  provideRecommendations() {
    console.log('\n=== 推荐解决方案 ===\n');
    
    const successfulResults = this.testResults.filter(r => r.status === 'success');
    
    if (successfulResults.length > 0) {
      console.log('🎉 找到可用的连接方法！');
      successfulResults.forEach(result => {
        console.log(`\n方法: ${result.method}`);
        if (result.proxy) {
          console.log('配置示例:');
          console.log(`  set HTTPS_PROXY=${result.proxy}`);
          console.log(`  set HTTP_PROXY=${result.proxy}`);
        }
        if (result.hostname) {
          console.log('API端点:');
          console.log(`  ${result.hostname}`);
        }
      });
    } else {
      console.log('😔 所有连接方法都失败了。建议:');
      console.log('\n1. 配置本地代理工具');
      console.log('   - 安装Clash、V2Ray或Shadowsocks');
      console.log('   - 配置代理服务器');
      console.log('   - 测试代理连接');
      
      console.log('\n2. 使用VPN服务');
      console.log('   - 连接VPN服务器');
      console.log('   - 重新测试网络连接');
      
      console.log('\n3. 使用API中转服务');
      console.log('   - 寻找可靠的OpenAI API中转服务');
      console.log('   - 配置自定义API端点');
      
      console.log('\n4. 继续使用智能降级机制');
      console.log('   - 当前降级机制工作正常');
      console.log('   - 用户仍能获得任务分解服务');
    }
  }

  generateConfigFile() {
    const successfulResults = this.testResults.filter(r => r.status === 'success');
    
    if (successfulResults.length === 0) {
      console.log('\n❌ 没有可用的连接方法，无法生成配置文件');
      return;
    }
    
    const result = successfulResults[0]; // 使用第一个成功的方法
    
    let configContent = '';
    
    if (result.proxy) {
      configContent = `# 代理配置
export HTTP_PROXY="${result.proxy}"
export HTTPS_PROXY="${result.proxy}"

# 在Shrimp MCP中使用
# 将这些环境变量添加到 mcp-shrimp-task-manager/.env 文件
HTTP_PROXY=${result.proxy}
HTTPS_PROXY=${result.proxy}
`;
    } else if (result.hostname) {
      configContent = `# API端点配置
# 在Shrimp MCP中使用
# 将这些环境变量添加到 mcp-shrimp-task-manager/.env 文件
OPENAI_BASE_URL=https://${result.hostname}
`;
    }
    
    if (configContent) {
      const configFile = 'proxy-config.env';
      const fs = require('fs');
      fs.writeFileSync(configFile, configContent);
      console.log(`\n📁 配置文件已生成: ${configFile}`);
      console.log('使用方法:');
      console.log(`  source ${configFile}  # Linux/Mac`);
      console.log(`  type ${configFile}    # Windows (查看内容)`);
    }
  }
}

// 主函数
async function main() {
  console.log('🔧 OpenAI API 代理解决方案测试\n');
  
  const tester = new ProxySolutionTester();
  
  // 测试直接连接
  await tester.testDirectConnection();
  console.log('');
  
  // 测试常见代理
  await tester.testCommonProxies();
  
  // 测试替代端点
  await tester.testAlternativeEndpoints();
  
  // 显示结果
  tester.displayResults();
  
  // 提供建议
  tester.provideRecommendations();
  
  // 生成配置文件
  tester.generateConfigFile();
}

// 运行测试
main().catch(console.error);