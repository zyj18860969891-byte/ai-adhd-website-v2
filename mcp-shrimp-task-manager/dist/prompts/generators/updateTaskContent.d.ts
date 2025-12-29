/**
 * updateTaskContent prompt 生成器
 * updateTaskContent prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * updateTaskContent prompt 參數介面
 * updateTaskContent prompt parameter interface
 */
export interface UpdateTaskContentPromptParams {
    taskId: string;
    task?: Task;
    success?: boolean;
    message?: string;
    validationError?: string;
    emptyUpdate?: boolean;
    updatedTask?: Task;
}
/**
 * 獲取 updateTaskContent 的完整 prompt
 * Get the complete updateTaskContent prompt
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getUpdateTaskContentPrompt(params: UpdateTaskContentPromptParams): Promise<string>;
