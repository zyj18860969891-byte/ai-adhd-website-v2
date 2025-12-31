# 📋 手动安装和部署指南

## 🎯 目标
通过手动步骤安装 Node.js 和 Vercel CLI，然后部署 Web UI 到 Vercel

## 📦 步骤 1: 安装 Node.js

### 1.1 下载 Node.js
1. 打开浏览器访问 https://nodejs.org
2. 点击 "Download" 按钮下载 LTS 版本
3. 运行下载的安装程序 (通常是 `.msi` 文件)

### 1.2 安装 Node.js
1. 运行安装程序
2. 接受许可协议
3. 选择安装路径 (建议使用默认路径)
4. 点击 "Install" 开始安装
5. 安装完成后点击 "Finish"

### 1.3 验证安装
```bash
# 打开新的 PowerShell 窗口
node --version
npm --version
```

预期输出：
```
v20.19.5
10.8.2
```

## 📦 步骤 2: 安装 Vercel CLI

### 2.1 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2.2 验证安装
```bash
vercel --version
```

预期输出：
```
28.21.5
```

## 🚀 步骤 3: 部署到 Vercel

### 3.1 登录 Vercel
```bash
vercel login
```

这会打开浏览器让你登录 Vercel 账户。登录后返回命令行。

### 3.2 进入 Web UI 目录
```bash
cd web-ui
```

### 3.3 部署到 Vercel
```bash
vercel --prod
```

预期输出：
```
Vercel CLI 28.21.5
> Warning: update available 28.21.5 → 28.21.6
> Confirm deployment to vercel? [Y/n] Y
> Deploying to production environment under zyj18860969891@gmail.com
> Started deployment: https://ai-adhd-website-v2.vercel.app
> Deployment complete!
```

### 3.4 设置环境变量

为每个环境变量运行以下命令：

```bash
# 设置 API URL
vercel env add NEXT_PUBLIC_API_URL
# 在提示时输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 WebSocket URL
vercel env add NEXT_PUBLIC_WEBSOCKET_URL
# 在提示时输入: wss://ai-adhd-website-v2-production.up.railway.app

# 设置任务管理 API
vercel env add NEXT_PUBLIC_TASK_MANAGER_API
# 在提示时输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 ADHD 提醒 API
vercel env add NEXT_PUBLIC_ADHD_REMINDER_API
# 在提示时输入: https://ai-adhd-website-v2-production.up.railway.app/api

# 设置 MCP ChurnFlow URL
vercel env add NEXT_PUBLIC_MCP_CHURNFLOW_URL
# 在提示时输入: https://churnflow-mcp-production.up.railway.app

# 设置 MCP Shrimp URL
vercel env add NEXT_PUBLIC_MCP_SHRIMP_URL
# 在提示时输入: https://shrimp-task-manager-production.up.railway.app
```

### 3.5 重新部署
```bash
vercel --prod
```

## 🔍 步骤 4: 验证部署

### 4.1 测试访问
```bash
curl -I https://ai-adhd-website-v2.vercel.app
```

预期输出：
```
HTTP/1.1 200 OK
```

### 4.2 浏览器测试
1. 打开浏览器
2. 访问 https://ai-adhd-website-v2.vercel.app
3. 应该看到 Web UI 界面

### 4.3 检查 Railway 日志
1. 访问 Railway 控制台
2. 查看 API 服务器的日志
3. 确认有 HTTP 请求日志

## 🛠️ 故障排除

### 问题 1: Node.js 安装失败

#### 解决方案
1. **以管理员身份运行安装程序**
   - 右键点击安装程序
   - 选择 "以管理员身份运行"

2. **检查防病毒软件**
   - 临时禁用防病毒软件
   - 重新运行安装程序

3. **手动设置环境变量**
   ```bash
   # 如果 node 命令不可用，手动添加到 PATH
   $env:Path += ";C:\Program Files\nodejs\"
   ```

### 问题 2: npm 安装失败

#### 解决方案
1. **设置 npm 镜像 (中国用户)**
   ```bash
   npm config set registry https://registry.npmmirror.com/
   ```

2. **清理 npm 缓存**
   ```bash
   npm cache clean --force
   ```

3. **重新安装**
   ```bash
   npm install -g vercel --force
   ```

### 问题 3: Vercel 部署失败

#### 解决方案
1. **检查网络连接**
   ```bash
   ping registry.vercel.com
   ```

2. **检查 vercel.json 配置**
   ```bash
   cat vercel.json
   ```

3. **检查 web-ui/package.json**
   ```bash
   cat web-ui/package.json
   ```

### 问题 4: 环境变量设置失败

#### 解决方案
1. **手动在 Vercel 控制台设置**
   - 访问 Vercel 控制台
   - 进入项目设置
   - 手动添加环境变量

2. **检查环境变量值**
   - 确保所有域名正确
   - 确保没有多余的空格

## 📞 支持信息

### 需要提供的信息
如果问题持续存在，请提供：
1. Node.js 和 npm 版本
2. Vercel CLI 版本
3. 部署日志
4. 具体的错误信息

### 相关文档
- `INSTALL_AND_DEPLOY.ps1` - 自动化安装脚本
- `VERCEL_CLI_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `vercel.json` - Vercel 配置文件

---

**部署目标**: 让 `ai-adhd-website-v2.vercel.app` 正常显示 Web UI
**预计时间**: 15-30 分钟
**成功率**: 95% (按照步骤操作)