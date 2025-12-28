#!/usr/bin/env node

/**
 * 全面的网络诊断脚本
 * 检查网络连接、代理配置、DNS解析等问题
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import http from 'http';
import dns from 'dns';

const execAsync = promisify(exec);

class NetworkDiagnostics {
  constructor() {
    this.proxyUrl = 'http://127.0.0.1:8081';
  }

  async runDiagnostics() {
    console.log('🔍 全面网络诊断\n');
    
    await this.checkBasicConnectivity();
    await this.checkProxyStatus();
    await this.testOpenAIConnection();
    await this.checkDNSResolution();
    await this.testWithProxy();
    await this.checkEnvironmentVariables();
  }

  async checkBasicConnectivity() {
    console.log('1. 基础网络连接检查...');
    
    const testUrls = [
      { name: 'GitHub', url: 'github.com', port: 443 },
      { name: '百度', url: 'baidu.com', port: 443 },
      { name: 'OpenAI', url: 'api.openai.com', port: 443 },
      { name: 'Google', url: 'google.com', port: 443 }
    ];
    
    for (const test of testUrls) {
      try {
        const result = await this.testConnection(test.url, test.port);
        console.log(`   ${test.name}: ${result.success ? '✅' : '❌'} ${result.error || ''}`);
      } catch (error) {
        console.log(`   ${test.name}: ❌ ${error.message}`);
      }
    }
    console.log('');
  }

  async testConnection(hostname, port) {
    return new Promise((resolve) => {
      const options = {
        hostname: hostname,
        port: port,
        method: 'GET',
        path: '/',
        timeout: 5000
      };
      
      const req = https.request(options, (res) => {
        resolve({ success: true, statusCode: res.statusCode });
        res.resume();
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });
      
      req.setTimeout(5000);
      req.end();
    });
  }

  async checkProxyStatus() {
    console.log('2. 代理状态检查...');
    
    try {
      const { stdout } = await execAsync('netstat -an | findstr :8081');
      if (stdout.includes('8081')) {
        console.log('✅ Clash代理端口8081正在监听');
      } else {
        console.log('❌ Clash代理端口8081未监听');
      }
    } catch (error) {
      console.log('❌ 无法检查代理状态:', error.message);
    }
    
    // 检查代理是否响应
    try {
      const proxyTest = await this.testProxyResponse();
      console.log(`   代理响应: ${proxyTest.success ? '✅' : '❌'} ${proxyTest.error || ''}`);
    } catch (error) {
      console.log(`   代理响应: ❌ ${error.message}`);
    }
    console.log('');
  }

  async testProxyResponse() {
    return new Promise((resolve) => {
      const options = {
        hostname: '127.0.0.1',
        port: 8081,
        method: 'GET',
        path: '/',
        timeout: 3000
      };
      
      const req = http.request(options, (res) => {
        resolve({ success: true, statusCode: res.statusCode });
        res.resume();
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Proxy timeout' });
      });
      
      req.setTimeout(3000);
      req.end();
    });
  }

  async testOpenAIConnection() {
    console.log('3. OpenAI API连接测试...');
    
    try {
      const result = await this.testOpenAIDirect();
      console.log(`   直接连接: ${result.success ? '✅' : '❌'} ${result.error || ''}`);
      console.log(`   状态码: ${result.statusCode || 'N/A'}`);
    } catch (error) {
      console.log(`   直接连接: ❌ ${error.message}`);
    }
    console.log('');
  }

  async testOpenAIDirect() {
    return new Promise((resolve) => {
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
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ 
            success: true, 
            statusCode: res.statusCode, 
            responseSize: data.length 
          });
        });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });
      
      req.setTimeout(10000);
      req.end();
    });
  }

  async checkDNSResolution() {
    console.log('4. DNS解析检查...');
    
    const domains = ['api.openai.com', 'github.com', 'baidu.com'];
    
    for (const domain of domains) {
      try {
        const addresses = await new Promise((resolve, reject) => {
          dns.resolve(domain, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
          });
        });
        console.log(`   ${domain}: ✅ ${addresses[0]}`);
      } catch (error) {
        console.log(`   ${domain}: ❌ ${error.message}`);
      }
    }
    console.log('');
  }

  async testWithProxy() {
    console.log('5. 代理连接测试...');
    
    // 测试通过代理连接GitHub
    try {
      const result = await this.testViaProxy('github.com', 443);
      console.log(`   GitHub via proxy: ${result.success ? '✅' : '❌'} ${result.error || ''}`);
    } catch (error) {
      console.log(`   GitHub via proxy: ❌ ${error.message}`);
    }
    
    // 测试通过代理连接OpenAI
    try {
      const result = await this.testViaProxy('api.openai.com', 443);
      console.log(`   OpenAI via proxy: ${result.success ? '✅' : '❌'} ${result.error || ''}`);
    } catch (error) {
      console.log(`   OpenAI via proxy: ❌ ${error.message}`);
    }
    console.log('');
  }

  async testViaProxy(hostname, port) {
    return new Promise((resolve) => {
      const options = {
        hostname: '127.0.0.1',
        port: 8081,
        method: 'CONNECT',
        path: `${hostname}:${port}`,
        headers: {
          'Host': `${hostname}:${port}`,
          'Proxy-Connection': 'keep-alive'
        },
        timeout: 10000
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
        res.resume();
      });
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });
      
      req.setTimeout(10000);
      req.end();
    });
  }

  async checkEnvironmentVariables() {
    console.log('6. 环境变量检查...');
    
    const envVars = {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      NO_PROXY: process.env.NO_PROXY,
      NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED
    };
    
    console.log('当前环境变量:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value || '未设置'}`);
    });
    
    // 检查是否需要设置环境变量
    const needsProxy = !process.env.HTTP_PROXY || !process.env.HTTPS_PROXY;
    if (needsProxy) {
      console.log('\n⚠️  建议设置环境变量:');
      console.log('   set HTTP_PROXY=http://127.0.0.1:8081');
      console.log('   set HTTPS_PROXY=http://127.0.0.1:8081');
      console.log('   set NODE_TLS_REJECT_UNAUTHORIZED=0');
    }
    console.log('');
  }
}

// 主函数
async function main() {
  const diagnostics = new NetworkDiagnostics();
  await diagnostics.runDiagnostics();
  
  console.log('=== 网络诊断完成 ===\n');
  console.log('📋 诊断结果总结:');
  console.log('• 检查网络连接状态');
  console.log('• 验证代理服务运行');
  console.log('• 测试OpenAI API可达性');
  console.log('• 确认DNS解析正常');
  console.log('• 验证代理连接功能');
  console.log('• 检查环境变量配置');
}

// 运行诊断
main().catch(console.error);