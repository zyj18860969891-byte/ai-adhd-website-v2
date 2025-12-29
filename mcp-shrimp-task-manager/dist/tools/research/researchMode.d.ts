import { z } from "zod";
export declare const researchModeSchema: z.ZodObject<{
    topic: z.ZodString;
    previousState: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    currentState: z.ZodString;
    nextSteps: z.ZodString;
}, "strip", z.ZodTypeAny, {
    previousState: string;
    topic: string;
    currentState: string;
    nextSteps: string;
}, {
    topic: string;
    currentState: string;
    nextSteps: string;
    previousState?: string | undefined;
}>;
export declare function researchMode({ topic, previousState, currentState, nextSteps, }: z.infer<typeof researchModeSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
