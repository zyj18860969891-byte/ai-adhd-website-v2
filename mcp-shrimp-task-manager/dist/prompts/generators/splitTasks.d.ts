/**
 * splitTasks prompt 生成器
 * splitTasks prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * splitTasks prompt 參數介面
 * splitTasks prompt parameter interface
 */
export interface SplitTasksPromptParams {
    updateMode: string;
    createdTasks: Task[];
    allTasks: Task[];
}
/**
 * 獲取 splitTasks 的完整 prompt
 * Get the complete splitTasks prompt
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getSplitTasksPrompt(params: SplitTasksPromptParams): Promise<string>;
