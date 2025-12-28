import UnifiedShrimpService from './src/UnifiedShrimpService.js';

async function testUnifiedService() {
  console.log('🔄 开始测试统一服务...');
  
  try {
    // 创建服务实例
    const service = new UnifiedShrimpService('./stdio-mcp-client.js');
    
    // 显示初始状态
    console.log('📊 初始状态:');
    console.log(JSON.stringify(service.getServiceStatus(), null, 2));
    
    // 启动服务
    console.log('🚀 启动服务...');
    await service.start();
    
    // 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 显示服务状态
    console.log('📊 服务启动后状态:');
    console.log(JSON.stringify(service.getServiceStatus(), null, 2));
    
    // 测试健康检查
    console.log('🏥 执行健康检查...');
    try {
      const health = await service.healthCheck();
      console.log('✅ 健康检查结果:', health);
    } catch (error) {
      console.log('⚠️ 健康检查失败:', error.message);
    }
    
    // 测试工具调用（如果可用）
    console.log('🔧 测试工具调用...');
    try {
      const result = await service.callTool('echo', { message: 'Hello from unified service!' });
      console.log('✅ 工具调用结果:', result);
    } catch (error) {
      console.log('⚠️ 工具调用失败:', error.message);
    }
    
    // 显示性能指标
    console.log('📈 性能指标:');
    console.log(JSON.stringify(service.getCallHistory(), null, 2));
    
    // 运行一段时间以收集更多指标
    console.log('⏳ 运行30秒收集指标...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 显示最终状态
    console.log('📊 最终状态:');
    console.log(JSON.stringify(service.getServiceStatus(), null, 2));
    
    // 停止服务
    console.log('🛑 停止服务...');
    await service.stop();
    
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testUnifiedService().catch(console.error);