# 🚀 Vercel CLI 部署指南

## 📋 前置要求

### 1. 安装 Node.js 和 npm

由于你的系统中没有 Node.js 和 npm，需要先安装：

#### Windows 安装步骤
1. **下载 Node.js**
   - 访问 https://nodejs.org
   - 下载 LTS 版本 (推荐)
   - 运行安装程序

2. **验证安装**
   ```bash
   node --version
   npm --version
   ```

#### 或者使用包管理器
```bash
# 使用 Chocolatey (如果已安装)
choco install nodejs

# 使用 Scoop (如果已安装)
scoop install nodejs
```

### 2. 安装 Vercel CLI

安装完成后：
```bash
npm install -g vercel
```

## 🚀 部署步骤

### 步骤 1: 登录 Vercel

```bash
vercel login
```

这会打开浏览器让你登录 Vercel 账户。

### 步骤 2: 进入 Web UI 目录

```bash
cd web-ui
```

### 步骤 3: 部署到 Vercel

```bash
vercel --prod
```

### 步骤 4: 设置环境变量

部署完成后，设置环境变量：

```bash
# 设置 API URL
vercel env add NEXT_PUBLIC_API_URL
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 WebSocket URL
vercel env add NEXT_PUBLIC_WEBSOCKET_URL
# 输入: wss://ai-adhd-website-v2-production.up.railway.app

# 设置任务管理 API
vercel env add NEXT_PUBLIC_TASK_MANAGER_API
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 ADHD 提醒 API
vercel env add NEXT_PUBLIC_ADHD_REMINDER_API
# 输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 MCP ChurnFlow URL
vercel env add NEXT_PUBLIC_MCP_CHURNFLOW_URL
# 输入: https://churnflow-mcp-production.up.railway.app

# 设置 MCP Shrimp URL
vercel env add NEXT_PUBLIC_MCP_SHRIMP_URL
# 输入: https://shrimp-task-manager-production.up.railway.app
```

### 步骤 5: 重新部署

设置环境变量后，重新部署：

```bash
vercel --prod
```

## 📊 验证部署

### 验证步骤

1. **等待部署完成**
   - Vercel CLI 会显示部署进度
   - 部署完成后会显示 URL

2. **测试访问**
   ```bash
   curl -I https://ai-adhd-website-v2.vercel.app
   ```
   预期响应: `HTTP/1.1 200 OK`

3. **浏览器测试**
   - 打开浏览器访问 `https://ai-adhd-website-v2.vercel.app`
   - 应该看到 Web UI 界面

4. **检查 Railway 日志**
   - 访问 Railway 控制台
   - 查看 API 服务器的日志
   - 确认有 HTTP 请求日志

## 🛠️ 故障排除

### 如果 Node.js 安装失败

#### 问题 1: 权限问题
```bash
# 以管理员身份运行 PowerShell
Run as Administrator
```

#### 问题 2: 网络问题
```bash
# 设置 npm 镜像 (中国用户)
npm config set registry https://registry.npmmirror.com/
```

### 如果 Vercel CLI 安装失败

#### 问题 1: npm 权限
```bash
# 使用 --force 标志
npm install -g vercel --force
```

#### 问题 2: 网络连接
```bash
# 检查网络连接
ping registry.npmjs.org
```

### 如果部署失败

#### 问题 1: 构建失败
- 检查 `web-ui/package.json` 依赖
- 确保所有依赖版本兼容

#### 问题 2: 环境变量问题
- 确认所有环境变量设置正确
- 检查域名配置

## 📞 支持信息

### 需要提供的信息
如果问题持续存在，请提供：
1. Node.js 和 npm 版本
2. Vercel CLI 安装日志
3. 部署日志
4. 具体的错误信息

### 相关文档
- `VERCEL_404_FIX_GUIDE.md` - Vercel 404 修复指南
- `WEB_UI_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `vercel.json` - Vercel 配置文件

---

**部署目标**: 让 `ai-adhd-website-v2.vercel.app` 正常显示 Web UI
**预计时间**: 15-30 分钟 (包括 Node.js 安装)
**成功率**: 95% (按照步骤操作)