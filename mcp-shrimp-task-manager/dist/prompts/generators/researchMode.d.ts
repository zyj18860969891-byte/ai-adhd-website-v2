/**
 * researchMode prompt 生成器
 * researchMode prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
/**
 * researchMode prompt 參數介面
 * researchMode prompt parameter interface
 */
export interface ResearchModePromptParams {
    topic: string;
    previousState: string;
    currentState: string;
    nextSteps: string;
    memoryDir: string;
}
/**
 * 獲取 researchMode 的完整 prompt
 * Get the complete researchMode prompt
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getResearchModePrompt(params: ResearchModePromptParams): Promise<string>;
