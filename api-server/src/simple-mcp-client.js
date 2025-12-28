import WebSocket from 'ws';

class SimpleMCPClient {
  constructor(serviceUrl) {
    this.serviceUrl = serviceUrl;
    this.ws = null;
    this.requestId = 1;
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // 对于Railway上的MCP服务，我们需要使用wss协议
        const wsUrl = this.serviceUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          console.log(`Connected to MCP service: ${this.serviceUrl}`);
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing MCP message:', error);
          }
        });

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log('WebSocket connection closed');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(message) {
    // 处理MCP协议的响应
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'MCP request failed'));
      } else {
        resolve(message.result);
      }
    }
  }

  async callTool(toolName, params) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;
      this.pendingRequests.set(requestId, { resolve, reject });

      // 发送MCP协议格式的请求
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      this.ws.send(JSON.stringify(request));

      // 设置超时
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('MCP request timeout'));
        }
      }, 10000);
    });
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
    this.pendingRequests.clear();
  }
}

export default SimpleMCPClient;