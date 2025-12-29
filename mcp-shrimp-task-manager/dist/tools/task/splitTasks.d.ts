import { z } from "zod";
import { RelatedFileType } from '../../types/index.js';
export declare const splitTasksSchema: z.ZodObject<{
    updateMode: z.ZodEnum<["append", "overwrite", "selective", "clearAllTasks"]>;
    tasks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        implementationGuide: z.ZodString;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
        relatedFiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            type: z.ZodNativeEnum<typeof RelatedFileType>;
            description: z.ZodString;
            lineStart: z.ZodOptional<z.ZodNumber>;
            lineEnd: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }, {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }>, "many">>;
        verificationCriteria: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        implementationGuide: string;
        relatedFiles?: {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }[] | undefined;
        notes?: string | undefined;
        dependencies?: string[] | undefined;
        verificationCriteria?: string | undefined;
    }, {
        description: string;
        name: string;
        implementationGuide: string;
        relatedFiles?: {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }[] | undefined;
        notes?: string | undefined;
        dependencies?: string[] | undefined;
        verificationCriteria?: string | undefined;
    }>, "many">;
    globalAnalysisResult: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tasks: {
        description: string;
        name: string;
        implementationGuide: string;
        relatedFiles?: {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }[] | undefined;
        notes?: string | undefined;
        dependencies?: string[] | undefined;
        verificationCriteria?: string | undefined;
    }[];
    updateMode: "append" | "overwrite" | "selective" | "clearAllTasks";
    globalAnalysisResult?: string | undefined;
}, {
    tasks: {
        description: string;
        name: string;
        implementationGuide: string;
        relatedFiles?: {
            description: string;
            type: RelatedFileType;
            path: string;
            lineStart?: number | undefined;
            lineEnd?: number | undefined;
        }[] | undefined;
        notes?: string | undefined;
        dependencies?: string[] | undefined;
        verificationCriteria?: string | undefined;
    }[];
    updateMode: "append" | "overwrite" | "selective" | "clearAllTasks";
    globalAnalysisResult?: string | undefined;
}>;
export declare function splitTasks({ updateMode, tasks, globalAnalysisResult, }: z.infer<typeof splitTasksSchema>): Promise<{
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
