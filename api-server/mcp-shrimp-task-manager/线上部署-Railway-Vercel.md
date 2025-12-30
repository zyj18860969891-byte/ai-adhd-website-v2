# 🚀 Railway 和 Vercel 线上部署指南

## 📋 当前配置状态

### Railway配置
项目已包含 `railway.toml` 配置文件：
```toml
[build]
builder = "nixpacks"

[env]
NODE_ENV = "production"
PORT = "3009"

[run]
startCommand = "npm run railway"

[deploy]
startCommand = "npm run railway"
```

### package.json配置
已添加railway启动脚本：
```json
"railway": "npm run build:mcp && npm start"
```

## 🎯 Railway部署步骤

### 1. 连接GitHub仓库

1. **登录Railway**
   - 访问 https://railway.app
   - 使用GitHub账户登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `cjo4m06/mcp-shrimp-task-manager` 仓库

3. **配置部署设置**
   - Railway会自动检测 `railway.toml` 配置
   - 确认构建命令：`npm run railway`
   - 确认启动命令：`npm run railway`

### 2. 环境变量配置

在Railway项目设置中添加环境变量：

```
NODE_ENV = production
PORT = 3009
```

### 3. 部署触发

- **自动部署**: 每次推送到main分支会自动部署
- **手动部署**: 在Railway控制台点击 "Deploy"
- **预览部署**: 创建Pull Request时会自动创建预览部署

### 4. 查看部署状态

```bash
# 在Railway控制台查看
# - 构建日志
# - 部署状态
# - 运行日志
# - 自定义域名
```

### 5. 获取部署URL

部署成功后，Railway会提供：
- **默认域名**: `*.up.railway.app`
- **自定义域名**: 可在设置中配置

## 🚫 Vercel部署说明

### 重要提示
**Vercel主要用于前端应用部署，不适合MCP服务器部署**

原因：
1. Vercel专注于静态站点和Serverless函数
2. MCP服务器需要长时间运行的进程
3. Vercel的Serverless环境不适合stdin/stdout通信

### 推荐替代方案
- ✅ **Railway** - 最适合MCP服务器（已配置）
- ✅ **Heroku** - 传统PaaS平台
- ✅ **DigitalOcean App Platform** - 容器化部署
- ✅ **Google Cloud Run** - Serverless容器
- ✅ **AWS ECS/Fargate** - 企业级容器服务

## 🔧 Railway部署优化

### 优化构建速度

1. **添加 `.railwayignore` 文件**
```
node_modules
.git
.gitignore
*.log
.env
.nyc_output
coverage
.vscode
.idea
*.md
!README.md
test-*
start-*
check-config.js
```

2. **优化构建缓存**
```toml
[build]
builder = "nixpacks"
cache = true
```

### 监控和日志

1. **查看实时日志**
   - 在Railway控制台查看应用日志
   - 监控错误和性能指标

2. **设置告警**
   - 配置健康检查
   - 设置错误率告警
   - 监控响应时间

### 自定义域名

1. **添加域名**
   - 在Railway项目设置中选择 "Domains"
   - 添加你的域名
   - 配置DNS记录

2. **SSL证书**
   - Railway自动提供SSL证书
   - 无需额外配置

## ✅ 部署验证

### 1. 构建验证
部署完成后，检查：
- ✅ 构建日志无错误
- ✅ 服务启动成功
- ✅ 端口3009正常监听

### 2. 功能测试
```bash
# 使用curl测试（替换为你的域名）
curl -X POST https://your-domain.up.railway.app \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "Test", "version": "1.0.0"}
    }
  }'
```

### 3. MCP客户端配置
将Railway部署的URL配置到MCP客户端：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://your-domain.up.railway.app",
        "-H", "Content-Type: application/json",
        "-d"
      ]
    }
  }
}
```

**注意**: 这种HTTP接口方式需要额外的适配层，因为MCP协议通常使用stdin/stdout。

## 🔄 更新部署

### 自动更新
- 推送到main分支自动触发部署
- 创建Pull Request创建预览部署

### 手动更新
1. 在Railway控制台点击 "Redeploy"
2. 选择要部署的分支或提交
3. 确认部署

### 回滚操作
1. 在Railway控制台查看部署历史
2. 选择之前的健康版本
3. 点击 "Redeploy" 回滚

## 📊 监控和维护

### Railway控制台功能
- **Metrics**: CPU、内存、网络使用情况
- **Logs**: 实时应用日志
- **Deployments**: 部署历史和状态
- **Settings**: 环境变量和配置

### 成本管理
- Railway提供免费额度
- 监控资源使用情况
- 根据需要升级计划

## 🚨 故障排除

### 构建失败
```bash
# 查看构建日志
# 常见问题：
# 1. Node.js版本不兼容
# 2. 依赖安装失败
# 3. TypeScript编译错误
```

### 运行时错误
```bash
# 查看运行日志
# 常见问题：
# 1. 端口配置错误
# 2. 环境变量缺失
# 3. 依赖模块找不到
```

### 性能问题
1. 检查Railway Metrics
2. 优化构建过程
3. 考虑升级实例类型

## 📈 扩展部署

### 多环境部署
1. **Production**: main分支自动部署
2. **Staging**: develop分支部署
3. **Preview**: Pull Request部署

### 数据库集成
如果需要持久化存储：
1. 在Railway添加PostgreSQL插件
2. 配置数据库连接
3. 更新应用代码使用数据库

### 其他Railway服务
- **Redis**: 缓存和会话存储
- **Cron Jobs**: 定时任务
- **Webhooks**: 事件通知

## 🎯 部署检查清单

### 部署前
- [x] railway.toml配置正确
- [x] package.json包含railway脚本
- [x] 环境变量配置完整
- [x] 构建脚本测试通过

### 部署后
- [ ] 构建成功完成
- [ ] 服务正常启动
- [ ] 功能测试通过
- [ ] 日志无错误
- [ ] MCP客户端能连接

### 长期维护
- [ ] 监控资源使用
- [ ] 定期查看日志
- [ ] 更新依赖包
- [ ] 备份重要数据

## 📞 支持资源

### Railway文档
- 官方文档: https://docs.railway.app
- 社区支持: https://discord.gg/railway
- 状态页面: https://status.railway.app

### 项目文档
- 部署指南: `DEPLOYMENT_GUIDE.md`
- 测试报告: `MCP_CUSTOM_SERVER_DEPLOYMENT_REPORT.md`
- 快速总结: `DEPLOYMENT_SUMMARY.md`

## 🎉 总结

### Railway部署优势
- ✅ 简单易用，GitHub集成
- ✅ 自动SSL证书
- ✅ 免费额度充足
- ✅ 自动扩缩容
- ✅ 实时监控

### 下一步行动
1. **立即部署**: 连接GitHub仓库到Railway
2. **配置环境**: 设置环境变量
3. **验证功能**: 测试MCP服务
4. **配置客户端**: 更新MCP客户端配置
5. **开始使用**: 享受完整功能的MCP服务

---

**🚀 准备就绪！现在就可以开始Railway部署！**

将GitHub仓库连接到Railway，一切都会自动完成。