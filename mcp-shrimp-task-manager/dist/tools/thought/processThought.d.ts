import { z } from "zod";
/**
 * processThought工具的參數結構
 * Parameter structure for the processThought tool
 */
export declare const processThoughtSchema: z.ZodObject<{
    thought: z.ZodString;
    thought_number: z.ZodNumber;
    total_thoughts: z.ZodNumber;
    next_thought_needed: z.ZodBoolean;
    stage: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    axioms_used: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assumptions_challenged: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    thought: string;
    stage: string;
    thought_number: number;
    total_thoughts: number;
    next_thought_needed: boolean;
    tags?: string[] | undefined;
    axioms_used?: string[] | undefined;
    assumptions_challenged?: string[] | undefined;
}, {
    thought: string;
    stage: string;
    thought_number: number;
    total_thoughts: number;
    next_thought_needed: boolean;
    tags?: string[] | undefined;
    axioms_used?: string[] | undefined;
    assumptions_challenged?: string[] | undefined;
}>;
/**
 * 處理單一思維並返回格式化輸出
 * Process a single thought and return formatted output
 */
export declare function processThought(params: z.infer<typeof processThoughtSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
