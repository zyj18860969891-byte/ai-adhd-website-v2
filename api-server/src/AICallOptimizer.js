export default class AICallOptimizer {
  constructor(config = {}) {
    this.config = {
      maxConcurrentCalls: 5,
      requestTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      degradationThreshold: 0.5,
      optimizationEnabled: true,
      ...config
    };
    
    this.activeCalls = new Map();
    this.callHistory = [];
    this.performanceMetrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    
    this.degradationLevel = 'full';
    this.optimizationRules = new Map();
    this.setupOptimizationRules();
  }

  setupOptimizationRules() {
    this.optimizationRules.set('concurrentLimit', (metrics) => {
      if (metrics.errorRate > this.config.degradationThreshold) {
        return Math.max(1, Math.floor(this.config.maxConcurrentCalls * 0.5));
      }
      return this.config.maxConcurrentCalls;
    });
    
    this.optimizationRules.set('timeoutAdjustment', (metrics) => {
      if (metrics.averageResponseTime > 20000) {
        return Math.min(60000, this.config.requestTimeout * 1.5);
      }
      return this.config.requestTimeout;
    });
    
    this.optimizationRules.set('retryStrategy', (metrics) => {
      if (metrics.errorRate > 0.3) {
        return {
          attempts: Math.max(1, this.config.retryAttempts - 1),
          delay: Math.min(5000, this.config.retryDelay * 2)
        };
      }
      return {
        attempts: this.config.retryAttempts,
        delay: this.config.retryDelay
      };
    });
  }

  async optimizeCall(callFunction, ...args) {
    if (!this.config.optimizationEnabled) {
      return callFunction(...args);
    }

    const startTime = Date.now();
    const callId = this.generateCallId();
    
    try {
      await this.waitForCallSlot();
      this.activeCalls.set(callId, { startTime, function: callFunction, args });
      
      const optimizedConfig = this.getOptimizedConfig();
      const result = await this.executeWithRetry(callFunction, args, optimizedConfig);
      
      this.recordCallSuccess(startTime);
      return result;
    } catch (error) {
      this.recordCallFailure(startTime, error);
      throw error;
    } finally {
      this.activeCalls.delete(callId);
      this.notifyCallAvailable();
    }
  }

  async waitForCallSlot() {
    const maxConcurrent = this.getCurrentConcurrentLimit();
    
    while (this.activeCalls.size >= maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async executeWithRetry(callFunction, args, config) {
    const { attempts, delay } = config.retryStrategy;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), config.timeout);
        });
        
        return await Promise.race([
          callFunction(...args),
          timeoutPromise
        ]);
      } catch (error) {
        if (attempt === attempts) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  getCurrentConcurrentLimit() {
    const rule = this.optimizationRules.get('concurrentLimit');
    return rule(this.performanceMetrics);
  }

  getOptimizedConfig() {
    return {
      timeout: this.optimizationRules.get('timeoutAdjustment')(this.performanceMetrics),
      retryStrategy: this.optimizationRules.get('retryStrategy')(this.performanceMetrics)
    };
  }

  generateCallId() {
    return Math.random().toString(36).substr(2, 9);
  }

  recordCallSuccess(startTime) {
    const responseTime = Date.now() - startTime;
    this.performanceMetrics.totalCalls++;
    this.performanceMetrics.successfulCalls++;
    
    this.updateAverageResponseTime(responseTime);
    this.updateErrorRate();
    this.recordCallHistory(responseTime, 'success');
  }

  recordCallFailure(startTime, error) {
    const responseTime = Date.now() - startTime;
    this.performanceMetrics.totalCalls++;
    this.performanceMetrics.failedCalls++;
    
    this.updateAverageResponseTime(responseTime);
    this.updateErrorRate();
    this.recordCallHistory(responseTime, 'failure', error.message);
  }

  updateAverageResponseTime(newResponseTime) {
    const { totalCalls, averageResponseTime } = this.performanceMetrics;
    this.performanceMetrics.averageResponseTime = 
      (averageResponseTime * (totalCalls - 1) + newResponseTime) / totalCalls;
  }

  updateErrorRate() {
    const { totalCalls, failedCalls } = this.performanceMetrics;
    this.performanceMetrics.errorRate = failedCalls / totalCalls;
  }

  recordCallHistory(responseTime, status, error = null) {
    this.callHistory.push({
      timestamp: Date.now(),
      responseTime,
      status,
      error,
      degradationLevel: this.degradationLevel
    });
    
    if (this.callHistory.length > 1000) {
      this.callHistory.shift();
    }
  }

  notifyCallAvailable() {
    // 可以在这里实现通知机制，比如事件发射
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      activeCalls: this.activeCalls.size,
      degradationLevel: this.degradationLevel
    };
  }

  getCallHistory(limit = 100) {
    return this.callHistory.slice(-limit);
  }

  resetMetrics() {
    this.performanceMetrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    this.callHistory = [];
  }

  updateDegradationLevel() {
    const errorRate = this.performanceMetrics.errorRate;
    
    if (errorRate > 0.7) {
      this.degradationLevel = 'minimal';
    } else if (errorRate > 0.4) {
      this.degradationLevel = 'simplified';
    } else if (errorRate > 0.2) {
      this.degradationLevel = 'degraded';
    } else {
      this.degradationLevel = 'full';
    }
  }
}