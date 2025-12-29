/**
 * reflectTask prompt 生成器
 * reflectTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
/**
 * reflectTask prompt 參數介面
 * reflectTask prompt parameter interface
 */
export interface ReflectTaskPromptParams {
    summary: string;
    analysis: string;
}
/**
 * 獲取 reflectTask 的完整 prompt
 * Get the complete reflectTask prompt
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getReflectTaskPrompt(params: ReflectTaskPromptParams): Promise<string>;
