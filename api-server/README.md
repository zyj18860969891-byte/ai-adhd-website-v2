# Shrimp MCP 服务统一架构

## 概述

这个统一架构解决了 `stdio-mcp-client.js` 文件被重复污染的问题，并提供了完整的 Shrimp MCP 服务稳定性解决方案。

## 问题修复

### 原始问题
- `stdio-mcp-client.js` 文件从50行增长到957行
- 每次执行测试文件都会添加重复代码
- 导致语法错误和服务不稳定

### 解决方案
1. **删除了被污染的文件**
2. **创建了统一的配置管理**
3. **实现了模块化的服务架构**
4. **添加了监控和优化功能**

## 文件结构

```
src/
├── ShrimpMCPClient.js      # 统一的MCP客户端
├── ServiceMonitor.js       # 服务监控器
├── AICallOptimizer.js      # AI调用优化器
├── UnifiedShrimpService.js # 统一服务入口
└── stdio-mcp-client.js     # 原始客户端（已清理）

config/
└── development.json        # 统一配置文件

test-unified-service.js     # 测试文件
```

## 核心组件

### 1. ShrimpMCPClient
- 统一的MCP客户端实现
- 支持超时、重试、降级
- 提供用户体验反馈
- 事件驱动的架构

### 2. ServiceMonitor
- 实时服务健康监控
- 性能指标收集
- 自动健康状态分析
- 阈值告警机制

### 3. AICallOptimizer
- 并发调用优化
- 智能重试策略
- 性能自适应调整
- 降级级别管理

### 4. UnifiedShrimpService
- 统一的服务入口
- 整合所有组件
- 配置管理
- 生命周期管理

## 配置说明

### development.json
```json
{
  "client": {
    "timeout": {
      "connection": 10000,
      "request": 30000,
      "toolCall": 60000,
      "healthCheck": 5000,
      "reconnect": 3000
    },
    "retry": {
      "maxRetries": 3,
      "retryDelay": 1000,
      "maxRetryDelay": 10000
    }
  },
  "monitoring": {
    "enabled": true,
    "interval": 5000,
    "thresholds": {
      "errorRate": 0.1,
      "avgResponseTime": 5000,
      "consecutiveFailures": 5
    }
  },
  "optimization": {
    "maxConcurrentCalls": 5,
    "requestTimeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000,
    "degradationThreshold": 0.5
  },
  "ux": {
    "enabled": true,
    "feedback": {
      "styles": {
        "success": "✅",
        "error": "❌",
        "warning": "⚠️",
        "info": "ℹ️",
        "progress": "🔄"
      }
    }
  }
}
```

## 使用方法

### 基本使用
```javascript
import UnifiedShrimpService from './src/UnifiedShrimpService.js';

// 创建服务实例
const service = new UnifiedShrimpService('./stdio-mcp-client.js');

// 启动服务
await service.start();

// 调用工具
const result = await service.callTool('echo', { message: 'Hello!' });

// 健康检查
const health = await service.healthCheck();

// 停止服务
await service.stop();
```

### 高级使用
```javascript
// 自定义配置
const customConfig = {
  client: {
    timeout: { request: 60000 }
  },
  monitoring: {
    interval: 1000
  }
};

const service = new UnifiedShrimpService('./stdio-mcp-client.js', customConfig);

// 监听事件
service.monitor.on('healthChanged', (data) => {
  console.log('Health changed:', data.status);
});

service.monitor.on('metricsUpdate', (metrics) => {
  console.log('Metrics:', metrics);
});
```

## 运行测试

```bash
node test-unified-service.js
```

## 特性

### 🛡️ 稳定性保障
- 自动重试机制
- 超时控制
- 连接状态监控
- 优雅降级

### 📊 监控分析
- 实时性能指标
- 错误率统计
- 响应时间分析
- 健康状态跟踪

### ⚡ 性能优化
- 并发调用限制
- 智能超时调整
- 自适应重试策略
- 负载均衡

### 🎯 用户体验
- 清晰的状态反馈
- 进度显示
- 错误提示
- 配置验证

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 `stdio-mcp-client.js` 是否存在
   - 验证 Node.js 环境
   - 查看网络连接

2. **性能问题**
   - 调整并发限制
   - 优化超时设置
   - 检查系统资源

3. **监控告警**
   - 查看错误率阈值
   - 检查响应时间设置
   - 分析失败模式

### 日志分析

```javascript
// 获取详细状态
const status = service.getServiceStatus();
console.log('服务状态:', status);

// 调用历史
const history = service.getCallHistory();
console.log('调用历史:', history);

// 性能指标
const metrics = service.optimizer.getPerformanceMetrics();
console.log('性能指标:', metrics);
```

## 未来改进

- [ ] 添加分布式支持
- [ ] 实现配置热重载
- [ ] 增加更多监控指标
- [ ] 优化降级策略
- [ ] 添加性能分析工具

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License