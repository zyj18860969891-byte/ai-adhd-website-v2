/**
 * prompt 載入器
 * prompt loader
 * 提供從環境變數載入自定義 prompt 的功能
 * Provides functionality to load custom prompts from environment variables
 */
/**
 * 載入 prompt，支援環境變數自定義
 * Load prompt with environment variable customization support
 * @param basePrompt 基本 prompt 內容
 * @param basePrompt Basic prompt content
 * @param promptKey prompt 的鍵名，用於生成環境變數名稱
 * @param promptKey Prompt key name, used to generate environment variable names
 * @returns 最終的 prompt 內容
 * @returns Final prompt content
 */
export declare function loadPrompt(basePrompt: string, promptKey: string): string;
/**
 * 生成包含動態參數的 prompt
 * Generate prompt with dynamic parameters
 * @param promptTemplate prompt 模板
 * @param promptTemplate prompt template
 * @param params 動態參數
 * @param params dynamic parameters
 * @returns 填充參數後的 prompt
 * @returns Prompt with parameters filled in
 */
export declare function generatePrompt(promptTemplate: string, params?: Record<string, any>): string;
/**
 * 從模板載入 prompt
 * Load prompt from template
 * @param templatePath 相對於模板集根目錄的模板路徑 (e.g., 'chat/basic.md')
 * @param templatePath Template path relative to template set root directory (e.g., 'chat/basic.md')
 * @returns 模板內容
 * @returns Template content
 * @throws Error 如果找不到模板文件
 * @throws Error if template file is not found
 */
export declare function loadPromptFromTemplate(templatePath: string): Promise<string>;
