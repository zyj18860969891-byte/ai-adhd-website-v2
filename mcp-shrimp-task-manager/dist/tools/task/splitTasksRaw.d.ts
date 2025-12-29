import { z } from "zod";
export declare const splitTasksRawSchema: z.ZodObject<{
    updateMode: z.ZodEnum<["append", "overwrite", "selective", "clearAllTasks"]>;
    tasksRaw: z.ZodString;
    globalAnalysisResult: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updateMode: "append" | "overwrite" | "selective" | "clearAllTasks";
    tasksRaw: string;
    globalAnalysisResult?: string | undefined;
}, {
    updateMode: "append" | "overwrite" | "selective" | "clearAllTasks";
    tasksRaw: string;
    globalAnalysisResult?: string | undefined;
}>;
export declare function splitTasksRaw({ updateMode, tasksRaw, globalAnalysisResult, }: z.infer<typeof splitTasksRawSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    ephemeral?: undefined;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    ephemeral: {
        taskCreationResult: {
            success: boolean;
            message: string;
            backupFilePath: string | null | undefined;
        };
    };
}>;
