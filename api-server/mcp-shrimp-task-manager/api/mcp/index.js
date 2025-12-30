#!/usr/bin/env node
/**
 * Vercel Serverless Function for MCP Service
 * 将自定义 MCP 服务器适配为 Vercel Serverless Function
 */

import { spawn } from 'child_process';
import { createReadStream, createWriteStream } from 'stream';

// MCP 服务器路径
const MCP_SERVER_PATH = './dist/custom-mcp-server.js';

// 启动 MCP 服务器进程
let mcpProcess = null;

function startMCPServer() {
  if (mcpProcess) {
    return mcpProcess;
  }

  console.log('🚀 启动 MCP 服务器进程...');

  mcpProcess = spawn('node', [MCP_SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  mcpProcess.on('error', (error) => {
    console.error('❌ MCP 服务器启动失败:', error);
    mcpProcess = null;
  });

  mcpProcess.on('exit', (code) => {
    console.log(`⚠️ MCP 服务器退出，代码: ${code}`);
    mcpProcess = null;
  });

  return mcpProcess;
}

// HTTP 请求处理器
export default async function handler(req, res) {
  try {
    console.log('📨 收到 HTTP 请求');

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 只允许 POST 请求
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: '只允许 POST 请求',
        method: req.method
      });
    }

    // 启动 MCP 服务器
    const server = startMCPServer();
    if (!server) {
      return res.status(500).json({
        error: 'MCP 服务器启动失败'
      });
    }

    // 解析请求体
    let requestBody;
    try {
      requestBody = JSON.parse(req.body);
    } catch (parseError) {
      return res.status(400).json({
        error: '无效的 JSON 请求体',
        details: parseError.message
      });
    }

    console.log('📤 发送 MCP 请求:', requestBody.method);

    // 发送请求到 MCP 服务器
    const requestJson = JSON.stringify(requestBody);
    server.stdin.write(requestJson + '\n');

    // 等待响应
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP 响应超时'));
      }, 10000); // 10秒超时

      // 监听响应
      const onData = (data) => {
        try {
          const responseStr = data.toString().trim();
          console.log('📥 收到 MCP 响应:', responseStr.substring(0, 200) + '...');

          // 查找 JSON-RPC 响应
          const lines = responseStr.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              try {
                const jsonResponse = JSON.parse(line);
                if (jsonResponse.jsonrpc === '2.0' && jsonResponse.id === requestBody.id) {
                  clearTimeout(timeout);
                  server.stdout.removeListener('data', onData);
                  resolve(jsonResponse);
                  return;
                }
              } catch (e) {
                // 继续查找有效的 JSON
              }
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      server.stdout.on('data', onData);
      server.stderr.on('data', (data) => {
        console.error('❌ MCP 错误:', data.toString());
      });
    });

    console.log('✅ MCP 请求处理完成');
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ 处理请求时出错:', error);
    return res.status(500).json({
      error: '内部服务器错误',
      details: error.message
    });
  }
}