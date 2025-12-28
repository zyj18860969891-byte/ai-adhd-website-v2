#!/usr/bin/env bash

# 部署API服务器到Railway

echo "🚀 开始部署API服务器到Railway..."

# 1. 进入API服务器目录
cd e:\MultiModel\ai-adhd-website\api-server

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 测试本地运行
echo "🧪 测试本地运行..."
npm start &
API_PID=$!

# 等待服务器启动
sleep 3

# 测试API
echo "🔍 测试API端点..."
curl -s http://localhost:3003/api/health
echo ""

# 停止本地服务器
kill $API_PID

# 4. 部署到Railway
echo "🚀 部署到Railway..."
railway deploy

echo "✅ API服务器部署完成！"
echo "🌐 访问: https://ai-adhd-api-production.up.railway.app"