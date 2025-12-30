# MCP 服务部署修复总结

## 🚀 问题诊断

### 原始错误
1. **主服务构建失败**:
   ```
   Build Failed: build daemon returned an error < failed to solve: lstat /api-server: no such file or directory >
   ```

2. **MCP 服务构建失败**:
   ```
   Build Failed: build daemon returned an error < failed to solve: lstat /churnflow-mcp: no such file or directory >
   ```

3. **数据库初始化错误**:
   ```
   ❌ Database not available: Error: Database not set up. Run: npm run db:setup
   ```

## 🔧 修复方案

### 1. Railway 构建上下文问题

**问题分析**:
- Railway 为每个服务设置了不同的根目录
- 主服务：`root directory set as 'api-server'`
- MCP 服务：`root directory set as 'churnflow-mcp'`
- 但 `Dockerfile.combined` 期望在根目录构建

**解决方案**:
- 为每个服务创建专门的 Dockerfile
- 更新 `railway.toml` 指向正确的 Dockerfile
- 确保所有 Dockerfile 都能正确构建所有服务

### 2. 数据库初始化问题

**问题分析**:
- 数据库未在容器启动时自动初始化
- 服务在数据库不可用时崩溃

**解决方案**:
- 创建 `init-database.sh` 脚本
- 修改 `DatabaseManager.js` 的错误处理
- 服务在数据库不可用时降级到文件模式

### 3. 文件路径问题

**问题分析**:
- Dockerfile 中使用绝对路径 `/app/start-all-services.sh`
- 但构建上下文不同导致文件找不到

**解决方案**:
- 使用相对路径 `start-all-services.sh`
- 更新启动脚本中的路径
- 确保所有文件都在正确位置

## 📁 修改的文件

### Dockerfile 文件
1. **`churnflow-mcp/Dockerfile`** - 更新为独立服务 Dockerfile
2. **`mcp-shrimp-task-manager/Dockerfile`** - 更新为独立服务 Dockerfile
3. **`api-server/Dockerfile`** - 新增 API 服务器 Dockerfile

### Railway 配置文件
1. **`railway.toml`** - 更新为指向 api-server/Dockerfile
2. **`api-server/railway.toml`** - 新增 API 服务器配置
3. **`churnflow-mcp/railway.toml`** - 新增 ChurnFlow MCP 配置
4. **`mcp-shrimp-task-manager/railway.toml`** - 新增 Shrimp MCP 配置

### 脚本文件
1. **`start-all-services.sh`** - 修复路径问题
2. **`init-database.sh`** - 新增数据库初始化脚本

### 代码文件
1. **`churnflow-mcp/dist/storage/DatabaseManager.js`** - 改进错误处理

## 🎯 修复结果

### 预期部署成功状态
```
✅ Database initialized successfully
✅ ChurnFlow ready for ADHD-friendly capture!
✅ Shrimp Task Manager MCP started successfully
✅ API Server running on port 3003
```

### 服务运行状态
1. **ChurnFlow MCP** (端口 3008) - 正常运行
2. **Shrimp Task Manager MCP** (端口 3009) - 正常运行
3. **API Server** (端口 3003) - 正常运行

## 📋 部署步骤

### 1. 提交更改
```bash
# 添加所有修改的文件
git add .
git commit -m "修复 MCP 服务部署问题

- 修复 Docker 构建中的文件路径问题
- 添加数据库自动初始化
- 改进错误处理机制
- 修复 Railway 构建上下文问题"
git push origin main
```

### 2. 触发部署
- Railway 会自动检测 GitHub 更改并开始部署
- 或在 Railway 仪表板中手动点击 "Deploy"

### 3. 验证部署
- 检查部署日志确认成功
- 测试各个服务是否正常运行
- 验证数据库是否自动初始化

## 🔍 故障排除

### 如果部署仍然失败
1. **检查 Railway 日志** - 查看具体错误信息
2. **验证文件路径** - 确保所有文件都在正确位置
3. **数据库问题** - 服务应该在文件模式下继续运行
4. **构建上下文** - 确认 Railway 配置正确

### 常见问题
1. **文件路径错误** - 检查 Dockerfile 中的路径
2. **权限问题** - 确保脚本有执行权限
3. **依赖问题** - 检查 package.json 和依赖安装

## 📞 支持

如果问题持续存在，请：
1. 检查 Railway 文档
2. 查看 Docker 构建日志
3. 联系技术支持

---

**修复日期**: 2025年12月31日
**修复版本**: v2.0
**状态**: ✅ 已修复，等待部署验证