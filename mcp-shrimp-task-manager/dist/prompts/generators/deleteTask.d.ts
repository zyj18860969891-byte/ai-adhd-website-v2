/**
 * deleteTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * deleteTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * deleteTask prompt 參數介面
 * deleteTask prompt parameter interface
 */
export interface DeleteTaskPromptParams {
    taskId: string;
    task?: Task;
    success?: boolean;
    message?: string;
    isTaskCompleted?: boolean;
}
/**
 * 獲取 deleteTask 的完整 prompt
 * Get the complete prompt for deleteTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getDeleteTaskPrompt(params: DeleteTaskPromptParams): Promise<string>;
