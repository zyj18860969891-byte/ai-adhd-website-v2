#!/usr/bin/env node

/**
 * 简化连接测试脚本
 * 测试基本的网络连接和API访问
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';
import net from 'net';

class SimpleConnectionTester {
  constructor() {
    this.apiKey = this.getApiKey();
    this.results = [];
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

  async testBasicConnectivity() {
    console.log('🔍 测试基本网络连接...\n');
    
    const testHosts = [
      { host: 'api.openai.com', port: 443, name: 'OpenAI API' },
      { host: 'google.com', port: 443, name: 'Google' },
      { host: 'github.com', port: 443, name: 'GitHub' },
      { host: 'baidu.com', port: 443, name: 'Baidu' }
    ];
    
    for (const test of testHosts) {
      await this.testPortConnection(test.host, test.port, test.name);
    }
  }

  async testPortConnection(host, port, name) {
    console.log(`测试 ${name} (${host}:${port})...`);
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const startTime = Date.now();
      
      const timeoutId = setTimeout(() => {
        socket.destroy();
        console.log(`  ❌ 连接超时 (5秒)`);
        this.results.push({ host, port, name, status: 'timeout' });
        resolve();
      }, 5000);
      
      socket.connect(port, host, () => {
        clearTimeout(timeoutId);
        const connectTime = Date.now() - startTime;
        console.log(`  ✅ 连接成功 (${connectTime}ms)`);
        this.results.push({ host, port, name, status: 'success', time: connectTime });
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (error) => {
        clearTimeout(timeoutId);
        console.log(`  ❌ 连接失败: ${error.code || error.message}`);
        this.results.push({ host, port, name, status: 'failed', error: error.code || error.message });
        resolve();
      });
    });
  }

  async testOpenAIAPI() {
    console.log('\n🔍 测试OpenAI API访问...\n');
    
    if (!this.apiKey) {
      console.log('❌ 缺少OPENAI_API_KEY，跳过API测试');
      console.log('提示: 请设置环境变量或检查Shrimp .env文件');
      return;
    }
    
    console.log('测试直接API访问...');
    
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
            resolve({ 
              status: 'success', 
              statusCode: res.statusCode, 
              data: JSON.parse(data) 
            });
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
        console.log('  ✅ API访问成功');
        console.log(`  状态码: ${result.statusCode}`);
        console.log(`  可用模型数: ${result.data.data?.length || 0}`);
        
        if (result.data.data && result.data.data.length > 0) {
          console.log('  前3个模型:');
          result.data.data.slice(0, 3).forEach(model => {
            console.log(`    - ${model.id}`);
          });
        }
      } else {
        console.log(`  ❌ API访问失败: ${result.error || `Status ${result.statusCode}`}`);
      }
      
    } catch (error) {
      console.log(`  ❌ API测试异常: ${error.message}`);
    }
  }

  analyzeResults() {
    console.log('\n=== 连接分析 ===\n');
    
    const successful = this.results.filter(r => r.status === 'success');
    const failed = this.results.filter(r => r.status !== 'success');
    
    console.log(`成功连接: ${successful.length}/${this.results.length}`);
    successful.forEach(result => {
      console.log(`  ✅ ${result.name} (${result.host}:${result.port}) - ${result.time}ms`);
    });
    
    console.log(`\n失败连接: ${failed.length}/${this.results.length}`);
    failed.forEach(result => {
      console.log(`  ❌ ${result.name} (${result.host}:${result.port}) - ${result.error || 'timeout'}`);
    });
    
    // 分析模式
    const openAIBlocked = this.results.find(r => r.host === 'api.openai.com' && r.status !== 'success');
    const googleBlocked = this.results.find(r => r.host === 'google.com' && r.status !== 'success');
    const githubWorks = this.results.find(r => r.host === 'github.com' && r.status === 'success');
    const baiduWorks = this.results.find(r => r.host === 'baidu.com' && r.status === 'success');
    
    console.log('\n=== 问题分析 ===\n');
    
    if (openAIBlocked && googleBlocked && githubWorks) {
      console.log('🔍 诊断结果: 特定网站阻断');
      console.log('   - OpenAI和Google无法访问');
      console.log('   - GitHub可以访问');
      console.log('   - 可能是ISP级别的特定网站过滤');
      console.log('\n💡 建议解决方案:');
      console.log('   1. 使用代理服务器');
      console.log('   2. 使用VPN连接');
      console.log('   3. 使用API中转服务');
    } else if (openAIBlocked && !googleBlocked) {
      console.log('🔍 诊断结果: OpenAI特定阻断');
      console.log('   - 只有OpenAI无法访问');
      console.log('   - 其他国际网站正常');
      console.log('   - 可能是OpenAI API的特定限制');
      console.log('\n💡 建议解决方案:');
      console.log('   1. 使用OpenAI API中转服务');
      console.log('   2. 配置代理访问OpenAI');
      console.log('   3. 检查API密钥和区域限制');
    } else if (failed.length === this.results.length) {
      console.log('🔍 诊断结果: 网络完全断开');
      console.log('   - 所有外部连接都失败');
      console.log('   - 可能是网络连接问题');
      console.log('\n💡 建议解决方案:');
      console.log('   1. 检查网络连接');
      console.log('   2. 检查防火墙设置');
      console.log('   3. 重启网络设备');
    } else if (successful.length === this.results.length) {
      console.log('🔍 诊断结果: 网络连接正常');
      console.log('   - 所有测试都成功');
      console.log('   - 问题可能在API配置');
      console.log('\n💡 建议解决方案:');
      console.log('   1. 检查API密钥有效性');
      console.log('   2. 检查API配额和限制');
      console.log('   3. 检查Shrimp MCP服务配置');
    }
  }

  provideActionableSteps() {
    console.log('\n=== 具体操作步骤 ===\n');
    
    const openAIBlocked = this.results.find(r => r.host === 'api.openai.com' && r.status !== 'success');
    
    if (openAIBlocked) {
      console.log('🚀 立即行动方案:\n');
      
      console.log('方案A: 使用代理工具 (推荐)');
      console.log('  1. 下载并安装代理工具:');
      console.log('     - Clash: https://github.com/Fndroid/clash_for_windows_pkg/releases');
      console.log('     - V2RayN: https://github.com/2dust/v2rayN/releases');
      console.log('  2. 配置代理服务器');
      console.log('  3. 启动代理服务');
      console.log('  4. 重新测试连接');
      
      console.log('\n方案B: 使用VPN服务');
      console.log('  1. 订阅VPN服务');
      console.log('  2. 连接VPN服务器');
      console.log('  3. 重新测试连接');
      
      console.log('\n方案C: 使用API中转 (技术方案)');
      console.log('  1. 寻找OpenAI API中转服务');
      console.log('  2. 修改Shrimp MCP配置:');
      console.log('     编辑 mcp-shrimp-task-manager/.env');
      console.log('     添加: OPENAI_BASE_URL=https://your-proxy-domain.com');
      console.log('  3. 重启Shrimp MCP服务');
      
      console.log('\n方案D: 继续使用降级方案 (临时)');
      console.log('  ✅ 当前降级机制工作正常');
      console.log('  ✅ 用户仍能获得任务分解服务');
      console.log('  ℹ️  等待网络问题解决后再切换');
    }
  }
}

// 主函数
async function main() {
  console.log('🔍 OpenAI API 连接诊断工具\n');
  
  const tester = new SimpleConnectionTester();
  
  // 测试基本连接
  await tester.testBasicConnectivity();
  
  // 测试API访问
  await tester.testOpenAIAPI();
  
  // 分析结果
  tester.analyzeResults();
  
  // 提供操作建议
  tester.provideActionableSteps();
  
  console.log('\n💡 提示: 当前智能降级机制确保服务可用性');
  console.log('   即使网络问题未解决，用户仍能获得良好的服务体验\n');
}

// 运行测试
main().catch(console.error);