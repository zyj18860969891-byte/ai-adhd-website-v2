const https = require('https');

const urls = [
  'https://ai-adhd-website-v2.vercel.app',
  'https://ai-adhd-website-v2-zhang-yujies-projects.vercel.app'
];

function test(url) {
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
        resolve({ url, status: res.statusCode, body: body.substring(0, 200) });
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

async function check() {
  console.log('\n=== 测试 Vercel 新部署 ===\n');
  for (const url of urls) {
    const result = await test(url);
    if (result.error) {
      console.log(`❌ ${url}: ${result.error}`);
    } else {
      console.log(`✅ ${url}: ${result.status}`);
      if (result.status === 200) {
        console.log(`   内容: ${result.body}`);
      }
    }
  }
}

check().catch(console.error);
