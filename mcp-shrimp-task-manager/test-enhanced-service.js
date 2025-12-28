import { spawn } from 'child_process';
import * as fs from 'fs';

// 创建测试日志文件
const logStream = fs.createWriteStream('test-enhanced-service.log', { flags: 'w' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

function sendRequest(process, request) {
  return new Promise((resolve, reject) => {
    const requestStr = JSON.stringify(request) + '\n';
    log(`Sending request: ${requestStr.trim()}`);
    process.stdin.write(requestStr);
    
    // 设置超时机制
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after 10 seconds: ${requestStr.trim()}`));
    }, 10000);
    
    // 监听响应
    const listener = (data) => {
      const responseStr = data.toString();
      log(`Received raw data: ${responseStr.trim()}`);
      
      try {
        const response = JSON.parse(responseStr);
        if (response.id === request.id) {
          clearTimeout(timeout);
          process.stdout.removeListener('data', listener);
          resolve(response);
        }
      } catch (error) {
        // 忽略解析错误，继续等待正确的响应
        log(`Parse error: ${error.message}`);
      }
    };
    
    process.stdout.on('data', listener);
  });
}

async function testEnhancedMCP() {
  log('Starting Enhanced MCP Service Test');
  
  // 启动增强版MCP服务
  const mcpProcess = spawn('node', ['dist/index-enhanced.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });
  
  // 监听服务输出
  mcpProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('Received raw data:')) {
      log(`Service output: ${output.trim()}`);
    }
  });
  
  mcpProcess.stderr.on('data', (data) => {
    log(`Service error: ${data.toString().trim()}`);
  });
  
  mcpProcess.on('close', (code) => {
    log(`Service exited with code ${code}`);
  });
  
  let requestId = 1;
  
  try {
    log('Waiting for service to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试1: 初始化请求
    log('\n=== Test 1: Initialize Request ===');
    const initRequest = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "Test Client",
          version: "1.0.0"
        }
      }
    };
    
    try {
      const initResponse = await sendRequest(mcpProcess, initRequest);
      log(`Initialize response: ${JSON.stringify(initResponse, null, 2)}`);
    } catch (error) {
      log(`Initialize request failed: ${error.message}`);
    }
    
    // 测试2: tools/list 请求
    log('\n=== Test 2: Tools/List Request ===');
    const listRequest = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/list",
      params: {}
    };
    
    try {
      const listResponse = await sendRequest(mcpProcess, listRequest);
      log(`Tools/list response: ${JSON.stringify(listResponse, null, 2)}`);
      
      if (listResponse.result && listResponse.result.tools) {
        log(`Successfully retrieved ${listResponse.result.tools.length} tools`);
      }
    } catch (error) {
      log(`Tools/list request failed: ${error.message}`);
    }
    
    // 测试3: 正确参数的 tools/call 请求
    log('\n=== Test 3: Tools/Call Request with Correct Parameters ===');
    const correctCallRequest = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "plan_task",
        arguments: {
          description: "创建一个简单的待办事项应用",
          requirements: "使用React和Node.js实现",
          existingTasksReference: false
        }
      }
    };
    
    try {
      const correctResponse = await sendRequest(mcpProcess, correctCallRequest);
      log(`Correct tools/call response: ${JSON.stringify(correctResponse, null, 2)}`);
    } catch (error) {
      log(`Correct tools/call request failed: ${error.message}`);
    }
    
    // 测试4: 错误参数的 tools/call 请求
    log('\n=== Test 4: Tools/Call Request with Invalid Parameters ===');
    const invalidCallRequest = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "plan_task",
        arguments: {
          description: "", // 空描述，应该触发验证错误
          requirements: "使用React和Node.js实现",
          existingTasksReference: false
        }
      }
    };
    
    try {
      const invalidResponse = await sendRequest(mcpProcess, invalidCallRequest);
      log(`Invalid tools/call response: ${JSON.stringify(invalidResponse, null, 2)}`);
    } catch (error) {
      log(`Invalid tools/call request failed: ${error.message}`);
    }
    
    // 测试5: 缺少参数的 tools/call 请求
    log('\n=== Test 5: Tools/Call Request with Missing Parameters ===');
    const missingCallRequest = {
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "plan_task",
        arguments: {
          description: "创建一个简单的待办事项应用"
          // 缺少 requirements 参数
        }
      }
    };
    
    try {
      const missingResponse = await sendRequest(mcpProcess, missingCallRequest);
      log(`Missing params tools/call response: ${JSON.stringify(missingResponse, null, 2)}`);
    } catch (error) {
      log(`Missing params tools/call request failed: ${error.message}`);
    }
    
    log('\n=== Test Summary ===');
    log('All tests completed. Check the logs above for detailed results.');
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`);
  } finally {
    // 关闭MCP服务
    mcpProcess.kill();
    logStream.end();
    log('Test completed. Check test-enhanced-service.log for detailed logs.');
  }
}

// 运行测试
testEnhancedMCP().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});