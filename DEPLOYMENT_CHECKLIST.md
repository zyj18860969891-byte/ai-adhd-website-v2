# 🚀 部署检查清单

## ✅ 集成完成 - 待部署

### 1. 代码验证
```bash
# 检查所有文件存在
cd D:\MultiMode\ai-adhd-website-v2\api-server\src

# 验证 4层架构文件
dir data, skill, tools, a2ui, agent, routes

# 验证 index.js 集成
Get-Content index.js | Select-String "createA2UIRoutes"
```

### 2. 依赖检查
```bash
# 检查 package.json
cd D:\MultiMode\ai-adhd-website-v2\api-server

# 确认已安装
npm list drizzle-orm
npm list @paralleldrive/cuid2
npm list better-sqlite3
```

### 3. 启动服务器
```bash
# 方式 1: 本地启动
cd D:\MultiMode\ai-adhd-website-v2\api-server
npm start

# 方式 2: 使用 nodemon (如果安装)
npx nodemon src/index.js
```

### 4. 验证端点
```bash
# 健康检查
curl http://localhost:3003/api/health

# Agent 状态
curl http://localhost:3003/api/agent/status

# Skills 列表
curl http://localhost:3003/api/agent/skills

# Tools 列表
curl http://localhost:3003/api/agent/tools
```

### 5. 运行集成测试
```bash
cd D:\MultiMode\ai-adhd-website-v2\api-server
node test-a2ui-integration.js
```

### 6. 生产部署
```bash
# 提交更改
cd D:\MultiMode\ai-adhd-website-v2
git add .
git commit -m "feat: A2UI 4-layer architecture integration complete"

# 推送到 Railway
git push railway main

# 检查部署状态
# 访问: https://railway.app/project/...
```

---

## 📋 预期输出

### 服务器启动日志
```
Starting API Server on port 3003
[Agent System] Initializing...
[Agent System] ✅ Database initialized
[Agent System] ✅ Fully initialized
✅ A2UI routes registered at /api/agent/* and /api/a2ui/*
API服务器运行在端口 3003
```

### 测试预期结果
```
✅ Agent Status: 200
✅ Get Skills: 200
✅ Get Tools: 200
✅ Agent Process: 200
✅ A2UI Start: 200
✅ Quick Capture: 200

🎉 All tests passed!
```

---

## ⚠️ 常见问题

### 问题 1: "Database not available"
**解决**: 检查数据库路径和权限
```bash
ls -la /app/churnflow.db
```

### 问题 2: "MCP client not connected"
**解决**: 确认 MCP 服务正在运行
```bash
# 检查 ChurnFlow
cd api-server/churnflow-mcp && npm start

# 检查 Shrimp
cd api-server/mcp-shrimp-task-manager && npm start
```

### 问题 3: "Cannot find module"
**解决**: 重新安装依赖
```bash
cd api-server
npm install
```

### 问题 4: "Port already in use"
**解决**: 更改端口或终止进程
```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# 或使用不同端口
PORT=3004 npm start
```

---

## 🎯 成功标准

### 最低要求
- [ ] 服务器启动无错误
- [ ] `/api/agent/status` 返回 200
- [ ] `/api/agent/skills` 返回 6 个技能
- [ ] `/api/agent/tools` 返回 16 个工具

### 完整验证
- [ ] 所有 6 个测试通过
- [ ] 数据库操作正常
- [ ] MCP 客户端连接正常
- [ ] A2UI 路由可访问
- [ ] 原有端点保持兼容

---

## 📞 快速参考

### 关键文件
- **主服务器**: `api-server/src/index.js`
- **A2UI 路由**: `api-server/src/routes/a2ui-routes.ts`
- **Agent 核心**: `api-server/src/agent/agent-core.ts`
- **架构文档**: `REFACTORING_ARCHITECTURE.md`
- **快速指南**: `QUICK_START_V2.md`

### 关键端点
```
GET  /api/agent/status
GET  /api/agent/skills
GET  /api/agent/tools
POST /api/agent/process
POST /api/a2ui/start
POST /api/a2ui/input
POST /api/agent/capture
POST /api/agent/task
POST /api/agent/review
```

---

## ✅ 部署完成确认

**日期**: 2026年1月4日  
**状态**: ✅ 集成完成，待测试  
**下一步**: 启动服务器并运行测试

**所有代码已就绪，准备部署！** 🚀
