#!/usr/bin/env node

/**
 * 生产环境 OpenAI 连接测试脚本
 * 上传到 Railway 并运行，验证 OpenAI API 是否可访问
 */

const https = require('https');

console.log('=== 生产环境 OpenAI 连接测试 ===\n');

// 从环境变量读取 API Key
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log('❌ 错误: OPENAI_API_KEY 环境变量未设置');
  console.log('\n请在 Railway 仪表板设置环境变量:');
  console.log('OPENAI_API_KEY = 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');
  process.exit(1);
}

console.log('✅ API Key 已设置');
console.log('Key:', apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10));

// 测试 1: DNS 解析
console.log('\n[1] 测试 DNS 解析...');
const dns = require('dns');
dns.resolve('api.openai.com', (err, addresses) => {
  if (err) {
    console.log('    ❌ DNS 解析失败:', err.message);
    console.log('    可能原因: 网络限制或 DNS 配置问题');
  } else {
    console.log('    ✅ DNS 解析成功:', addresses);
  }
  
  // 测试 2: 基础连接
  console.log('\n[2] 测试基础连接...');
  const req1 = https.request({
    hostname: 'api.openai.com',
    port: 443,
    path: '/',
    method: 'GET'
  }, (res) => {
    console.log('    ✅ 连接成功，状态码:', res.statusCode);
    
    // 测试 3: 实际 API 调用
    console.log('\n[3] 测试 OpenAI API 调用...');
    testOpenAICall();
  });
  
  req1.on('error', (e) => {
    console.log('    ❌ 连接失败:', e.message);
    console.log('    可能原因: 防火墙阻止或网络限制');
  });
  
  req1.end();
});

function testOpenAICall() {
  const data = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Hello from Railway test' }
    ],
    max_tokens: 10
  });

  const req = https.request({
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
      'Content-Length': data.length
    }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('    响应状态:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(body);
          console.log('    ✅ API 调用成功！');
          console.log('    模型:', result.model);
          console.log('    回复:', result.choices[0].message.content);
          console.log('\n✅ 生产环境 OpenAI 配置正常！');
        } catch (e) {
          console.log('    ❌ JSON 解析失败:', e.message);
        }
      } else if (res.statusCode === 401) {
        console.log('    ❌ API Key 无效或已过期');
        console.log('    响应:', body);
      } else if (res.statusCode === 429) {
        console.log('    ⚠️ 配额已用完或频率限制');
        console.log('    响应:', body);
      } else {
        console.log('    ⚠️ 其他错误');
        console.log('    响应:', body.substring(0, 200));
      }
    });
  });

  req.on('error', (e) => {
    console.log('    ❌ 网络错误:', e.message);
    console.log('    可能原因:');
    console.log('    1. 无法访问 api.openai.com');
    console.log('    2. 防火墙阻止');
    console.log('    3. 网络限制');
  });

  req.write(data);
  req.end();
}

// 4. 测试其他 API（对比）
setTimeout(() => {
  console.log('\n[4] 测试其他 API (GitHub) 对比...');
  const req = https.request({
    hostname: 'api.github.com',
    port: 443,
    path: '/zen',
    method: 'GET',
    headers: {
      'User-Agent': 'Railway-Test'
    }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('    ✅ GitHub API 可访问');
        console.log('    说明: 网络正常，问题在 OpenAI');
      } else {
        console.log('    ⚠️ GitHub API 状态:', res.statusCode);
      }
    });
  });
  
  req.on('error', (e) => {
    console.log('    ❌ GitHub API 不可访问:', e.message);
    console.log('    说明: 生产环境网络可能有问题');
  });
  
  req.end();
}, 2000);

// 5. 检查环境变量
setTimeout(() => {
  console.log('\n[5] 环境变量检查...');
  console.log('    OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('    OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置 (使用默认)');
  console.log('    HTTP_PROXY:', process.env.HTTP_PROXY || '未设置');
  console.log('    HTTPS_PROXY:', process.env.HTTPS_PROXY || '未设置');
}, 3000);
