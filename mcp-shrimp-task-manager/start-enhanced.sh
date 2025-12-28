#!/bin/bash

# 启动增强版Shrimp MCP服务
echo "启动增强版Shrimp MCP服务..."

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    echo "错误: OPENAI_API_KEY 环境变量未设置"
    exit 1
fi

echo "环境变量检查通过"
echo "OPENAI_MODEL: $OPENAI_MODEL"
echo "OPENAI_BASE_URL: $OPENAI_BASE_URL"

# 启动服务
node dist/enhanced-index.js