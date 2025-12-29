#!/bin/bash

# 启动所有服务的脚本

echo "Starting all services..."

# 构建并启动ChurnFlow MCP服务
echo "Building ChurnFlow MCP Service..."
cd /app/churnflow-mcp
npm run build
echo "Starting ChurnFlow MCP Service..."
npm run start &
CHURNFLOW_PID=$!
echo "ChurnFlow MCP PID: $CHURNFLOW_PID"

# 构建并启动Shrimp Task Manager MCP服务
echo "Building Shrimp Task Manager MCP Service..."
cd /app/mcp-shrimp-task-manager
npm run build
echo "Starting Shrimp Task Manager MCP Service..."
npm run start &
SHRIMP_PID=$!
echo "Shrimp Task Manager MCP PID: $SHRIMP_PID"

# 等待MCP服务启动
echo "Waiting for MCP services to start..."
sleep 10

# 启动API Server
echo "Starting API Server..."
cd /app/api-server
npm run start-api &
API_PID=$!
echo "API Server PID: $API_PID"

echo "All services started:"
echo "ChurnFlow MCP PID: $CHURNFLOW_PID"
echo "Shrimp Task Manager MCP PID: $SHRIMP_PID"
echo "API Server PID: $API_PID"

# 等待所有进程完成
wait $API_PID $CHURNFLOW_PID $SHRIMP_PID