import { z } from "zod";
export declare const listTasksSchema: z.ZodObject<{
    status: z.ZodEnum<["all", "pending", "in_progress", "completed"]>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "pending" | "in_progress" | "all";
}, {
    status: "completed" | "pending" | "in_progress" | "all";
}>;
export declare function listTasks({ status }: z.infer<typeof listTasksSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
