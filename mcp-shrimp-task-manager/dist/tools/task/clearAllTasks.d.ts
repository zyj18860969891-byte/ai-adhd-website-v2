import { z } from "zod";
export declare const clearAllTasksSchema: z.ZodObject<{
    confirm: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    confirm: boolean;
}, {
    confirm: boolean;
}>;
export declare function clearAllTasks({ confirm, }: z.infer<typeof clearAllTasksSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
}>;
