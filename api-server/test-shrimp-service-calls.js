import UnifiedShrimpService from './src/UnifiedShrimpService.js';

async function testShrimpServiceCalls() {
  console.log('🚀 开始测试Shrimp MCP服务调用...');
  
  try {
    // 创建服务实例
    const service = new UnifiedShrimpService('./stdio-mcp-client.js');
    
    // 启动服务
    console.log('📡 启动Shrimp MCP服务...');
    await service.start();
    console.log('✅ 服务启动成功');
    
    // 等待连接稳定
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. 测试健康检查
    console.log('\n🏥 测试健康检查...');
    try {
      const health = await service.healthCheck();
      console.log('✅ 健康检查结果:', JSON.stringify(health, null, 2));
    } catch (error) {
      console.log('⚠️ 健康检查失败:', error.message);
    }
    
    // 2. 测试列出可用工具
    console.log('\n🔧 测试列出可用工具...');
    try {
      const tools = await service.callTool('list_tools', {});
      console.log('✅ 可用工具列表:', JSON.stringify(tools, null, 2));
    } catch (error) {
      console.log('⚠️ 列出工具失败:', error.message);
    }
    
    // 3. 测试echo工具
    console.log('\n📢 测试echo工具...');
    try {
      const echoResult = await service.callTool('echo', { 
        message: 'Hello from Shrimp MCP Service!',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Echo结果:', JSON.stringify(echoResult, null, 2));
    } catch (error) {
      console.log('⚠️ Echo工具调用失败:', error.message);
    }
    
    // 4. 测试多个并发调用
    console.log('\n⚡ 测试并发调用...');
    const concurrentCalls = [];
    for (let i = 1; i <= 3; i++) {
      concurrentCalls.push(
        service.callTool('echo', { 
          message: `并发调用 ${i}`,
          id: i
        })
      );
    }
    
    try {
      const results = await Promise.all(concurrentCalls);
      console.log('✅ 并发调用结果:', results.map((r, i) => `调用${i+1}: ${JSON.stringify(r)}`).join('\n'));
    } catch (error) {
      console.log('⚠️ 并发调用失败:', error.message);
    }
    
    // 5. 测试错误处理
    console.log('\n❌ 测试错误处理...');
    try {
      const errorResult = await service.callTool('nonexistent_tool', { param: 'test' });
      console.log('❌ 意外成功:', errorResult);
    } catch (error) {
      console.log('✅ 错误处理正常:', error.message);
    }
    
    // 6. 显示服务状态
    console.log('\n📊 服务状态报告...');
    const status = service.getServiceStatus();
    console.log('运行状态:', status.isRunning ? '运行中' : '已停止');
    console.log('连接状态:', status.clientConnected ? '已连接' : '未连接');
    console.log('健康状态:', status.health.currentHealth);
    console.log('性能指标:');
    console.log('  - 总调用次数:', status.performance.totalCalls);
    console.log('  - 成功调用:', status.performance.successfulCalls);
    console.log('  - 失败调用:', status.performance.failedCalls);
    console.log('  - 错误率:', (status.performance.errorRate * 100).toFixed(2) + '%');
    console.log('  - 平均响应时间:', status.performance.averageResponseTime.toFixed(2) + 'ms');
    console.log('  - 降级级别:', status.performance.degradationLevel);
    
    // 7. 显示调用历史
    console.log('\n📜 调用历史...');
    const history = service.getCallHistory(10);
    history.forEach((call, index) => {
      console.log(`${index + 1}. [${call.status}] ${call.timestamp}: ${call.responseTime}ms`);
      if (call.error) {
        console.log(`   错误: ${call.error}`);
      }
    });
    
    // 8. 测试配置更新
    console.log('\n⚙️ 测试配置更新...');
    service.updateConfig({
      optimization: {
        maxConcurrentCalls: 2,
        degradationThreshold: 0.2
      }
    });
    console.log('✅ 配置更新成功');
    
    // 9. 测试重置指标
    console.log('\n🔄 测试重置指标...');
    service.resetMetrics();
    console.log('✅ 指标重置成功');
    
    // 10. 最终状态检查
    console.log('\n📊 最终状态检查...');
    const finalStatus = service.getServiceStatus();
    console.log('运行时间:', finalStatus.health.uptime + 'ms');
    console.log('当前配置 - 最大并发数:', finalStatus.config.optimization.maxConcurrentCalls);
    console.log('当前配置 - 降级阈值:', finalStatus.config.optimization.degradationThreshold);
    
    // 停止服务
    console.log('\n🛑 停止服务...');
    await service.stop();
    console.log('✅ 服务停止成功');
    
    console.log('\n🎉 Shrimp MCP服务调用测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testShrimpServiceCalls().catch(console.error);