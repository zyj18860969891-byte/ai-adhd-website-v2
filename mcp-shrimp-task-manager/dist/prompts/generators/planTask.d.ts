/**
 * planTask prompt 生成器
 * planTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * planTask prompt 參數介面
 * planTask prompt parameters interface
 */
export interface PlanTaskPromptParams {
    description: string;
    requirements?: string;
    existingTasksReference?: boolean;
    completedTasks?: Task[];
    pendingTasks?: Task[];
    memoryDir: string;
}
/**
 * 獲取 planTask 的完整 prompt
 * Get the complete prompt for planTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getPlanTaskPrompt(params: PlanTaskPromptParams): Promise<string>;
