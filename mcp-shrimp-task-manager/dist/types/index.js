// 任務狀態枚舉：定義任務在工作流程中的當前階段
// Task status enumeration: Defines the current stage of tasks in the workflow
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    // PENDING = "pending", // Created but not yet started tasks
    TaskStatus["IN_PROGRESS"] = "in_progress";
    // IN_PROGRESS = "in_progress", // Currently executing tasks
    TaskStatus["COMPLETED"] = "completed";
    // COMPLETED = "completed", // Successfully completed and verified tasks
    TaskStatus["BLOCKED"] = "blocked";
    // BLOCKED = "blocked", // Tasks temporarily unable to execute due to dependencies
})(TaskStatus || (TaskStatus = {}));
// 相關文件類型：定義文件與任務的關係類型
// Related file type: Defines the relationship type between files and tasks
export var RelatedFileType;
(function (RelatedFileType) {
    RelatedFileType["TO_MODIFY"] = "TO_MODIFY";
    // TO_MODIFY = "TO_MODIFY", // Files that need to be modified in the task
    RelatedFileType["REFERENCE"] = "REFERENCE";
    // REFERENCE = "REFERENCE", // Reference materials or related documents for the task
    RelatedFileType["CREATE"] = "CREATE";
    // CREATE = "CREATE", // Files that need to be created in the task
    RelatedFileType["DEPENDENCY"] = "DEPENDENCY";
    // DEPENDENCY = "DEPENDENCY", // Components or library files that the task depends on
    RelatedFileType["OTHER"] = "OTHER";
    // OTHER = "OTHER", // Other types of related files
})(RelatedFileType || (RelatedFileType = {}));
// 任務複雜度級別：定義任務的複雜程度分類
// Task complexity level: Defines task complexity classification
export var TaskComplexityLevel;
(function (TaskComplexityLevel) {
    TaskComplexityLevel["LOW"] = "\u4F4E\u8907\u96DC\u5EA6";
    // LOW = "Low Complexity", // Simple and straightforward tasks, usually no special handling required
    TaskComplexityLevel["MEDIUM"] = "\u4E2D\u7B49\u8907\u96DC\u5EA6";
    // MEDIUM = "Medium Complexity", // Tasks with some complexity but still manageable
    TaskComplexityLevel["HIGH"] = "\u9AD8\u8907\u96DC\u5EA6";
    // HIGH = "High Complexity", // Complex and time-consuming tasks that require special attention
    TaskComplexityLevel["VERY_HIGH"] = "\u6975\u9AD8\u8907\u96DC\u5EA6";
    // VERY_HIGH = "Very High Complexity", // Extremely complex tasks, recommended to be split for processing
})(TaskComplexityLevel || (TaskComplexityLevel = {}));
// 任務複雜度閾值：定義任務複雜度評估的參考標準
// Task complexity thresholds: Defines reference standards for task complexity assessment
export const TaskComplexityThresholds = {
    DESCRIPTION_LENGTH: {
        MEDIUM: 500, // 超過此字數判定為中等複雜度
        // MEDIUM: 500, // Above this word count is classified as medium complexity
        HIGH: 1000, // 超過此字數判定為高複雜度
        // HIGH: 1000, // Above this word count is classified as high complexity
        VERY_HIGH: 2000, // 超過此字數判定為極高複雜度
        // VERY_HIGH: 2000, // Above this word count is classified as very high complexity
    },
    DEPENDENCIES_COUNT: {
        MEDIUM: 2, // 超過此依賴數量判定為中等複雜度
        // MEDIUM: 2, // Above this dependency count is classified as medium complexity
        HIGH: 5, // 超過此依賴數量判定為高複雜度
        // HIGH: 5, // Above this dependency count is classified as high complexity
        VERY_HIGH: 10, // 超過此依賴數量判定為極高複雜度
        // VERY_HIGH: 10, // Above this dependency count is classified as very high complexity
    },
    NOTES_LENGTH: {
        MEDIUM: 200, // 超過此字數判定為中等複雜度
        // MEDIUM: 200, // Above this word count is classified as medium complexity
        HIGH: 500, // 超過此字數判定為高複雜度
        // HIGH: 500, // Above this word count is classified as high complexity
        VERY_HIGH: 1000, // 超過此字數判定為極高複雜度
        // VERY_HIGH: 1000, // Above this word count is classified as very high complexity
    },
};
//# sourceMappingURL=index.js.map