import { z } from "zod";
export declare const reflectTaskSchema: z.ZodObject<{
    summary: z.ZodString;
    analysis: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: string;
    analysis: string;
}, {
    summary: string;
    analysis: string;
}>;
export declare function reflectTask({ summary, analysis, }: z.infer<typeof reflectTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
