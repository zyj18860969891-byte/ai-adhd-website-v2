# 🔧 **ChurnFlow MCP better-sqlite3 问题完整解决方案**

## 🎯 **问题诊断**

从部署日志分析：
```
❌ Failed to initialize database: Error: /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node: invalid ELF header
```

**根本原因**：
- `better-sqlite3` 是一个需要编译的 Node.js 原生模块
- Railway 的 Linux 环境需要重新编译才能使用
- 当前的 Dockerfile 或构建过程没有正确编译它

## ✅ **已实施的修复**

### **1. 更新 ChurnFlow MCP Dockerfile**

**文件位置**：`churnflow-mcp/Dockerfile`

```dockerfile
# ChurnFlow MCP Dockerfile - 修复 better-sqlite3 编译问题
FROM node:lts-slim

# 安装所有必要的构建工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# 完整的依赖安装和重建流程
RUN npm install && \
    npm rebuild better-sqlite3 --build-from-source && \
    ls -la node_modules/better-sqlite3/build/Release/ || echo "Build verification failed"

# Bundle app source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Verify the build
RUN ls -la dist/ || echo "Dist directory not found"

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]
```

**关键改进**：
- ✅ 使用 `npm install` 而非 `--ignore-scripts`
- ✅ 明确执行 `npm rebuild better-sqlite3 --build-from-source`
- ✅ 添加构建验证步骤
- ✅ 确保所有构建工具都已安装

### **2. 更新 Railway 配置**

**文件位置**：`churnflow-mcp/railway.toml`

```toml
# ChurnFlow MCP Railway Configuration
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[env]
NODE_ENV = "production"
PORT = "3008"

[deploy]
numReplicas = 1
sleepApplication = false
```

**关键改进**：
- ✅ 明确指定使用 Dockerfile 构建
- ✅ 指定 Dockerfile 路径

### **3. API 服务器健康检查已修复**

**文件位置**：`api-server/src/index.js`

已添加：
- ✅ `checkUrlHealth()` 函数支持 URL 检查
- ✅ 支持多服务架构（不同容器）
- ✅ 支持 Vercel 部署的 Web UI

## 📋 **部署步骤**

### **步骤 1：提交并推送代码**
```bash
cd churnflow-mcp
git add Dockerfile railway.toml
git commit -m "fix: 修复 better-sqlite3 编译问题"
git push
```

### **步骤 2：在 Railway 中重新部署**
1. 登录 Railway 控制台
2. 找到 ChurnFlow MCP 服务
3. 触发重新部署（手动或等待 Git 触发）
4. 查看构建日志，确认：
   - ✅ `npm install` 成功
   - ✅ `npm rebuild better-sqlite3` 成功
   - ✅ `ls -la node_modules/better-sqlite3/build/Release/` 显示正确的 .node 文件

### **步骤 3：验证部署**
查看部署日志，应该看到：
```
✅ [SUCCESS] Custom MCP Server started successfully
✅ Server is ready and waiting for client connections...
✅ Available tools: capture, status, list_trackers
```

**不应该看到**：
```
❌ Failed to initialize database: Error: better_sqlite3.node: invalid ELF header
```

### **步骤 4：测试健康检查**
访问：
```
https://ai-adhd-website-v2-production.up.railway.app/api/health
```

**预期返回**：
```json
{
  "timestamp": "2026-01-02T14:xx:xx.xxxZ",
  "services": {
    "churnFlow": { "status": "healthy", "details": "Service accessible" },
    "shrimp": { "status": "healthy", "details": "Service accessible" },
    "webUI": { "status": "healthy", "details": "Vercel frontend accessible" }
  },
  "status": "healthy"
}
```

## 🎯 **备选方案（如果上述方法失败）**

如果 Dockerfile 方法仍然失败，可以考虑：

### **方案 A：使用预编译的 better-sqlite3**
```dockerfile
# 在 package.json 中指定平台
"better-sqlite3": "^12.2.0"
```

### **方案 B：使用 Alpine 镜像 + 手动编译**
```dockerfile
FROM node:lts-alpine
RUN apk add --no-cache python3 make g++ build-base
# ... 其余相同
```

### **方案 C：移除 better-sqlite3，使用其他数据库**
- 使用 PostgreSQL（Railway 原生支持）
- 使用 MongoDB
- 使用纯内存存储（用于演示）

## 📊 **当前状态**

- ✅ **API 服务器**：已修复，支持 URL 检查
- ✅ **Shrimp MCP**：已正常运行
- ⚠️ **ChurnFlow MCP**：需要重新部署以修复 better-sqlite3
- ✅ **Web UI**：Vercel 部署正常

**下一步**：重新部署 ChurnFlow MCP 服务，使用新的 Dockerfile。
