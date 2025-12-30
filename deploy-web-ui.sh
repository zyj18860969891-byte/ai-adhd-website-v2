#!/bin/bash

# Web UI 部署脚本
# 用于部署 Web UI 到 Vercel

echo "🚀 开始部署 Web UI 到 Vercel..."

# 检查是否在 web-ui 目录
if [ ! -f "web-ui/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "当前目录: $(pwd)"
    echo "需要的文件: web-ui/package.json"
    exit 1
fi

# 进入 web-ui 目录
cd web-ui

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null; then
    echo "❌ 错误: Vercel CLI 未安装"
    echo "请运行: npm install -g vercel"
    exit 1
fi

# 检查是否已登录 Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ 错误: 未登录 Vercel"
    echo "请运行: vercel login"
    exit 1
fi

echo "✅ Vercel CLI 已安装并登录"

# 检查环境配置
echo "📋 检查环境配置..."
if [ -f ".env.production" ]; then
    echo "✅ 生产环境配置文件存在"
    grep -E "NEXT_PUBLIC_API_URL|NEXT_PUBLIC_WEBSOCKET_URL" .env.production
else
    echo "⚠️  警告: 生产环境配置文件不存在"
fi

# 部署到 Vercel
echo "📦 开始构建和部署..."
vercel --prod

# 检查部署结果
if [ $? -eq 0 ]; then
    echo "✅ Web UI 部署成功!"
    echo "🌐 访问地址: https://ai-adhd-website-v2.vercel.app"
else
    echo "❌ Web UI 部署失败"
    exit 1
fi

# 返回项目根目录
cd ..