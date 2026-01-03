const https = require('https');

console.log('=== OpenAI 连接测试 ===\n');

const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key 设置:', apiKey ? '✅' : '❌');

// 简单测试
const data = JSON.stringify({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'test' }],
  max_tokens: 5
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
  console.log('状态码:', res.statusCode);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ OpenAI 可访问');
      console.log('响应:', body.substring(0, 100));
    } else {
      console.log('❌ 错误:', body);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ 网络错误:', e.message);
});

req.write(data);
req.end();
