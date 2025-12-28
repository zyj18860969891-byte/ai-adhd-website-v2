# 清理 stdio-mcp-client.js 中的重复代码
$filePath = "e:\MultiModel\ai-adhd-website\api-server\src\stdio-mcp-client.js"
$content = Get-Content $filePath -Raw

# 定义要保留一次的代码块
$timeoutConfigBlock = @"
  // 增强的超时配置
  static TIMEOUT_CONFIG = {
    CONNECTION: 10000,      // 连接超时: 10秒
    REQUEST: 30000,         // 请求超时: 30秒
    TOOL_CALL: 60000,       // 工具调用超时: 60秒
    HEALTH_CHECK: 5000,     // 健康检查超时: 5秒
    RECONNECT: 3000         // 重连超时: 3秒
  };

  // 动态超时计算
  calculateTimeout(operationType, attempt = 1) {
    const baseTimeout = this.constructor.TIMEOUT_CONFIG[operationType] || this.constructor.TIMEOUT_CONFIG.REQUEST;
    // 指数退避: timeout * (1.5 ^ attempt)
    const multiplier = Math.pow(1.5, Math.min(attempt, 4));
    return Math.floor(baseTimeout * multiplier);
  }
"@

# 统计原始文件中的重复块数量
$pattern = [regex]::Escape($timeoutConfigBlock)
$matches = [regex]::Matches($content, $pattern)
Write-Host "Found $($matches.Count) duplicate blocks"

# 只保留一个实例，移除其他所有重复
$cleanContent = [regex]::Replace($content, $pattern, "", 1)
$cleanContent = [regex]::Replace($cleanContent, [regex]::Escape($timeoutConfigBlock), "")

# 写入清理后的内容
$cleanContent | Set-Content $filePath -Encoding UTF8
Write-Host "File cleaned successfully"