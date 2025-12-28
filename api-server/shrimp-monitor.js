#!/usr/bin/env node

/**
 * Shrimp MCP服务监控脚本
 * 实时监控服务状态、性能和健康指标
 */

import StdioMCPClient from './src/stdio-mcp-client.js';

class ShrimpServiceMonitor {
  constructor() {
    this.client = null;
    this.monitoring = false;
    this.stats = {
      startTime: Date.now(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      lastHealthCheck: null,
      errors: []
    };
  }

  async initialize() {
    console.log('🔍 初始化Shrimp MCP服务监控...');
    
    this.client = new StdioMCPClient('../../mcp-shrimp-task-manager', {
      cwd: '../mcp-shrimp-task-manager',
      maxRetries: 3,
      baseTimeout: 300000,
      retryDelay: 2000
    });

    // 初始健康检查
    try {
      const health = await this.client.healthCheck();
      this.stats.lastHealthCheck = health;
      console.log('✅ 初始健康检查通过:', health);
    } catch (error) {
      console.error('❌ 初始健康检查失败:', error.message);
      this.stats.errors.push({
        time: new Date().toISOString(),
        type: 'initial_health_check',
        message: error.message
      });
    }
  }

  async startMonitoring() {
    this.monitoring = true;
    console.log('📊 开始监控Shrimp MCP服务...\n');

    // 定期健康检查（每30秒）
    const healthCheckInterval = setInterval(async () => {
      if (!this.monitoring) {
        clearInterval(healthCheckInterval);
        return;
      }

      try {
        const health = await this.client.healthCheck();
        this.stats.lastHealthCheck = health;
        this.displayHealthStatus(health);
      } catch (error) {
        console.error('❌ 健康检查失败:', error.message);
        this.stats.failedRequests++;
        this.stats.errors.push({
          time: new Date().toISOString(),
          type: 'health_check',
          message: error.message
        });
      }
    }, 30000);

    // 定期性能测试（每2分钟）
    const performanceTestInterval = setInterval(async () => {
      if (!this.monitoring) {
        clearInterval(performanceTestInterval);
        return;
      }

      await this.runPerformanceTest();
    }, 120000);

    // 显示监控仪表板（每10秒）
    const dashboardInterval = setInterval(() => {
      if (!this.monitoring) {
        clearInterval(dashboardInterval);
        return;
      }

      this.displayDashboard();
    }, 10000);

    console.log('🚀 监控已启动');
    console.log('   - 健康检查: 每30秒');
    console.log('   - 性能测试: 每2分钟');
    console.log('   - 仪表板更新: 每10秒');
    console.log('按 Ctrl+C 停止监控\n');
  }

  async runPerformanceTest() {
    console.log('⚡ 运行性能测试...');
    
    try {
      // 测试list_tasks（简单操作）
      const startTime = Date.now();
      const result = await this.client.callTool('list_tasks', {});
      const responseTime = Date.now() - startTime;
      
      this.stats.totalRequests++;
      this.stats.successfulRequests++;
      this.stats.totalResponseTime += responseTime;

      console.log(`✅ list_tasks响应时间: ${responseTime}ms`);
      
      // 如果有任务，测试split_tasks（复杂操作）
      if (result.tasks && result.tasks.length > 0) {
        const splitStartTime = Date.now();
        await this.client.callTool('split_tasks', {
          updateMode: "append",
          tasksRaw: JSON.stringify([{
            name: "性能测试任务",
            description: "这是一个性能测试任务",
            implementationGuide: "测试用",
            dependencies: []
          }])
        });
        const splitResponseTime = Date.now() - splitStartTime;
        
        this.stats.totalRequests++;
        this.stats.successfulRequests++;
        this.stats.totalResponseTime += splitResponseTime;

        console.log(`✅ split_tasks响应时间: ${splitResponseTime}ms`);
      }
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error.message);
      this.stats.failedRequests++;
      this.stats.errors.push({
        time: new Date().toISOString(),
        type: 'performance_test',
        message: error.message
      });
    }
  }

  displayHealthStatus(health) {
    const status = health.healthy ? '✅ 健康' : '❌ 不健康';
    const uptime = Math.floor(health.uptime / 1000);
    const errorRate = health.requestCount > 0 ? 
      ((health.errorCount / health.requestCount) * 100).toFixed(2) : '0.00';
    
    console.log(`🏥 健康状态: ${status}`);
    console.log(`  运行时间: ${uptime}秒`);
    console.log(`  请求数: ${health.requestCount}`);
    console.log(`  错误数: ${health.errorCount}`);
    console.log(`  错误率: ${errorRate}%`);
    console.log(`  内存使用: ${health.memoryUsage.heapUsed}MB/${health.memoryUsage.heapTotal}MB`);
    console.log('');
  }

  displayDashboard() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const avgResponseTime = this.stats.successfulRequests > 0 ?
      Math.floor(this.stats.totalResponseTime / this.stats.successfulRequests) : 0;
    const successRate = this.stats.totalRequests > 0 ?
      ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2) : '100.00';

    console.clear();
    console.log('📊 Shrimp MCP服务监控仪表板');
    console.log('==============================');
    console.log(`监控运行时间: ${uptime}秒`);
    console.log(`总请求数: ${this.stats.totalRequests}`);
    console.log(`成功请求: ${this.stats.successfulRequests}`);
    console.log(`失败请求: ${this.stats.failedRequests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`平均响应时间: ${avgResponseTime}ms`);
    
    if (this.stats.lastHealthCheck) {
      const health = this.stats.lastHealthCheck;
      console.log(`\n🔍 最后健康检查:`);
      console.log(`  状态: ${health.healthy ? '✅ 健康' : '❌ 不健康'}`);
      console.log(`  服务运行时间: ${Math.floor(health.uptime / 1000)}秒`);
      console.log(`  服务错误率: ${health.requestCount > 0 ? 
        ((health.errorCount / health.requestCount) * 100).toFixed(2) : '0.00'}%`);
      console.log(`  内存: ${health.memoryUsage.heapUsed}MB/${health.memoryUsage.heapTotal}MB`);
    }

    if (this.stats.errors.length > 0) {
      console.log(`\n⚠️  最近错误 (${this.stats.errors.length}):`);
      this.stats.errors.slice(-3).forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.time}] ${error.type}: ${error.message.substring(0, 50)}...`);
      });
    }

    console.log('\n按 Ctrl+C 停止监控');
  }

  async stopMonitoring() {
    this.monitoring = false;
    console.log('\n🛑 停止监控...');
    
    if (this.client) {
      await this.client.disconnect();
    }

    console.log('📈 最终统计:');
    console.log(`  总请求数: ${this.stats.totalRequests}`);
    console.log(`  成功: ${this.stats.successfulRequests}`);
    console.log(`  失败: ${this.stats.failedRequests}`);
    console.log(`  成功率: ${this.stats.totalRequests > 0 ? 
      ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2) : '0.00'}%`);
    console.log(`  总错误数: ${this.stats.errors.length}`);
  }
}

// 主函数
async function main() {
  const monitor = new ShrimpServiceMonitor();
  
  // 处理Ctrl+C
  process.on('SIGINT', async () => {
    await monitor.stopMonitoring();
    process.exit(0);
  });

  try {
    await monitor.initialize();
    await monitor.startMonitoring();
  } catch (error) {
    console.error('监控启动失败:', error);
    process.exit(1);
  }
}

// 运行监控
main().catch(console.error);