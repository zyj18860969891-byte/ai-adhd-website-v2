const https = require('https');

const urls = [
  'https://ai-adhd-website-v2.vercel.app',
  'https://ai-adhd-website-v2-git-main-zyj18860969891-byte.vercel.app',
  'https://ai-adhd-web-ui.vercel.app'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, body: body.substring(0, 100) });
      });
    });

    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });

    req.end();
  });
}

async function checkAll() {
  console.log('\n=== 🔍 测试所有可能的 Vercel URL ===\n');
  
  for (const url of urls) {
    console.log(`测试: ${url}`);
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`  ❌ ${result.error}`);
    } else {
      console.log(`  ✅ 状态: ${result.status}`);
      if (result.status === 200) {
        console.log(`  内容: ${result.body}`);
      }
    }
    console.log('');
  }
}

checkAll().catch(console.error);
