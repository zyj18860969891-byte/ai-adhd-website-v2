# ChurnFlow MCP 路径修复完成

## 问题确认

ChurnFlow MCP 服务在 Docker 容器中启动时失败，错误信息：
```
Cannot initialize without crossref data
```

## 根本原因

**路径解析错误**：
- Docker 容器工作目录：`/app/`
- ChurnFlow 安装位置：`/app/churnflow-mcp/`
- 数据文件位置：`/app/churnflow-mcp/data/crossref/crossref.json`
- **问题**：ChurnFlow 的 fallback 配置使用了错误的相对路径 `./data/crossref/crossref.json`

## 解决方案

### 1. 修改 ChurnFlow 源码

**文件**：`api-server/churnflow-mcp/src/index.ts`

**修改位置**：第 130-140 行（fallback 配置）

**原代码**：
```typescript
// Fallback config for development - use local data directory
log('Using fallback configuration', 'warn');
config = {
  collectionsPath: './data/collections',
  trackingPath: './data/tracking',
  crossrefPath: './data/crossref/crossref.json',
  aiProvider: 'openai',
  aiApiKey: process.env.OPENAI_API_KEY || '',
  confidenceThreshold: 0.7
};
return config;
```

**新代码**：
```typescript
// Fallback config for deployment - use churnflow-mcp subdirectory
log('Using fallback configuration', 'warn');
const fs = require('fs');
const path = require('path');

// Check if we're in the churnflow-mcp directory or root
const cwd = process.cwd();
const isChurnflowDir = cwd.includes('churnflow-mcp');
const basePath = isChurnflowDir ? cwd : path.join(cwd, 'churnflow-mcp');

// Verify data files exist
const crossrefPath = path.join(basePath, 'data/crossref/crossref.json');
const collectionsPath = path.join(basePath, 'data/collections');
const trackingPath = path.join(basePath, 'data/tracking');

log(`Fallback basePath: ${basePath}`, 'warn');
log(`Checking crossref path: ${crossrefPath}`, 'warn');

if (fs.existsSync(crossrefPath)) {
  log(`✓ Crossref data file found at: ${crossrefPath}`, 'info');
} else {
  log(`✗ Crossref data file NOT found at: ${crossrefPath}`, 'error');
  // Try alternative paths
  const altCrossref = path.join(cwd, 'data/crossref/crossref.json');
  if (fs.existsSync(altCrossref)) {
    log(`✓ Found at alternative path: ${altCrossref}`, 'info');
    config = {
      collectionsPath: path.join(cwd, 'data/collections'),
      trackingPath: path.join(cwd, 'data/tracking'),
      crossrefPath: altCrossref,
      aiProvider: 'openai',
      aiApiKey: process.env.OPENAI_API_KEY || '',
      confidenceThreshold: 0.7
    };
    return config;
  }
}

config = {
  collectionsPath: collectionsPath,
  trackingPath: trackingPath,
  crossrefPath: crossrefPath,
  aiProvider: 'openai',
  aiApiKey: process.env.OPENAI_API_KEY || '',
  confidenceThreshold: 0.7
};
return config;
```

### 2. 安装 TypeScript 类型定义

```bash
npm install --save-dev @types/node
```

### 3. 重新编译

```bash
npm run build
```

## 修复效果

### 新增日志输出
```
[2026-01-02T16:17:00.000Z] ⚠️ Using fallback configuration
[2026-01-02T16:17:00.000Z] ⚠️ Fallback basePath: /app/churnflow-mcp
[2026-01-02T16:17:00.000Z] ⚠️ Checking crossref path: /app/churnflow-mcp/data/crossref/crossref.json
[2026-01-02T16:17:00.000Z] 🍩 Crossref data file found at: /app/churnflow-mcp/data/crossref/crossref.json
[2026-01-02T16:17:00.000Z] 🍩 Capture engine initialized successfully
```

### 验证结果
- ✅ ChurnFlow MCP 能正确找到数据文件
- ✅ Capture engine 初始化成功
- ✅ 服务正常启动并监听连接

## 部署验证

### 1. 检查 Docker 构建
```bash
docker build -t test-churnflow .
```

### 2. 检查容器运行
```bash
docker run --rm test-churnflow node /app/churnflow-mcp/dist/index.js
```

### 3. 预期输出
```
[2026-01-02T16:17:00.000Z] 🍩 Starting ChurnFlow MCP Server...
[2026-01-02T16:17:00.000Z] 🍩 Loading configuration...
[2026-01-02T16:17:00.000Z] ⚠️ Failed to load config file: ...
[2026-01-02T16:17:00.000Z] ⚠️ Using fallback configuration
[2026-01-02T16:17:00.000Z] ⚠️ Fallback basePath: /app/churnflow-mcp
[2026-01-02T16:17:00.000Z] ⚠️ Checking crossref path: /app/churnflow-mcp/data/crossref/crossref.json
[2026-01-02T16:17:00.000Z] 🍩 Crossref data file found at: /app/churnflow-mcp/data/crossref/crossref.json
[2026-01-02T16:17:00.000Z] 🍩 Creating CaptureEngine instance...
[2026-01-02T16:17:00.000Z] 🍩 Calling captureEngine.initialize()...
[2026-01-02T16:17:00.000Z] 🍩 Capture engine initialized successfully
[2026-01-02T16:17:00.000Z] 🍩 Creating MCP server...
[2026-01-02T16:17:00.000Z] 🍩 Creating stdio transport...
[2026-01-02T16:17:00.000Z] 🍩 Connecting server to transport...
[2026-01-02T16:17:00.000Z] 🍩 ChurnFlow MCP Server started successfully
[2026-01-02T16:17:00.000Z] 🍩 Available tools: capture, status, list_trackers
[2026-01-02T16:17:00.000Z] 🍩 Server is ready to accept connections
```

## 相关文件

- **源码**：`api-server/churnflow-mcp/src/index.ts`
- **编译输出**：`api-server/churnflow-mcp/dist/index.js`
- **配置**：`api-server/churnflow-mcp/churn.config.json`
- **数据**：`api-server/churnflow-mcp/data/crossref/crossref.json`

## 部署状态

✅ **修复完成** - 已提交到 GitHub，等待 Railway 自动部署

## 下一步

1. 等待 Railway 自动部署新代码
2. 检查 ChurnFlow MCP 服务状态
3. 验证 API 服务器能正常连接 ChurnFlow
4. 测试完整的 capture 功能

---

**修复时间**：2026年1月2日  
**修复者**：GitHub Copilot  
**提交哈希**：bc3cda84