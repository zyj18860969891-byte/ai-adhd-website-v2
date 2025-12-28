# Shrimp MCP 服务问题分析与解决方案

## 问题总览

### ✅ 已解决的核心问题
1. **StdioMCPClient实现** - 成功创建了自定义stdio传输客户端
2. **JSON-RPC协议** - 正确实现了`tools/call`和`tools/list`方法
3. **工具名称匹配** - 修复了`split_tasks`和`list_tasks`工具调用
4. **参数格式** - 正确处理了`updateMode`和结构化`tasksRaw`参数
5. **智能fallback机制** - 当MCP服务不可用时提供可靠的备选方案

### ❌ 当前存在的问题

## 1. Shrimp MCP服务稳定性问题

### 现象
- 服务在处理`split_tasks`请求时超时（3分钟）
- 进程崩溃并重新启动
- 返回`roots/list`请求而不是工具响应
- 显示"Request timed out"错误

### 根本原因分析
```javascript
// 从日志中观察到的模式
[StdioMCPClient] 发送请求: split_tasks (ID: 1)
[StdioMCPClient] 收到响应 (ID: 0): { "method": "roots/list" }
[StdioMCPClient] 收到响应 (ID: undefined): {
  "method": "notifications/cancelled",
  "reason": "McpError: MCP error -32001: Request timed out"
}
[StdioMCPClient] MCP服务进程退出，代码: null
```

**可能原因**：
1. **OpenAI API调用失败**
   - API密钥无效或过期
   - API配额不足
   - 网络连接问题
   - 模型不存在或不可用

2. **内存不足**
   - 服务在处理大型请求时内存溢出
   - 未及时释放资源

3. **未捕获的异常**
   - 代码中存在未处理的错误
   - 依赖库版本不兼容

### 针对性解决方案

#### 方案A：诊断OpenAI API配置
```bash
# 检查Shrimp MCP服务的OpenAI配置
cd mcp-shrimp-task-manager
node -e "
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置' : '未设置');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || '未设置');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置');
"
```

#### 方案B：增加服务稳定性
```javascript
// 在Shrimp MCP服务中添加更好的错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获异常:', error);
  // 不退出进程，记录错误并继续
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 不退出进程，记录错误并继续
});
```

#### 方案C：优化内存管理
```javascript
// 在splitTasksRaw函数中添加内存监控
const used = process.memoryUsage();
console.log(`内存使用: RSS: ${Math.round(used.rss / 1024 / 1024)}MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
```

## 2. 中文编码问题

### 现象
- API响应中`originalTask`显示为"?????????????"
- 但子任务的中文描述正常显示

### 根本原因
```javascript
// 从日志中可以看到
"description":"?????????????"  // 原始任务描述
"name":"用户需求分析与系统设计"  // 子任务名称正常
```

**原因分析**：
1. **HTTP请求编码问题** - PowerShell/curl发送请求时的编码问题
2. **Express中间件配置** - 需要明确指定UTF-8编码
3. **日志显示问题** - 终端显示限制，实际数据可能是正确的

### 针对性解决方案

#### 方案A：修复Express编码配置
```javascript
// 在api-server/src/index.js中
app.use(express.json({ 
  limit: '10mb', 
  type: 'application/json; charset=utf-8'  // 明确指定UTF-8
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 10000  // 增加参数限制
}));

// 添加全局编码中间件
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
```

#### 方案B：使用Buffer正确处理中文字符
```javascript
// 在handleShrimpAction中
const taskDescription = Buffer.from(
  data.task || data.projectDescription, 'binary'
).toString('utf-8');
```

## 3. 超时和重试机制优化

### 当前问题
- 3分钟超时仍然不够
- 没有重试机制
- 服务崩溃后没有优雅恢复

### 针对性解决方案

#### 方案A：实现智能超时和重试
```javascript
// 在StdioMCPClient中添加
class StdioMCPClient {
  constructor(servicePath, options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseTimeout = options.baseTimeout || 180000; // 3分钟
    this.retryDelay = options.retryDelay || 1000; // 1秒
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000; // 1分钟
  }

  async callToolWithRetry(toolName, params = {}, retryCount = 0) {
    try {
      return await this.callTool(toolName, params);
    } catch (error) {
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callToolWithRetry(toolName, params, retryCount + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    return error.message.includes('超时') || 
           error.message.includes('timeout') ||
           error.message.includes('ECONNREFUSED');
  }
}
```

## 4. 智能fallback机制增强

### 当前状态
✅ **fallback机制已经工作得很好**，能够：
- 识别常见项目类型（待办事项、用户注册、博客平台）
- 生成合理的任务分解
- 提供时间估算和难度评估
- 正确处理任务依赖关系

### 增强建议

#### 方案A：添加更多项目类型识别
```javascript
// 扩展generateFallbackTasks函数
if (lowerTask.includes('ecommerce') || lowerTask.includes('电商') || lowerTask.includes('购物')) {
  subtasks = [
    {
      name: '设计商品数据模型',
      description: '设计商品、分类、订单、用户等数据库结构',
      estimatedTime: '3-4小时',
      difficulty: '中等',
      dependencies: []
    },
    // ... 更多电商相关任务
  ];
} else if (lowerTask.includes('dashboard') || lowerTask.includes('仪表板') || lowerTask.includes('数据可视化')) {
  subtasks = [
    {
      name: '设计数据采集方案',
      description: '确定数据源和采集频率，设计数据存储方案',
      estimatedTime: '2-3小时',
      difficulty: '中等',
      dependencies: []
    },
    // ... 更多仪表板相关任务
  ];
}
```

#### 方案B：实现缓存机制
```javascript
// 添加任务分解缓存
const taskCache = new Map();

function generateFallbackTasks(taskDescription) {
  const cacheKey = taskDescription.toLowerCase().trim();
  
  if (taskCache.has(cacheKey)) {
    console.log('从缓存返回任务分解');
    return taskCache.get(cacheKey);
  }
  
  // 正常生成任务分解
  const result = generateTasks(taskDescription);
  
  // 缓存结果（1小时过期）
  taskCache.set(cacheKey, result);
  setTimeout(() => taskCache.delete(cacheKey), 3600000);
  
  return result;
}
```

## 实施优先级

### 🔥 立即实施（高优先级）
1. **验证当前fallback机制** - 确认是否满足用户需求
2. **修复Express编码配置** - 解决中文显示问题
3. **增加超时时间到5分钟** - 给AI更多处理时间

### 📋 短期实施（中优先级）
1. **诊断Shrimp MCP服务** - 检查OpenAI API配置和错误日志
2. **实现重试机制** - 提高服务可靠性
3. **增强fallback模式识别** - 支持更多项目类型

### 🚀 中长期实施（低优先级）
1. **修复Shrimp MCP服务稳定性** - 根本解决问题
2. **实现服务监控** - 实时监控MCP服务状态
3. **优化AI调用效率** - 减少响应时间

## 当前推荐行动

基于当前情况，我推荐：

1. **继续使用智能fallback机制** - 它已经提供了可靠的任务分解功能
2. **修复中文编码问题** - 改进用户体验
3. **监控和记录** - 收集更多关于Shrimp MCP服务失败的具体原因
4. **逐步优化** - 根据实际使用情况调整参数和功能

**最重要的是**：当前的fallback机制已经能够为用户提供高质量的任务分解服务，即使Shrimp MCP服务暂时不稳定。