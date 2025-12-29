/**
 * executeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * executeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * 任務複雜度評估的介面
 * Interface for task complexity assessment
 */
interface ComplexityAssessment {
    level: string;
    metrics: {
        descriptionLength: number;
        dependenciesCount: number;
    };
    recommendations?: string[];
}
/**
 * executeTask prompt 參數介面
 * executeTask prompt parameter interface
 */
export interface ExecuteTaskPromptParams {
    task: Task;
    complexityAssessment?: ComplexityAssessment;
    relatedFilesSummary?: string;
    dependencyTasks?: Task[];
}
/**
 * 獲取 executeTask 的完整 prompt
 * Get the complete prompt for executeTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getExecuteTaskPrompt(params: ExecuteTaskPromptParams): Promise<string>;
export {};
