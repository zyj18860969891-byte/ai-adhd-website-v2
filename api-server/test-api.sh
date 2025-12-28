#!/bin/bash
echo "=== 测试Shrimp MCP API（使用curl） ==="

# 测试1: 简单英文任务
echo -e "\n1. 测试简单英文任务..."
curl -X POST http://localhost:3000/api/mcp/shrimp \
  -H "Content-Type: application/json" \
  -d '{"action":"decompose","data":{"task":"Create a simple todo app"}}'

# 等待5秒
sleep 5

# 测试2: 简单中文任务
echo -e "\n\n2. 测试简单中文任务..."
curl -X POST http://localhost:3000/api/mcp/shrimp \
  -H "Content-Type: application/json" \
  -d '{"action":"decompose","data":{"task":"创建一个简单的待办事项应用"}}'

echo -e "\n\n测试完成"