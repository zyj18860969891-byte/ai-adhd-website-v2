import { EventEmitter } from 'events';

export default class ServiceMonitor extends EventEmitter {
  constructor(client, config = {}) {
    super();
    this.client = client;
    this.config = {
      enabled: true,
      interval: 5000,
      thresholds: {
        errorRate: 0.1,
        avgResponseTime: 5000,
        consecutiveFailures: 5,
        memoryUsage: 0.8,
        cpuUsage: 0.8
      },
      ...config
    };
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      errorHistory: [],
      healthChecks: []
    };
    this.isMonitoring = false;
    this.monitorInterval = null;
  }

  start() {
    if (!this.config.enabled) return;
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeHealth();
    }, this.config.interval);
    
    this.emit('monitoringStarted');
  }

  stop() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.emit('monitoringStopped');
  }

  async collectMetrics() {
    try {
      const health = await this.client.healthCheck();
      const responseTime = Date.now() - this.lastHealthCheckTime || 0;
      
      this.metrics.healthChecks.push({
        timestamp: Date.now(),
        status: health.status,
        responseTime,
        details: health.details
      });
      
      this.metrics.responseTimes.push(responseTime);
      if (this.metrics.responseTimes.length > 100) {
        this.metrics.responseTimes.shift();
      }
      
      this.lastHealthCheckTime = Date.now();
    } catch (error) {
      this.metrics.totalErrors++;
      this.metrics.errorHistory.push({
        timestamp: Date.now(),
        error: error.message,
        type: 'healthCheck'
      });
    }
  }

  analyzeHealth() {
    const recentErrors = this.metrics.errorHistory.filter(
      error => Date.now() - error.timestamp < 60000
    );
    
    const recentHealthChecks = this.metrics.healthChecks.slice(-10);
    const recentFailures = recentHealthChecks.filter(
      check => check.status !== 'healthy'
    );
    
    const errorRate = recentErrors.length / Math.max(1, recentErrors.length + recentHealthChecks.length);
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;
    
    const healthStatus = this.calculateHealthStatus(errorRate, avgResponseTime, recentFailures.length);
    
    if (healthStatus !== this.currentHealthStatus) {
      this.currentHealthStatus = healthStatus;
      this.emit('healthChanged', {
        status: healthStatus,
        metrics: {
          errorRate,
          avgResponseTime,
          recentFailures: recentFailures.length,
          uptime: Date.now() - this.metrics.startTime
        }
      });
    }
    
    this.emit('metricsUpdate', {
      errorRate,
      avgResponseTime,
      recentFailures: recentFailures.length,
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.totalErrors,
      uptime: Date.now() - this.metrics.startTime
    });
  }

  calculateHealthStatus(errorRate, avgResponseTime, recentFailures) {
    if (errorRate > this.config.thresholds.errorRate) {
      return 'degraded';
    }
    
    if (avgResponseTime > this.config.thresholds.avgResponseTime) {
      return 'slow';
    }
    
    if (recentFailures >= this.config.thresholds.consecutiveFailures) {
      return 'unstable';
    }
    
    return 'healthy';
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      currentHealth: this.currentHealthStatus || 'unknown'
    };
  }

  resetMetrics() {
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      errorHistory: [],
      healthChecks: []
    };
    this.emit('metricsReset');
  }
}
