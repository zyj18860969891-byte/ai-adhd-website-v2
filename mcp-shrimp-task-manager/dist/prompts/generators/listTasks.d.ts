/**
 * listTasks prompt 生成器
 * listTasks prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * listTasks prompt 參數介面
 * listTasks prompt parameters interface
 */
export interface ListTasksPromptParams {
    status: string;
    tasks: Record<string, Task[]>;
    allTasks: Task[];
}
/**
 * 獲取 listTasks 的完整 prompt
 * Get the complete prompt for listTasks
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getListTasksPrompt(params: ListTasksPromptParams): Promise<string>;
