#!/usr/bin/env pwsh

# 自动部署脚本 - 包含环境变量配置 (PowerShell 版本)
# 此脚本会将所有配置推送到 GitHub，触发 Vercel 和 Railway 的自动部署

Write-Host "🚀 开始自动部署..." -ForegroundColor Green

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 添加所有文件到 Git
Write-Host "📦 添加文件到 Git..." -ForegroundColor Yellow
git add .

# 创建提交信息
$commitMessage = @"
feat: 更新环境变量配置和部署设置

- 更新 Vercel 环境变量配置
- 更新 Railway 环境变量配置
- 修复 API 服务器和 MCP 服务配置
- 优化部署流程
"@

Write-Host "📝 创建提交..." -ForegroundColor Yellow
git commit -m $commitMessage

# 推送到 GitHub
Write-Host "📤 推送到 GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署触发成功!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 部署状态:" -ForegroundColor Cyan
    Write-Host "   - Vercel 会自动开始部署 Web UI" -ForegroundColor White
    Write-Host "   - Railway 会自动开始部署后端服务" -ForegroundColor White
    Write-Host "   - 部署完成后会自动应用新的环境变量" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 部署时间预估:" -ForegroundColor Cyan
    Write-Host "   - Vercel: 2-5 分钟" -ForegroundColor White
    Write-Host "   - Railway: 5-10 分钟" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 验证部署:" -ForegroundColor Cyan
    Write-Host "   - Vercel: https://focus-on-you.com" -ForegroundColor White
    Write-Host "   - API 健康检查: https://ai-adhd-website-v2-production.up.railway.app/api/health" -ForegroundColor White
} else {
    Write-Host "❌ 推送失败，请检查网络连接和权限" -ForegroundColor Red
    exit 1
}