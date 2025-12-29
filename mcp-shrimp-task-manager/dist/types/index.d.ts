export declare enum TaskStatus {
    PENDING = "pending",// 已創建但尚未開始執行的任務
    IN_PROGRESS = "in_progress",// 當前正在執行的任務
    COMPLETED = "completed",// 已成功完成並通過驗證的任務
    BLOCKED = "blocked"
}
export interface TaskDependency {
    taskId: string;
}
export declare enum RelatedFileType {
    TO_MODIFY = "TO_MODIFY",// 需要在任務中修改的文件
    REFERENCE = "REFERENCE",// 任務的參考資料或相關文檔
    CREATE = "CREATE",// 需要在任務中建立的文件
    DEPENDENCY = "DEPENDENCY",// 任務依賴的組件或庫文件
    OTHER = "OTHER"
}
export interface RelatedFile {
    path: string;
    type: RelatedFileType;
    description?: string;
    lineStart?: number;
    lineEnd?: number;
}
export interface Task {
    id: string;
    name: string;
    description: string;
    notes?: string;
    status: TaskStatus;
    dependencies: TaskDependency[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    summary?: string;
    relatedFiles?: RelatedFile[];
    analysisResult?: string;
    agent?: string;
    implementationGuide?: string;
    verificationCriteria?: string;
}
export declare enum TaskComplexityLevel {
    LOW = "\u4F4E\u8907\u96DC\u5EA6",// 簡單且直接的任務，通常不需要特殊處理
    MEDIUM = "\u4E2D\u7B49\u8907\u96DC\u5EA6",// 具有一定複雜性但仍可管理的任務
    HIGH = "\u9AD8\u8907\u96DC\u5EA6",// 複雜且耗時的任務，需要特別關注
    VERY_HIGH = "\u6975\u9AD8\u8907\u96DC\u5EA6"
}
export declare const TaskComplexityThresholds: {
    DESCRIPTION_LENGTH: {
        MEDIUM: number;
        HIGH: number;
        VERY_HIGH: number;
    };
    DEPENDENCIES_COUNT: {
        MEDIUM: number;
        HIGH: number;
        VERY_HIGH: number;
    };
    NOTES_LENGTH: {
        MEDIUM: number;
        HIGH: number;
        VERY_HIGH: number;
    };
};
export interface TaskComplexityAssessment {
    level: TaskComplexityLevel;
    metrics: {
        descriptionLength: number;
        dependenciesCount: number;
        notesLength: number;
        hasNotes: boolean;
    };
    recommendations: string[];
}
