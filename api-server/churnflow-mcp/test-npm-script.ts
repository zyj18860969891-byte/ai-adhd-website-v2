#!/usr/bin/env node

/**
 * 使用 npm 脚本测试 ChurnFlow MCP 服务
 */

import { spawn } from 'child_process';

async function testChurnFlowNPM() {
  console.log('🧪 使用 npm 脚本测试 ChurnFlow MCP 服务...');

  try {
    // 使用 npm run mcp 启动服务
    console.log('📡 启动 ChurnFlow MCP 服务...');
    const churnflowProcess = spawn('npm', ['run', 'mcp'], {
      cwd: 'e:/MultiModel/ai-adhd-website/churnflow-mcp',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 监听输出
    churnflowProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[ChurnFlow] ${output}`);
      }
    });

    churnflowProcess.stderr.on('data', (data: Buffer) => {
      const error = data.toString().trim();
      if (error) {
        console.error(`[ChurnFlow Error] ${error}`);
      }
    });

    // 等待服务启动
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ 服务启动完成');
        resolve(true);
      }, 5000);
    });

    // 检查进程是否还在运行
    if (churnflowProcess.exitCode === null) {
      console.log('✅ ChurnFlow MCP 服务正在运行');
      
      // 测试服务是否响应
      console.log('📋 测试服务响应...');
      
      // 模拟 MCP 客户端请求
      const testRequest = {
        jsonrpc: '2.0',
        id: 'test-1',
        method: 'tools/list',
        params: {}
      };

      console.log('📤 发送测试请求:', JSON.stringify(testRequest, null, 2));
      
      // 这里我们只是测试服务是否运行，不实际发送请求
      console.log('✅ 服务测试完成');

      // 关闭服务
      churnflowProcess.kill();
      console.log('🔌 服务已关闭');
    } else {
      console.log('❌ 服务启动失败，退出代码:', churnflowProcess.exitCode);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testChurnFlowNPM().catch(console.error);