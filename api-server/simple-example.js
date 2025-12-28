import UnifiedShrimpService from './src/UnifiedShrimpService.js';

// 简单的使用示例
async function simpleExample() {
  console.log('🚀 启动统一服务...');
  
  // 创建服务实例
  const service = new UnifiedShrimpService('./stdio-mcp-client.js');
  
  try {
    // 启动服务
    await service.start();
    console.log('✅ 服务启动成功');
    
    // 等待一下让监控开始工作
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 检查服务状态
    const status = service.getServiceStatus();
    console.log('📊 服务状态:', {
      isRunning: status.isRunning,
      connected: status.clientConnected,
      health: status.health.currentHealth,
      performance: {
        totalCalls: status.performance.totalCalls,
        errorRate: status.performance.errorRate,
        degradationLevel: status.performance.degradationLevel
      }
    });
    
    // 停止服务
    await service.stop();
    console.log('🛑 服务已停止');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行示例
simpleExample().catch(console.error);