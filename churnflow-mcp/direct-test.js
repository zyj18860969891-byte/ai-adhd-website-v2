#!/usr/bin/env node

console.log('🎯 直接测试 - 调用 main 函数...');

// 直接导入并调用 main
import('./dist/index.js').then(({ main }) => {
  console.log('✅ main 函数导入成功');
  console.log('🚀 开始调用 main()...');
  
  main().then(() => {
    console.log('✅ main 函数执行完成');
  }).catch(error => {
    console.error('❌ main 函数执行失败:', error);
    console.error('堆栈:', error.stack);
  });
}).catch(error => {
  console.error('❌ 导入失败:', error);
  console.error('堆栈:', error.stack);
});