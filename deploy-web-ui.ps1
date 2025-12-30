#!/usr/bin/env pwsh

# Web UI 部署脚本 (PowerShell 版本)
# 用于部署 Web UI 到 Vercel

Write-Host "🚀 开始部署 Web UI 到 Vercel..." -ForegroundColor Green

# 检查是否在 web-ui 目录
if (-not (Test-Path "web-ui/package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "当前目录: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "需要的文件: web-ui/package.json" -ForegroundColor Yellow
    exit 1
}

# 进入 web-ui 目录
Set-Location web-ui

# 检查 Vercel CLI 是否安装
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: Vercel CLI 未安装" -ForegroundColor Red
    Write-Host "请运行: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# 检查是否已登录 Vercel
try {
    $whoami = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Vercel CLI 已安装并登录" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未登录 Vercel" -ForegroundColor Red
    Write-Host "请运行: vercel login" -ForegroundColor Yellow
    exit 1
}

# 检查环境配置
Write-Host "📋 检查环境配置..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
    Write-Host "✅ 生产环境配置文件存在" -ForegroundColor Green
    Get-Content .env.production | Select-String "NEXT_PUBLIC_API_URL|NEXT_PUBLIC_WEBSOCKET_URL"
} else {
    Write-Host "⚠️  警告: 生产环境配置文件不存在" -ForegroundColor Yellow
}

# 部署到 Vercel
Write-Host "📦 开始构建和部署..." -ForegroundColor Yellow
vercel --prod

# 检查部署结果
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web UI 部署成功!" -ForegroundColor Green
    Write-Host "🌐 访问地址: https://ai-adhd-website-v2.vercel.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Web UI 部署失败" -ForegroundColor Red
    exit 1
}

# 返回项目根目录
Set-Location ..