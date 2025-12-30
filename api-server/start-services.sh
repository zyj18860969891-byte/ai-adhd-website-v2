#!/bin/bash

# Start all services for unified deployment
echo "Starting unified MCP services and API server..."

# Start ChurnFlow MCP (port 3008)
echo "Starting ChurnFlow MCP on port 3008..."
node ../churnflow-mcp/dist/index.js &
CHURNFLOW_PID=$!
echo "ChurnFlow MCP started with PID: $CHURNFLOW_PID"

# Wait a moment for ChurnFlow to start
sleep 3

# Start Shrimp Task Manager MCP (port 3009)
echo "Starting Shrimp Task Manager MCP on port 3009..."
node ../mcp-shrimp-task-manager/dist/custom-mcp-server.js &
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