import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export default class StdioMCPClient extends EventEmitter {
  constructor(scriptPath, options = {}) {
    super();
    this.scriptPath = scriptPath;
    this.options = {
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
      ...options
    };
    this.state = {
      isConnected: false,
      degradationLevel: 'full',
      health: 'healthy'
    };
    this.process = null;
    this.requestId = 0;
  }

  async connect() {
    try {
      this.process = spawn('node', [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...this.options.spawnOptions || {}
      });
      
      this.process.on('error', (error) => {
        this.emit('error', error);
      });
      
      this.process.on('exit', (code) => {
        this.state.isConnected = false;
        this.emit('disconnected');
      });
      
      // 设置超时
      const timeoutTimer = setTimeout(() => {
        if (!this.state.isConnected) {
          this.emit('error', new Error('Connection timeout'));
        }
      }, this.options.timeout.connection);
      
      this.process.on('error', (error) => {
        clearTimeout(timeoutTimer);
        this.emit('error', error);
      });
      
      this.process.on('exit', (code) => {
        clearTimeout(timeoutTimer);
        this.state.isConnected = false;
        this.emit('disconnected');
      });
      
      this.state.isConnected = true;
      clearTimeout(timeoutTimer);
      this.emit('connected');
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.options.timeout.request);
      
      const requestId = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };
      
      const onData = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === requestId) {
            this.process.stdout.off('data', onData);
            clearTimeout(timeout);
            
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
}
