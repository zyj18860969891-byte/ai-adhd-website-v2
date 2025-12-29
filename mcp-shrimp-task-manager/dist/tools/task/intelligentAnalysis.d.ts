import { z } from "zod";
/**
 * 智能任务分类和工作流建议工具
 * Intelligent Task Classification and Workflow Suggestion Tool
 */
export declare const intelligentTaskAnalysisSchema: z.ZodObject<{
    taskDescription: z.ZodString;
    userContext: z.ZodOptional<z.ZodObject<{
        currentEnergy: z.ZodEnum<["high", "medium", "low"]>;
        availableTime: z.ZodEnum<["5min", "15min", "30min", "1hr", "2hr+", "full-day"]>;
        preferredTimeOfDay: z.ZodEnum<["morning", "afternoon", "evening", "night"]>;
        workStyle: z.ZodEnum<["deep-focus", "quick-tasks", "creative", "analytical", "routine"]>;
        currentProjects: z.ZodArray<z.ZodString, "many">;
        pastCompletionPatterns: z.ZodArray<z.ZodObject<{
            taskType: z.ZodString;
            completionTime: z.ZodString;
            successRate: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            completionTime: string;
            taskType: string;
            successRate: number;
        }, {
            completionTime: string;
            taskType: string;
            successRate: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        currentEnergy: "high" | "medium" | "low";
        availableTime: "5min" | "15min" | "30min" | "1hr" | "2hr+" | "full-day";
        preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night";
        workStyle: "deep-focus" | "quick-tasks" | "creative" | "analytical" | "routine";
        currentProjects: string[];
        pastCompletionPatterns: {
            completionTime: string;
            taskType: string;
            successRate: number;
        }[];
    }, {
        currentEnergy: "high" | "medium" | "low";
        availableTime: "5min" | "15min" | "30min" | "1hr" | "2hr+" | "full-day";
        preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night";
        workStyle: "deep-focus" | "quick-tasks" | "creative" | "analytical" | "routine";
        currentProjects: string[];
        pastCompletionPatterns: {
            completionTime: string;
            taskType: string;
            successRate: number;
        }[];
    }>>;
    taskHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
        taskType: z.ZodString;
        completionStatus: z.ZodEnum<["completed", "incomplete", "abandoned"]>;
        timeSpent: z.ZodString;
        difficulty: z.ZodEnum<["easy", "medium", "hard"]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        taskType: string;
        completionStatus: "completed" | "incomplete" | "abandoned";
        timeSpent: string;
        difficulty: "medium" | "easy" | "hard";
        notes?: string | undefined;
    }, {
        taskType: string;
        completionStatus: "completed" | "incomplete" | "abandoned";
        timeSpent: string;
        difficulty: "medium" | "easy" | "hard";
        notes?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    taskDescription: string;
    userContext?: {
        currentEnergy: "high" | "medium" | "low";
        availableTime: "5min" | "15min" | "30min" | "1hr" | "2hr+" | "full-day";
        preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night";
        workStyle: "deep-focus" | "quick-tasks" | "creative" | "analytical" | "routine";
        currentProjects: string[];
        pastCompletionPatterns: {
            completionTime: string;
            taskType: string;
            successRate: number;
        }[];
    } | undefined;
    taskHistory?: {
        taskType: string;
        completionStatus: "completed" | "incomplete" | "abandoned";
        timeSpent: string;
        difficulty: "medium" | "easy" | "hard";
        notes?: string | undefined;
    }[] | undefined;
}, {
    taskDescription: string;
    userContext?: {
        currentEnergy: "high" | "medium" | "low";
        availableTime: "5min" | "15min" | "30min" | "1hr" | "2hr+" | "full-day";
        preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night";
        workStyle: "deep-focus" | "quick-tasks" | "creative" | "analytical" | "routine";
        currentProjects: string[];
        pastCompletionPatterns: {
            completionTime: string;
            taskType: string;
            successRate: number;
        }[];
    } | undefined;
    taskHistory?: {
        taskType: string;
        completionStatus: "completed" | "incomplete" | "abandoned";
        timeSpent: string;
        difficulty: "medium" | "easy" | "hard";
        notes?: string | undefined;
    }[] | undefined;
}>;
export declare function intelligentTaskAnalysis({ taskDescription, userContext, taskHistory, }: z.infer<typeof intelligentTaskAnalysisSchema>): Promise<{
    analysis: string;
    recommendations: {
        optimalTiming: string;
        workflowSuggestions: string;
        energyMatching: string;
        riskMitigation: string;
        progressTracking: string;
    };
}>;
