export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum AgentType {
    RESEARCHER = "researcher",
    ANALYZER = "analyzer",
    EXECUTOR = "executor",
    COORDINATOR = "coordinator"
}
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedTime: number;
    actualTime?: number;
    createdAt: number;
    completedAt?: number;
    dueDate?: number;
    tags: string[];
    subtasks: string[];
    parentId?: string;
    context: string[];
    attachments: Attachment[];
    comments: Comment[];
    agentId?: string;
    metadata: Record<string, any>;
}
export interface Subtask {
    id: string;
    taskId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedTime: number;
    createdAt: number;
    completedAt?: number;
    tags: string[];
    context: string[];
    dependencies: string[];
    agentId?: string;
}
export interface Attachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: number;
    uploadedBy: string;
}
export interface Comment {
    id: string;
    taskId: string;
    content: string;
    author: string;
    createdAt: number;
    editedAt?: number;
    parentId?: string;
}
export interface Agent {
    id: string;
    type: AgentType;
    name: string;
    description: string;
    status: 'idle' | 'busy' | 'offline';
    capabilities: string[];
    createdAt: number;
    lastActiveAt: number;
    config: Record<string, any>;
}
export interface ResearchResult {
    id: string;
    query: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startTime: number;
    endTime?: number;
    results: ResearchItem[];
    summary: string;
    error?: string;
}
export interface ResearchItem {
    id: string;
    title: string;
    url: string;
    summary: string;
    relevance: number;
    source: string;
    publishedAt?: number;
}
export interface Reminder {
    id: string;
    taskId: string;
    message: string;
    time: number;
    recurrence?: 'daily' | 'weekly' | 'monthly';
    triggered: boolean;
    createdAt: number;
}
export interface Statistics {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    cancelledTasks: number;
    averageCompletionTime: number;
    completionRate: number;
    mostActiveTime: string;
    weeklyStats: {
        completedTasks: number;
        newTasks: number;
        workHours: number;
    };
}
export interface CreateTaskRequest {
    title: string;
    description: string;
    priority?: TaskPriority;
    estimatedTime?: number;
    dueDate?: number;
    tags?: string[];
    context?: string[];
    parentId?: string;
    attachments?: Attachment[];
    agentType?: AgentType;
}
export interface UpdateTaskRequest {
    id: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    estimatedTime?: number;
    actualTime?: number;
    completedAt?: number;
    dueDate?: number;
    tags?: string[];
    subtasks?: string[];
    parentId?: string;
    context?: string[];
    attachments?: Attachment[];
    comments?: Comment[];
    agentId?: string;
    metadata?: Record<string, any>;
}
export interface TaskFilter {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    tags?: string[];
    timeRange?: {
        start: number;
        end: number;
    };
    search?: string;
    agentType?: AgentType[];
}
export interface TaskSort {
    field: 'createdAt' | 'dueDate' | 'priority' | 'status' | 'estimatedTime';
    direction: 'asc' | 'desc';
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface DecomposeTaskRequest {
    taskId: string;
    granularity?: 'coarse' | 'medium' | 'fine';
    autoAssignAgents?: boolean;
}
export interface DecomposeTaskResult {
    originalTask: Task;
    subtasks: Subtask[];
    suggestions: string[];
    decomposedAt: number;
}
export interface ResearchModeRequest {
    query: string;
    depth?: 'shallow' | 'medium' | 'deep';
    timeLimit?: number;
    relevanceThreshold?: number;
}
export interface AssignAgentRequest {
    taskId: string;
    agentType: AgentType;
    config?: Record<string, any>;
}
export interface CreateReminderRequest {
    taskId: string;
    message: string;
    time: number;
    recurrence?: 'daily' | 'weekly' | 'monthly';
}
export interface ShrimpConfig {
    enablePersistentMemory?: boolean;
    enableStructuredWorkflows?: boolean;
    enableSmartDecomposition?: boolean;
    enableContextRetention?: boolean;
    enableTaskManagement?: boolean;
    enableResearchMode?: boolean;
    enableAgentSystem?: boolean;
    enableReminderSystem?: boolean;
    maxTasks?: number;
    maxSubtasks?: number;
    autoSaveInterval?: number;
}
