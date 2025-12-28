# MCP Shrimp Task Manager 部署指南

## 概述

本文档提供MCP Shrimp Task Manager的完整部署指南，包括开发环境和生产环境的配置步骤。

## 系统要求

- **Node.js**: >= 18.0.0 (推荐使用最新LTS版本)
- **TypeScript**: >= 5.0.0
- **操作系统**: Windows 10+, Linux, macOS 10.14+

## 快速开始

### 1. 安装依赖

```bash
cd mcp-shrimp-task-manager
npm install
```

### 2. 构建项目

```bash
# 使用项目脚本构建
npm run build

# 或手动构建
npx tsc --outDir dist --module NodeNext --target ES2022 --allowSyntheticDefaultImports true --skipLibCheck true
```

### 3. 启动服务

```bash
# 使用npm脚本启动
npm start

# 或直接运行
node dist/custom-mcp-server.js
```

## MCP客户端配置

### Cursor IDE 配置

在Cursor的设置中添加MCP服务器配置：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-shrimp-task-manager/dist/custom-mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### VS Code 配置

在VS Code的`settings.json`中添加：

```json
{
  "mcp.serverProviders": {
    "shrimp-task-manager": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-shrimp-task-manager/dist/custom-mcp-server.js"
      ]
    }
  }
}
```

### Clinease 配置

在Clinease的配置文件中添加：

```yaml
mcp_servers:
  - name: shrimp-task-manager
    command: node
    args:
      - /absolute/path/to/mcp-shrimp-task-manager/dist/custom-mcp-server.js
```

## 可用的工具列表

自定义MCP服务器提供以下16个工具：

### 任务规划工具
- `plan_task` - 任务规划指导
- `analyze_task` - 深度任务分析
- `intelligent_task_analysis` - 智能任务分析
- `reflect_task` - 任务反思和优化

### 任务管理工具
- `split_tasks` - 任务拆分
- `list_tasks` - 任务列表生成
- `execute_task` - 任务执行指导
- `verify_task` - 任务验证
- `update_task` - 任务更新
- `delete_task` - 删除任务
- `clear_all_tasks` - 清除所有任务
- `query_task` - 任务查询
- `get_task_detail` - 获取任务详情

### 辅助工具
- `process_thought` - 思维过程处理
- `init_project_rules` - 项目规则初始化
- `research_mode` - 研究模式

## 验证部署

### 测试MCP连接

1. 启动MCP客户端（Cursor/VS Code等）
2. 检查MCP服务器是否成功连接
3. 尝试调用工具验证功能

### 测试工具调用

使用提供的测试脚本验证：

```bash
# 运行测试脚本
node test-custom-mcp-simple.js
```

预期输出应包含：
- ✅ Initialize请求成功
- ✅ Tools/List返回16个工具
- ✅ Tools/Call执行成功

## 生产环境部署

### Docker部署（推荐）

创建`Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/custom-mcp-server.js"]
```

构建和运行：

```bash
# 构建镜像
docker build -t mcp-shrimp-task-manager .

# 运行容器
docker run -d --name mcp-shrimp \
  -v $(pwd)/data:/app/data \
  mcp-shrimp-task-manager
```

### PM2进程管理

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start dist/custom-mcp-server.js --name mcp-shrimp

# 设置开机自启
pm2 startup
pm2 save
```

### Systemd服务

创建`/etc/systemd/system/mcp-shrimp.service`:

```ini
[Unit]
Description=MCP Shrimp Task Manager
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/mcp-shrimp-task-manager
ExecStart=/usr/bin/node dist/custom-mcp-server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-shrimp
sudo systemctl start mcp-shrimp
```

## 监控和日志

### 日志配置

服务器会自动记录以下信息：
- 请求处理日志
- 错误日志
- 性能指标

日志文件位置：
- 开发环境：控制台输出
- 生产环境：建议配置日志收集系统

### 健康检查

定期检查服务状态：

```bash
# 检查进程状态
pm2 status mcp-shrimp

# 查看日志
pm2 logs mcp-shrimp

# 监控性能
pm2 monit
```

## 故障排除

### 常见问题

1. **服务无法启动**
   - 检查Node.js版本是否符合要求
   - 确认所有依赖已安装
   - 验证TypeScript编译是否成功

2. **MCP客户端连接失败**
   - 确认服务器路径正确
   - 检查文件权限
   - 验证JSON-RPC协议兼容性

3. **工具调用无响应**
   - 检查工具参数格式
   - 验证Zod schema配置
   - 查看错误日志

### 调试模式

启动调试模式：

```bash
# 启用详细日志
DEBUG=mcp:* node dist/custom-mcp-server.js
```

## 性能优化

### 推荐配置

- 使用PM2集群模式提高并发性能
- 配置适当的资源限制
- 定期清理临时文件

### 资源监控

监控关键指标：
- 内存使用量
- CPU使用率
- 响应时间
- 错误率

## 安全考虑

- 限制文件系统访问权限
- 验证输入参数
- 定期更新依赖
- 使用HTTPS连接（如适用）

## 更新和维护

### 更新流程

1. 停止当前服务
2. 拉取最新代码
3. 安装新依赖
4. 重新构建
5. 启动服务
6. 验证功能

### 备份策略

定期备份：
- 任务数据文件
- 配置文件
- 日志文件

## 支持

如遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查GitHub Issues
3. 提交详细的错误报告

## 版本历史

- **v1.0.21**: 自定义MCP服务器实现，解决原SDK协议问题
- 完整的16个工具支持
- 改进的错误处理和参数验证

---

**注意**: 确保在生产环境部署前进行充分的测试。