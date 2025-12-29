import { z } from "zod";
export declare const planTaskSchema: z.ZodObject<{
    description: z.ZodString;
    requirements: z.ZodOptional<z.ZodString>;
    existingTasksReference: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    existingTasksReference: boolean;
    requirements?: string | undefined;
}, {
    description: string;
    requirements?: string | undefined;
    existingTasksReference?: boolean | undefined;
}>;
export declare function planTask({ description, requirements, existingTasksReference, }: z.infer<typeof planTaskSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
