#!/usr/bin/env node

/**
 * 网络连接诊断脚本
 * 检查到OpenAI API的网络连接和DNS解析
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import dns from 'dns';
import https from 'https';
import net from 'net';
import { URL } from 'url';

// 加载环境变量
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  config({ path: envPath });
}

console.log('🌐 网络连接诊断\n');

const openaiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const apiUrl = new URL(openaiBaseUrl);
const hostname = apiUrl.hostname;

console.log(`目标主机: ${hostname}`);
console.log(`完整URL: ${openaiBaseUrl}`);
console.log('');

async function testDNSResolution() {
  console.log('1. 测试DNS解析...');
  
  try {
    const addresses = await dns.promises.resolve4(hostname);
    console.log(`✅ DNS解析成功: ${addresses.join(', ')}`);
    return addresses[0];
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
    return null;
  }
}

async function testPortConnection(ip, port = 443) {
  console.log(`\n2. 测试端口连接 (${ip}:${port})...`);
  
  return new Promise((resolve) => {
    const socket = net.createConnection(port, ip, () => {
      console.log(`✅ 端口连接成功`);
      socket.destroy();
      resolve(true);
    });
    
    socket.setTimeout(5000);
    
    socket.on('timeout', () => {
      console.log(`❌ 连接超时`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (error) => {
      console.log(`❌ 连接失败: ${error.message}`);
      resolve(false);
    });
  });
}

async function testHTTPSRequest() {
  console.log('\n3. 测试HTTPS请求...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ HTTPS请求成功`);
      console.log(`HTTP状态码: ${res.statusCode}`);
      console.log(`响应头: ${JSON.stringify(res.headers, null, 2).substring(0, 200)}...`);
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.log(`❌ API错误: ${parsed.error.message}`);
            resolve(false);
          } else {
            console.log(`✅ API响应正常`);
            console.log(`可用模型数量: ${parsed.data?.length || 0}`);
            resolve(true);
          }
        } catch (error) {
          console.log(`⚠️  JSON解析失败: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('timeout', () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve(false);
    });
    
    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

async function testSimpleRequest() {
  console.log('\n4. 测试简单请求...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ 简单请求成功 (状态码: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('timeout', () => {
      console.log('❌ 简单请求超时');
      req.destroy();
      resolve(false);
    });
    
    req.on('error', (error) => {
      console.log(`❌ 简单请求失败: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

async function runDiagnostics() {
  console.log('=== 开始网络诊断 ===\n');
  
  // 1. DNS解析
  const ip = await testDNSResolution();
  if (!ip) {
    console.log('\n❌ DNS解析失败，无法继续诊断');
    return;
  }
  
  // 2. 端口连接
  const portConnected = await testPortConnection(ip);
  if (!portConnected) {
    console.log('\n❌ 端口连接失败，无法继续诊断');
    return;
  }
  
  // 3. 简单请求
  await testSimpleRequest();
  
  // 4. HTTPS请求
  const apiWorking = await testHTTPSRequest();
  
  console.log('\n=== 诊断结果 ===');
  
  if (apiWorking) {
    console.log('✅ 网络连接正常，OpenAI API可访问');
    console.log('\n建议检查:');
    console.log('1. OpenAI库版本兼容性');
    console.log('2. 代码中的API调用参数');
    console.log('3. 防火墙或代理设置');
  } else {
    console.log('❌ 网络连接存在问题');
    console.log('\n建议检查:');
    console.log('1. 网络连接状态');
    console.log('2. 防火墙设置');
    console.log('3. 代理配置');
    console.log('4. OpenAI服务状态');
  }
}

// 运行诊断
runDiagnostics().catch(console.error);