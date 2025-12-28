// Vercel Serverless Function wrapper for MCP Server
// 注意: 这个文件仅为Vercel部署提供基础结构
// 由于MCP协议需要stdin/stdout，Vercel的Serverless环境不完全适合

import { createServer } from 'http';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // 读取请求体
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }

    const requestData = JSON.parse(body || '{}');
    
    // 这里应该调用MCP服务器的处理逻辑
    // 但由于MCP需要stdin/stdout，在Serverless环境中需要特殊处理
    
    // 临时响应
    const response = {
      jsonrpc: "2.0",
      id: requestData.id || null,
      error: {
        code: -32601,
        message: "MCP server not fully compatible with Vercel Serverless environment. Please use Railway deployment instead."
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: "Internal error: " + error.message
      }
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};