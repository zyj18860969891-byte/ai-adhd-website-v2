#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ADHD 生产力工具平台快速部署脚本

.DESCRIPTION
    自动化部署流程，包括代码推送、Railway 和 Vercel 部署配置

.AUTHOR
    GitHub Copilot

.DATE
    2025年12月28日
#>

param(
    [switch]$PushOnly = $false,
    [switch]$DeployOnly = $false,
    [switch]$TestOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 ADHD 生产力工具平台部署脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "📍 当前目录: $currentDir" -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录执行此脚本" -ForegroundColor Red
    exit 1
}

# 阶段 1: Git 操作
function Invoke-GitOperations {
    Write-Host "`n📤 阶段 1: Git 操作" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green

    try {
        # 检查 git 状态
        Write-Host "🔍 检查 Git 状态..." -ForegroundColor Yellow
        $status = git status --porcelain

        if ($status) {
            Write-Host "📋 检测到以下更改:" -ForegroundColor Yellow
            git status --short

            # 添加文件
            Write-Host "`n📦 添加文件到 Git..." -ForegroundColor Yellow
            git add api-server/
            git add churnflow-mcp/
            git add mcp-shrimp-task-manager/
            git add railway.toml
            git add vercel.json
            git add package.json
            git add vercel-mcp-config.json
            git add "*.md" -ErrorAction SilentlyContinue

            # 提交
            Write-Host "`n💾 提交更改..." -ForegroundColor Yellow
            $commitMessage = "feat: 完成MCP服务开发和部署配置

- 添加API Server Gateway配置
- 完成Shrimp Task Manager MCP服务
- 添加Railway部署配置
- 更新Vercel配置
- 添加部署文档和测试报告"

            git commit -m $commitMessage

            # 推送
            Write-Host "`n🚀 推送到远程仓库..." -ForegroundColor Yellow
            git push origin main

            Write-Host "✅ Git 操作完成!" -ForegroundColor Green
        }
        else {
            Write-Host "ℹ️ 没有检测到新的更改，跳过 Git 操作" -ForegroundColor Blue
        }
    }
    catch {
        Write-Host "❌ Git 操作失败: $_" -ForegroundColor Red
        throw
    }
}

# 阶段 2: 部署信息显示
function Show-DeploymentInfo {
    Write-Host "`n🚀 阶段 2: 部署信息" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green

    Write-Host "`n📋 Railway 部署步骤:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://railway.app" -ForegroundColor Cyan
    Write-Host "2. 登录账户: zyj18860969891@gmail.com" -ForegroundColor Cyan
    Write-Host "3. 创建新项目 → Deploy from GitHub" -ForegroundColor Cyan
    Write-Host "4. 连接仓库: zyj18860969891-byte/ai-adhd-website" -ForegroundColor Cyan
    Write-Host "5. 依次添加以下服务:" -ForegroundColor Cyan
    Write-Host "   - api-server (端口: 3003)" -ForegroundColor Cyan
    Write-Host "   - mcp-shrimp-task-manager (端口: 3009)" -ForegroundColor Cyan
    Write-Host "   - churnflow-mcp (端口: 3005)" -ForegroundColor Cyan

    Write-Host "`n📋 Vercel 配置步骤:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://vercel.com" -ForegroundColor Cyan
    Write-Host "2. 选择项目: ai-adhd-website" -ForegroundColor Cyan
    Write-Host "3. Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host "4. 更新以下环境变量:" -ForegroundColor Cyan
    Write-Host "   NEXT_PUBLIC_API_URL" -ForegroundColor Cyan
    Write-Host "   NEXT_PUBLIC_MCP_CHURNFLOW_URL" -ForegroundColor Cyan
    Write-Host "   NEXT_PUBLIC_MCP_SHRIMP_URL" -ForegroundColor Cyan

    Write-Host "`n📋 部署验证步骤:" -ForegroundColor Yellow
    Write-Host "1. 测试健康检查端点" -ForegroundColor Cyan
    Write-Host "2. 测试 MCP 工具调用" -ForegroundColor Cyan
    Write-Host "3. 验证 Web UI 功能" -ForegroundColor Cyan
}

# 阶段 3: 本地测试
function Invoke-LocalTesting {
    Write-Host "`n🧪 阶段 3: 本地测试" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green

    try {
        # 测试 Shrimp MCP Service
        Write-Host "`n🔍 测试 Shrimp MCP Service..." -ForegroundColor Yellow

        if (Test-Path "mcp-shrimp-task-manager") {
            Set-Location "mcp-shrimp-task-manager"

            if (Test-Path "dist/custom-mcp-server.js") {
                Write-Host "✅ 构建文件存在" -ForegroundColor Green

                # 运行快速测试
                Write-Host "🚀 运行快速功能测试..." -ForegroundColor Yellow
                node test-deployment-comprehensive.js

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Shrimp MCP Service 测试通过!" -ForegroundColor Green
                }
                else {
                    Write-Host "❌ Shrimp MCP Service 测试失败" -ForegroundColor Red
                }
            }
            else {
                Write-Host "⚠️ 构建文件不存在，请先运行 npm run build:mcp" -ForegroundColor Yellow
            }

            Set-Location ".."
        }
        else {
            Write-Host "⚠️ Shrimp MCP Service 目录不存在" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ 本地测试失败: $_" -ForegroundColor Red
    }
}

# 主执行流程
try {
    Write-Host "🎯 开始部署流程..." -ForegroundColor Yellow

    if ($TestOnly) {
        Invoke-LocalTesting
        exit 0
    }

    if (-not $DeployOnly) {
        Invoke-GitOperations
    }

    if (-not $PushOnly) {
        Show-DeploymentInfo
        Invoke-LocalTesting
    }

    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host "🎉 部署准备完成!" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 按照上述步骤在 Railway 控制台部署服务" -ForegroundColor Cyan
    Write-Host "2. 在 Vercel 控制台更新环境变量" -ForegroundColor Cyan
    Write-Host "3. 验证部署功能" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 预计完成时间: 35-65 分钟" -ForegroundColor Yellow
    Write-Host "📝 详细步骤请参考: DEPLOYMENT_EXECUTION_PLAN.md" -ForegroundColor Yellow
    Write-Host ""

}
catch {
    Write-Host "`n❌ 部署流程失败: $_" -ForegroundColor Red
    Write-Host "💡 请检查错误信息并手动执行相关步骤" -ForegroundColor Yellow
    exit 1
}