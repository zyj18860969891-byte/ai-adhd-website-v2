# 🔧 Vercel 项目修复步骤

## 🎯 问题确认

### 当前状态
- **域名**: `ai-adhd-website-v2.vercel.app`
- **错误**: "The page could not be found"
- **原因**: Vercel 项目没有部署任何内容

### 可能原因
1. Vercel 项目未连接到 GitHub 仓库
2. Vercel 项目配置了错误的构建目录
3. Vercel 项目使用了错误的分支
4. Vercel 项目配置文件有问题

## 🚀 立即修复步骤

### 步骤 1: 检查 Vercel 项目状态

#### 1.1 访问 Vercel 控制台
1. 打开浏览器访问 https://vercel.com
2. 登录你的账户 (zyj18860969891@gmail.com)
3. 在项目列表中找到 `ai-adhd-website-v2`

#### 1.2 检查项目详情
在项目页面中检查：
- **Git Repository**: 是否显示连接的 GitHub 仓库
- **Last Deployment**: 最近的部署状态
- **Settings**: 项目配置

### 步骤 2: 重新连接 GitHub 仓库

#### 2.1 断开当前连接（如果需要）
如果项目没有正确连接：
1. 进入项目设置 (Settings)
2. 找到 "Git" 选项
3. 点击 "Disconnect" 断开连接

#### 2.2 重新连接 GitHub 仓库
1. 点击 "Connect Git Repository"
2. 选择 GitHub
3. 授权 Vercel 访问你的 GitHub 账户
4. 选择仓库: `zyj18860969891-byte/ai-adhd-website-v2`

### 步骤 3: 配置项目设置

#### 3.1 设置构建配置
在项目设置中配置：
- **Root Directory**: `web-ui`
- **Build Command**: `npm run build`
- **Output Directory**: (留空，Next.js SSR)
- **Install Command**: `npm install`

#### 3.2 设置环境变量
添加以下环境变量：
```bash
NEXT_PUBLIC_API_URL=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_WEBSOCKET_URL=wss://ai-adhd-website-v2-production.up.railway.app
NEXT_PUBLIC_TASK_MANAGER_API=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_ADHD_REMINDER_API=https://ai-adhd-website-v2-production.up.railway.app/api
NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://churnflow-mcp-production.up.railway.app
NEXT_PUBLIC_MCP_SHRIMP_URL=https://shrimp-task-manager-production.up.railway.app
```

### 步骤 4: 触发部署

#### 4.1 手动触发部署
1. 在 Vercel 控制台
2. 点击 "Deployments"
3. 点击 "Deploy" 按钮
4. 或者推送代码到 GitHub 触发自动部署

#### 4.2 等待部署完成
- 部署通常需要 2-5 分钟
- 查看部署日志确认成功

## 🛠️ 备选方案：使用 Vercel CLI

如果控制台配置有问题，可以使用 Vercel CLI：

### 步骤 A: 安装和登录
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login
```

### 步骤 B: 部署 Web UI
```bash
# 1. 进入 Web UI 目录
cd web-ui

# 2. 部署到 Vercel
vercel --prod
```

### 步骤 C: 设置环境变量
```bash
# 设置环境变量
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

### 步骤 D: 重新部署
```bash
vercel --prod
```

## 📊 验证修复

### 验证步骤
1. **等待部署完成** (2-5 分钟)
2. **测试访问**
   ```bash
   curl -I https://ai-adhd-website-v2.vercel.app
   ```
   预期响应: `HTTP/1.1 200 OK`

3. **浏览器测试**
   - 打开浏览器访问 `https://ai-adhd-website-v2.vercel.app`
   - 应该看到 Web UI 界面

4. **API 连接测试**
   - 检查浏览器控制台
   - 确认没有 404 错误
   - 确认 API 连接正常

### 预期结果
- ✅ Web UI 正常加载
- ✅ 不再出现 "The page could not be found" 错误
- ✅ API 连接正常
- ✅ 所有功能正常工作

## 🚨 故障排除

### 如果仍然显示 "The page could not be found"

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

### 常见问题解决

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
1. Vercel 控制台的部署日志截图
2. `vercel.json` 文件内容
3. `web-ui/package.json` 文件内容
4. 具体的错误信息

### 相关文档
- `VERCEL_DOMAIN_FIX.md` - 详细修复指南
- `WEB_UI_DEPLOYMENT_GUIDE.md` - 部署指南
- `vercel.json` - Vercel 配置文件

---

**修复目标**: 让 `ai-adhd-website-v2.vercel.app` 正常显示 Web UI
**预计时间**: 10-30 分钟
**成功率**: 95% (按照步骤操作)