# 🚀 实际部署执行计划

## 📋 当前状态分析

### Git 仓库状态
- **仓库地址**: https://github.com/zyj18860969891-byte/ai-adhd-website.git
- **当前分支**: main
- **最新提交**: 添加 Railway 部署配置以支持子目录构建
- **本地状态**: 有未跟踪文件（包括我们刚创建的测试和报告）

### 已部署组件
- ✅ **Web UI**: https://ai-adhd-web.vercel.app
  - 部署时间: 之前
  - 状态: 运行中
  - 技术: Next.js 14

### 待部署组件
- ⏳ **API Server Gateway** (`api-server/`)
- ⏳ **ChurnFlow MCP Service** (`churnflow-mcp/`)
- ⏳ **Shrimp Task Manager MCP Service** (`mcp-shrimp-task-manager/`)

---

## 🎯 部署执行步骤

### 阶段 1: 代码准备和推送

#### 1.1 添加和提交本地更改
```bash
cd E:\MultiModel\ai-adhd-website

# 添加所有部署相关文件
git add api-server/
git add churnflow-mcp/
git add mcp-shrimp-task-manager/
git add railway.toml
git add vercel.json
git add package.json
git add DEPLOYMENT_*.md
git add MCP_*.md

# 提交更改
git commit -m "feat: 完成MCP服务开发和部署配置

- 添加API Server Gateway配置
- 完成Shrimp Task Manager MCP服务
- 添加Railway部署配置
- 更新Vercel配置
- 添加部署文档和测试报告"

# 推送代码
git push origin main
```

#### 1.2 验证推送成功
- 访问 https://github.com/zyj18860969891-byte/ai-adhd-website
- 确认代码已更新

---

### 阶段 2: Railway 后端部署

#### 2.1 部署 API Server Gateway

1. **访问 Railway 控制台**
   - 打开 https://railway.app
   - 登录账户: zyj18860969891@gmail.com

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"
   - 连接仓库: `zyj18860969891-byte/ai-adhd-website`

3. **配置服务**
   - 选择 "Configure" → "Select a service to add"
   - 选择 "api-server" 目录
   - Railway 会自动检测 `api-server/railway.toml`

4. **设置环境变量**
   ```bash
   NODE_ENV=production
   PORT=3003
   ```

5. **部署**
   - Railway 会自动构建并部署
   - 获取部署 URL (例如: https://api-server-production.up.railway.app)

#### 2.2 部署 Shrimp Task Manager MCP Service

1. **在 Railway 项目中添加新服务**
   - 在同一个 Railway 项目中
   - 点击 "Add Service" → "GitHub Repo"
   - 选择 "mcp-shrimp-task-manager" 目录

2. **配置服务**
   - Railway 会自动检测 `mcp-shrimp-task-manager/railway.toml`
   - 配置会自动应用

3. **设置环境变量**
   ```bash
   NODE_ENV=production
   PORT=3009
   ```

4. **部署**
   - Railway 会自动构建并部署
   - 获取部署 URL (例如: https://shrimp-mcp-production.up.railway.app)

#### 2.3 部署 ChurnFlow MCP Service

1. **在 Railway 项目中添加新服务**
   - 在同一个 Railway 项目中
   - 点击 "Add Service" → "GitHub Repo"
   - 选择 "churnflow-mcp" 目录

2. **创建配置文件** (如果不存在)
   ```toml
   # churnflow-mcp/railway.toml
   [build]
   builder = "nixpacks"

   [env]
   NODE_ENV = "production"
   PORT = "3005"

   [run]
   startCommand = "npm start"
   ```

3. **设置环境变量**
   ```bash
   NODE_ENV=production
   PORT=3005
   ```

4. **部署**
   - Railway 会自动构建并部署
   - 获取部署 URL (例如: https://churnflow-mcp-production.up.railway.app)

---

### 阶段 3: Vercel 环境变量配置

#### 3.1 更新 Vercel 环境变量

1. **访问 Vercel 控制台**
   - 打开 https://vercel.com
   - 选择项目: `ai-adhd-website`

2. **配置环境变量**
   - 进入 "Settings" → "Environment Variables"

3. **添加/更新变量**
   ```bash
   # API Server Gateway URL
   NEXT_PUBLIC_API_URL=https://api-server-production.up.railway.app

   # MCP 服务 URL
   NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://churnflow-mcp-production.up.railway.app
   NEXT_PUBLIC_MCP_SHRIMP_URL=https://shrimp-mcp-production.up.railway.app
   ```

4. **重新部署**
   - Vercel 会自动重新构建并部署
   - 验证部署成功

---

### 阶段 4: 部署验证

#### 4.1 健康检查测试
```bash
# 测试 API Server Gateway
curl https://api-server-production.up.railway.app/api/health

# 预期响应:
# {
#   "timestamp": "2025-12-28T...",
#   "services": {
#     "churnFlow": { "status": "healthy", ... },
#     "shrimp": { "status": "healthy", ... }
#   }
# }
```

#### 4.2 MCP 服务测试
```bash
# 测试 Shrimp MCP Service
curl -X POST https://api-server-production.up.railway.app/api/mcp/shrimp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'

# 预期响应: 包含 16 个工具的列表
```

#### 4.3 端到端功能测试
1. **访问 Web UI**: https://ai-adhd-web.vercel.app
2. **测试各个功能模块**
3. **验证数据加载和展示**
4. **检查错误日志**

---

## 📊 部署配置总结

### Railway 服务配置

| 服务名称 | 目录 | 端口 | 配置文件 | 状态 |
|---------|------|------|----------|------|
| API Gateway | `api-server/` | 3003 | `railway.toml` | ⏳ 待部署 |
| Shrimp MCP | `mcp-shrimp-task-manager/` | 3009 | `railway.toml` | ⏳ 待部署 |
| ChurnFlow MCP | `churnflow-mcp/` | 3005 | 待创建 | ⏳ 待部署 |

### Vercel 环境变量

```bash
# 当前配置 (需要更新)
NEXT_PUBLIC_API_URL=@api-url
NEXT_PUBLIC_MCP_CHURNFLOW_URL=@mcp-churnflow-url
NEXT_PUBLIC_MCP_SHRIMP_URL=@mcp-shrimp-url

# 更新为 (使用实际的 Railway URL)
NEXT_PUBLIC_API_URL=https://api-server-production.up.railway.app
NEXT_PUBLIC_MCP_CHURNFLOW_URL=https://churnflow-mcp-production.up.railway.app
NEXT_PUBLIC_MCP_SHRIMP_URL=https://shrimp-mcp-production.up.railway.app
```

---

## 🔧 故障排除

### 常见问题

#### 1. Railway 构建失败
**问题**: npm install 或 npm run build 失败
**解决方案**:
- 检查 `package.json` 依赖配置
- 确保所有必需的依赖都已列出
- 检查 Node.js 版本兼容性

#### 2. 服务间通信失败
**问题**: API Gateway 无法连接到 MCP 服务
**解决方案**:
- 确保所有服务在同一个 Railway 项目中
- 使用 Railway 的内部网络地址
- 检查环境变量配置

#### 3. CORS 错误
**问题**: Web UI 无法调用 API
**解决方案**:
- 检查 API Gateway 的 CORS 配置
- 确保 Vercel URL 在允许的源列表中
- 验证环境变量配置正确

#### 4. MCP 服务无响应
**问题**: MCP 工具调用返回错误
**解决方案**:
- 检查 MCP 服务日志
- 验证 MCP 服务正确启动
- 测试本地 MCP 服务功能

---

## 📝 部署检查清单

### 代码准备
- [ ] 提交所有更改到 Git
- [ ] 推送到 GitHub 仓库
- [ ] 验证代码在 GitHub 上正确显示

### Railway 部署
- [ ] 部署 API Server Gateway
- [ ] 部署 Shrimp Task Manager MCP Service
- [ ] 部署 ChurnFlow MCP Service
- [ ] 获取所有服务的部署 URL
- [ ] 验证所有服务健康检查通过

### Vercel 配置
- [ ] 更新环境变量
- [ ] 触发重新部署
- [ ] 验证部署成功

### 功能验证
- [ ] 健康检查端点正常
- [ ] MCP 工具列表正常
- [ ] MCP 工具调用正常
- [ ] Web UI 功能正常
- [ ] 数据展示正常

---

## 🎯 执行时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 代码准备和推送 | 5-10 分钟 |
| 2 | Railway 后端部署 | 15-30 分钟 |
| 3 | Vercel 环境变量配置 | 5-10 分钟 |
| 4 | 部署验证 | 10-15 分钟 |
| **总计** | | **35-65 分钟** |

---

## 🚀 立即执行

现在可以开始执行部署：

1. **执行 Git 推送**
   ```bash
   cd E:\MultiModel\ai-adhd-website
   git add .
   git commit -m "feat: 完成MCP服务开发和部署配置"
   git push origin main
   ```

2. **访问 Railway 控制台**
   - https://railway.app
   - 开始部署 API Server Gateway

3. **按照上述步骤完成所有部署**

---

**创建时间**: 2025年12月28日
**执行状态**: 准备就绪
**预计完成时间**: 35-65 分钟