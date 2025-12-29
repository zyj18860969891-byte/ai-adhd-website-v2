import { Task, TaskStatus, TaskComplexityAssessment, RelatedFile } from '../types/index.js';
export declare function getAllTasks(): Promise<Task[]>;
export declare function getTaskById(taskId: string): Promise<Task | null>;
export declare function createTask(name: string, description: string, notes?: string, dependencies?: string[], relatedFiles?: RelatedFile[], agent?: string): Promise<Task>;
export declare function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null>;
export declare function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null>;
export declare function updateTaskSummary(taskId: string, summary: string): Promise<Task | null>;
export declare function updateTaskContent(taskId: string, updates: {
    name?: string;
    description?: string;
    notes?: string;
    relatedFiles?: RelatedFile[];
    dependencies?: string[];
    implementationGuide?: string;
    verificationCriteria?: string;
    agent?: string;
}): Promise<{
    success: boolean;
    message: string;
    task?: Task;
}>;
export declare function updateTaskRelatedFiles(taskId: string, relatedFiles: RelatedFile[]): Promise<{
    success: boolean;
    message: string;
    task?: Task;
}>;
export declare function batchCreateOrUpdateTasks(taskDataList: Array<{
    name: string;
    description: string;
    notes?: string;
    dependencies?: string[];
    relatedFiles?: RelatedFile[];
    implementationGuide?: string;
    verificationCriteria?: string;
    agent?: string;
}>, updateMode: "append" | "overwrite" | "selective" | "clearAllTasks", // 必填參數，指定任務更新策略
globalAnalysisResult?: string): Promise<Task[]>;
export declare function canExecuteTask(taskId: string): Promise<{
    canExecute: boolean;
    blockedBy?: string[];
}>;
export declare function deleteTask(taskId: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function assessTaskComplexity(taskId: string): Promise<TaskComplexityAssessment | null>;
export declare function clearAllTasks(): Promise<{
    success: boolean;
    message: string;
    backupFile?: string;
}>;
export declare function searchTasksWithCommand(query: string, isId?: boolean, page?: number, pageSize?: number): Promise<{
    tasks: Task[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalResults: number;
        hasMore: boolean;
    };
}>;
