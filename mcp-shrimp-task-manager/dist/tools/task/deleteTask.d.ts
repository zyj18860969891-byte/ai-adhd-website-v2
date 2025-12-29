import { z } from "zod";
export declare const deleteTaskSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export declare function deleteTask({ taskId }: z.infer<typeof deleteTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
}>;
