# 🚀 快速启动指南 (v2.0 - A2UI + Agent 系统)

## 📋 架构概览

```
数据层 → 上下文层 → 工具层 → 交互层 (A2UI)
```

---

## 🔧 立即使用

### 1. 安装依赖
```bash
cd api-server
npm install drizzle-orm @paralleldrive/cuid2 better-sqlite3
```

### 2. 启动 API 服务器
```bash
cd api-server
npm start
```

### 3. 访问前端
```
https://ai-adhd-website-v2-production.up.railway.app/
```

---

## 🎯 核心 API 端点

### Agent 核心处理
```bash
# 处理用户输入
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/agent/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "input": "捕获一个任务：明天下午3点开会"
  }'
```

### A2UI 交互
```bash
# 启动交互
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/a2ui/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "intent": "capture"
  }'

# 返回：
{
  "success": true,
  "sessionId": "abc123",
  "ui": {
    "intent": "form",
    "components": [
      { "type": "input", "props": { "label": "内容", "required": true } },
      { "type": "select", "props": { "label": "类型", "options": ["action", "note", ...] } }
    ]
  }
}

# 提交输入
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/a2ui/input \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "input": { "content": "明天下午3点开会", "category": "action", "priority": "high" }
  }'
```

### 快捷端点
```bash
# 捕获
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/agent/capture \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "content": "测试任务"}'

# 任务
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/agent/task \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "title": "完成报告"}'

# 评审
curl -X POST https://ai-adhd-website-v2-production.up.railway.app/api/agent/review \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

### 系统状态
```bash
# 获取系统状态
curl https://ai-adhd-website-v2-production.up.railway.app/api/agent/status

# 获取所有 Skills
curl https://ai-adhd-website-v2-production.up.railway.app/api/agent/skills

# 获取所有 Tools
curl https://ai-adhd-website-v2-production.up.railway.app/api/agent/tools
```

---

## 📊 Skills 与 Tools

### 可用 Skills (6个)

| Skill | 意图 | 用途 |
|-------|------|------|
| **capture_skill** | capture, add, note | 智能捕获 |
| **task_management** | task, todo, schedule | 任务管理 |
| **review_skill** | review, check | 智能评审 |
| **analysis_skill** | analyze, insight | 数据分析 |
| **a2ui_interaction** | form, wizard | 交互界面 |
| **agent_collaboration** | collaborate, delegate | Agent 协作 |

### 可用 Tools (16个)

**MCP 工具：**
- capture_tool (ChurnFlow)
- task_create, task_list, task_update (Shrimp)

**内部工具：**
- context_analyzer, ai_classifier
- review_finder, review_ui
- a2ui_generator, a2ui_validator
- task_splitter, result_aggregator
- data_analyzer, insight_generator, report_builder

**A2A 工具：**
- a2a_coordinator

---

## 🎨 A2UI 组件类型

### 支持的组件
- **输入：** input, textarea, select, checkbox, radio
- **按钮：** button, link
- **展示：** list, card, table, chart
- **布局：** container, grid, stack
- **交互：** dialog, wizard
- **数据：** progress, metric, status

### UI 意图
- **form** - 表单输入
- **list** - 列表展示
- **card** - 卡片展示
- **dialog** - 对话框
- **dashboard** - 仪表板
- **wizard** - 向导流程

---

## 🔒 安全机制

### 权限层级
1. **read** - 只读
2. **write** - 读写
3. **admin** - 管理
4. **system** - 系统

### A2UI 安全验证
- 组件类型白名单
- 危险属性过滤
- XSS 防护
- 风险等级评估

---

## 📝 使用示例

### 示例 1：智能捕获
```typescript
// 用户输入
"明天下午3点开会"

// Agent 处理
1. 分析意图: capture
2. 匹配 Skill: capture_skill (0.95)
3. 执行工具:
   - context_analyzer → { intent: 'capture', entities: ['明天', '下午3点'] }
   - ai_classifier → { category: 'action', confidence: 0.9 }
   - capture_tool → 创建捕获记录
4. 生成 A2UI:
   {
     intent: 'form',
     components: [
       { type: 'input', props: { label: '内容', value: '明天下午3点开会' } },
       { type: 'select', props: { label: '类型', options: ['action', 'note', ...] } }
     ]
   }
```

### 示例 2：Agent 协作
```typescript
// 用户输入
"帮我规划一个项目"

// Agent 处理
1. 匹配 Skill: agent_collaboration
2. 执行工具:
   - task_splitter → 拆分出 3 个子任务
   - a2a_coordinator → 协调 3 个 Agent
   - result_aggregator → 聚合结果
3. 生成 A2UI:
   {
     intent: 'dashboard',
     components: [
       { type: 'status', props: { agents: 3, progress: 100 } },
       { type: 'list', props: { items: [...] } }
     ]
   }
```

---

## 🎯 核心优势

### 1. 分层架构
- ✅ 清晰的职责分离
- ✅ 易于维护和扩展
- ✅ 类型安全

### 2. 智能路由
- ✅ 自动匹配最佳 Skill
- ✅ 基于意图和置信度
- ✅ 支持回退机制

### 3. A2UI 集成
- ✅ 声明式 UI 生成
- ✅ 安全验证
- ✅ 交互流程管理

### 4. Agent 协作
- ✅ 多 Agent 协调
- ✅ 支持多种策略
- ✅ 结果聚合

---

## 📦 文件结构

```
api-server/src/
├── data/
│   ├── schema.ts          # 数据模型
│   └── repository.ts      # 数据访问层
├── skill/
│   └── skill-registry.ts  # Skill 注册表
├── tools/
│   └── tool-orchestrator.ts # 工具编排
├── a2ui/
│   └── a2ui-renderer.ts   # A2UI 渲染器
├── agent/
│   └── agent-core.ts      # Agent 核心
└── routes/
    └── a2ui-routes.ts     # API 路由
```

---

## 🚀 下一步

1. **集成到现有服务器**
   ```bash
   # 在 index.js 中添加
   import { createA2UIRoutes } from './routes/a2ui-routes.js';
   app.use('/api', createA2UIRoutes(db, mcpClients));
   ```

2. **测试所有端点**
   ```bash
   curl https://ai-adhd-website-v2-production.up.railway.app/api/agent/status
   ```

3. **创建前端 A2UI 渲染器**
   - 解析 A2UI 响应
   - 渲染对应组件
   - 处理用户交互

---

## 📞 支持

- **架构文档：** `REFACTORING_ARCHITECTURE.md`
- **代码文件：** `api-server/src/` 下的 8 个核心文件
- **测试环境：** Railway 生产环境

---

**状态：** ✅ 核心架构完成，等待集成  
**版本：** v2.0.0  
**更新时间：** 2026年1月4日
