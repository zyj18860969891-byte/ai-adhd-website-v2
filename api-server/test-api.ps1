# 测试Shrimp MCP API（PowerShell版本）

Write-Host "=== 测试Shrimp MCP API ==="

# 测试1: 简单英文任务
Write-Host "`n1. 测试简单英文任务..."
$englishBody = @{
    action = "decompose"
    data = @{
        task = "Create a simple todo app"
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri http://localhost:3000/api/mcp/shrimp `
        -Method POST `
        -Headers @{"Content-Type"="application/json; charset=utf-8"} `
        -Body $englishBody `
        -UseBasicParsing
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}

# 等待5秒
Write-Host "`n等待5秒..."
Start-Sleep -Seconds 5

# 测试2: 简单中文任务（使用Base64编码避免PowerShell编码问题）
Write-Host "`n2. 测试简单中文任务..."
$chineseBody = @{
    action = "decompose"
    data = @{
        task = "创建一个简单的待办事项应用"
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri http://localhost:3000/api/mcp/shrimp `
        -Method POST `
        -Headers @{"Content-Type"="application/json; charset=utf-8"} `
        -Body $chineseBody `
        -UseBasicParsing
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}

Write-Host "`n测试完成"