/**
 * verifyTask prompt 生成器
 * verifyTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { Task } from '../../types/index.js';
/**
 * verifyTask prompt 參數介面
 * verifyTask prompt parameters interface
 */
export interface VerifyTaskPromptParams {
    task: Task;
    score: number;
    summary: string;
}
/**
 * 獲取 verifyTask 的完整 prompt
 * Get the complete prompt for verifyTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns Generated prompt
 */
export declare function getVerifyTaskPrompt(params: VerifyTaskPromptParams): Promise<string>;
