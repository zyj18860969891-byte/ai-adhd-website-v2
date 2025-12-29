import { z } from "zod";
export declare const executeTaskSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export declare function executeTask({ taskId, }: z.infer<typeof executeTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
