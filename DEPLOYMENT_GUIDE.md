# MCP 服务部署指南

## 🚀 修复后的部署流程

### 问题修复摘要

✅ **已修复的问题:**
1. **Docker 构建失败** - 修复了 `start-all-services.sh` 文件路径问题
2. **数据库初始化错误** - 添加了自动数据库初始化脚本
3. **错误处理改进** - 服务在数据库不可用时优雅降级到文件模式

### 部署步骤

#### 1. 提交代码更改

由于文件是通过 VS Code 的 GitHub 扩展访问的，你需要：

1. **打开 VS Code 的源代码管理面板** (Ctrl+Shift+G)
2. **查看更改的文件**:
   - `Dockerfile.combined` (新增)
   - `railway.toml` (已修改)
   - `start-all-services.sh` (已修改)
   - `init-database.sh` (新增)
   - `churnflow-mcp/dist/storage/DatabaseManager.js` (已修改)

3. **添加提交消息**:
   ```
   修复 MCP 服务部署问题
   
   - 修复 Docker 构建中的文件路径问题
   - 添加数据库自动初始化
   - 改进错误处理机制
   ```

4. **提交并推送到 GitHub**

#### 2. 触发 Railway 部署

1. **自动部署**: Railway 会自动检测到 GitHub 的更改并开始部署
2. **手动触发**: 在 Railway 仪表板中点击 "Deploy" 按钮

#### 3. 监控部署日志

部署成功后应该看到:
```
✅ Database initialized successfully
✅ ChurnFlow ready for ADHD-friendly capture!
✅ Shrimp Task Manager MCP started successfully
✅ API Server running on port 3003
```

### 预期结果

部署成功后，所有三个服务应该正常运行:

1. **ChurnFlow MCP** (端口 3008)
2. **Shrimp Task Manager MCP** (端口 3009)  
3. **API Server** (端口 3003)

### 故障排除

如果部署仍然失败:

1. **检查 Railway 日志** - 查看具体的错误信息
2. **验证文件路径** - 确保所有文件都在正确位置
3. **数据库问题** - 服务应该在文件模式下继续运行
4. **联系支持** - 如果问题持续存在

### 关键文件

- `Dockerfile.combined` - 修复后的组合 Dockerfile
- `railway.toml` - 更新的 Railway 配置
- `start-all-services.sh` - 修复的启动脚本
- `init-database.sh` - 数据库初始化脚本

## 🎯 下一步

部署成功后，你可以:

1. **测试 MCP 服务** - 验证所有功能正常
2. **监控性能** - 观察服务运行状态
3. **添加更多功能** - 基于当前架构扩展功能