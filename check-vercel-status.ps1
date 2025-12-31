#!/usr/bin/env pwsh

# Vercel 项目状态检查脚本 (PowerShell 版本)

Write-Host "🔍 检查 Vercel 项目状态..." -ForegroundColor Green
Write-Host ""

# 检查 Vercel 域名状态
function Check-VercelDomain {
    Write-Host "📋 检查 Vercel 域名状态..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "https://ai-adhd-website-v2.vercel.app" -UseBasicParsing -ErrorAction Stop
        Write-Host "   域名状态: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Cyan
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ 域名正常，有内容部署" -ForegroundColor Green
            Write-Host "   内容长度: $($response.Content.Length) 字符" -ForegroundColor Cyan
        } elseif ($response.StatusCode -eq 404) {
            Write-Host "   ❌ 域名存在但没有部署内容" -ForegroundColor Red
            Write-Host "   📋 需要重新配置 Vercel 项目" -ForegroundColor Yellow
        } else {
            Write-Host "   ⚠️  域名返回状态: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   ❌ 无法访问域名: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 检查 API 服务器状态
function Check-ApiServer {
    Write-Host ""
    Write-Host "📋 检查 API 服务器状态..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "https://ai-adhd-website-v2-production.up.railway.app/api/health" -UseBasicParsing -ErrorAction Stop
        Write-Host "   API 状态: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Cyan
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ API 服务器正常运行" -ForegroundColor Green
            try {
                $data = $response.Content | ConvertFrom-Json
                Write-Host "   服务状态: $($data.overallStatus)" -ForegroundColor Cyan
                Write-Host "   MCP 服务状态:" -ForegroundColor Cyan
                foreach ($service in $data.services.PSObject.Properties) {
                    Write-Host "     - $($service.Name): $($service.Value.status)" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "   ⚠️  无法解析 API 响应" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ API 服务器异常: $($response.StatusCode)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ❌ 无法访问 API 服务器: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 检查 Vercel 项目配置
function Check-VercelProject {
    Write-Host ""
    Write-Host "📋 检查 Vercel 项目配置..." -ForegroundColor Yellow
    
    # 检查是否有 vercel.json 配置文件
    if (Test-Path "vercel.json") {
        Write-Host "   ✅ vercel.json 配置文件存在" -ForegroundColor Green
        $config = Get-Content "vercel.json" | ConvertFrom-Json
        Write-Host "   构建目录: $($config.builds[0].src)" -ForegroundColor Cyan
        Write-Host "   构建工具: $($config.builds[0].use)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ vercel.json 配置文件不存在" -ForegroundColor Red
    }
    
    # 检查 web-ui 目录
    if (Test-Path "web-ui") {
        Write-Host "   ✅ web-ui 目录存在" -ForegroundColor Green
        if (Test-Path "web-ui/package.json") {
            Write-Host "   ✅ web-ui/package.json 存在" -ForegroundColor Green
        } else {
            Write-Host "   ❌ web-ui/package.json 不存在" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ web-ui 目录不存在" -ForegroundColor Red
    }
}

# 检查 GitHub 仓库
function Check-GitHubRepo {
    Write-Host ""
    Write-Host "📋 检查 GitHub 仓库..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "https://github.com/zyj18860969891-byte/ai-adhd-website-v2" -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ GitHub 仓库存在" -ForegroundColor Green
        
        # 检查关键文件
        $files = @(
            "web-ui/package.json",
            "vercel.json",
            "web-ui/.env.production"
        )
        
        foreach ($file in $files) {
            try {
                $fileUrl = "https://raw.githubusercontent.com/zyj18860969891-byte/ai-adhd-website-v2/main/$file"
                $fileResponse = Invoke-WebRequest -Uri $fileUrl -UseBasicParsing -ErrorAction Stop
                Write-Host "   ✅ $file 存在" -ForegroundColor Green
            } catch {
                Write-Host "   ❌ $file 不存在" -ForegroundColor Red
            }
        }
    }
    catch {
        Write-Host "   ❌ 无法访问 GitHub 仓库: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 主函数
function Main {
    Check-VercelDomain
    Check-ApiServer
    Check-VercelProject
    Check-GitHubRepo
    
    Write-Host ""
    Write-Host "🎯 诊断结果总结:" -ForegroundColor Green
    Write-Host "   如果 Vercel 域名显示 404，说明需要重新配置 Vercel 项目" -ForegroundColor Yellow
    Write-Host "   请检查 Vercel 控制台中的项目配置" -ForegroundColor Yellow
    Write-Host "   确保 Root Directory 设置为 'web-ui'" -ForegroundColor Yellow
    Write-Host "   确保环境变量配置正确" -ForegroundColor Yellow
}

# 运行检查
Main