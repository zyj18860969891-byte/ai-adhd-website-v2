/**
 * initProjectRules prompt 生成器
 * initProjectRules prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import { loadPrompt, loadPromptFromTemplate } from '../loader.js';
/**
 * 獲取 initProjectRules 的完整 prompt
 * Get the complete prompt for initProjectRules
 * @param params prompt 參數（可選）
 * @param params prompt parameters (optional)
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getInitProjectRulesPrompt(params) {
    const indexTemplate = await loadPromptFromTemplate("initProjectRules/index.md");
    // 載入可能的自定義 prompt (通過環境變數覆蓋或追加)
    // Load possible custom prompt (override or append via environment variables)
    return loadPrompt(indexTemplate, "INIT_PROJECT_RULES");
}
//# sourceMappingURL=initProjectRules.js.map