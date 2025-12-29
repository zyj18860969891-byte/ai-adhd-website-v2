#!/bin/bash

# 启动所有服务的脚本

# 启动API Server
echo "Starting API Server..."
cd /app/api-server
npm run start-api &
API_PID=$!

# 启动ChurnFlow MCP服务
echo "Starting ChurnFlow MCP Service..."
cd /app/churnflow-mcp
npm run start &
CHURNFLOW_PID=$!

# 启动Shrimp Task Manager MCP服务
echo "Starting Shrimp Task Manager MCP Service..."
cd /app/mcp-shrimp-task-manager
npm run start &
SHRIMP_PID=$!

echo "All services started:"
echo "API Server PID: $API_PID"
echo "ChurnFlow MCP PID: $CHURNFLOW_PID"
echo "Shrimp Task Manager MCP PID: $SHRIMP_PID"

# 等待所有进程完成
wait $API_PID $CHURNFLOW_PID $SHRIMP_PID