import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workDir = resolve(__dirname, '../mcp-shrimp-task-manager');

console.log('=== 诊断Shrimp MCP服务启动问题 ===');
console.log(`工作目录: ${workDir}`);
console.log(`入口文件: dist/index.js`);

// 启动Shrimp MCP服务进程，捕获所有输出
const process = spawn('node', ['dist/index.js'], {
  cwd: workDir,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...global.process.env,
    NODE_ENV: 'production',
    OPENAI_API_KEY: global.process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: global.process.env.OPENAI_MODEL || 'gpt-5-mini-2025-08-07',
    OPENAI_BASE_URL: global.process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    DATA_DIR: global.process.env.DATA_DIR || './data/shrimp'
  }
});

console.log(`进程PID: ${process.pid}`);

// 处理stdout数据
process.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[STDOUT] ${output}`);
});

// 处理stderr数据
process.stderr.on('data', (data) => {
  const output = data.toString();
  console.log(`[STDERR] ${output}`);
});

// 处理进程退出
process.on('exit', (code, signal) => {
  console.log(`\n[EXIT] 进程退出`);
  console.log(`  退出代码: ${code}`);
  console.log(`  退出信号: ${signal}`);
  
  if (code === 0) {
    console.log('  ✅ 正常退出');
  } else if (code === 1) {
    console.log('  ❌ 异常退出 (代码 1) - 通常是未捕获的异常');
    console.log('  可能的原因:');
    console.log('    - 缺少环境变量');
    console.log('    - 依赖模块未安装');
    console.log('    - 配置文件错误');
    console.log('    - 数据库连接失败');
  } else if (code === null) {
    console.log('  ⚠️  进程被终止 (代码 null) - 可能是信号终止');
  } else {
    console.log(`  ❌ 异常退出 (代码 ${code})`);
  }
});

// 处理进程错误
process.on('error', (error) => {
  console.log(`\n[ERROR] 进程错误: ${error.message}`);
  console.log('  可能的原因:');
  console.log('    - node命令不存在');
  console.log('    - 入口文件不存在');
  console.log('    - 权限问题');
});

// 5秒后如果没有退出，手动终止
setTimeout(() => {
  if (process.exitCode === null) {
    console.log('\n[INFO] 进程仍在运行，手动终止以进行诊断');
    process.kill('SIGTERM');
  }
}, 5000);