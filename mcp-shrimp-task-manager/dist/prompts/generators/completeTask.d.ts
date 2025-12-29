/**
 * completeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * completeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * completeTask prompt 參數介面
 * completeTask prompt parameter interface
 */
export interface CompleteTaskPromptParams {
    task: Task;
    completionTime: string;
}
/**
 * 獲取 completeTask 的完整 prompt
 * Get the complete prompt for completeTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getCompleteTaskPrompt(params: CompleteTaskPromptParams): Promise<string>;
