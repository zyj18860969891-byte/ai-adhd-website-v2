import ShrimpMCPClient from './ShrimpMCPClient.js';
import ServiceMonitor from './ServiceMonitor.js';
import AICallOptimizer from './AICallOptimizer.js';
import config from '../config/development.json' with { type: 'json' };

export default class UnifiedShrimpService {
  constructor(scriptPath, customConfig = {}) {
    this.scriptPath = scriptPath;
    this.config = { ...config, ...customConfig };
    
    this.client = new ShrimpMCPClient(scriptPath, this.config.client);
    this.monitor = new ServiceMonitor(this.client, this.config.monitoring);
    this.optimizer = new AICallOptimizer(this.config.optimization);
    
    this.isRunning = false;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.monitor.on('healthChanged', (healthData) => {
      console.log(`Health status changed to: ${healthData.status}`);
      this.optimizer.updateDegradationLevel();
    });

    this.monitor.on('metricsUpdate', (metrics) => {
      console.log(`Metrics updated - Error rate: ${metrics.errorRate.toFixed(2)}, Avg response: ${metrics.avgResponseTime}ms`);
    });

    this.client.on('error', (error) => {
      console.error('Client error:', error.message);
      this.optimizer.recordCallFailure(Date.now(), error);
    });

    this.client.on('connected', () => {
      console.log('Connected to MCP server');
    });

    this.client.on('disconnected', () => {
      console.log('Disconnected from MCP server');
    });
  }

  async start() {
    if (this.isRunning) return;
    
    try {
      await this.client.connect();
      this.monitor.start();
      this.isRunning = true;
      
      console.log('Unified Shrimp Service started successfully');
      console.log(`Configuration loaded: ${JSON.stringify(this.config, null, 2)}`);
      
    } catch (error) {
      console.error('Failed to start service:', error.message);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;
    
    try {
      this.monitor.stop();
      await this.client.disconnect();
      this.isRunning = false;
      
      console.log('Unified Shrimp Service stopped');
      
    } catch (error) {
      console.error('Error during service shutdown:', error.message);
      throw error;
    }
  }

  async callTool(toolName, args = {}) {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }

    const optimizedCall = async () => {
      return this.client.callTool(toolName, args);
    };

    return this.optimizer.optimizeCall(optimizedCall);
  }

  async sendRequest(method, params = {}) {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }

    const optimizedCall = async () => {
      return this.client.sendRequest(method, params);
    };

    return this.optimizer.optimizeCall(optimizedCall);
  }

  async healthCheck() {
    if (!this.isRunning) {
      throw new Error('Service is not running');
    }

    return this.client.healthCheck();
  }

  getServiceStatus() {
    return {
      isRunning: this.isRunning,
      clientConnected: this.client.state.isConnected,
      health: this.monitor.getMetrics(),
      performance: this.optimizer.getPerformanceMetrics(),
      config: this.config
    };
  }

  getCallHistory(limit = 100) {
    return this.optimizer.getCallHistory(limit);
  }

  resetMetrics() {
    this.monitor.resetMetrics();
    this.optimizer.resetMetrics();
    console.log('Metrics reset successfully');
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.client) {
      this.client.config = this.client.loadConfig(this.config.client);
    }
    
    if (this.monitor) {
      this.monitor.config = { ...this.monitor.config, ...this.config.monitoring };
    }
    
    if (this.optimizer) {
      this.optimizer.config = { ...this.optimizer.config, ...this.config.optimization };
    }
    
    console.log('Configuration updated successfully');
  }
}

// 使用示例
/*
const service = new UnifiedShrimpService('./stdio-mcp-client.js');

// 启动服务
await service.start();

// 调用工具
try {
  const result = await service.callTool('some-tool', { param1: 'value1' });
  console.log('Tool call result:', result);
} catch (error) {
  console.error('Tool call failed:', error.message);
}

// 检查服务状态
const status = service.getServiceStatus();
console.log('Service status:', status);

// 停止服务
await service.stop();
*/