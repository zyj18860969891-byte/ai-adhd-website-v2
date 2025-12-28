# Shrimp MCP 服务使用指南

## 概述

Shrimp MCP 服务现在提供了增强的参数验证和错误处理功能，让您的开发体验更加顺畅。

## 快速开始

### 1. 启动服务

```bash
cd mcp-shrimp-task-manager
npm run build
node dist/index-enhanced.js
```

### 2. 连接到服务

```javascript
import { spawn } from 'child_process';

const mcpService = spawn('node', ['dist/index-enhanced.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});
```

### 3. 发送请求

```javascript
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'plan_task',
    arguments: {
      description: '创建一个用户管理系统',
      requirements: '包含用户注册、登录功能'
    }
  }
};

mcpService.stdin.write(JSON.stringify(request) + '\n');
```

## 工具列表

### 任务管理工具

#### plan_task - 规划任务
```javascript
{
  name: 'plan_task',
  arguments: {
    description: '任务描述（必需）',
    requirements: '任务要求（可选）',
    existingTasksReference: false  // 是否参考现有任务（可选）
  }
}
```

**示例**:
```javascript
{
  name: 'plan_task',
  arguments: {
    description: '创建一个用户管理系统，包含用户注册、登录和个人资料管理功能',
    requirements: '系统应该支持多角色权限管理'
  }
}
```

#### list_tasks - 列出任务
```javascript
{
  name: 'list_tasks',
  arguments: {
    status: 'all'  // 'all' | 'pending' | 'in_progress' | 'completed'
  }
}
```

**示例**:
```javascript
{
  name: 'list_tasks',
  arguments: {
    status: 'pending'  // 列出所有待处理任务
  }
}
```

#### analyze_task - 分析任务
```javascript
{
  name: 'analyze_task',
  arguments: {
    taskId: 'task-123',  // 任务ID（必需）
    analysisType: 'comprehensive'  // 分析类型
  }
}
```

#### execute_task - 执行任务
```javascript
{
  name: 'execute_task',
  arguments: {
    taskId: 'task-123',  // 任务ID（必需）
    executionMode: 'dry_run'  // 执行模式
  }
}
```

### 智能分析工具

#### intelligent_task_analysis - 智能任务分析
```javascript
{
  name: 'intelligent_task_analysis',
  arguments: {
    taskDescription: '优化网站性能',  // 任务描述（必需）
    analysisDepth: 'deep'  // 分析深度
  }
}
```

#### process_thought - 处理思路
```javascript
{
  name: 'process_thought',
  arguments: {
    thought: '我需要先分析当前网站的性能瓶颈',  // 思路（必需）
    context: 'performance_optimization'  // 上下文
  }
}
```

### 项目管理工具

#### init_project_rules - 初始化项目规则
```javascript
{
  name: 'init_project_rules',
  arguments: {
    projectType: 'web_application',  // 项目类型（必需）
    framework: 'react'  // 框架
  }
}
```

## 错误处理

### 参数验证错误

当您提供错误的参数时，服务会返回详细的错误信息：

```
工具调用失败: plan_task

参数验证错误:
1. 字段 "description": Required
   期望类型: string
   实际值: "undefined"

修复建议:
1. 任务描述是必需的，应该包含任务目标、背景和预期成果
   示例: description: "创建一个用户管理系统，包含用户注册、登录和个人资料管理功能"

请根据上述建议修正参数后重试。
```

### 常见错误及解决方案

#### 1. 缺少必需参数
**错误**: `Required`
**解决方案**: 提供必需的参数

```javascript
// 错误示例
{
  name: 'plan_task',
  arguments: {
    requirements: '测试要求'  // 缺少description
  }
}

// 正确示例
{
  name: 'plan_task',
  arguments: {
    description: '创建一个用户管理系统',
    requirements: '测试要求'
  }
}
```

#### 2. 参数类型错误
**错误**: `Invalid type`
**解决方案**: 确保参数类型正确

```javascript
// 错误示例
{
  name: 'list_tasks',
  arguments: {
    status: 123  // 应该是字符串
  }
}

// 正确示例
{
  name: 'list_tasks',
  arguments: {
    status: 'all'  // 字符串类型
  }
}
```

#### 3. 枚举值错误
**错误**: `Invalid enum value`
**解决方案**: 使用有效的枚举值

```javascript
// 错误示例
{
  name: 'list_tasks',
  arguments: {
    status: 'invalid_status'  // 无效状态
  }
}

// 正确示例
{
  name: 'list_tasks',
  arguments: {
    status: 'pending'  // 有效状态值
  }
}
```

#### 4. 工具不存在
**错误**: `Tool does not exist`
**解决方案**: 使用正确的工具名称

```
错误: 工具 "nonexistent_tool" 不存在

可用工具列表:
- plan_task: 规划任务
- analyze_task: 分析任务
- reflect_task: 反思任务
- split_tasks_raw: 分割任务
- list_tasks: 列出任务
- execute_task: 执行任务
- verify_task: 验证任务
- delete_task: 删除任务
- clear_all_tasks: 清空所有任务
- update_task_content: 更新任务内容
- query_task: 查询任务
- get_task_detail: 获取任务详情
- intelligent_task_analysis: 智能任务分析
- process_thought: 处理思路
- init_project_rules: 初始化项目规则
- research_mode: 研究模式
```

## 最佳实践

### 1. 参数验证
- 在调用工具前验证参数
- 使用正确的数据类型
- 提供必需的参数

### 2. 错误处理
- 检查响应中的错误信息
- 根据建议修正参数
- 记录错误以便调试

### 3. 性能优化
- 避免频繁的工具调用
- 使用批量操作（如果支持）
- 合理设置超时时间

### 4. 调试技巧
- 使用详细的错误信息
- 参考示例代码
- 检查参数格式

## 故障排除

### 1. 服务启动失败
**问题**: 服务无法启动
**解决方案**:
- 检查Node.js版本
- 确保依赖已安装
- 查看错误日志

### 2. 连接失败
**问题**: 无法连接到服务
**解决方案**:
- 检查服务是否运行
- 验证端口配置
- 检查网络连接

### 3. 工具调用失败
**问题**: 工具调用返回错误
**解决方案**:
- 检查参数格式
- 参考错误信息中的建议
- 使用示例代码

### 4. 响应时间过长
**问题**: 工具调用响应慢
**解决方案**:
- 检查网络延迟
- 优化工具参数
- 考虑使用异步调用

## 技术支持

如果您遇到问题，请：

1. 查看错误信息中的建议
2. 参考本使用指南
3. 检查示例代码
4. 联系技术支持

## 更新日志

### v1.0.0
- 初始版本发布
- 基础工具功能
- 基础错误处理

### v1.1.0
- 增强参数验证
- 改进错误处理
- 添加详细建议
- 优化用户体验

## 许可证

MIT License