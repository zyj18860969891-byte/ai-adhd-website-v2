/**
 * getTaskDetail prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * getTaskDetail prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * getTaskDetail prompt 參數介面
 * getTaskDetail prompt parameter interface
 */
export interface GetTaskDetailPromptParams {
    taskId: string;
    task?: Task | null;
    error?: string;
}
/**
 * 獲取 getTaskDetail 的完整 prompt
 * Get the complete prompt for getTaskDetail
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getGetTaskDetailPrompt(params: GetTaskDetailPromptParams): Promise<string>;
