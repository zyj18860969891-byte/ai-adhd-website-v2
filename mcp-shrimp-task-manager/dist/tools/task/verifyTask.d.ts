import { z } from "zod";
export declare const verifyTaskSchema: z.ZodObject<{
    taskId: z.ZodString;
    summary: z.ZodString;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    summary: string;
    score: number;
}, {
    taskId: string;
    summary: string;
    score: number;
}>;
export declare function verifyTask({ taskId, summary, score, }: z.infer<typeof verifyTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: undefined;
}>;
