/**
 * analyzeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */
/**
 * analyzeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
/**
 * analyzeTask prompt 參數介面
 */
/**
 * analyzeTask prompt parameter interface
 */
export interface AnalyzeTaskPromptParams {
    summary: string;
    initialConcept: string;
    previousAnalysis?: string;
}
/**
 * 獲取 analyzeTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for analyzeTask
 * @param params prompt parameters
 * @returns generated prompt
 */
export declare function getAnalyzeTaskPrompt(params: AnalyzeTaskPromptParams): Promise<string>;
