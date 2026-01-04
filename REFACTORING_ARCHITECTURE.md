# 🏗️ 系统重构架构文档

**重构日期：** 2026年1月4日  
**重构目标：** 引入 A2UI + Google A2UI 集成，构建完整的 Agent 系统  
**架构分层：** 数据层 → 上下文层 → 工具层 → 交互层

---

## 📋 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    交互层 A2UI (用户界面)                         │
│  - A2UI 组件渲染与验证                                           │
│  - 交互流程管理                                                  │
│  - 安全审计                                                      │
│  文件: src/a2ui/a2ui-renderer.ts                                 │
├─────────────────────────────────────────────────────────────────┤
│                    工具层 + A2A层                                 │
│  - 工具调用与编排                                                │
│  - MCP 工具集成 (ChurnFlow, Shrimp)                              │
│  - Agent 协作协议 (A2A)                                          │
│  文件: src/tools/tool-orchestrator.ts                            │
├─────────────────────────────────────────────────────────────────┤
│                    上下文层 / Skill层                             │
│  - Agent 能力定义                                                │
│  - Skill 注册与发现                                              │
│  - 智能路由与匹配                                                │
│  文件: src/skill/skill-registry.ts                               │
├─────────────────────────────────────────────────────────────────┤
│                    数据层                                        │
│  - 核心数据模型                                                  │
│  - Repository 模式                                               │
│  - 数据访问层                                                    │
│  文件: src/data/schema.ts, src/data/repository.ts                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 各层详细说明

### 1️⃣ 数据层 (Data Layer)

**文件：** `src/data/schema.ts`, `src/data/repository.ts`

**核心表结构：**

```typescript
// 用户与会话
users, sessions

// 核心捕获与任务
captures, contexts

// AI 学习
learningPatterns

// Agent 交互日志
agentLogs

// 工具注册表
tools

// Skill 注册表
skills

// A2UI 交互会话
a2uiSessions
```

**Repository 模式：**
```typescript
export class CaptureRepository extends BaseRepository<Capture, NewCapture> {
  async findNeedsReview(userId: string, days: number): Promise<Capture[]>
  async search(userId: string, query: string): Promise<Capture[]>
  // ...
}
```

**优势：**
- ✅ 统一的数据访问接口
- ✅ 支持事务
- ✅ 易于测试
- ✅ 类型安全

---

### 2️⃣ 上下文层 / Skill层 (Context/Skill Layer)

**文件：** `src/skill/skill-registry.ts`

**核心概念：**

#### Skill 定义
```typescript
interface SkillDefinition {
  name: string;
  displayName: string;
  description: string;
  
  capabilities: {
    intents: string[];  // 支持的意图
    domains: string[];  // 支持的领域
    confidence: number; // 置信度
  };
  
  toolIds: string[];    // 关联工具
  workflow: {           // 执行流程
    steps: Array<{ tool: string; condition?: string; fallback?: string }>;
  };
  
  uiComponents: {       // A2UI 集成
    intent: 'form' | 'list' | 'card' | 'dialog' | 'dashboard' | 'wizard';
    components: any[];
    layout?: string;
  };
}
```

#### 预定义 Skills

| Skill | 意图 | 领域 | 主要工具 |
|-------|------|------|----------|
| **capture_skill** | capture, add, note | productivity, task | capture_tool, ai_classifier |
| **task_management** | task, todo, schedule | productivity, task | task_create, task_list |
| **review_skill** | review, check, audit | productivity, review | review_finder, review_ui |
| **analysis_skill** | analyze, insight, stats | analytics | data_analyzer, report_builder |
| **a2ui_interaction** | form, wizard, dialog | ui, interaction | a2ui_generator, a2ui_validator |
| **agent_collaboration** | collaborate, delegate | agent, workflow | a2a_coordinator, task_splitter |

#### 智能路由
```typescript
async routeSkill(userId: string, input: string) {
  // 1. 分析意图
  const intent = await this.analyzeIntent(input);
  
  // 2. 匹配技能
  const candidates = this.findSkillsByIntent(intent);
  
  // 3. 选择最佳
  return candidates.reduce((best, curr) => 
    curr.capabilities.confidence > best.capabilities.confidence ? curr : best
  );
}
```

---

### 3️⃣ 工具层 + A2A层 (Tool + A2A Layer)

**文件：** `src/tools/tool-orchestrator.ts`

#### 工具定义
```typescript
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  
  executor: 'mcp' | 'internal' | 'external' | 'a2a';
  
  // MCP 集成
  mcpServer?: string;
  mcpToolName?: string;
  
  // A2A 协议
  a2aEndpoint?: string;
  a2aProtocol?: 'json-rpc' | 'rest' | 'websocket';
  
  permissionLevel: 'read' | 'write' | 'admin' | 'system';
  category: 'task' | 'capture' | 'search' | 'analysis' | 'ui' | 'a2a';
}
```

#### 预定义工具（16个）

**MCP 工具：**
- `capture_tool` (ChurnFlow) - 捕获
- `task_create`, `task_list`, `task_update` (Shrimp) - 任务管理

**内部工具：**
- `context_analyzer` - 上下文分析
- `ai_classifier` - AI 分类
- `review_finder` - 查找待评审
- `review_ui` - 生成评审 UI
- `a2ui_generator` - 生成 A2UI
- `a2ui_validator` - 验证 A2UI
- `task_splitter` - 拆分任务
- `result_aggregator` - 聚合结果
- `data_analyzer` - 数据分析
- `insight_generator` - 生成洞察
- `report_builder` - 构建报告

**A2A 工具：**
- `a2a_coordinator` - Agent 协调

#### 工具执行器
```typescript
export class ToolExecutor {
  async execute(toolName: string, args: any, userId: string, permission: string) {
    // 1. 获取工具定义
    // 2. 验证权限
    // 3. 根据执行器类型执行
    // 4. 记录日志
    // 5. 返回结果
  }
  
  private async executeMCP(tool: Tool, args: any) {
    const client = this.mcpClients.get(tool.mcpServer!);
    return client.callTool(tool.mcpToolName!, args);
  }
  
  private async executeInternal(toolName: string, args: any, userId: string) {
    // 实现内部工具逻辑
  }
}
```

#### A2A 协调器
```typescript
export class A2ACoordinator {
  async coordinate(agents: string[], task: string, strategy: 'sequential' | 'parallel' | 'competitive') {
    switch (strategy) {
      case 'sequential':
        // 顺序执行
      case 'parallel':
        // 并行执行
      case 'competitive':
        // 竞争模式
    }
  }
}
```

---

### 4️⃣ 交互层 A2UI (A2UI Layer)

**文件：** `src/a2ui/a2ui-renderer.ts`

#### A2UI 响应格式
```typescript
interface A2UIResponse {
  type: 'ui';
  ui: {
    intent: 'form' | 'list' | 'card' | 'dialog' | 'dashboard' | 'wizard';
    components: A2UIComponent[];
    layout?: string;
    metadata?: Record<string, any>;
  };
}

interface A2UIComponent {
  type: string;
  id?: string;
  props: Record<string, any>;
  children?: A2UIComponent[];
}
```

#### 安全验证
```typescript
export class A2UISecurity {
  static validate(response: A2UIResponse, userPermission: string) {
    // 1. 检查组件类型
    // 2. 检查危险属性
    // 3. 权限验证
    // 4. 风险等级评估
  }
}
```

#### 渲染器
```typescript
export class A2UIRenderer {
  async render(response: A2UIResponse, userId: string, sessionId?: string) {
    // 1. 安全验证
    // 2. 创建/更新会话
    // 3. 转换组件
    // 4. 记录审计
  }
  
  async handleInput(sessionId: string, input: any) {
    // 1. 获取会话
    // 2. 验证状态
    // 3. 处理输入
    // 4. 更新状态
  }
}
```

#### UI 模板
```typescript
A2UIRenderer.templates = {
  form: (fields) => { /* ... */ },
  list: (items) => { /* ... */ },
  card: (content, metadata, actions) => { /* ... */ },
  dashboard: (widgets) => { /* ... */ },
  wizard: (steps) => { /* ... */ },
  dialog: (title, content, actions) => { /* ... */ },
};
```

---

## 🧠 Agent 核心 (Agent Core)

**文件：** `src/agent/agent-core.ts`

### 核心处理流程

```typescript
export class AgentCore {
  async process(userId: string, input: string, sessionId?: string) {
    // 1. 分析上下文和意图
    const contextAnalysis = await this.analyzeContext(userId, input);
    
    // 2. 路由到合适的 Skill
    const skillMatch = await this.skillRegistry.routeSkill(userId, input);
    
    // 3. 检查权限
    if (!this.skillRegistry.validatePermission(skill.name, this.config.permissionLevel)) {
      return { type: 'text', response: '权限不足' };
    }
    
    // 4. 执行 Skill 工作流
    const result = await this.executeSkillWorkflow(skill, userId, input, contextAnalysis);
    
    // 5. 记录日志
    await this.repositoryFactory.repositories.agentLog.create({ /* ... */ });
    
    // 6. 返回响应
    return {
      response: result.response,
      type: result.type,
      metadata: { skill: skill.name, confidence, reason },
    };
  }
}
```

---

## 🚀 API 端点

### Agent 核心
- `POST /api/agent/process` - 处理用户输入
- `GET /api/agent/status` - 系统状态
- `GET /api/agent/skills` - 所有 Skills
- `GET /api/agent/tools` - 所有 Tools

### A2UI 交互
- `POST /api/a2ui/start` - 启动交互
- `POST /api/a2ui/input` - 处理输入
- `POST /api/a2ui/cancel` - 取消交互

### Agent 协作
- `POST /api/agent/collaborate` - Agent 间协作

### 快捷端点
- `POST /api/agent/capture` - 快捷捕获
- `POST /api/agent/task` - 快捷任务
- `POST /api/agent/review` - 快捷评审

---

## 📊 数据流示例

### 场景 1：智能捕获

```
用户输入: "明天下午3点开会"

1. 数据层
   └─> 创建 Capture 记录

2. 上下文层
   └─> routeSkill("明天下午3点开会")
       └─> 匹配: capture_skill (confidence: 0.95)

3. 工具层
   └─> executeWorkflow:
       ├─> context_analyzer (分析意图)
       ├─> ai_classifier (分类: action)
       └─> capture_tool (存储)

4. 交互层
   └─> 生成 A2UI 响应:
       {
         type: 'ui',
         ui: {
           intent: 'form',
           components: [
             { type: 'input', props: { label: '内容', value: '明天下午3点开会' } },
             { type: 'select', props: { label: '类型', options: ['action', 'note', ...] } }
           ]
         }
       }
```

### 场景 2：Agent 协作

```
用户输入: "帮我规划一个项目"

1. 上下文层
   └─> routeSkill("规划项目")
       └─> 匹配: agent_collaboration

2. 工具层
   └─> execute:
       ├─> task_splitter (拆分任务)
       ├─> a2a_coordinator (协调多个 Agent)
       │   ├─> Agent 1: 任务分解
       │   ├─> Agent 2: 时间安排
       │   └─> Agent 3: 资源分配
       └─> result_aggregator (聚合结果)

3. 交互层
   └─> 生成 A2UI 响应:
       {
         type: 'ui',
         ui: {
           intent: 'dashboard',
           components: [
             { type: 'status', props: { agents: 3, progress: 100 } },
             { type: 'list', props: { items: [...] } }
           ]
         }
       }
```

---

## 🔧 部署与使用

### 1. 初始化系统
```typescript
const agent = AgentFactory.create('MainAgent', db, {
  version: '2.0.0',
  capabilities: ['capture', 'task', 'review', 'analysis', 'a2ui', 'collaboration'],
  permissionLevel: 'write',
});

// 注册 MCP 客户端
agent.registerMCPClient('churnflow', churnFlowClient);
agent.registerMCPClient('shrimp', shrimpClient);

// 初始化（创建默认 Skills, Tools, Contexts）
await agent.initializeSystem();
```

### 2. 处理请求
```typescript
const result = await agent.process(userId, input, sessionId);

if (result.type === 'ui') {
  // 渲染 A2UI
  res.json(result.response);
} else {
  // 返回文本
  res.json({ message: result.response });
}
```

### 3. A2UI 交互
```typescript
// 启动交互
const { response, sessionId } = await agent.startA2UIInteraction(userId, 'capture');

// 处理用户输入
const result = await agent.handleA2UIInput(sessionId, userInput);
```

---

## ✅ 重构完成检查清单

### 数据层 ✅
- [x] 完整的 schema 定义
- [x] Repository 模式实现
- [x] 类型导出

### 上下文层 ✅
- [x] Skill 定义接口
- [x] 预定义 Skills (6个)
- [x] 智能路由
- [x] 权限验证

### 工具层 ✅
- [x] 工具定义接口
- [x] 预定义 Tools (16个)
- [x] 工具执行器
- [x] MCP 集成
- [x] A2A 协调器

### 交互层 ✅
- [x] A2UI 响应格式
- [x] 安全验证
- [x] 渲染器
- [x] UI 模板
- [x] 交互管理器

### Agent 核心 ✅
- [x] 核心处理流程
- [x] Skill 工作流执行
- [x] 日志记录
- [x] 系统状态

### API 集成 ⏳
- [ ] 路由集成
- [ ] 端点测试
- [ ] 文档更新

---

## 🎯 下一步行动

1. **集成到现有 API 服务器**
   - 将 A2UI 路由添加到 index.js
   - 测试所有端点

2. **前端 A2UI 集成**
   - 创建 A2UI 渲染器前端
   - 集成到 web-ui

3. **测试**
   - 单元测试
   - 集成测试
   - 端到端测试

4. **文档**
   - API 文档
   - 使用指南
   - 部署文档

---

## 📝 代码统计

- **总文件数：** 8 个核心文件
- **总代码行数：** ~2000+ 行
- **架构分层：** 4 层
- **Skills：** 6 个
- **Tools：** 16 个
- **API 端点：** 10+ 个

---

**重构完成时间：** 2026年1月4日  
**架构版本：** v2.0.0  
**状态：** ✅ 核心架构完成，等待集成测试
