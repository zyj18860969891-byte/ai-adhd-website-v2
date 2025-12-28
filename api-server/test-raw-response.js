import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testRawResponse() {
  console.log('=== 测试Shrimp MCP原始响应 ===');
  
  // 直接使用child_process测试，查看原始输出
  const servicePath = path.resolve(__dirname, '../../mcp-shrimp-task-manager');
  const child = spawn('node', ['dist/index.js'], {
    cwd: servicePath,
    env: {
      ...global.process.env,
      OPENAI_API_KEY: global.process.env.OPENAI_API_KEY || 'mock-key',
      OPENAI_MODEL: global.process.env.OPENAI_MODEL || 'gpt-4',
      OPENAI_BASE_URL: global.process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      DATA_DIR: path.join(servicePath, 'data/shrimp')
    }
  });

  let buffer = '';
  let requestId = 1;

  child.stdout.on('data', (data) => {
    const text = data.toString();
    buffer += text;
    console.log('[RAW STDOUT]', text);
    
    // 尝试解析JSON行
    const lines = buffer.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const json = JSON.parse(line);
          console.log('[PARSED JSON]', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('[PARSE ERROR]', e.message);
        }
      }
    }
    buffer = lines[lines.length - 1];
  });

  child.stderr.on('data', (data) => {
    console.log('[STDERR]', data.toString());
  });

  child.on('exit', (code) => {
    console.log(`[EXIT] Process exited with code ${code}`);
  });

  // 等待服务启动
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 发送测试请求
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'split_tasks',
      arguments: {
        updateMode: 'clearAllTasks',
        tasksRaw: JSON.stringify([
          {
            "name": "简单测试任务",
            "description": "创建一个测试功能",
            "implementationGuide": "1. 测试步骤1\n2. 测试步骤2",
            "notes": "这是一个测试",
            "dependencies": [],
            "relatedFiles": [],
            "verificationCriteria": "功能可用"
          }
        ]),
        globalAnalysisResult: ''
      }
    }
  };

  console.log('\n[SENDING REQUEST]', JSON.stringify(request, null, 2));
  child.stdin.write(JSON.stringify(request) + '\n');

  // 等待响应
  await new Promise(resolve => setTimeout(resolve, 120000)); // 2分钟
  
  child.kill();
  console.log('\n测试完成');
}

testRawResponse();