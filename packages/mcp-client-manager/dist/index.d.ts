import { EventEmitter } from 'events';
import { Logger, createMCPLogger, type LogLevel, type LogEntry, type LoggerConfig } from './logger';
import { defaultConfig, loadConfigFromEnv, validateConfig, type MCPConfig } from './config';
type ChurnFlowMCPConfig = any;
type ShrimpMCPConfig = any;
import { CaptureInput, CaptureResult, AnalysisResult, Context, Session } from './types/churnflow';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilter, TaskSort, PaginationParams, DecomposeTaskRequest, DecomposeTaskResult, ResearchModeRequest, ResearchResult, AssignAgentRequest, Agent, CreateReminderRequest, Reminder, Statistics } from './types/shrimp';
export interface MCPManagerConfig {
    churnflow: ChurnFlowMCPConfig;
    shrimp: ShrimpMCPConfig;
    autoConnect?: boolean;
    connectionTimeout?: number;
}
export interface UnifiedTask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    source: 'churnflow' | 'shrimp' | 'unified';
    dueDate?: Date;
    estimatedTime?: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowStep {
    id: string;
    type: 'input_capture' | 'task_creation' | 'research' | 'agent_execution';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    input?: any;
    output?: any;
    error?: string;
    timestamp: Date;
}
export interface Workflow {
    id: string;
    title: string;
    steps: WorkflowStep[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
export interface ClientStatus {
    churnflow: {
        connected: boolean;
        status: string;
        lastError?: string;
    };
    shrimp: {
        connected: boolean;
        status: string;
        lastError?: string;
    };
}
export interface WorkflowResult {
    success: boolean;
    data?: any;
    error?: string;
    duration: number;
    steps: string[];
}
export declare class MCPClientManager extends EventEmitter {
    private churnflowClient;
    private shrimpClient;
    private config;
    private isConnected;
    private workflows;
    private activeWorkflows;
    private logger;
    constructor(config: MCPManagerConfig);
    private setupEventListeners;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnectedToServices(): boolean;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getStatus(): ClientStatus;
    routeInput(input: string): Promise<WorkflowResult>;
    manageTask(taskData: CreateTaskRequest): Promise<WorkflowResult>;
    conductResearch(query: string): Promise<WorkflowResult>;
    captureInput(input: CaptureInput): Promise<CaptureResult>;
    analyzeInput(input: string): Promise<AnalysisResult>;
    getContext(): Promise<Context>;
    recoverSession(sessionId: string): Promise<Session>;
    getHistory(limit?: number): Promise<CaptureResult[]>;
    clearHistory(beforeDate?: Date): Promise<void>;
    createTask(task: CreateTaskRequest): Promise<Task>;
    getTask(taskId: string): Promise<Task>;
    updateTask(task: UpdateTaskRequest): Promise<Task>;
    deleteTask(taskId: string): Promise<void>;
    getTasks(filter?: TaskFilter, sort?: TaskSort, pagination?: PaginationParams): Promise<{
        tasks: Task[];
        total: number;
    }>;
    decomposeTask(request: DecomposeTaskRequest): Promise<DecomposeTaskResult>;
    startResearch(request: ResearchModeRequest): Promise<ResearchResult>;
    getResearchResult(researchId: string): Promise<ResearchResult>;
    assignAgent(request: AssignAgentRequest): Promise<Agent>;
    getAgents(): Promise<Agent[]>;
    createReminder(reminder: CreateReminderRequest): Promise<Reminder>;
    getReminders(taskId?: string): Promise<Reminder[]>;
    getStatistics(): Promise<Statistics>;
    searchTasks(query: string): Promise<Task[]>;
    importTasks(tasks: CreateTaskRequest[]): Promise<{
        imported: number;
        failed: number;
    }>;
    exportTasks(filter?: TaskFilter): Promise<Task[]>;
    createWorkflow(title: string, steps: WorkflowStep[]): Promise<Workflow>;
    executeWorkflow(workflowId: string): Promise<Workflow>;
    getWorkflows(): Workflow[];
    getWorkflow(workflowId: string): Workflow | undefined;
    getConnectedClients(): string[];
    getChurnFlowCapabilities(): any;
    getShrimpCapabilities(): any;
    getStats(): any;
}
export { Logger, type LogLevel, type LogEntry, type LoggerConfig, createMCPLogger };
export { defaultConfig, loadConfigFromEnv, validateConfig, type MCPConfig, type ChurnFlowMCPConfig, type ShrimpMCPConfig };
export * as utils from './utils';
export * from './interfaces/IMCPClient';
export * from './types/churnflow';
export * from './types/shrimp';
export default MCPClientManager;
