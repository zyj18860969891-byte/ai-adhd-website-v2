#!/usr/bin/env node

console.log('🧪 简单测试 - 直接运行服务代码...');

try {
  // 直接导入和运行服务
  import('./dist/index.js').then(() => {
    console.log('✅ 服务模块加载成功');
  }).catch(error => {
    console.error('❌ 模块加载失败:', error);
  });
} catch (error) {
  console.error('❌ 启动失败:', error);
  console.error('堆栈:', error.stack);
}