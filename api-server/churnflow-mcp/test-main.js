#!/usr/bin/env node

/**
 * 直接测试 main 函数
 */

console.log('🧪 直接测试 main 函数...');

async function testMain() {
  try {
    // 导入 main 函数
    const { main } = await import('./dist/index.js');
    
    console.log('📡 调用 main() 函数...');
    await main();
    
    console.log('✅ main() 函数执行完成');
    
  } catch (error) {
    console.error('❌ main() 函数执行失败:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMain().catch(error => {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
});