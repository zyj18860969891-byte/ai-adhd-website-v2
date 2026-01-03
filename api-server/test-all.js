#!/usr/bin/env node

/**
 * 完整功能测试脚本
 * 测试 ChurnFlow MCP 的所有功能
 */

import { spawn } from 'child_process';
import http from 'http';

const API_URL = 'http://localhost:3003';
const TEST_RESULTS = [];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(test, status, details) {
  TEST_RESULTS.push({ test, status, details });
  const color = status === 'PASS' ? 'green' : 'red';
  log(`[${status}] ${test}`, color);
  if (details) log(`  ${details}`, 'yellow');
}

// 测试 1：API 服务器健康检查
async function testHealthCheck() {
  return new Promise((resolve) => {
    http.get(`${API_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const allHealthy = json.status === 'healthy';
          addResult(
            'API Health Check',
            allHealthy ? 'PASS' : 'FAIL',
            `Status: ${json.status}`
          );
          resolve(allHealthy);
        } catch (e) {
          addResult('API Health Check', 'FAIL', e.message);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      addResult('API Health Check', 'FAIL', `Cannot connect: ${e.message}`);
      resolve(false);
    });
  });
}

// 测试 2：Capture 功能
async function testCapture() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      text: '这是一个自动化测试任务',
      priority: 'high',
      context: 'work'
    });

    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/mcp/capture',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const success = json.success === true;
          addResult(
            'Capture Function',
            success ? 'PASS' : 'FAIL',
            success ? `Created: ${json.data?.content?.[0]?.text?.substring(0, 50)}...` : json.error
          );
          resolve(success);
        } catch (e) {
          addResult('Capture Function', 'FAIL', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      addResult('Capture Function', 'FAIL', `Request error: ${e.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// 测试 3：MCP 状态查询
async function testMCPStatus() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      action: 'status',
      data: {}
    });

    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/api/mcp/churnflow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const success = json.success === true;
          addResult(
            'MCP Status Query',
            success ? 'PASS' : 'FAIL',
            success ? 'Status retrieved' : json.error
          );
          resolve(success);
        } catch (e) {
          addResult('MCP Status Query', 'FAIL', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      addResult('MCP Status Query', 'FAIL', `Request error: ${e.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// 测试 4：数据库验证
async function testDatabase() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    
    // 使用 Node.js 检查数据库
    const testScript = `
      import { DatabaseManager } from './dist/storage/DatabaseManager.js';
      const dbm = new DatabaseManager();
      await dbm.initialize();
      const captures = await dbm.db.select().from(dbm.db.captures);
      console.log(JSON.stringify({ count: captures.length, latest: captures[captures.length - 1] }));
    `;
    
    exec(`node -e "${testScript}"`, { cwd: 'churnflow-mcp' }, (error, stdout, stderr) => {
      if (error) {
        addResult('Database Verification', 'FAIL', stderr || error.message);
        resolve(false);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        const hasData = result.count > 0;
        addResult(
          'Database Verification',
          hasData ? 'PASS' : 'FAIL',
          `Captures: ${result.count}${hasData ? `, Latest: ${result.latest.item}` : ''}`
        );
        resolve(hasData);
      } catch (e) {
        addResult('Database Verification', 'FAIL', `Parse error: ${e.message}`);
        resolve(false);
      }
    });
  });
}

// 主测试流程
async function runAllTests() {
  log('\n🧪 ChurnFlow MCP 完整功能测试', 'blue');
  log('=' .repeat(50), 'blue');
  
  log('\n1. 等待 API 服务器启动...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  log('\n2. 开始测试...\n');
  
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testCapture());
  results.push(await testMCPStatus());
  results.push(await testDatabase());
  
  // 总结
  log('\n' + '='.repeat(50), 'blue');
  log('测试总结', 'blue');
  log('='.repeat(50), 'blue');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\n通过: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 所有测试通过！系统完全可用！', 'green');
  } else {
    log('\n⚠️  部分测试失败，请检查日志', 'red');
  }
  
  log('\n详细结果:', 'blue');
  TEST_RESULTS.forEach(r => {
    const color = r.status === 'PASS' ? 'green' : 'red';
    log(`  ${r.status}: ${r.test}`, color);
    if (r.details) log(`    ${r.details}`, 'yellow');
  });
  
  process.exit(passed === total ? 0 : 1);
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});