#!/usr/bin/env node

/**
 * 带错误处理的 ChurnFlow MCP 服务启动器
 */

console.log('🚀 启动 ChurnFlow MCP 服务（带错误处理）...');

// 设置全局错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  console.error('在 Promise:', promise);
  process.exit(1);
});

// 启动服务
import('./dist/index.js').then(({ main }) => {
  console.log('📡 导入 main 函数成功');
  
  main().then(() => {
    console.log('✅ main 函数执行完成');
    // 保持进程运行
    console.log('📡 服务正在运行，按 Ctrl+C 退出...');
    
    // 设置信号处理
    process.on('SIGINT', () => {
      console.log('📡 收到 SIGINT，正在关闭...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('📡 收到 SIGTERM，正在关闭...');
      process.exit(0);
    });
    
    // 定期心跳
    setInterval(() => {
      console.log('📡 服务心跳...');
    }, 30000);
    
  }).catch(error => {
    console.error('❌ main 函数执行失败:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
  
}).catch(error => {
  console.error('❌ 导入失败:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});