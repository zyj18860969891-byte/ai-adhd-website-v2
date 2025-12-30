#!/usr/bin/env node

/**
 * 服务健康状态测试脚本
 * 用于验证各个 MCP 服务和 API 服务器的运行状态
 */

const { spawn } = require('child_process');
const http = require('http');

const services = {
  churnflow: {
    name: 'ChurnFlow MCP',
    path: '/app/churnflow-mcp/dist/index.js',
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'mock-key',
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
      PORT: 3001
    }
  },
  shrimp: {
    name: 'Shrimp Task Manager MCP',
    path: '/app/mcp-shrimp-task-manager/dist/index.js',
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'mock-key',
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'mock-key',
      PORT: 3002
    }
  },
  api: {
    name: 'API Server',
    port: process.env.PORT || 3003,
    path: '/app/api-server/dist/index.js'
  }
};

async function testServiceHealth() {
  console.log('🔍 开始测试服务健康状态...\n');

  // 测试 API 服务器健康检查端点
  console.log('📊 测试 API 服务器健康检查...');
  try {
    const healthStatus = await checkApiHealth();
    console.log('✅ API 服务器健康检查通过');
    console.log('   整体状态:', healthStatus.overallStatus);
    console.log('   服务详情:');
    Object.entries(healthStatus.services).forEach(([name, service]) => {
      console.log(`   - ${name}: ${service.status}`);
      if (service.error) {
        console.log(`     错误: ${service.error}`);
      }
    });
  } catch (error) {
    console.log('❌ API 服务器健康检查失败:', error.message);
  }

  console.log('\n🎯 测试各个 MCP 服务进程启动...');

  // 测试 ChurnFlow MCP
  await testProcessStartup('churnflow', services.churnflow);

  // 测试 Shrimp MCP
  await testProcessStartup('shrimp', services.shrimp);

  console.log('\n✨ 服务健康测试完成');
}

async function checkApiHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: services.api.port,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
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

async function testProcessStartup(serviceKey, serviceConfig) {
  console.log(`\n🧪 测试 ${serviceConfig.name} 进程启动...`);
  
  try {
    const process = spawn('node', [serviceConfig.path], {
      env: { ...process.env, ...serviceConfig.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 等待进程启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isRunning = process.exitCode === null;
    
    if (isRunning) {
      console.log(`✅ ${serviceConfig.name} 进程启动成功`);
      process.kill();
      await new Promise(resolve => {
        process.on('exit', resolve);
        setTimeout(resolve, 1000);
      });
    } else {
      console.log(`❌ ${serviceConfig.name} 进程启动失败`);
      console.log(`   退出码: ${process.exitCode}`);
      
      // 获取错误输出
      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      if (stderr) {
        console.log(`   错误信息: ${stderr.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    console.log(`❌ ${serviceConfig.name} 进程启动测试异常:`, error.message);
  }
}

// 运行测试
testServiceHealth()
  .catch(console.error);