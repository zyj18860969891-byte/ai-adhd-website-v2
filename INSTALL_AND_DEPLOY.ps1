#!/usr/bin/env pwsh

# 🚀 Node.js 安装和 Vercel 部署脚本
# 请以管理员身份运行此脚本

Write-Host "🎯 Node.js 安装和 Vercel 部署脚本" -ForegroundColor Green
Write-Host "请以管理员身份运行此脚本" -ForegroundColor Yellow
Write-Host ""

# 检查是否以管理员身份运行
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object System.Security.Principal.WindowsPrincipal($currentUser)
if (-not $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ 请以管理员身份运行此脚本" -ForegroundColor Red
    Write-Host "右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    exit 1
}

# 步骤 1: 下载并安装 Node.js
function Install-NodeJS {
    Write-Host "📋 步骤 1: 下载并安装 Node.js" -ForegroundColor Green
    
    # Node.js LTS 下载 URL
    $nodeUrl = "https://nodejs.org/dist/v20.19.5/node-v20.19.5-x64.msi"
    $installerPath = "$env:TEMP\nodejs-installer.msi"
    
    Write-Host "   下载 Node.js..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "   ✅ 下载完成" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ 下载失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   安装 Node.js..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet" -Wait -PassThru
        if ($process.ExitCode -eq 0) {
            Write-Host "   ✅ 安装完成" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ 安装失败，退出代码: $($process.ExitCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ 安装过程中出错: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 步骤 2: 验证安装
function Verify-Installation {
    Write-Host ""
    Write-Host "📋 步骤 2: 验证安装" -ForegroundColor Green
    
    # 刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    try {
        $nodeVersion = node --version
        Write-Host "   Node.js 版本: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Node.js 未正确安装" -ForegroundColor Red
        return $false
    }
    
    try {
        $npmVersion = npm --version
        Write-Host "   npm 版本: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ npm 未正确安装" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# 步骤 3: 安装 Vercel CLI
function Install-VercelCLI {
    Write-Host ""
    Write-Host "📋 步骤 3: 安装 Vercel CLI" -ForegroundColor Green
    
    try {
        Write-Host "   安装 Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        Write-Host "   ✅ Vercel CLI 安装完成" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Vercel CLI 安装失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 步骤 4: 验证 Vercel CLI
function Verify-VercelCLI {
    Write-Host ""
    Write-Host "📋 步骤 4: 验证 Vercel CLI" -ForegroundColor Green
    
    try {
        $vercelVersion = vercel --version
        Write-Host "   Vercel CLI 版本: $vercelVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Vercel CLI 未正确安装" -ForegroundColor Red
        return $false
    }
}

# 步骤 5: 部署到 Vercel
function Deploy-ToVercel {
    Write-Host ""
    Write-Host "📋 步骤 5: 部署到 Vercel" -ForegroundColor Green
    
    # 检查 web-ui 目录
    if (-not (Test-Path "web-ui")) {
        Write-Host "   ❌ web-ui 目录不存在" -ForegroundColor Red
        return $false
    }
    
    # 进入 web-ui 目录
    Set-Location web-ui
    Write-Host "   进入 web-ui 目录" -ForegroundColor Yellow
    
    # 登录 Vercel
    Write-Host "   登录 Vercel..." -ForegroundColor Yellow
    try {
        vercel login
        Write-Host "   ✅ Vercel 登录成功" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Vercel 登录失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # 部署到 Vercel
    Write-Host "   部署到 Vercel..." -ForegroundColor Yellow
    try {
        vercel --prod
        Write-Host "   ✅ Vercel 部署成功" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Vercel 部署失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 步骤 6: 设置环境变量
function Set-EnvironmentVariables {
    Write-Host ""
    Write-Host "📋 步骤 6: 设置环境变量" -ForegroundColor Green
    
    $envVars = @{
        "NEXT_PUBLIC_API_URL" = "https://ai-adhd-website-v2-production.up.railway.app/api"
        "NEXT_PUBLIC_WEBSOCKET_URL" = "wss://ai-adhd-website-v2-production.up.railway.app"
        "NEXT_PUBLIC_TASK_MANAGER_API" = "https://ai-adhd-website-v2-production.up.railway.app/api"
        "NEXT_PUBLIC_ADHD_REMINDER_API" = "https://ai-adhd-website-v2-production.up.railway.app/api"
        "NEXT_PUBLIC_MCP_CHURNFLOW_URL" = "https://churnflow-mcp-production.up.railway.app"
        "NEXT_PUBLIC_MCP_SHRIMP_URL" = "https://shrimp-task-manager-production.up.railway.app"
    }
    
    foreach ($envVar in $envVars.GetEnumerator()) {
        Write-Host "   设置 $($envVar.Key)..." -ForegroundColor Yellow
        try {
            # 使用 echo 输入环境变量值
            $envValue = $envVar.Value
            $command = "echo '$envValue' | vercel env add $($envVar.Key)"
            Invoke-Expression $command | Out-Null
            Write-Host "   ✅ $($envVar.Key) 设置成功" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ $($envVar.Key) 设置失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    return $true
}

# 步骤 7: 重新部署
function Redeploy {
    Write-Host ""
    Write-Host "📋 步骤 7: 重新部署" -ForegroundColor Green
    
    try {
        Write-Host "   重新部署..." -ForegroundColor Yellow
        vercel --prod
        Write-Host "   ✅ 重新部署成功" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ 重新部署失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 步骤 8: 验证部署
function Verify-Deployment {
    Write-Host ""
    Write-Host "📋 步骤 8: 验证部署" -ForegroundColor Green
    
    try {
        $response = Invoke-WebRequest -Uri "https://ai-adhd-website-v2.vercel.app" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Vercel 域名访问成功 (状态码: $($response.StatusCode))" -ForegroundColor Green
            Write-Host "   内容长度: $($response.Content.Length) 字符" -ForegroundColor Cyan
            return $true
        } else {
            Write-Host "   ❌ Vercel 域名返回状态码: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Vercel 域名访问失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 主函数
function Main {
    Write-Host "🚀 开始安装和部署过程..." -ForegroundColor Green
    Write-Host ""
    
    # 执行所有步骤
    $steps = @(
        @{Name = "安装 Node.js"; Action = { Install-NodeJS } },
        @{Name = "验证安装"; Action = { Verify-Installation } },
        @{Name = "安装 Vercel CLI"; Action = { Install-VercelCLI } },
        @{Name = "验证 Vercel CLI"; Action = { Verify-VercelCLI } },
        @{Name = "部署到 Vercel"; Action = { Deploy-ToVercel } },
        @{Name = "设置环境变量"; Action = { Set-EnvironmentVariables } },
        @{Name = "重新部署"; Action = { Redeploy } },
        @{Name = "验证部署"; Action = { Verify-Deployment } }
    )
    
    $successCount = 0
    foreach ($step in $steps) {
        Write-Host "🎯 执行步骤: $($step.Name)" -ForegroundColor Cyan
        try {
            $result = & $step.Action
            if ($result) {
                $successCount++
                Write-Host "   ✅ 步骤完成" -ForegroundColor Green
            } else {
                Write-Host "   ❌ 步骤失败" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "   ❌ 步骤执行异常: $($_.Exception.Message)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # 总结
    Write-Host "🎯 部署总结" -ForegroundColor Green
    Write-Host "   成功步骤: $successCount/$($steps.Count)" -ForegroundColor Cyan
    
    if ($successCount -eq $steps.Count) {
        Write-Host "   🎉 所有步骤完成！Vercel 部署成功！" -ForegroundColor Green
        Write-Host "   📋 访问地址: https://ai-adhd-website-v2.vercel.app" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  部分步骤失败，请检查错误信息并重试" -ForegroundColor Yellow
    }
}

# 运行主函数
Main