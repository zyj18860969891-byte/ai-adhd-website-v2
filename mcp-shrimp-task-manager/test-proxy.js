
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Shrimp MCP服务环境变量检查');
console.log('================================');

// 检查进程环境变量
console.log('进程环境变量:');
console.log('  HTTP_PROXY:', process.env.HTTP_PROXY || '未设置');
console.log('  HTTPS_PROXY:', process.env.HTTPS_PROXY || '未设置');
console.log('  NO_PROXY:', process.env.NO_PROXY || '未设置');
console.log('  NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED || '未设置');

// 检查.env文件
const envFile = join(process.cwd(), '.env');
if (require('fs').existsSync(envFile)) {
  const envContent = require('fs').readFileSync(envFile, 'utf8');
  console.log('\n.env文件内容:');
  console.log(envContent);
} else {
  console.log('\n❌ .env文件不存在');
}

// 测试代理连接
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

async function testProxyConnection() {
  try {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (!proxyUrl) {
      console.log('\n❌ 未设置代理环境变量');
      return;
    }
    
    console.log('\n📡 测试代理连接...');
    const agent = new HttpsProxyAgent(proxyUrl);
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      method: 'GET',
      path: '/v1/models',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      agent: agent,
      timeout: 5000
    };
    
    const result = await new Promise((resolve) => {
      const req = https.request(options, (res) => {
        resolve({ status: 'success', statusCode: res.statusCode });
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
    
    if (result.status === 'success') {
      console.log('✅ 代理连接测试成功');
    } else {
      console.log(`❌ 代理连接测试失败: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ 代理测试异常: ${error.message}`);
  }
}

testProxyConnection();
