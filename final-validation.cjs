const https = require('https');

function test(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ai-adhd-website-v2-production.up.railway.app',
      port: 443,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ url, method, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300 });
      });
    });

    req.on('error', (err) => {
      resolve({ url, method, status: 'ERROR', ok: false });
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n=== 🎯 生产环境最终验证 ===\n');
  
  const tests = [
    { url: '/', method: 'GET' },
    { url: '/api/health', method: 'GET' },
    { url: '/api/mcp/capture', method: 'POST', data: { action: 'capture', data: { text: '测试', priority: 'high' } } },
    { url: '/api/mcp/shrimp', method: 'POST', data: { action: 'list_tasks', data: {} } },
    { url: '/api/tasks', method: 'GET' }
  ];

  for (const t of tests) {
    const result = await test(t.url, t.method, t.data);
    const status = result.ok ? '✅' : '❌';
    console.log(`${status} ${t.method.padEnd(6, ' ')} ${t.url.padEnd(25, ' ')} [${result.status}]`);
  }
}

runTests().catch(console.error);
