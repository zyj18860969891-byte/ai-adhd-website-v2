import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default class ShrimpMCPClient extends EventEmitter {
  static DEFAULT_CONFIG = {
    timeout: {
      connection: 10000,
      request: 30000,
      toolCall: 60000,
      healthCheck: 5000,
      reconnect: 3000
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      maxRetryDelay: 10000
    },
    monitoring: {
      enabled: true,
      interval: 5000,
      thresholds: {
        errorRate: 0.1,
        avgResponseTime: 5000,
        consecutiveFailures: 5
      }
    },
    degradation: {
      enabled: true,
      levels: {
        full: 'full',
        simplified: 'simplified',
        minimal: 'minimal',
        offline: 'offline'
      },
      thresholds: {
        failureRate: 0.5,
        consecutiveFailures: 3
      }
    },
    ux: {
      enabled: true,
      feedback: {
        styles: {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
          progress: '🔄'
        }
      }
    }
  };

  constructor(scriptPath, config = {}) {
    super();
    this.scriptPath = scriptPath;
    this.config = this.loadConfig(config);
    this.state = {
      isConnected: false,
      degradationLevel: 'full',
      health: 'healthy',
      metrics: {
        uptime: 0,
        requests: 0,
        errors: 0,
        responseTime: []
      }
    };
    this.process = null;
  }

  loadConfig(userConfig) {
    return { ...ShrimpMCPClient.DEFAULT_CONFIG, ...userConfig };
  }

  async connect() {
    try {
      this.process = spawn('node', [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...this.config.spawnOptions || {}
      });
      this.state.isConnected = true;
      this.state.metrics.uptime = Date.now();
      this.emit('connected');
      this.showSuccess('Connected to MCP server');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async sendRequest(method, params = {}) {
    const timeout = this.config.timeout.request;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestId = Math.random().toString(36).substr(2, 9);
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };

      return new Promise((resolve, reject) => {
        const onData = (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.id === requestId) {
              this.process.stdout.off('data', onData);
              clearTimeout(timeoutId);
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
            }
          } catch (error) {
            reject(error);
          }
        };

        this.process.stdout.on('data', onData);
        this.process.stdin.write(JSON.stringify(request) + '\n');
      });
    } catch (error) {
      throw error;
    }
  }

  async callTool(toolName, args = {}) {
    return this.sendRequest('tools/call', {
      tool: toolName,
      args
    });
  }

  async healthCheck() {
    return this.sendRequest('health/check', {});
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.state.isConnected = false;
    this.emit('disconnected');
  }

  // 用户体验方法
  showSuccess(message) {
    if (!this.config.ux.enabled) return;
    console.log(`${this.config.ux.feedback.styles.success} ${message}`);
  }

  showError(message) {
    if (!this.config.ux.enabled) return;
    console.log(`${this.config.ux.feedback.styles.error} ${message}`);
  }

  showWarning(message) {
    if (!this.config.ux.enabled) return;
    console.log(`${this.config.ux.feedback.styles.warning} ${message}`);
  }

  showInfo(message) {
    if (!this.config.ux.enabled) return;
    console.log(`${this.config.ux.feedback.styles.info} ${message}`);
  }

  showProgress(message, progress = 0) {
    if (!this.config.ux.enabled) return;
    
    const barLength = 20;
    const filledLength = Math.round(barLength * progress);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const percentage = Math.round(progress * 100);
    
    process.stdout.write(`\r${this.config.ux.feedback.styles.progress} ${message} [${bar}] ${percentage}%`);
  }

  clearProgress() {
    if (!this.config.ux.enabled) return;
    process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
  }
}
