import UnifiedShrimpService from './src/UnifiedShrimpService.js';

async function comprehensiveTest() {
  console.log('🚀 开始全面测试统一服务...');
  
  try {
    // 创建服务实例
    const service = new UnifiedShrimpService('./stdio-mcp-client.js');
    
    // 显示初始状态
    console.log('📊 初始状态:');
    const initialStatus = service.getServiceStatus();
    console.log(`- 运行状态: ${initialStatus.isRunning ? '运行中' : '已停止'}`);
    console.log(`- 连接状态: ${initialStatus.clientConnected ? '已连接' : '未连接'}`);
    console.log(`- 健康状态: ${initialStatus.health.currentHealth}`);
    console.log(`- 性能指标: 错误率 ${initialStatus.performance.errorRate}, 降级级别 ${initialStatus.performance.degradationLevel}`);
    
    // 启动服务
    console.log('\n🚀 启动服务...');
    await service.start();
    console.log('✅ 服务启动成功');
    
    // 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 显示服务状态
    console.log('\n📊 服务启动后状态:');
    const runningStatus = service.getServiceStatus();
    console.log(`- 运行状态: ${runningStatus.isRunning ? '运行中' : '已停止'}`);
    console.log(`- 连接状态: ${runningStatus.clientConnected ? '已连接' : '未连接'}`);
    console.log(`- 健康状态: ${runningStatus.health.currentHealth}`);
    console.log(`- 性能指标: 错误率 ${runningStatus.performance.errorRate}, 降级级别 ${runningStatus.performance.degradationLevel}`);
    
    // 测试健康检查
    console.log('\n🏥 执行健康检查...');
    try {
      const health = await service.healthCheck();
      console.log('✅ 健康检查成功:', health);
    } catch (error) {
      console.log('⚠️ 健康检查失败:', error.message);
    }
    
    // 测试工具调用
    console.log('\n🔧 测试工具调用...');
    try {
      const result = await service.callTool('echo', { message: 'Hello from unified service!' });
      console.log('✅ 工具调用成功:', result);
    } catch (error) {
      console.log('⚠️ 工具调用失败:', error.message);
    }
    
    // 显示性能指标
    console.log('\n📈 性能指标:');
    const performance = service.getCallHistory();
    console.log(`- 总调用次数: ${performance.length}`);
    if (performance.length > 0) {
      const latest = performance[performance.length - 1];
      console.log(`- 最新调用状态: ${latest.status}`);
      console.log(`- 最新响应时间: ${latest.responseTime}ms`);
    }
    
    // 测试配置更新
    console.log('\n⚙️ 测试配置更新...');
    service.updateConfig({
      optimization: {
        maxConcurrentCalls: 3,
        degradationThreshold: 0.3
      }
    });
    console.log('✅ 配置更新成功');
    
    // 显示更新后的配置
    console.log('\n📊 更新后的配置:');
    const updatedStatus = service.getServiceStatus();
    console.log(`- 最大并发数: ${updatedStatus.config.optimization.maxConcurrentCalls}`);
    console.log(`- 降级阈值: ${updatedStatus.config.optimization.degradationThreshold}`);
    
    // 重置指标
    console.log('\n🔄 重置指标...');
    service.resetMetrics();
    console.log('✅ 指标重置成功');
    
    // 显示重置后的状态
    console.log('\n📊 重置后的状态:');
    const resetStatus = service.getServiceStatus();
    console.log(`- 总调用次数: ${resetStatus.performance.totalCalls}`);
    console.log(`- 错误率: ${resetStatus.performance.errorRate}`);
    
    // 停止服务
    console.log('\n🛑 停止服务...');
    await service.stop();
    console.log('✅ 服务停止成功');
    
    // 显示最终状态
    console.log('\n📊 最终状态:');
    const finalStatus = service.getServiceStatus();
    console.log(`- 运行状态: ${finalStatus.isRunning ? '运行中' : '已停止'}`);
    console.log(`- 连接状态: ${finalStatus.clientConnected ? '已连接' : '未连接'}`);
    console.log(`- 运行时间: ${finalStatus.health.uptime}ms`);
    
    console.log('\n✅ 全面测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
comprehensiveTest().catch(console.error);