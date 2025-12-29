/**
 * initProjectRules prompt 生成器
 * initProjectRules prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
/**
 * initProjectRules prompt 參數介面
 * initProjectRules prompt parameters interface
 */
export interface InitProjectRulesPromptParams {
}
/**
 * 獲取 initProjectRules 的完整 prompt
 * Get the complete prompt for initProjectRules
 * @param params prompt 參數（可選）
 * @param params prompt parameters (optional)
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export declare function getInitProjectRulesPrompt(params?: InitProjectRulesPromptParams): Promise<string>;
