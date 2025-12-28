# 简化部署指南

## 🚀 快速部署方案

由于直接CLI部署遇到了一些技术问题，我们采用以下简化方案：

### 方案一：手动部署（推荐）

#### 1. Railway 后端部署

1. **访问 Railway 控制台**
   - 打开 https://railway.com
   - 登录账户：zyj18860969891@gmail.com

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"
   - 连接GitHub仓库：`jgsteeler/churnflow-mcp`

3. **配置服务**
   - 选择根目录作为服务目录
   - 配置环境变量（参考 `.env.production`）
   - 设置启动命令：`npm run start:backend`

4. **部署**
   - Railway会自动检测配置并部署
   - 获取部署后的URL（用于前端配置）

#### 2. Vercel 前端部署

1. **访问 Vercel 控制台**
   - 打开 https://vercel.com
   - 登录账户

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择GitHub仓库：`jgsteeler/churnflow-mcp`
   - 选择 "web-ui" 作为根目录

3. **配置环境变量**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://your-mcp-churnflow-url.railway.app
   NEXT_PUBLIC_MCP_SHRIMP_URL=https://your-mcp-shrimp-url.railway.app
   ```

4. **部署**
   - Vercel会自动构建并部署
   - 获取部署后的URL

### 方案二：Docker 本地测试

如果线上部署遇到问题，可以先进行本地测试：

```bash
# 构建并启动所有服务
docker-compose up --build

# 访问前端
# http://localhost:3000
```

### 方案三：分步手动部署

#### 后端服务部署

1. **构建后端**
   ```bash
   npm run build
   ```

2. **准备部署文件**
   - 确保所有依赖已安装
   - 配置好环境变量

3. **手动上传到服务器**
   - 使用FTP或Git推送代码
   - 在服务器上运行 `npm start`

#### 前端部署

1. **构建前端**
   ```bash
   cd web-ui
   npm run build
   npm run export
   ```

2. **部署静态文件**
   - 将 `out` 目录内容上传到静态文件托管服务
   - 配置API代理

### 当前状态

✅ **已完成**：
- 项目构建成功
- 所有功能测试通过
- 部署配置文件已准备
- CLI工具已安装

⚠️ **待完成**：
- Railway服务配置（网络超时问题）
- Vercel项目链接（路径配置问题）
- 生产环境变量配置

### 建议

由于遇到技术限制，建议：

1. **使用方案一（手动部署）**：通过Web控制台完成部署
2. **或使用方案二（Docker测试）**：先在本地验证部署配置
3. **联系技术支持**：如果问题持续，可以联系Railway/Vercel技术支持

### 下一步行动

1. 访问 Railway 控制台手动创建服务
2. 访问 Vercel 控制台手动部署前端
3. 配置环境变量和域名
4. 验证部署结果

---

**注意**：这是一个临时解决方案，等技术问题解决后可以回到自动化部署流程。