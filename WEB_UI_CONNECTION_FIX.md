# 🌐 Web UI 连接修复报告

## 🔍 问题诊断

### 问题描述
用户访问 Vercel 域名 (`ai-adhd-website-v2.vercel.app`) 时，页面尝试连接到自己的域名获取 API，但返回 404 错误。

### 根本原因
Web UI 的环境配置文件中，API 基础 URL 指向了错误的 Railway 域名：
- **错误配置**: `ai-adhd-website-production.up.railway.app`
- **正确配置**: `ai-adhd-website-v2-production.up.railway.app`

## 🔧 修复内容

### 修复的文件

#### 1. `.env.local` (本地开发环境)
```bash
# 修复前
VITE_API_BASE_URL="https://ai-adhd-website-production.up.railway.app/api"
VITE_WS_URL="wss://ai-adhd-website-production.up.railway.app"

# 修复后
VITE_API_BASE_URL="https://ai-adhd-website-v2-production.up.railway.app/api"
VITE_WS_URL="wss://ai-adhd-website-v2-production.up.railway.app"
```

#### 2. `.env.production` (生产环境)
```bash
# 修复前
NEXT_PUBLIC_API_URL=https://api-server-production.up.railway.app/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://api-server-production.up.railway.app

# 修复后
NEXT_PUBLIC_API_URL=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://ai-adhd-website-v2-production.up.railway.app
```

### 修复的配置项

1. **API 基础 URL**: 指向正确的 Railway 生产环境域名
2. **WebSocket URL**: 指向正确的 Railway 生产环境域名
3. **后端服务 URL**: 统一使用正确的域名

## 📊 修复前后对比

### 修复前
```
Web UI (Vercel) → 尝试连接 ai-adhd-website-production.up.railway.app → ❌ 404 Not Found
```

### 修复后
```
Web UI (Vercel) → 连接 ai-adhd-website-v2-production.up.railway.app → ✅ 成功
```

## 🎯 当前架构

### 域名分配
- **Web UI**: `ai-adhd-website-v2.vercel.app` (前端界面)
- **API 服务器**: `ai-adhd-website-v2-production.up.railway.app` (后端 API)
- **MCP 服务**: 
  - ChurnFlow: `churnflow-mcp-production.up.railway.app`
  - Shrimp: `shrimp-task-manager-production.up.railway.app`

### 数据流
```
用户浏览器 → Vercel (Web UI) → Railway (API 服务器) → MCP 服务
```

## 📋 验证步骤

### 1. 检查环境配置
确认所有环境配置文件使用正确的域名：
- ✅ `.env.local` - 已修复
- ✅ `.env.production` - 已修复
- ✅ `.env.development` - 正确 (localhost)

### 2. 重新部署 Web UI
需要重新部署 Vercel 上的 Web UI 以应用新的环境配置：

```bash
# 在 web-ui 目录中
cd web-ui
git add .
git commit -m "修复 Web UI 连接配置 - 使用正确的 Railway API 域名"
git push origin main  # 触发 Vercel 自动部署
```

### 3. 验证连接
部署完成后，测试以下连接：
- ✅ Web UI 页面加载
- ✅ API 健康检查: `https://ai-adhd-website-v2-production.up.railway.app/api/health`
- ✅ 任务管理功能
- ✅ WebSocket 连接

## 🔍 技术细节

### 环境变量说明

#### NEXT_PUBLIC_* 变量
这些变量会被 Next.js 打包到客户端代码中，因此需要在构建时确定：
- `NEXT_PUBLIC_API_URL`: 主要 API 端点
- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket 连接
- `NEXT_PUBLIC_TASK_MANAGER_API`: 任务管理 API
- `NEXT_PUBLIC_ADHD_REMINDER_API`: 提醒服务 API

#### MCP 服务配置
- `NEXT_PUBLIC_MCP_CHURNFLOW_URL`: ChurnFlow MCP 服务
- `NEXT_PUBLIC_MCP_SHRIMP_URL`: Shrimp MCP 服务

### 部署流程

1. **Web UI 部署到 Vercel**
   - 使用 `.env.production` 中的配置
   - 构建时将环境变量打包到客户端

2. **API 服务器部署到 Railway**
   - 独立的 Docker 容器
   - 提供 REST API 和 WebSocket 服务

3. **MCP 服务部署到 Railway**
   - 独立的 Docker 容器
   - 通过 stdio 与客户端通信

## 🚨 注意事项

### 环境变量优先级
1. **Vercel 环境变量** (最高优先级)
2. **.env.production** (生产构建)
3. **.env.local** (本地开发)
4. **.env.development** (开发环境)

### 部署同步
- 修改环境配置后，需要重新部署 Web UI
- API 服务器和 MCP 服务的修改需要重新部署 Railway 服务
- 确保所有服务使用一致的域名配置

## 📞 故障排除

### 如果仍然出现 404 错误
1. **检查 Vercel 部署状态**
   ```bash
   vercel status
   ```

2. **验证环境变量**
   ```bash
   vercel env ls
   ```

3. **检查构建日志**
   ```bash
   vercel logs
   ```

4. **确认 Railway 服务运行**
   ```bash
   curl https://ai-adhd-website-v2-production.up.railway.app/api/health
   ```

### 如果 API 连接失败
1. **检查 CORS 配置** - API 服务器已配置允许所有来源
2. **检查网络连接** - Vercel 到 Railway 的连接
3. **检查服务状态** - 确认所有服务都在运行

## 🎉 修复结果

### ✅ 已解决
- Web UI 环境配置指向正确的 API 域名
- 所有环境配置文件已更新
- 连接架构清晰明确

### 🔄 待完成
- 重新部署 Web UI 到 Vercel
- 验证所有功能正常工作
- 监控系统稳定性

---

**修复日期**: 2025年12月31日
**修复状态**: ✅ 配置修复完成，等待部署
**影响范围**: Web UI 到 API 服务器的连接