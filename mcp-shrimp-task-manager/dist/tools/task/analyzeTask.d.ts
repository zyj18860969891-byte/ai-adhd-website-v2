import { z } from "zod";
export declare const analyzeTaskSchema: z.ZodObject<{
    summary: z.ZodString;
    initialConcept: z.ZodString;
    previousAnalysis: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    initialConcept: string;
    previousAnalysis?: string | undefined;
}, {
    summary: string;
    initialConcept: string;
    previousAnalysis?: string | undefined;
}>;
export declare function analyzeTask({ summary, initialConcept, previousAnalysis, }: z.infer<typeof analyzeTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
