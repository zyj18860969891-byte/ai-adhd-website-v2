/**
 * 🎨 交互层 A2UI (Agent-to-User Interface)
 * 
 * 职责：
 * 1. A2UI 组件渲染
 * 2. 安全验证
 * 3. 交互流程管理
 * 4. 用户输入处理
 */

import { RepositoryFactory } from '../data/repository.js';
import { DatabaseManager } from '../../churnflow-mcp/src/storage/DatabaseManager.js';
import type { A2UISession, NewA2UISession } from '../data/schema.js';

// ============================================================================
// A2UI 组件定义
// ============================================================================

export interface A2UIComponent {
  type: string;
  id?: string;
  props: Record<string, any>;
  children?: A2UIComponent[];
}

export interface A2UIResponse {
  type: 'ui';
  ui: {
    intent: 'form' | 'list' | 'card' | 'dialog' | 'dashboard' | 'wizard';
    components: A2UIComponent[];
    layout?: string;
    metadata?: Record<string, any>;
  };
}

// ============================================================================
// A2UI 安全策略
// ============================================================================

export class A2UISecurity {
  // 允许的组件类型
  private static ALLOWED_COMPONENTS = [
    'input', 'textarea', 'select', 'checkbox', 'radio',
    'button', 'link',
    'list', 'card', 'table', 'chart',
    'dialog', 'wizard',
    'progress', 'metric', 'status',
    'container', 'grid', 'stack',
  ];

  // 危险组件（阻止）
  private static BLOCKED_COMPONENTS = [
    'script', 'iframe', 'embed', 'object',
    'eval', 'exec',
  ];

  // 验证 A2UI 响应
  static validate(response: A2UIResponse, userPermission: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!response.ui || !response.ui.components) {
      errors.push('Invalid UI structure: missing ui or components');
      return { valid: false, errors, warnings, riskLevel: 'high' };
    }

    // 检查组件类型
    const components = response.ui.components;
    const checkComponent = (comp: A2UIComponent, path: string = 'root') => {
      // 检查是否被阻止
      if (this.BLOCKED_COMPONENTS.includes(comp.type)) {
        errors.push(`Blocked component at ${path}: ${comp.type}`);
      }

      // 检查是否允许
      if (!this.ALLOWED_COMPONENTS.includes(comp.type)) {
        warnings.push(`Unknown component at ${path}: ${comp.type}`);
      }

      // 检查 props 安全
      if (comp.props) {
        Object.entries(comp.props).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('javascript:')) {
            errors.push(`Dangerous prop at ${path}.${key}: ${value}`);
          }
        });
      }

      // 递归检查子组件
      if (comp.children) {
        comp.children.forEach((child, i) => {
          checkComponent(child, `${path}.children[${i}]`);
        });
      }
    };

    components.forEach((comp, i) => checkComponent(comp, `components[${i}]`));

    // 根据权限限制功能
    if (userPermission === 'read' && response.ui.intent === 'form') {
      warnings.push('Read-only user receiving form intent');
    }

    // 计算风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (errors.length > 0) riskLevel = 'high';
    else if (warnings.length > 0) riskLevel = 'medium';

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      riskLevel,
    };
  }

  // 生成安全审计报告
  static audit(response: A2UIResponse, userId: string): any {
    const validation = this.validate(response, 'write');
    
    return {
      userId,
      timestamp: new Date().toISOString(),
      ...validation,
      metadata: {
        intent: response.ui.intent,
        componentCount: response.ui.components.length,
        layout: response.ui.layout,
      },
    };
  }
}

// ============================================================================
// A2UI 渲染器
// ============================================================================

export class A2UIRenderer {
  private repositoryFactory: RepositoryFactory;

  constructor(db: DatabaseManager) {
    this.repositoryFactory = RepositoryFactory.getInstance(db);
  }

  // 渲染 A2UI 响应
  async render(
    response: A2UIResponse,
    userId: string,
    sessionId?: string
  ): Promise<{
    rendered: any;
    session?: A2UISession;
    security: any;
  }> {
    // 1. 安全验证
    const security = A2UISecurity.validate(response, 'write');
    
    if (!security.valid) {
      throw new Error(`A2UI validation failed: ${security.errors.join(', ')}`);
    }

    // 2. 创建或更新 A2UI 会话
    let session: A2UISession | undefined;
    if (sessionId) {
      // 更新现有会话
      session = await this.repositoryFactory.repositories.a2uiSession.update(
        sessionId,
        {
          state: 'awaiting_input',
          componentStack: response.ui.components,
          updatedAt: new Date().toISOString(),
        } as any
      );
    } else {
      // 创建新会话
      session = await this.repositoryFactory.repositories.a2uiSession.create({
        userId,
        state: 'awaiting_input',
        currentIntent: response.ui.intent,
        componentStack: response.ui.components,
        inputHistory: [],
        securityAudit: A2UISecurity.audit(response, userId),
        metadata: {
          agentName: response.ui.metadata?.agentName,
          skillName: response.ui.metadata?.skillName,
        },
      } as any);
    }

    // 3. 渲染组件（转换为前端可用的格式）
    const rendered = this.transformComponents(response.ui.components);

    // 4. 记录安全审计
    await this.repositoryFactory.repositories.agentLog.create({
      sessionId: sessionId || 'system',
      userId,
      agentName: 'A2UIRenderer',
      request: { type: 'render', response },
      response: { rendered, security },
      a2uiResponse: response,
      duration: 0,
      status: 'success',
    } as any);

    return {
      rendered,
      session,
      security,
    };
  }

  // 转换组件为前端格式
  private transformComponents(components: A2UIComponent[]): any[] {
    return components.map(comp => ({
      type: comp.type,
      id: comp.id || `comp_${Math.random().toString(36).substr(2, 9)}`,
      props: this.sanitizeProps(comp.props),
      children: comp.children ? this.transformComponents(comp.children) : undefined,
    }));
  }

  // 清理 props（防止 XSS）
  private sanitizeProps(props: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // 移除危险字符
        sanitized[key] = value
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeProps(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  // 处理用户输入
  async handleInput(
    sessionId: string,
    input: any,
    source: 'user' | 'agent' = 'user'
  ): Promise<{
    success: boolean;
    nextAction?: 'render' | 'complete' | 'error';
    data?: any;
    error?: string;
  }> {
    try {
      // 1. 获取会话
      const session = await this.repositoryFactory.repositories.a2uiSession.findById(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      // 2. 验证会话状态
      if (session.state !== 'awaiting_input') {
        return { success: false, error: `Invalid session state: ${session.state}` };
      }

      // 3. 记录输入
      await this.repositoryFactory.repositories.a2uiSession.addInput(sessionId, input, source);

      // 4. 根据组件类型处理输入
      const result = await this.processInputByComponent(session, input);

      // 5. 更新会话状态
      if (result.complete) {
        await this.repositoryFactory.repositories.a2uiSession.updateState(sessionId, 'completed');
        return { success: true, nextAction: 'complete', data: result.data };
      } else if (result.nextComponents) {
        // 需要渲染下一个步骤
        await this.repositoryFactory.repositories.a2uiSession.updateState(
          sessionId,
          'awaiting_input',
          result.nextComponents
        );
        return { success: true, nextAction: 'render', data: result.nextComponents };
      }

      return { success: true, nextAction: 'complete' };

    } catch (error: any) {
      await this.repositoryFactory.repositories.a2uiSession.updateState(sessionId, 'error');
      return { success: false, error: error.message };
    }
  }

  // 根据组件类型处理输入
  private async processInputByComponent(session: any, input: any): Promise<{
    complete: boolean;
    data?: any;
    nextComponents?: any[];
  }> {
    const components = session.componentStack || [];

    // 简单的表单处理
    if (session.currentIntent === 'form') {
      // 验证所有必填字段
      const required = components.filter((c: any) => c.props?.required);
      const missing = required.filter((c: any) => !input[c.id || c.props?.name]);

      if (missing.length > 0) {
        return {
          complete: false,
          nextComponents: components.map((c: any) => ({
            ...c,
            props: {
              ...c.props,
              error: missing.includes(c) ? '此字段为必填项' : undefined,
            },
          })),
        };
      }

      return { complete: true, data: input };
    }

    // 列表处理
    if (session.currentIntent === 'list') {
      return { complete: true, data: input };
    }

    // 向导处理
    if (session.currentIntent === 'wizard') {
      // 检查是否还有下一步
      const currentStep = session.metadata?.currentStep || 0;
      const totalSteps = session.metadata?.totalSteps || 3;

      if (currentStep < totalSteps - 1) {
        // 下一步
        return {
          complete: false,
          nextComponents: this.getWizardStep(currentStep + 1),
        };
      } else {
        // 完成
        return { complete: true, data: input };
      }
    }

    return { complete: true, data: input };
  }

  // 获取向导步骤
  private getWizardStep(step: number): any[] {
    const steps = [
      [{ type: 'input', id: 'step1', props: { label: '步骤 1', required: true } }],
      [{ type: 'input', id: 'step2', props: { label: '步骤 2', required: true } }],
      [{ type: 'input', id: 'step3', props: { label: '步骤 3', required: true } }],
    ];
    return steps[step] || steps[0];
  }

  // 生成 A2UI 响应（便捷方法）
  static createResponse(
    intent: 'form' | 'list' | 'card' | 'dialog' | 'dashboard' | 'wizard',
    components: any[],
    layout?: string,
    metadata?: any
  ): A2UIResponse {
    return {
      type: 'ui',
      ui: {
        intent,
        components,
        layout,
        metadata,
      },
    };
  }

  // 常用 UI 模板
  static templates = {
    // 表单模板
    form: (fields: Array<{ name: string; label: string; type?: string; required?: boolean }>): A2UIResponse => {
      return this.createResponse('form', fields.map(f => ({
        type: f.type || 'input',
        id: f.name,
        props: {
          label: f.label,
          required: f.required || false,
          name: f.name,
        },
      })));
    },

    // 列表模板
    list: (items: any[], itemTemplate?: any): A2UIResponse => {
      return this.createResponse('list', [
        {
          type: 'list',
          props: {
            items,
            itemTemplate: itemTemplate || { title: 'title', description: 'description' },
          },
        },
      ]);
    },

    // 卡片模板
    card: (content: string, metadata: any, actions: string[]): A2UIResponse => {
      return this.createResponse('card', [
        {
          type: 'card',
          props: {
            content,
            metadata,
            actions,
          },
        },
      ]);
    },

    // 仪表板模板
    dashboard: (widgets: any[]): A2UIResponse => {
      return this.createResponse('dashboard', widgets.map(w => ({
        type: w.type || 'metric',
        props: w,
      })), 'grid');
    },

    // 向导模板
    wizard: (steps: Array<{ title: string; description: string }>): A2UIResponse => {
      return this.createResponse('wizard', [
        {
          type: 'wizard',
          props: {
            steps,
            submitLabel: '提交',
            cancelLabel: '取消',
          },
        },
      ]);
    },

    // 对话框模板
    dialog: (title: string, content: string, actions: string[]): A2UIResponse => {
      return this.createResponse('dialog', [
        {
          type: 'dialog',
          props: {
            title,
            content,
            actions,
          },
        },
      ]);
    },
  };
}

// ============================================================================
// A2UI 交互管理器
// ============================================================================

export class A2UIInteractionManager {
  private renderer: A2UIRenderer;
  private repositoryFactory: RepositoryFactory;

  constructor(db: DatabaseManager) {
    this.renderer = new A2UIRenderer(db);
    this.repositoryFactory = RepositoryFactory.getInstance(db);
  }

  // 启动交互流程
  async startInteraction(
    userId: string,
    intent: string,
    metadata?: any
  ): Promise<{
    response: A2UIResponse;
    sessionId: string;
  }> {
    // 根据意图生成 UI
    let response: A2UIResponse;

    switch (intent) {
      case 'capture':
        response = A2UIRenderer.templates.form([
          { name: 'content', label: '内容', required: true },
          { name: 'category', label: '类型', type: 'select', required: false },
          { name: 'priority', label: '优先级', type: 'select', required: false },
        ]);
        break;

      case 'task':
        response = A2UIRenderer.templates.form([
          { name: 'title', label: '标题', required: true },
          { name: 'description', label: '描述', type: 'textarea', required: false },
          { name: 'dueDate', label: '截止日期', type: 'date', required: false },
        ]);
        break;

      case 'review':
        // 获取待评审项目
        const captures = await this.repositoryFactory.repositories.capture.findNeedsReview(userId);
        response = A2UIRenderer.templates.card(
          captures[0]?.content || '暂无待评审项目',
          { priority: captures[0]?.priority, dueDate: captures[0]?.dueDate },
          ['approve', 'reject', 'snooze']
        );
        break;

      case 'dashboard':
        response = A2UIRenderer.templates.dashboard([
          { type: 'metric', label: '今日捕获', value: 5, trend: 'up' },
          { type: 'metric', label: '待办任务', value: 3, trend: 'down' },
          { type: 'chart', chartType: 'bar', data: [1, 2, 3, 4, 5] },
        ]);
        break;

      case 'wizard':
        response = A2UIRenderer.templates.wizard([
          { title: '输入信息', description: '提供必要信息' },
          { title: '确认', description: '验证输入' },
          { title: '完成', description: '处理完成' },
        ]);
        break;

      default:
        response = A2UIRenderer.templates.form([
          { name: 'input', label: '输入', required: true },
        ]);
    }

    // 添加元数据
    response.ui.metadata = {
      ...response.ui.metadata,
      ...metadata,
      agentName: 'A2UIInteractionManager',
    };

    // 渲染并创建会话
    const { rendered, session } = await this.renderer.render(response, userId);

    return {
      response,
      sessionId: session!.id,
    };
  }

  // 处理用户响应
  async handleUserResponse(
    sessionId: string,
    userInput: any
  ): Promise<{
    success: boolean;
    result?: any;
    next?: A2UIResponse;
    error?: string;
  }> {
    const result = await this.renderer.handleInput(sessionId, userInput, 'user');

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (result.nextAction === 'render') {
      // 需要渲染下一步
      const nextResponse = A2UIRenderer.templates.form([
        { name: 'next', label: '下一步', required: true },
      ]);
      return { success: true, next: nextResponse };
    }

    if (result.nextAction === 'complete') {
      // 交互完成
      return { success: true, result: result.data };
    }

    return { success: true };
  }

  // 取消交互
  async cancelInteraction(sessionId: string): Promise<void> {
    await this.repositoryFactory.repositories.a2uiSession.updateState(sessionId, 'cancelled');
  }
}
