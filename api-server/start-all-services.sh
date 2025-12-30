#!/bin/bash

# 启动所有服务的脚本

echo "Starting all services..."

# 启动ChurnFlow MCP服务
echo "Starting ChurnFlow MCP Service..."
cd /app/churnflow-mcp
npm run start &
CHURNFLOW_PID=$!
echo "ChurnFlow MCP PID: $CHURNFLOW_PID"

# 启动Shrimp Task Manager MCP服务
echo "Starting Shrimp Task Manager MCP Service..."
cd /app/mcp-shrimp-task-manager
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

# 检查进程是否还在运行
sleep 2
if ps -p $CHURNFLOW_PID > /dev/null; then
    echo "ChurnFlow MCP is running"
else
    echo "ChurnFlow MCP failed to start"
fi

if ps -p $SHRIMP_PID > /dev/null; then
    echo "Shrimp Task Manager MCP is running"
else
    echo "Shrimp Task Manager MCP failed to start"
fi

if ps -p $API_PID > /dev/null; then
    echo "API Server is running"
else
    echo "API Server failed to start"
fi

# 等待所有进程完成
wait

echo "All services started:"
echo "ChurnFlow MCP PID: $CHURNFLOW_PID"
echo "Shrimp Task Manager MCP PID: $SHRIMP_PID"
echo "API Server PID: $API_PID"

# 等待所有进程完成
wait $API_PID $CHURNFLOW_PID $SHRIMP_PID