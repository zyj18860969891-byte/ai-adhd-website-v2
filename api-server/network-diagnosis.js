#!/usr/bin/env node

/**
 * 网络连接诊断脚本
 * 定位OpenAI API连接失败的具体原因
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import net from 'net';
import https from 'https';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

class NetworkDiagnoser {
  constructor() {
    this.results = {
      dns: null,
      port: null,
      ssl: null,
      proxy: null,
      api: null,
      environment: null,
      firewall: null
    };
  }

  async runDiagnosis() {
    console.log('🔍 OpenAI API 网络连接诊断\n');
    
    await this.checkEnvironmentVariables();
    await this.checkDNSResolution();
    await this.checkPortConnectivity();
    await this.checkSSLConnection();
    await this.checkProxySettings();
    await this.checkAPIAccess();
    await this.checkFirewallRules();
    
    this.displayResults();
    this.provideRecommendations();
  }

  async checkEnvironmentVariables() {
    console.log('1. 检查环境变量...');
    
    const envVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      NO_PROXY: process.env.NO_PROXY
    };
    
    console.log('当前环境变量:');
    Object.entries(envVars).forEach(([key, value]) => {
      if (key.includes('KEY')) {
        console.log(`  ${key}: ${value ? '***' + value.slice(-4) : '未设置'}`);
      } else {
        console.log(`  ${key}: ${value || '未设置'}`);
      }
    });
    
    // 检查Shrimp目录的.env文件
    const shrimpEnvFile = join(process.cwd(), '../mcp-shrimp-task-manager/.env');
    if (existsSync(shrimpEnvFile)) {
      console.log('\n检查Shrimp .env文件...');
      const envContent = readFileSync(shrimpEnvFile, 'utf8');
      
      const hasApiKey = envContent.includes('OPENAI_API_KEY=') && 
                       !envContent.includes('OPENAI_API_KEY=your_openai_api_key_here');
      const hasModel = envContent.includes('OPENAI_MODEL=');
      const hasBaseUrl = envContent.includes('OPENAI_BASE_URL=');
      
      console.log(`  .env文件存在: 是`);
      console.log(`  API密钥配置: ${hasApiKey ? '✅' : '❌'}`);
      console.log(`  模型配置: ${hasModel ? '✅' : '❌'}`);
      console.log(`  基础URL配置: ${hasBaseUrl ? '✅' : '❌'}`);
      
      this.results.environment = {
        status: hasApiKey && hasModel && hasBaseUrl ? 'configured' : 'missing',
        details: { hasApiKey, hasModel, hasBaseUrl }
      };
    } else {
      console.log('\n❌ Shrimp .env文件不存在');
      this.results.environment = { status: 'missing', details: {} };
    }
    console.log('');
  }

  async checkDNSResolution() {
    console.log('2. 检查DNS解析...');
    
    try {
      const hostname = 'api.openai.com';
      console.log(`解析域名: ${hostname}`);
      
      const startTime = Date.now();
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      const resolveTime = Date.now() - startTime;
      
      console.log(`✅ DNS解析成功 (${resolveTime}ms)`);
      console.log(`  IP地址: ${addresses.join(', ')}`);
      
      this.results.dns = { 
        status: 'success', 
        addresses, 
        resolveTime 
      };
      
    } catch (error) {
      console.log(`❌ DNS解析失败: ${error.message}`);
      this.results.dns = { 
        status: 'failed', 
        error: error.message 
      };
    }
    console.log('');
  }

  async checkPortConnectivity() {
    console.log('3. 检查端口连接...');
    
    try {
      const host = 'api.openai.com';
      const port = 443;
      
      console.log(`测试连接: ${host}:${port}`);
      
      const startTime = Date.now();
      const socket = new net.Socket();
      
      const connectionResult = await new Promise((resolve) => {
        let timeoutId = setTimeout(() => {
          socket.destroy();
          resolve({ status: 'timeout', time: 10000 });
        }, 10000);
        
        socket.connect(port, host, () => {
          clearTimeout(timeoutId);
          const connectTime = Date.now() - startTime;
          socket.destroy();
          resolve({ status: 'success', time: connectTime });
        });
        
        socket.on('error', (error) => {
          clearTimeout(timeoutId);
          resolve({ status: 'failed', error: error.message });
        });
      });
      
      if (connectionResult.status === 'success') {
        console.log(`✅ 端口连接成功 (${connectionResult.time}ms)`);
        this.results.port = { 
          status: 'success', 
          connectTime: connectionResult.time 
        };
      } else if (connectionResult.status === 'timeout') {
        console.log(`❌ 端口连接超时 (10秒)`);
        this.results.port = { 
          status: 'timeout', 
          error: 'Connection timeout after 10 seconds' 
        };
      } else {
        console.log(`❌ 端口连接失败: ${connectionResult.error}`);
        this.results.port = { 
          status: 'failed', 
          error: connectionResult.error 
        };
      }
      
    } catch (error) {
      console.log(`❌ 端口检查异常: ${error.message}`);
      this.results.port = { 
        status: 'error', 
        error: error.message 
      };
    }
    console.log('');
  }

  async checkSSLConnection() {
    console.log('4. 检查SSL/TLS连接...');
    
    try {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        method: 'GET',
        path: '/',
        timeout: 10000,
        rejectUnauthorized: false // 允许自签名证书测试
      };
      
      console.log('建立HTTPS连接...');
      
      const startTime = Date.now();
      const request = https.request(options, (response) => {
        const connectTime = Date.now() - startTime;
        console.log(`✅ SSL连接成功 (${connectTime}ms)`);
        console.log(`  状态码: ${response.statusCode}`);
        console.log(`  协议: ${response.socket.getProtocol()}`);
        
        this.results.ssl = { 
          status: 'success', 
          statusCode: response.statusCode,
          protocol: response.socket.getProtocol(),
          connectTime 
        };
        
        response.resume(); // 消耗响应体
      });
      
      request.on('error', (error) => {
        console.log(`❌ SSL连接失败: ${error.message}`);
        this.results.ssl = { 
          status: 'failed', 
          error: error.message 
        };
      });
      
      request.on('timeout', () => {
        console.log('❌ SSL连接超时');
        request.destroy();
        this.results.ssl = { 
          status: 'timeout', 
          error: 'SSL connection timeout' 
        };
      });
      
      request.setTimeout(10000);
      request.end();
      
      // 等待响应
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.log(`❌ SSL检查异常: ${error.message}`);
      this.results.ssl = { 
        status: 'error', 
        error: error.message 
      };
    }
    console.log('');
  }

  async checkProxySettings() {
    console.log('5. 检查代理设置...');
    
    const proxyVars = {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      http_proxy: process.env.http_proxy,
      https_proxy: process.env.https_proxy,
      NO_PROXY: process.env.NO_PROXY,
      no_proxy: process.env.no_proxy
    };
    
    const hasProxy = Object.values(proxyVars).some(v => v);
    
    if (hasProxy) {
      console.log('⚠️  检测到代理设置:');
      Object.entries(proxyVars).forEach(([key, value]) => {
        if (value) console.log(`  ${key}: ${value}`);
      });
      
      this.results.proxy = { 
        status: 'configured', 
        details: proxyVars 
      };
    } else {
      console.log('✅ 无代理设置（直接连接）');
      this.results.proxy = { 
        status: 'none', 
        details: {} 
      };
    }
    console.log('');
  }

  async checkAPIAccess() {
    console.log('6. 测试OpenAI API访问...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ 缺少OPENAI_API_KEY，跳过API测试');
      this.results.api = { 
        status: 'missing_key', 
        error: 'OPENAI_API_KEY not set' 
      };
      console.log('');
      return;
    }
    
    try {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        method: 'GET',
        path: '/v1/models',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      };
      
      console.log('发送API请求...');
      
      const startTime = Date.now();
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        
        response.on('end', () => {
          const responseTime = Date.now() - startTime;
          
          if (response.statusCode === 200) {
            console.log(`✅ API访问成功 (${responseTime}ms)`);
            console.log(`  状态码: ${response.statusCode}`);
            
            try {
              const models = JSON.parse(data);
              console.log(`  返回模型数: ${models.data?.length || 0}`);
              
              this.results.api = { 
                status: 'success', 
                statusCode: response.statusCode,
                modelCount: models.data?.length || 0,
                responseTime 
              };
            } catch (parseError) {
              console.log(`⚠️  JSON解析失败: ${parseError.message}`);
              this.results.api = { 
                status: 'parse_error', 
                error: parseError.message 
              };
            }
          } else {
            console.log(`❌ API访问失败 (${responseTime}ms)`);
            console.log(`  状态码: ${response.statusCode}`);
            console.log(`  响应: ${data.substring(0, 200)}`);
            
            this.results.api = { 
              status: 'failed', 
              statusCode: response.statusCode,
              error: data.substring(0, 200) 
            };
          }
        });
      });
      
      request.on('error', (error) => {
        console.log(`❌ API请求失败: ${error.message}`);
        this.results.api = { 
          status: 'request_error', 
          error: error.message 
        };
      });
      
      request.on('timeout', () => {
        console.log('❌ API请求超时');
        request.destroy();
        this.results.api = { 
          status: 'timeout', 
          error: 'API request timeout' 
        };
      });
      
      request.setTimeout(15000);
      request.end();
      
      // 等待响应
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (error) {
      console.log(`❌ API检查异常: ${error.message}`);
      this.results.api = { 
        status: 'error', 
        error: error.message 
      };
    }
    console.log('');
  }

  async checkFirewallRules() {
    console.log('7. 检查防火墙规则...');
    
    try {
      // Windows防火墙检查
      if (process.platform === 'win32') {
        console.log('检查Windows防火墙...');
        
        try {
          const { stdout } = await execAsync('netsh advfirewall show currentprofile');
          console.log('防火墙状态:');
          
          const lines = stdout.split('\n');
          const domainProfile = lines.find(line => line.includes('域配置文件'));
          const privateProfile = lines.find(line => line.includes('专用配置文件'));
          const publicProfile = lines.find(line => line.includes('公用配置文件'));
          
          [domainProfile, privateProfile, publicProfile].forEach(profile => {
            if (profile) console.log(`  ${profile.trim()}`);
          });
          
          this.results.firewall = { 
            status: 'checked', 
            details: { domainProfile, privateProfile, publicProfile } 
          };
          
        } catch (firewallError) {
          console.log('⚠️  无法检查防火墙状态');
          this.results.firewall = { 
            status: 'unknown', 
            error: firewallError.message 
          };
        }
      } else {
        console.log('⚠️  非Windows系统，跳过防火墙检查');
        this.results.firewall = { 
          status: 'skipped', 
          details: {} 
        };
      }
      
    } catch (error) {
      console.log(`❌ 防火墙检查异常: ${error.message}`);
      this.results.firewall = { 
        status: 'error', 
        error: error.message 
      };
    }
    console.log('');
  }

  displayResults() {
    console.log('=== 诊断结果汇总 ===\n');
    
    const checks = [
      { name: '环境变量', key: 'environment' },
      { name: 'DNS解析', key: 'dns' },
      { name: '端口连接', key: 'port' },
      { name: 'SSL连接', key: 'ssl' },
      { name: '代理设置', key: 'proxy' },
      { name: 'API访问', key: 'api' },
      { name: '防火墙', key: 'firewall' }
    ];
    
    checks.forEach(check => {
      const result = this.results[check.key];
      const status = result?.status || 'unknown';
      const statusIcon = status === 'success' || status === 'none' || status === 'configured' ? '✅' : 
                        status === 'failed' || status === 'missing' || status === 'timeout' ? '❌' : '⚠️';
      
      console.log(`${statusIcon} ${check.name}: ${status}`);
    });
  }

  provideRecommendations() {
    console.log('\n=== 修复建议 ===\n');
    
    const issues = [];
    
    // 环境变量问题
    if (this.results.environment?.status === 'missing') {
      issues.push({
        priority: 1,
        issue: '环境变量配置不完整',
        solution: '设置正确的OPENAI_API_KEY、OPENAI_MODEL和OPENAI_BASE_URL环境变量',
        commands: [
          'cd ../mcp-shrimp-task-manager',
          'node check-config.js',
          'npm run enhanced'
        ]
      });
    }
    
    // DNS问题
    if (this.results.dns?.status === 'failed') {
      issues.push({
        priority: 1,
        issue: 'DNS解析失败',
        solution: '检查网络连接和DNS服务器设置',
        commands: [
          'nslookup api.openai.com',
          'ipconfig /flushdns'
        ]
      });
    }
    
    // 端口连接问题
    if (this.results.port?.status === 'failed' || this.results.port?.status === 'timeout') {
      issues.push({
        priority: 1,
        issue: '端口443连接失败',
        solution: '检查防火墙、代理和网络连接',
        commands: [
          'Test-NetConnection api.openai.com -Port 443',
          '检查防火墙规则'
        ]
      });
    }
    
    // SSL问题
    if (this.results.ssl?.status === 'failed' || this.results.ssl?.status === 'timeout') {
      issues.push({
        priority: 2,
        issue: 'SSL连接失败',
        solution: '检查SSL证书和代理设置',
        commands: [
          '检查系统时间和时区设置',
          '更新根证书'
        ]
      });
    }
    
    // API访问问题
    if (this.results.api?.status === 'failed') {
      if (this.results.api?.statusCode === 401) {
        issues.push({
          priority: 1,
          issue: 'API密钥无效',
          solution: '检查OPENAI_API_KEY是否正确',
          commands: [
            '验证API密钥有效性',
            '检查API密钥权限'
          ]
        });
      } else if (this.results.api?.statusCode === 429) {
        issues.push({
          priority: 2,
          issue: 'API配额超限',
          solution: '检查API使用配额和账单',
          commands: [
            '检查OpenAI账户配额',
            '等待配额重置或升级账户'
          ]
        });
      } else {
        issues.push({
          priority: 2,
          issue: `API访问失败 (${this.results.api?.statusCode})`,
          solution: '检查API配置和网络设置',
          commands: [
            '验证OPENAI_BASE_URL配置',
            '检查网络连接'
          ]
        });
      }
    }
    
    // 代理问题
    if (this.results.proxy?.status === 'configured') {
      issues.push({
        priority: 3,
        issue: '检测到代理设置',
        solution: '确保代理配置正确或禁用代理',
        commands: [
          '检查代理服务器可用性',
          '临时禁用代理测试: set HTTP_PROXY= & set HTTPS_PROXY='
        ]
      });
    }
    
    if (issues.length === 0) {
      console.log('✅ 所有检查通过，网络连接正常');
      console.log('建议检查Shrimp MCP服务内部实现');
    } else {
      // 按优先级排序
      issues.sort((a, b) => a.priority - b.priority);
      
      console.log('发现问题及解决方案:\n');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue} (优先级: ${issue.priority})`);
        console.log(`   解决方案: ${issue.solution}`);
        console.log(`   执行命令:`);
        issue.commands.forEach(cmd => console.log(`     ${cmd}`));
        console.log('');
      });
    }
  }
}

// 主函数
async function main() {
  const diagnoser = new NetworkDiagnoser();
  await diagnoser.runDiagnosis();
}

// 运行诊断
main().catch(console.error);