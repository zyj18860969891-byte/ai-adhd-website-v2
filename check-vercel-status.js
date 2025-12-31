#!/usr/bin/env node

/**
 * Vercel 项目状态检查脚本
 * 用于诊断 Vercel 项目配置问题
 */

const https = require('https');

console.log('🔍 检查 Vercel 项目状态...\n');

// 检查 Vercel 域名状态
async function checkVercelDomain() {
  console.log('📋 检查 Vercel 域名状态...');
  
  try {
    const response = await fetchDomain('https://ai-adhd-website-v2.vercel.app');
    console.log(`   域名状态: ${response.status} ${response.statusText}`);
    console.log(`   响应内容: ${response.body.substring(0, 100)}...`);
    
    if (response.status === 404) {
      console.log('   ❌ 域名存在但没有部署内容');
      console.log('   📋 需要重新配置 Vercel 项目');
    } else if (response.status === 200) {
      console.log('   ✅ 域名正常，有内容部署');
    } else {
      console.log(`   ⚠️  域名返回状态: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 无法访问域名: ${error.message}`);
  }
}

// 检查 API 服务器状态
async function checkApiServer() {
  console.log('\n📋 检查 API 服务器状态...');
  
  try {
    const response = await fetchDomain('https://ai-adhd-website-v2-production.up.railway.app/api/health');
    console.log(`   API 状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('   ✅ API 服务器正常运行');
      try {
        const data = JSON.parse(response.body);
        console.log(`   服务状态: ${data.overallStatus}`);
        console.log('   MCP 服务:');
        Object.entries(data.services).forEach(([name, service]) => {
          console.log(`     - ${name}: ${service.status}`);
        });
      } catch (e) {
        console.log('   ⚠️  无法解析 API 响应');
      }
    } else {
      console.log(`   ❌ API 服务器异常: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 无法访问 API 服务器: ${error.message}`);
  }
}

// 检查 GitHub 仓库状态
async function checkGitHubRepo() {
  console.log('\n📋 检查 GitHub 仓库状态...');
  
  try {
    const response = await fetchDomain('https://github.com/zyj18860969891-byte/ai-adhd-website-v2');
    console.log(`   GitHub 状态: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('   ✅ GitHub 仓库存在');
      console.log('   📋 检查仓库内容...');
      
      // 检查关键文件
      const files = [
        'web-ui/package.json',
        'vercel.json',
        'web-ui/.env.production'
      ];
      
      for (const file of files) {
        try {
          const fileResponse = await fetchDomain(`https://raw.githubusercontent.com/zyj18860969891-byte/ai-adhd-website-v2/main/${file}`);
          if (fileResponse.status === 200) {
            console.log(`   ✅ ${file} 存在`);
          } else {
            console.log(`   ❌ ${file} 不存在 (${fileResponse.status})`);
          }
        } catch (error) {
          console.log(`   ❌ 无法检查 ${file}: ${error.message}`);
        }
      }
    } else {
      console.log(`   ❌ GitHub 仓库异常: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 无法访问 GitHub 仓库: ${error.message}`);
  }
}

// 辅助函数：获取域名响应
function fetchDomain(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// 主函数
async function main() {
  await checkVercelDomain();
  await checkApiServer();
  await checkGitHubRepo();
  
  console.log('\n🎯 诊断结果总结:');
  console.log('   如果 Vercel 域名显示 404，说明需要重新配置 Vercel 项目');
  console.log('   请参考 VERCEL_PROJECT_FIX_STEPS.md 进行修复');
  console.log('   或者使用 Vercel CLI 重新部署');
}

// 运行检查
main().catch(console.error);