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
    return new Promise((resolve, reject) => {
      try {
        console.log(`[StdioMCPClient] Spawning: node ${this.scriptPath}`);
        
        this.process = spawn('node', [this.scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          ...this.options.spawnOptions || {}
        });

        // 错误处理
        this.process.on('error', (error) => {
          console.error(`[StdioMCPClient] Spawn error:`, error.message);
          this.emit('error', error);
          reject(error);
        });

        // 进程退出
        this.process.on('exit', (code, signal) => {
          console.log(`[StdioMCPClient] Process exited with code ${code}, signal ${signal}`);
          this.state.isConnected = false;
          this.emit('disconnected');
        });

        // 收集启动日志（用于调试）
        const startupLogs = [];
        this.process.stderr.on('data', (data) => {
          const log = data.toString().trim();
          if (log) {
            startupLogs.push(log);
            console.log(`[MCP ${this.scriptPath}] ${log}`);
          }
        });

        // 等待 MCP 服务准备好
        const timeoutTimer = setTimeout(() => {
          console.error(`[StdioMCPClient] Connection timeout after ${this.options.timeout.connection}ms`);
          console.error(`[StdioMCPClient] Startup logs:`, startupLogs);
          this.emit('error', new Error('Connection timeout - MCP service did not start'));
          reject(new Error('Connection timeout'));
        }, this.options.timeout.connection);

        // 监听 stdout，等待初始化完成
        const onStdout = (data) => {
          const output = data.toString();
          console.log(`[StdioMCPClient] stdout:`, output);
          
          // 检查是否包含启动完成的标志
          if (output.includes('Ready') || output.includes('started') || output.includes('initialized')) {
            clearTimeout(timeoutTimer);
            this.process.stdout.off('data', onStdout);
            
            this.state.isConnected = true;
            this.emit('connected');
            console.log(`[StdioMCPClient] ✅ Connected successfully`);
            resolve();
          }
        };

        this.process.stdout.on('data', onStdout);

        // 如果 3 秒内没有看到启动标志，尝试发送初始化请求
        setTimeout(() => {
          if (!this.state.isConnected) {
            console.log(`[StdioMCPClient] Attempting manual initialization...`);
            this.sendRequest('initialize', {})
              .then(() => {
                clearTimeout(timeoutTimer);
                this.process.stdout.off('data', onStdout);
                this.state.isConnected = true;
                this.emit('connected');
                console.log(`[StdioMCPClient] ✅ Connected via manual init`);
                resolve();
              })
              .catch((err) => {
                console.log(`[StdioMCPClient] Manual init failed:`, err.message);
                // 继续等待 stdout 标志
              });
          }
        }, 3000);

      } catch (error) {
        console.error(`[StdioMCPClient] Exception in connect:`, error);
        this.emit('error', error);
        reject(error);
      }
    });
  }  async sendRequest(method, params = {}) {
    const startTime = Date.now();
    const requestId = ++this.requestId;
    
    console.log(`[MCP-CLIENT] [${requestId}] Sending request:`, {
      method,
      params: JSON.stringify(params).substring(0, 200)
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const duration = Date.now() - startTime;
        console.error(`[MCP-CLIENT] [${requestId}] ❌ Timeout after ${duration}ms`);
        reject(new Error(`Request timeout after ${duration}ms`));
      }, this.options.timeout.request);

      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };
      
        const onData = (data) => {
          try {
            const str = data.toString();
            // 尝试解析 JSON，处理可能的 emoji
            const response = JSON.parse(str);
            if (response.id === requestId) {
              const duration = Date.now() - startTime;
              this.process.stdout.off('data', onData);
              clearTimeout(timeout);

              if (response.error) {
                console.error(`[MCP-CLIENT] [${requestId}] ❌ Error response:`, response.error);
                reject(new Error(response.error.message));
              } else {
                console.log(`[MCP-CLIENT] [${requestId}] ✅ Success in ${duration}ms`);
                resolve(response.result);
              }
            }
          } catch (error) {
            // 如果解析失败，可能是日志输出，忽略
            if (str.trim().startsWith('{')) {
              // 可能是 JSON 但包含非法字符，尝试清理
              try {
                const cleaned = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, 
'');
                const response = JSON.parse(cleaned);
                if (response.id === requestId) {
                  const duration = Date.now() - startTime;
                  this.process.stdout.off('data', onData);
                  clearTimeout(timeout);

                  if (response.error) {
                    console.error(`[MCP-CLIENT] [${requestId}] ❌ Error response (cleaned):`, response.error);
                    reject(new Error(response.error.message));
                  } else {
                    console.log(`[MCP-CLIENT] [${requestId}] ✅ Success (cleaned) in ${duration}ms`);
                    resolve(response.result);
                  }
                }
              } catch (e2) {
                // 忽略解析错误，继续等待
              }
            }
            // 否则是日志输出，继续等待
          }
        };      this.process.stdout.on('data', onData);
      this.process.stdin.write(JSON.stringify(request) + '\n');
      console.log(`[MCP-CLIENT] [${requestId}] Request sent`);
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
