/**
 * queryTask prompt 生成器
 * queryTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * queryTask prompt 參數介面
 * queryTask prompt parameters interface
 */
export interface QueryTaskPromptParams {
    query: string;
    isId: boolean;
    tasks: Task[];
    totalTasks: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
/**
 * 獲取 queryTask 的完整 prompt
 * Get the complete prompt for queryTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getQueryTaskPrompt(params: QueryTaskPromptParams): Promise<string>;
