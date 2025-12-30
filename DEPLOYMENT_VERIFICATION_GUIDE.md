# 部署验证指南

本文档提供了部署后的验证步骤，确保所有服务正常运行。

## 修复内容总结

### 1. better-sqlite3 架构不匹配问题 ✅
- **问题**: better-sqlite3 原生模块在 Alpine Linux 容器中架构不匹配
- **解决方案**: 在 Dockerfile 中添加 `npm rebuild better-sqlite3` 命令，在容器中重新编译原生模块
- **影响**: ChurnFlow MCP 服务现在可以正常启动并使用数据库功能

### 2. API 服务器健康检查问题 ✅
- **问题**: 健康检查在 MCP 服务不可用时返回 503 错误，导致负载均衡器认为 API 服务器挂掉
- **解决方案**: 修改健康检查逻辑，总是返回 200 状态码，将 MCP 服务状态作为 degraded 而不是 unhealthy
- **影响**: API 服务器现在即使在某些 MCP 服务不可用时也能报告为健康状态

## 验证步骤

### 步骤 1: 检查部署状态

```bash
# 查看 Railway 部署日志
railway logs

# 或者查看特定服务的日志
railway logs api-server
railway logs churnflow-mcp
railway logs mcp-shrimp-task-manager
```

### 步骤 2: 验证 API 服务器健康检查

```bash
# 测试健康检查端点
curl https://your-api-domain.com/api/health

# 预期响应示例:
{
  "timestamp": "2025-12-31T12:00:00.000Z",
  "services": {
    "churnFlow": {
      "status": "healthy",
      "details": "Process started successfully"
    },
    "shrimp": {
      "status": "healthy", 
      "details": "Process started successfully"
    },
    "reminder": {
      "status": "not_implemented",
      "message": "Reminder MCP服务未实现，功能暂不可用"
    }
  },
  "overallStatus": "healthy",
  "message": "所有服务正常运行"
}
```

### 步骤 3: 测试 MCP 服务功能

```bash
# 测试 ChurnFlow MCP 服务
curl -X POST https://your-api-domain.com/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "测试任务",
    "description": "验证 ChurnFlow MCP 功能",
    "priority": "high"
  }'

# 测试 Shrimp Task Manager MCP 服务
curl -X POST https://your-api-domain.com/api/analyze-task \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "完成项目部署验证"
  }'
```

### 步骤 4: 本地验证（如果需要）

如果部署后仍有问题，可以在本地运行验证脚本：

```bash
# 设置环境变量
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
export PORT=3003

# 运行健康测试脚本
node test-service-health.js
```

## 预期结果

### ✅ 成功状态
- API 服务器健康检查返回 200 状态码
- `overallStatus` 为 "healthy" 或 "degraded"（不会返回 503）
- ChurnFlow MCP 服务正常启动，无 better-sqlite3 错误
- Shrimp Task Manager MCP 服务正常启动
- 所有核心功能（任务创建、分析等）正常工作

### ⚠️ 降级状态
- API 服务器健康检查仍返回 200，但 `overallStatus` 为 "degraded"
- 某些 MCP 服务显示为 "unhealthy" 或 "partially_healthy"
- 核心 API 功能正常，但某些高级功能可能不可用

### ❌ 失败状态
- API 服务器健康检查返回 500 或完全无响应
- 需要检查部署日志和错误信息

## 故障排除

### 问题 1: ChurnFlow MCP 仍无法启动
**症状**: 日志显示 better-sqlite3 相关错误
**解决方案**:
1. 确保 Dockerfile 中包含 `npm rebuild better-sqlite3`
2. 检查 Alpine Linux 构建依赖是否正确安装
3. 考虑在 Dockerfile 中添加: `RUN apk add --no-cache python3 make g++`

### 问题 2: API 服务器返回 503
**症状**: 健康检查返回 503 状态码
**解决方案**:
1. 确认已修改 `api-server/src/index.js` 中的健康检查逻辑
2. 检查是否重新构建并部署了 API 服务器
3. 查看 API 服务器日志确认修改已生效

### 问题 3: MCP 服务连接超时
**症状**: 健康检查显示 MCP 服务为 "unhealthy"
**解决方案**:
1. 检查 MCP 服务是否正确启动
2. 验证环境变量配置是否正确
3. 确认端口配置没有冲突
4. 查看 MCP 服务的独立日志

## 监控和维护

### 日常监控
- 定期检查 `/api/health` 端点状态
- 监控 Railway 控制台的服务状态
- 关注错误日志中的异常模式

### 性能指标
- API 响应时间应 < 500ms
- 健康检查响应时间应 < 100ms
- MCP 服务启动时间应 < 5s

### 更新策略
- 修改代码后，确保重新构建受影响的 Docker 镜像
- 使用 `railway up` 触发重新部署
- 验证修改后的功能正常工作

## 联系支持

如果问题持续存在，请提供以下信息：
1. Railway 部署日志
2. 健康检查端点响应
3. 特定服务的错误日志
4. 重现步骤和环境信息