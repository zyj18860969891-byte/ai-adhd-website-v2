/**
 * 🎓 上下文层 / Skill层
 * 
 * 职责：
 * 1. 定义 Agent 的所有能力 (Skills)
 * 2. Skill 注册与发现
 * 3. 上下文管理
 * 4. 能力匹配与路由
 */

import { RepositoryFactory } from '../data/repository.js';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import type { Skill, NewSkill, Tool } from '../data/schema.js';

// ============================================================================
// Skill 定义接口
// ============================================================================

export interface SkillDefinition {
  name: string;
  displayName: string;
  description: string;
  
  // 能力描述
  capabilities: {
    intents: string[];  // 支持的意图
    domains: string[];  // 支持的领域
    confidence: number; // 能力置信度 (0-1)
  };
  
  // 关联工具
  toolIds: string[];
  
  // 执行流程
  workflow: {
    steps: {
      tool: string;
      condition?: string;
      fallback?: string;
    }[];
  };
  
  // A2UI 集成
  uiComponents: {
    intent: 'form' | 'list' | 'card' | 'dialog' | 'dashboard' | 'wizard';
    components: any[];
    layout?: string;
  };
  
  // 权限
  permissionLevel: 'read' | 'write' | 'admin' | 'system';
}

// ============================================================================
// 预定义 Skills
// ============================================================================

export const PREDEFINED_SKILLS: SkillDefinition[] = [
  // 1. 捕获技能 (Capture Skill)
  {
    name: 'capture_skill',
    displayName: '智能捕获',
    description: '捕获用户输入并智能分类到合适的上下文',
    capabilities: {
      intents: ['capture', 'add', 'create', 'note'],
      domains: ['productivity', 'task', 'note'],
      confidence: 0.95,
    },
    toolIds: ['capture_tool', 'context_analyzer', 'ai_classifier'],
    workflow: {
      steps: [
        { tool: 'context_analyzer', condition: 'analyze input' },
        { tool: 'ai_classifier', condition: 'classify content' },
        { tool: 'capture_tool', fallback: 'manual_capture' },
      ],
    },
    uiComponents: {
      intent: 'form',
      components: [
        {
          type: 'input',
          label: '内容',
          placeholder: '输入要捕获的内容...',
          required: true,
        },
        {
          type: 'select',
          label: '类型',
          options: ['action', 'note', 'journal', 'link', 'someday', 'reminder'],
        },
        {
          type: 'select',
          label: '优先级',
          options: ['critical', 'high', 'medium', 'low'],
        },
      ],
      layout: 'vertical',
    },
    permissionLevel: 'write',
  },

  // 2. 任务管理技能 (Task Management Skill)
  {
    name: 'task_management',
    displayName: '任务管理',
    description: '创建、更新、查询和管理任务',
    capabilities: {
      intents: ['task', 'todo', 'schedule', 'plan'],
      domains: ['productivity', 'task'],
      confidence: 0.90,
    },
    toolIds: ['task_create', 'task_update', 'task_list', 'task_delete'],
    workflow: {
      steps: [
        { tool: 'task_create', condition: 'action needed' },
        { tool: 'task_list', condition: 'query needed' },
        { tool: 'task_update', condition: 'update needed' },
      ],
    },
    uiComponents: {
      intent: 'list',
      components: [
        {
          type: 'list',
          itemTemplate: {
            title: 'content',
            status: 'status',
            priority: 'priority',
            dueDate: 'dueDate',
          },
          actions: ['complete', 'edit', 'delete'],
        },
        {
          type: 'button',
          label: '添加任务',
          action: 'create',
        },
      ],
      layout: 'vertical',
    },
    permissionLevel: 'write',
  },

  // 3. 评审技能 (Review Skill)
  {
    name: 'review_skill',
    displayName: '智能评审',
    description: '评审待处理的捕获和任务',
    capabilities: {
      intents: ['review', 'check', 'audit'],
      domains: ['productivity', 'review'],
      confidence: 0.85,
    },
    toolIds: ['review_finder', 'review_ui', 'review_updater'],
    workflow: {
      steps: [
        { tool: 'review_finder', condition: 'find items to review' },
        { tool: 'review_ui', condition: 'display review interface' },
        { tool: 'review_updater', condition: 'update review status' },
      ],
    },
    uiComponents: {
      intent: 'card',
      components: [
        {
          type: 'card',
          content: 'item.content',
          metadata: ['priority', 'dueDate', 'lastReviewedAt'],
          actions: ['approve', 'reject', 'edit', 'snooze'],
        },
        {
          type: 'progress',
          label: '评审进度',
          value: 'completed',
          total: 'total',
        },
      ],
      layout: 'horizontal',
    },
    permissionLevel: 'read',
  },

  // 4. 分析技能 (Analysis Skill)
  {
    name: 'analysis_skill',
    displayName: '数据分析',
    description: '分析用户数据，提供洞察和建议',
    capabilities: {
      intents: ['analyze', 'insight', 'report', 'stats'],
      domains: ['analytics', 'productivity'],
      confidence: 0.80,
    },
    toolIds: ['data_analyzer', 'insight_generator', 'report_builder'],
    workflow: {
      steps: [
        { tool: 'data_analyzer', condition: 'analyze data' },
        { tool: 'insight_generator', condition: 'generate insights' },
        { tool: 'report_builder', condition: 'build report' },
      ],
    },
    uiComponents: {
      intent: 'dashboard',
      components: [
        {
          type: 'chart',
          chartType: 'bar',
          data: 'captureStats',
          title: '捕获统计',
        },
        {
          type: 'metric',
          label: '本周完成',
          value: 'completedThisWeek',
          trend: 'up',
        },
        {
          type: 'list',
          title: '待办事项',
          items: 'pendingTasks',
        },
      ],
      layout: 'grid',
    },
    permissionLevel: 'read',
  },

  // 5. A2UI 交互技能 (A2UI Interaction Skill)
  {
    name: 'a2ui_interaction',
    displayName: '交互式界面',
    description: '通过 A2UI 生成交互式用户界面',
    capabilities: {
      intents: ['form', 'wizard', 'dialog', 'interactive'],
      domains: ['ui', 'interaction'],
      confidence: 0.95,
    },
    toolIds: ['a2ui_generator', 'a2ui_validator', 'a2ui_renderer'],
    workflow: {
      steps: [
        { tool: 'a2ui_generator', condition: 'generate UI components' },
        { tool: 'a2ui_validator', condition: 'validate security' },
        { tool: 'a2ui_renderer', condition: 'render to user' },
      ],
    },
    uiComponents: {
      intent: 'wizard',
      components: [
        {
          type: 'wizard',
          steps: [
            { title: '输入', description: '提供必要信息' },
            { title: '确认', description: '验证输入' },
            { title: '完成', description: '处理完成' },
          ],
          submitLabel: '提交',
          cancelLabel: '取消',
        },
      ],
      layout: 'vertical',
    },
    permissionLevel: 'write',
  },

  // 6. Agent 协作技能 (Agent Collaboration Skill)
  {
    name: 'agent_collaboration',
    displayName: 'Agent 协作',
    description: '协调多个 Agent 完成复杂任务',
    capabilities: {
      intents: ['collaborate', 'delegate', 'coordinate'],
      domains: ['agent', 'workflow'],
      confidence: 0.75,
    },
    toolIds: ['a2a_coordinator', 'task_splitter', 'result_aggregator'],
    workflow: {
      steps: [
        { tool: 'task_splitter', condition: 'split complex task' },
        { tool: 'a2a_coordinator', condition: 'delegate to agents' },
        { tool: 'result_aggregator', condition: 'combine results' },
      ],
    },
    uiComponents: {
      intent: 'dashboard',
      components: [
        {
          type: 'status',
          label: '协作状态',
          agents: 'activeAgents',
          progress: 'overallProgress',
        },
        {
          type: 'list',
          title: '子任务',
          items: 'subTasks',
          actions: ['view', 'approve'],
        },
      ],
      layout: 'vertical',
    },
    permissionLevel: 'admin',
  },
];

// ============================================================================
// Skill 注册表
// ============================================================================

export class SkillRegistry {
  private repositoryFactory: RepositoryFactory;
  private skills: Map<string, SkillDefinition> = new Map();

  constructor(db: DatabaseManager) {
    this.repositoryFactory = RepositoryFactory.getInstance(db);
    this.initializeDefaultSkills();
  }

  // 初始化默认技能
  private initializeDefaultSkills(): void {
    PREDEFINED_SKILLS.forEach(skill => {
      this.skills.set(skill.name, skill);
    });
  }

  // 注册新技能
  registerSkill(skill: SkillDefinition): void {
    this.skills.set(skill.name, skill);
  }

  // 获取所有技能
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  // 根据名称获取技能
  getSkill(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  // 根据意图匹配技能
  findSkillsByIntent(intent: string): SkillDefinition[] {
    return this.getAllSkills().filter(skill => 
      skill.capabilities.intents.includes(intent)
    );
  }

  // 根据领域匹配技能
  findSkillsByDomain(domain: string): SkillDefinition[] {
    return this.getAllSkills().filter(skill => 
      skill.capabilities.domains.includes(domain)
    );
  }

  // 智能路由：根据用户输入选择最佳技能
  async routeSkill(userId: string, input: string, context?: string): Promise<{
    skill: SkillDefinition;
    confidence: number;
    reason: string;
  } | null> {
    // 1. 分析输入意图
    const intent = await this.analyzeIntent(input);
    
    // 2. 匹配候选技能
    const candidates = this.findSkillsByIntent(intent);
    
    if (candidates.length === 0) {
      return null;
    }

    // 3. 选择置信度最高的技能
    const best = candidates.reduce((prev, curr) => 
      curr.capabilities.confidence > prev.capabilities.confidence ? curr : prev
    );

    return {
      skill: best,
      confidence: best.capabilities.confidence,
      reason: `匹配意图: ${intent}`,
    };
  }

  // 意图分析（简化版）
  private async analyzeIntent(input: string): Promise<string> {
    const lower = input.toLowerCase();
    
    if (lower.match(/捕获|记录|添加|创建|capture|add|create|note/)) return 'capture';
    if (lower.match(/任务|todo|计划|schedule|task/)) return 'task';
    if (lower.match(/评审|检查|review|check|audit/)) return 'review';
    if (lower.match(/分析|统计|insight|analyze|stats/)) return 'analyze';
    if (lower.match(/交互|表单|wizard|form|dialog/)) return 'interactive';
    if (lower.match(/协作|协调|delegate|collaborate/)) return 'collaborate';
    
    return 'capture'; // 默认意图
  }

  // 持久化到数据库
  async persistToDatabase(): Promise<void> {
    const skillRepo = this.repositoryFactory.repositories.skill;
    
    for (const skill of this.skills.values()) {
      const existing = await skillRepo.findWhere([
        eq((skillRepo as any).table.name, skill.name)
      ]);
      
      if (existing.length === 0) {
        // 插入新技能
        await skillRepo.create({
          name: skill.name,
          displayName: skill.displayName,
          description: skill.description,
          capabilities: skill.capabilities,
          toolIds: skill.toolIds,
          workflow: skill.workflow,
          uiComponents: skill.uiComponents,
          permissionLevel: skill.permissionLevel,
          enabled: true,
        } as any);
      }
    }
  }

  // 从数据库加载
  async loadFromDatabase(): Promise<void> {
    const skillRepo = this.repositoryFactory.repositories.skill;
    const dbSkills = await skillRepo.findEnabled();
    
    dbSkills.forEach(skill => {
      this.skills.set(skill.name, {
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        capabilities: skill.capabilities as any,
        toolIds: skill.toolIds as any,
        workflow: skill.workflow as any,
        uiComponents: skill.uiComponents as any,
        permissionLevel: skill.permissionLevel as any,
      });
    });
  }

  // 获取技能的 UI 模板
  getSkillUITemplate(skillName: string): any {
    const skill = this.getSkill(skillName);
    return skill?.uiComponents || null;
  }

  // 验证技能权限
  validatePermission(skillName: string, userPermission: string): boolean {
    const skill = this.getSkill(skillName);
    if (!skill) return false;

    const permissionLevels = ['read', 'write', 'admin', 'system'];
    const userLevel = permissionLevels.indexOf(userPermission);
    const skillLevel = permissionLevels.indexOf(skill.permissionLevel);

    return userLevel >= skillLevel;
  }
}

// ============================================================================
// 上下文管理器
// ============================================================================

export class ContextManager {
  private repositoryFactory: RepositoryFactory;

  constructor(db: DatabaseManager) {
    this.repositoryFactory = RepositoryFactory.getInstance(db);
  }

  // 获取用户的所有上下文
  async getUserContexts(userId: string) {
    return this.repositoryFactory.repositories.context.findActive(userId);
  }

  // 智能上下文匹配
  async matchContext(userId: string, input: string): Promise<{
    context: any;
    confidence: number;
  } | null> {
    const contexts = await this.getUserContexts(userId);
    
    // 简单的关键词匹配
    const lower = input.toLowerCase();
    
    for (const ctx of contexts) {
      const keywords = ctx.keywords as string[];
      const patterns = ctx.patterns as string[];
      
      // 关键词匹配
      const keywordMatch = keywords.some(kw => lower.includes(kw.toLowerCase()));
      
      // 模式匹配（简化）
      const patternMatch = patterns.some(pattern => 
        new RegExp(pattern, 'i').test(lower)
      );

      if (keywordMatch || patternMatch) {
        return {
          context: ctx,
          confidence: keywordMatch ? 0.8 : 0.6,
        };
      }
    }

    return null;
  }

  // 创建新上下文
  async createContext(userId: string, data: {
    name: string;
    displayName: string;
    description?: string;
    keywords?: string[];
    patterns?: string[];
    color?: string;
    icon?: string;
  }) {
    return this.repositoryFactory.repositories.context.create({
      userId,
      ...data,
      active: true,
      priority: 0,
    } as any);
  }
}
