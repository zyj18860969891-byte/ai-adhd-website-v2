const https = require('https');

function testShrimp(action, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ action, data });
    const options = {
      hostname: 'ai-adhd-website-v2-production.up.railway.app',
      port: 443,
      path: '/api/mcp/shrimp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runFullShrimpTests() {
  console.log('\n=== 🦐 Shrimp MCP 16 功能完整测试 ===\n');
  
  const tests = [
    { name: 'plan_task', data: { title: '测试计划', description: '详细描述' } },
    { name: 'analyze_task', data: { task: '分析这个任务' } },
    { name: 'intelligent_task_analysis', data: { input: '智能分析输入' } },
    { name: 'reflect_task', data: { taskId: '1', reflection: '反思内容' } },
    { name: 'split_tasks', data: { parentTask: '父任务', subtasks: ['子1', '子2'] } },
    { name: 'list_tasks', data: {} },
    { name: 'execute_task', data: { taskId: '1' } },
    { name: 'verify_task', data: { taskId: '1' } },
    { name: 'delete_task', data: { id: '1' } },
    { name: 'clear_all_tasks', data: {} },
    { name: 'update_task', data: { id: '1', completed: true } },
    { name: 'query_task', data: { id: '1' } },
    { name: 'get_task_detail', data: { id: '1' } },
    { name: 'process_thought', data: { thought: '处理思路' } },
    { name: 'init_project_rules', data: { projectName: '测试项目' } },
    { name: 'research_mode', data: { topic: '研究主题' } }
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      const result = await testShrimp(test.name, test.data);
      const status = result.status >= 200 && result.status < 300 ? '✅' : '❌';
      results.push({ name: test.name, status: status, code: result.status });
      if (result.status >= 200 && result.status < 300) passed++; else failed++;
    } catch (error) {
      results.push({ name: test.name, status: '❌', code: 'ERROR' });
      failed++;
    }
  }

  console.log('功能测试结果:');
  results.forEach((r, i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')} ${r.status} ${r.name.padEnd(30, ' ')} [${r.code}]`);
  });

  console.log(`\n📊 总计: ${tests.length} | 通过: ${passed} | 失败: ${failed} | 成功率: ${Math.round(passed/tests.length*100)}%`);
}

runFullShrimpTests().catch(console.error);
