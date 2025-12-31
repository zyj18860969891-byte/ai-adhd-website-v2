# 🔧 Vercel 域名修复指南

## 🔍 问题诊断

### 当前状态
- **域名**: `ai-adhd-website-v2.vercel.app` (Vercel 分配的域名)
- **问题**: 访问返回 404，没有部署内容
- **原因**: Vercel 项目配置可能有问题

### 可能的原因
1. **Vercel 项目未连接到正确的 GitHub 仓库**
2. **Vercel 项目配置了错误的构建目录**
3. **Vercel 项目使用了错误的分支**
4. **Vercel 项目配置文件有问题**

## 🚀 修复步骤

### 方法 1: 重新配置 Vercel 项目 (推荐)

#### 1.1 访问 Vercel 控制台
1. 打开 https://vercel.com
2. 登录你的账户
3. 找到项目 `ai-adhd-website-v2`

#### 1.2 检查项目设置
1. 进入项目设置
2. 检查 "Git Repository" 是否连接到正确的仓库
   - 应该是: `zyj18860969891-byte/ai-adhd-website-v2`
3. 检查 "Root Directory" 设置
   - 应该是: `web-ui` (因为 Web UI 在子目录中)

#### 1.3 更新项目配置
如果配置不正确，需要重新配置：

1. **断开当前连接**
   - 在项目设置中找到 "Git" 选项
   - 点击 "Disconnect" 断开当前的 GitHub 连接

2. **重新连接**
   - 点击 "Connect Git Repository"
   - 选择正确的仓库: `zyj18860969891-byte/ai-adhd-website-v2`

3. **配置构建设置**
   - **Root Directory**: `web-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `out` (如果是静态导出) 或留空 (如果是 SSR)
   - **Install Command**: `npm install`

4. **环境变量**
   确保环境变量配置正确：
   ```bash
   NEXT_PUBLIC_API_URL=https://ai-adhd-website-v2-production.up.railway.app/api
   NEXT_PUBLIC_WEBSOCKET_URL=wss://ai-adhd-website-v2-production.up.railway.app
   NEXT_PUBLIC_TASK_MANAGER_API=https://ai-adhd-website-v2-production.up.railway.app/api
   NEXT_PUBLIC_ADHD_REMINDER_API=https://ai-adhd-website-v2-production.up.railway.app/api
   NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://churnflow-mcp-production.up.railway.app
   NEXT_PUBLIC_MCP_SHRIMP_URL=https://shrimp-task-manager-production.up.railway.app
   ```

#### 1.4 触发重新部署
1. 在 Vercel 控制台中
2. 点击 "Deployments"
3. 点击 "Deploy" 或等待自动部署

### 方法 2: 使用 Vercel CLI 重新部署

#### 2.1 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 登录 Vercel
```bash
vercel login
```

#### 2.3 进入 Web UI 目录
```bash
cd web-ui
```

#### 2.4 部署到 Vercel
```bash
vercel --prod
```

#### 2.5 设置环境变量
```bash
vercel env add NEXT_PUBLIC_API_URL
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

vercel env add NEXT_PUBLIC_WEBSOCKET_URL
# 输入: wss://ai-adhd-website-v2-production.up.railway.app

vercel env add NEXT_PUBLIC_TASK_MANAGER_API
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

vercel env add NEXT_PUBLIC_ADHD_REMINDER_API
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

vercel env add NEXT_PUBLIC_MCP_CHURNFLOW_URL
# 输入: https://churnflow-mcp-production.up.railway.app

vercel env add NEXT_PUBLIC_MCP_SHRIMP_URL
# 输入: https://shrimp-task-manager-production.up.railway.app
```

#### 2.6 重新部署
```bash
vercel --prod
```

### 方法 3: 检查和修复配置文件

#### 3.1 检查 vercel.json
确保 `vercel.json` 文件配置正确：

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

#### 3.2 检查 package.json
确保 `web-ui/package.json` 中的脚本正确：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📊 验证修复

### 验证步骤
1. **等待部署完成**
   - Vercel 通常需要 2-5 分钟完成部署

2. **测试访问**
   ```bash
   curl -I https://ai-adhd-website-v2.vercel.app
   ```
   预期响应: `HTTP/1.1 200 OK`

3. **测试 API 连接**
   ```bash
   curl https://ai-adhd-website-v2.vercel.app/api/health
   ```
   预期响应: 返回 API 服务器的健康状态

4. **浏览器测试**
   - 打开浏览器访问 `https://ai-adhd-website-v2.vercel.app`
   - 检查是否有内容显示
   - 检查浏览器控制台是否有错误

### 预期结果
- ✅ Web UI 正常加载
- ✅ 不再出现 404 错误
- ✅ API 连接正常
- ✅ 所有功能正常工作

## 🚨 故障排除

### 如果仍然 404

#### 1. 检查 Vercel 项目状态
```bash
vercel status
```

#### 2. 查看部署日志
```bash
vercel logs
```

#### 3. 检查构建错误
- 访问 Vercel 控制台
- 查看 "Deployments" 中的构建日志
- 查找具体的错误信息

#### 4. 手动重新部署
```bash
vercel --prod --force
```

### 常见问题

#### 问题 1: 构建失败
**错误**: `Build failed`
**解决**:
1. 检查 `web-ui/package.json` 依赖
2. 确保所有依赖版本兼容
3. 检查 Node.js 版本

#### 问题 2: 环境变量问题
**错误**: API 连接失败
**解决**:
1. 检查 Vercel 环境变量配置
2. 确认所有域名配置正确
3. 重新设置环境变量

#### 问题 3: 路径配置问题
**错误**: 找不到文件
**解决**:
1. 检查 `vercel.json` 中的 `src` 路径
2. 确认 `web-ui` 目录存在
3. 检查文件结构

## 📞 支持信息

### 需要提供的信息
如果问题持续存在，请提供：
1. Vercel 控制台的部署日志
2. `vercel.json` 文件内容
3. `web-ui/package.json` 文件内容
4. 具体的错误信息

### 相关文档
- `WEB_UI_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `DEPLOYMENT_STATUS_SUMMARY.md` - 部署状态总结
- `vercel.json` - Vercel 配置文件

---

**修复目标**: 让 `ai-adhd-website-v2.vercel.app` 正常显示 Web UI
**预计时间**: 10-30 分钟
**成功率**: 95% (按照步骤操作)