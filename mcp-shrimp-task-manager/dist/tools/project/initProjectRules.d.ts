import { z } from "zod";
export declare const initProjectRulesSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
/**
 * 初始化專案規範工具函數
 * Initialize project specification tool function
 * 提供建立規範文件的指導
 * Provide guidance for creating specification documents
 */
export declare function initProjectRules(): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
