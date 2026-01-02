/**
 * MCP HTTP Proxy
 * 通过 HTTP 代理访问远程的 MCP 服务
 * 因为 Railway 上的 MCP 服务是独立的，无法通过 spawn() 启动
 */

import { EventEmitter } from 'events';

export default class MCPHTTPProxy extends EventEmitter {
  constructor(serviceUrl, options = {}) {
    super();
    this.serviceUrl = serviceUrl;
    this.options = {
      timeout: 30000,
      ...options
    };
    this.state = {
      isConnected: false,
      degradationLevel: 'full',
      health: 'healthy'
    };
  }

  async connect() {
    try {
      // 测试连接
      const healthy = await this.checkHealth();
      if (healthy) {
        this.state.isConnected = true;
        this.emit('connected');
        console.log(`✅ MCP HTTP Proxy connected to ${this.serviceUrl}`);
      } else {
        throw new Error('Service health check failed');
      }
    } catch (error) {
      this.state.isConnected = false;
      this.emit('error', error);
      console.error(`❌ MCP HTTP Proxy connection failed: ${error.message}`);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
      
      const response = await fetch(`${this.serviceUrl}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 发送请求到 MCP 服务（通过 HTTP）
  async sendRequest(method, params = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
      
      const response = await fetch(`${this.serviceUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    this.state.isConnected = false;
    this.emit('disconnected');
  }
}
