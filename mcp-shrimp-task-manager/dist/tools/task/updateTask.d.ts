import { z } from "zod";
import { RelatedFileType } from '../../types/index.js';
export declare const updateTaskContentSchema: z.ZodObject<{
    taskId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relatedFiles: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        type: z.ZodNativeEnum<typeof RelatedFileType>;
        description: z.ZodOptional<z.ZodString>;
        lineStart: z.ZodOptional<z.ZodNumber>;
        lineEnd: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }, {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }>, "many">, {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }[], {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }[]>>;
    implementationGuide: z.ZodOptional<z.ZodString>;
    verificationCriteria: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    description?: string | undefined;
    name?: string | undefined;
    relatedFiles?: {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }[] | undefined;
    notes?: string | undefined;
    dependencies?: string[] | undefined;
    implementationGuide?: string | undefined;
    verificationCriteria?: string | undefined;
}, {
    taskId: string;
    description?: string | undefined;
    name?: string | undefined;
    relatedFiles?: {
        type: RelatedFileType;
        path: string;
        description?: string | undefined;
        lineStart?: number | undefined;
        lineEnd?: number | undefined;
    }[] | undefined;
    notes?: string | undefined;
    dependencies?: string[] | undefined;
    implementationGuide?: string | undefined;
    verificationCriteria?: string | undefined;
}>;
export declare function updateTaskContent({ taskId, name, description, notes, relatedFiles, dependencies, implementationGuide, verificationCriteria, }: z.infer<typeof updateTaskContentSchema>): Promise<{
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
