// 使用动态import来加载ESM模块
let MCPServiceClient, Transport;

async function loadMCP() {
  if (!MCPServiceClient) {
    const mcp = await import('@modelcontextprotocol/sdk');
    MCPServiceClient = mcp.MCPServiceClient;
    Transport = mcp.Transport;
  }
}

class MCPClient {
  constructor(serviceUrl) {
    this.serviceUrl = serviceUrl;
    this.client = null;
  }

  async connect() {
    try {
      await loadMCP();
      
      this.client = new MCPServiceClient({
        name: 'MCP Service',
        version: '1.0.0',
        timeout: 30000
      });

      await this.client.connect(this.serviceUrl, {
        transport: Transport.WebSocket
      });

      console.log(`Connected to MCP service: ${this.serviceUrl}`);
    } catch (error) {
      console.error('MCP connection failed:', error);
      throw error;
    }
  }

  async callTool(toolName, params) {
    if (!this.client) {
      await this.connect();
    }

    try {
      const result = await this.client.callTool(toolName, params);
      return result;
    } catch (error) {
      console.error(`MCP tool call failed: ${toolName}`, error);
      throw error;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }
}

export default MCPClient;