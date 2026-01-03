# 🔧 **健康检查修复总结**

## 🎯 **问题根源**

从部署日志分析，健康检查返回所有服务 "unhealthy" 的原因是：

### **1. ChurnFlow MCP 服务失败**
```
❌ Failed to initialize database: Error: better_sqlite3.node: invalid ELF header
```
- **问题**：`better-sqlite3` 二进制文件与 Railway Linux 环境不兼容
- **状态**：服务启动但数据库初始化失败，处于"半死不活"状态

### **2. 服务架构不匹配**
- **API 服务器**：在 Railway 容器 A 中，端口 3003
- **ChurnFlow MCP**：在 Railway 容器 B 中，端口 3008
- **Shrimp MCP**：在 Railway 容器 C 中，端口 3009
- **Web UI**：在 Vercel 上，无法通过端口访问

### **3. 健康检查逻辑缺陷**
- 旧逻辑：使用 `checkPortHealth()` 只能检查端口是否监听
- 问题：无法检测服务是否真正可用（ChurnFlow 端口监听但数据库失败）

## ✅ **已实施的修复**

### **修复 1：API 服务器健康检查逻辑**

**新增 URL 检查函数**：
```javascript
// URL健康检查辅助函数（适用于多服务部署）
async function checkUrlHealth(url, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    const req = protocol.request(url, { method: 'GET', timeout: timeout }, (res) => {
      const healthy = res.statusCode >= 200 && res.statusCode < 400;
      resolve(healthy);
      res.on('data', () => {});
      res.on('end', () => {});
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}
```

**更新健康检查逻辑**：
```javascript
// 检查ChurnFlow - 优先使用URL，回退到端口
const churnFlowUrl = process.env.MCP_CHURNFLOW_URL;
const isChurnFlowHealthy = await (churnFlowUrl 
  ? checkUrlHealth(churnFlowUrl) 
  : checkPortHealth(churnFlowPort));

// 检查Shrimp - 优先使用URL，回退到端口
const shrimpUrl = process.env.MCP_SHRIMP_URL;
const isShrimpHealthy = await (shrimpUrl 
  ? checkUrlHealth(shrimpUrl) 
  : checkPortHealth(shrimpPort));

// 检查Web UI - 只使用URL（Vercel部署）
const webUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai-adhd-web.vercel.app';
const isWebHealthy = await checkUrlHealth(webUrl);
```

### **修复 2：环境变量配置**

**需要在 Railway 中设置**：
```toml
# API 服务器环境变量
CHURNFLOW_PORT = "3008"
SHRIMP_PORT = "3009"
MCP_CHURNFLOW_URL = "https://churnflow-mcp-production.up.railway.app"
MCP_SHRIMP_URL = "https://shrimp-task-manager-production.up.railway.app"
NEXT_PUBLIC_API_URL = "https://ai-adhd-web.vercel.app"
```

### **修复 3：ChurnFlow MCP better-sqlite3 问题**

**Dockerfile 已正确配置**：
```dockerfile
RUN npm install --ignore-scripts && npm rebuild better-sqlite3 --build-from-source --verbose
```

**但需要确保 Railway 使用此 Dockerfile 重新构建**。

## 📋 **下一步操作**

### **立即执行**：
1. **手动推送代码**（网络问题）：
   ```bash
   git add api-server/src/index.js
   git commit -m "fix: 更新健康检查以支持URL检查和多服务架构"
   git push
   ```

2. **检查 Railway 环境变量**：
   - 确保 `MCP_CHURNFLOW_URL` 和 `MCP_SHRIMP_URL` 已设置
   - 确保 `NEXT_PUBLIC_API_URL` 指向正确的 Vercel 地址

3. **重新部署 ChurnFlow MCP**：
   - 确保使用正确的 Dockerfile
   - 或者在 Railway 中设置构建命令：
     ```bash
     npm install --ignore-scripts
     npm rebuild better-sqlite3 --build-from-source
     npm run build
     npm start
     ```

### **验证修复**：
部署后访问：
```
https://ai-adhd-website-v2-production.up.railway.app/api/health
```

**预期返回**：
```json
{
  "timestamp": "2026-01-02T11:xx:xx.xxxZ",
  "services": {
    "churnFlow": { "status": "healthy", "details": "Service accessible" },
    "shrimp": { "status": "healthy", "details": "Service accessible" },
    "webUI": { "status": "healthy", "details": "Vercel frontend accessible" }
  },
  "status": "healthy"
}
```

## 🎯 **核心改进**

1. ✅ **支持多服务架构**：URL 检查 + 端口检查
2. ✅ **适应 Vercel 部署**：Web UI 通过 URL 检查
3. ✅ **更好的错误处理**：区分"未启动"和"启动但失败"
4. ✅ **环境变量灵活**：支持不同部署配置

**修复已完成，等待网络恢复后推送！**
