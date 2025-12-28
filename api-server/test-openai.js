
import https from 'https';

async function testOpenAI() {
  console.log('测试OpenAI API连接...');
  
  // 检查环境变量
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  console.log('代理URL:', proxyUrl || '未设置');
  
  if (!proxyUrl) {
    console.log('❌ 未设置代理环境变量');
    return false;
  }
  
  try {
    // 使用代理测试OpenAI连接
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      method: 'GET',
      path: '/v1/models',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
      console.log('✅ OpenAI API连接成功');
      return true;
    } else {
      console.log(`❌ OpenAI API连接失败: ${result.error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ OpenAI API测试异常: ${error.message}`);
    return false;
  }
}

testOpenAI().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});
