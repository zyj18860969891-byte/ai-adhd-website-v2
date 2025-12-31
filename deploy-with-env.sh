#!/bin/bash

# 自动部署脚本 - 包含环境变量配置
# 此脚本会将所有配置推送到 GitHub，触发 Vercel 和 Railway 的自动部署

echo "🚀 开始自动部署..."

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 添加所有文件到 Git
echo "📦 添加文件到 Git..."
git add .

# 创建提交信息
COMMIT_MESSAGE="feat: 更新环境变量配置和部署设置

- 更新 Vercel 环境变量配置
- 更新 Railway 环境变量配置
- 修复 API 服务器和 MCP 服务配置
- 优化部署流程"

echo "📝 创建提交..."
git commit -m "$COMMIT_MESSAGE"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 部署触发成功!"
    echo ""
    echo "🎯 部署状态:"
    echo "   - Vercel 会自动开始部署 Web UI"
    echo "   - Railway 会自动开始部署后端服务"
    echo "   - 部署完成后会自动应用新的环境变量"
    echo ""
    echo "📋 部署时间预估:"
    echo "   - Vercel: 2-5 分钟"
    echo "   - Railway: 5-10 分钟"
    echo ""
    echo "🔍 验证部署:"
    echo "   - Vercel: https://focus-on-you.com"
    echo "   - API 健康检查: https://ai-adhd-website-v2-production.up.railway.app/api/health"
else
    echo "❌ 推送失败，请检查网络连接和权限"
    exit 1
fi