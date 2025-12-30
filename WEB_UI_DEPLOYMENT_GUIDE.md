# 🌐 Web UI 部署指南

## 🔍 问题诊断

### 当前状态
- **API 服务器**: ✅ 正常运行在 Railway
- **MCP 服务**: ✅ 正常运行在 Railway  
- **Web UI**: ❌ 未部署在 Vercel

### 问题原因
访问 `ai-adhd-website-v2.vercel.app` 时返回 404，是因为 Vercel 上没有部署 Web UI 应用。

## 🚀 部署步骤

### 方法 1: 使用部署脚本 (推荐)

#### PowerShell 脚本 (Windows)
```powershell
# 在项目根目录运行
.\deploy-web-ui.ps1
```

#### Bash 脚本 (Linux/Mac)
```bash
# 在项目根目录运行
chmod +x deploy-web-ui.sh
./deploy-web-ui.sh
```

### 方法 2: 手动部署

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 进入 Web UI 目录
```bash
cd web-ui
```

#### 4. 部署到 Vercel
```bash
vercel --prod
```

#### 5. 确认部署
部署完成后，Vercel 会显示部署 URL，通常是：
```
https://ai-adhd-website-v2.vercel.app
```

## 📋 前置条件

### 必需条件
1. **Node.js** (版本 >= 16)
2. **npm** 或 **yarn**
3. **Vercel CLI** 已安装
4. **Vercel 账户** 已登录

### 检查命令
```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Vercel CLI
vercel --version

# 检查是否已登录
vercel whoami
```

## 🔧 配置说明

### 环境变量配置
Web UI 的环境变量已配置在以下文件中：

#### `.env.production` (生产环境)
```bash
NEXT_PUBLIC_API_URL=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://ai-adhd-website-v2-production.up.railway.app
NEXT_PUBLIC_TASK_MANAGER_API=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_ADHD_REMINDER_API=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://churnflow-mcp-production.up.railway.app
NEXT_PUBLIC_MCP_SHRIMP_URL=https://shrimp-task-manager-production.up.railway.app
```

#### `vercel.json` (Vercel 配置)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "web-ui/package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://ai-adhd-website-v2-production.up.railway.app/api",
    "NEXT_PUBLIC_WEBSOCKET_URL": "wss://ai-adhd-website-v2-production.up.railway.app",
    "NEXT_PUBLIC_TASK_MANAGER_API": "https://ai-adhd-website-v2-production.up.railway.app/api",
    "NEXT_PUBLIC_ADHD_REMINDER_API": "https://ai-adhd-website-v2-production.up.railway.app/api",
    "NEXT_PUBLIC_MCP_CHURNFLOW_URL": "https://churnflow-mcp-production.up.railway.app",
    "NEXT_PUBLIC_MCP_SHRIMP_URL": "https://shrimp-task-manager-production.up.railway.app"
  }
}
```

## 🎯 部署架构

### 当前架构
```
用户浏览器
    ↓ HTTPS
Vercel (Web UI) ← 静态文件托管
    ↓ API 调用
Railway (API 服务器) ← 后端服务
    ↓ stdio
Railway (MCP 服务) ← AI 功能
```

### 域名分配
- **Web UI**: `ai-adhd-website-v2.vercel.app`
- **API 服务器**: `ai-adhd-website-v2-production.up.railway.app`
- **MCP 服务**: 
  - ChurnFlow: `churnflow-mcp-production.up.railway.app`
  - Shrimp: `shrimp-task-manager-production.up.railway.app`

## 📊 部署验证

### 1. 检查 Vercel 部署状态
```bash
vercel status
```

### 2. 验证 Web UI 访问
```bash
curl -I https://ai-adhd-website-v2.vercel.app
```
预期响应: `HTTP/1.1 200 OK`

### 3. 验证 API 连接
```bash
curl https://ai-adhd-website-v2.vercel.app/api/health
```
预期响应: 返回 API 服务器的健康状态

### 4. 检查浏览器控制台
打开浏览器开发者工具，查看是否有网络错误或 CORS 问题。

## 🚨 常见问题

### 问题 1: Vercel CLI 未安装
**错误**: `vercel : 无法将"vercel"项识别为 cmdlet`
**解决**: 
```bash
npm install -g vercel
```

### 问题 2: 未登录 Vercel
**错误**: `Not logged in`
**解决**:
```bash
vercel login
```

### 问题 3: 构建失败
**错误**: `Build failed`
**解决**:
1. 检查 `web-ui/package.json` 是否存在
2. 检查 Node.js 版本是否兼容
3. 查看 Vercel 构建日志

### 问题 4: 环境变量问题
**错误**: API 连接失败
**解决**:
1. 检查 `.env.production` 文件
2. 检查 `vercel.json` 中的 `env` 配置
3. 确认所有域名配置正确

## 📞 故障排除

### 检查部署日志
```bash
vercel logs
```

### 查看构建详情
```bash
vercel inspect
```

### 手动设置环境变量
```bash
vercel env add NEXT_PUBLIC_API_URL
# 然后输入: https://ai-adhd-website-v2-production.up.railway.app/api
```

### 重新部署
```bash
vercel --prod --force
```

## 🎉 预期结果

部署成功后：

1. **Web UI 可访问**: `https://ai-adhd-website-v2.vercel.app`
2. **API 连接正常**: 不再出现 404 错误
3. **功能正常**: 任务管理、MCP 集成等功能可用
4. **控制台无错误**: 浏览器控制台不再显示连接错误

## 📋 后续维护

### 更新 Web UI
```bash
cd web-ui
git add .
git commit -m "更新 Web UI"
git push origin main
# Vercel 会自动触发重新部署
```

### 更新环境配置
修改 `.env.production` 或 `vercel.json` 后，需要重新部署：
```bash
vercel --prod
```

### 监控状态
定期检查：
- Vercel 控制台的部署状态
- Railway 控制台的服务状态
- 浏览器控制台的错误信息

---

**部署指南版本**: 2025年12月31日
**支持平台**: Windows, Linux, Mac
**所需工具**: Node.js, npm, Vercel CLI