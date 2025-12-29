import { z } from "zod";
export declare const queryTaskSchema: z.ZodObject<{
    query: z.ZodString;
    isId: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    isId: boolean;
    page: number;
    pageSize: number;
}, {
    query: string;
    isId?: boolean | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare function queryTask({ query, isId, page, pageSize, }: z.infer<typeof queryTaskSchema>): Promise<{
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
