/**
 * A2UI Integration Test
 * 测试新集成的 Agent 系统端点
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3003';
const USER_ID = 'test-user-' + Date.now();

console.log('🧪 A2UI Integration Test');
console.log('========================\n');
console.log(`Target: ${BASE_URL}\n`);

// 测试端点列表
const tests = [
  {
    name: 'Agent Status',
    method: 'GET',
    path: '/api/agent/status',
    expected: 200
  },
  {
    name: 'Get Skills',
    method: 'GET',
    path: '/api/agent/skills',
    expected: 200
  },
  {
    name: 'Get Tools',
    method: 'GET',
    path: '/api/agent/tools',
    expected: 200
  },
  {
    name: 'Agent Process',
    method: 'POST',
    path: '/api/agent/process',
    body: { userId: USER_ID, input: '测试捕获一个任务' },
    expected: 200
  },
  {
    name: 'A2UI Start',
    method: 'POST',
    path: '/api/a2ui/start',
    body: { userId: USER_ID, intent: 'capture' },
    expected: 200
  },
  {
    name: 'Quick Capture',
    method: 'POST',
    path: '/api/agent/capture',
    body: { userId: USER_ID, content: '快速测试任务' },
    expected: 200
  }
];

// HTTP 请求函数
function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// 运行测试
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n[${test.name}]`);
      console.log(`  ${test.method} ${test.path}`);
      
      if (test.body) {
        console.log(`  Body: ${JSON.stringify(test.body)}`);
      }

      const result = await makeRequest(test.method, test.path, test.body);
      
      if (result.status === test.expected) {
        console.log(`  ✅ PASS (${result.status})`);
        if (result.data) {
          console.log(`  Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`  ❌ FAIL (${result.status}, expected ${test.expected})`);
        console.log(`  Response: ${JSON.stringify(result.data)}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed}/${tests.length} passed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️  ${failed} test(s) failed`);
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const result = await makeRequest('GET', '/', null);
    console.log(`✅ Server is running at ${BASE_URL}`);
    console.log(`   Status: ${result.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Server is not running at ${BASE_URL}`);
    console.log(`   Error: ${error.message}`);
    console.log(`\n💡 Please start the server first:`);
    console.log(`   cd api-server && npm start`);
    return false;
  }
}

// 主函数
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  await runTests();
}

main().catch(console.error);
