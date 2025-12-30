#!/bin/bash

# Start all services for unified deployment
echo "Starting unified MCP services and API server..."

# Start ChurnFlow MCP (port 3008)
echo "Starting ChurnFlow MCP on port 3008..."
node churnflow-mcp/dist/index.js &
CHURNFLOW_PID=$!
echo "ChurnFlow MCP started with PID: $CHURNFLOW_PID"

# Wait a moment for ChurnFlow to start
sleep 3

# Start Shrimp Task Manager MCP (port 3009)
echo "Starting Shrimp Task Manager MCP on port 3009..."
node mcp-shrimp-task-manager/dist/custom-mcp-server.js &
SHRIMP_PID=$!
echo "Shrimp Task Manager MCP started with PID: $SHRIMP_PID"

# Wait a moment for Shrimp to start
sleep 3

# Start API Server (port 3003)
echo "Starting API Server on port 3003..."
node dist/index.js &
API_PID=$!
echo "API Server started with PID: $API_PID"

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $API_PID 2>/dev/null
    kill $SHRIMP_PID 2>/dev/null
    kill $CHURNFLOW_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for all background processes
wait

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