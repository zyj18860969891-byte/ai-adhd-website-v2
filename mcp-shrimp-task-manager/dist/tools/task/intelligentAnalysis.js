import { z } from "zod";
import { getAIInferenceEngine } from '../../core/AIInferenceEngine.js';
/**
 * 智能任务分类和工作流建议工具
 * Intelligent Task Classification and Workflow Suggestion Tool
 */
export const intelligentTaskAnalysisSchema = z.object({
    taskDescription: z
        .string()
        .min(10, {
        message: "任务描述不能少于10个字符",
    })
        .describe("任务的详细描述"),
    userContext: z
        .object({
        currentEnergy: z.enum(["high", "medium", "low"]).describe("当前精力水平"),
        availableTime: z.enum(["5min", "15min", "30min", "1hr", "2hr+", "full-day"]).describe("可用时间"),
        preferredTimeOfDay: z.enum(["morning", "afternoon", "evening", "night"]).describe("偏好的工作时间段"),
        workStyle: z.enum(["deep-focus", "quick-tasks", "creative", "analytical", "routine"]).describe("工作风格"),
        currentProjects: z.array(z.string()).describe("当前正在进行的项目"),
        pastCompletionPatterns: z.array(z.object({
            taskType: z.string(),
            completionTime: z.string(),
            successRate: z.number()
        })).describe("过去的完成模式"),
    })
        .optional()
        .describe("用户的上下文信息（可选）"),
    taskHistory: z
        .array(z.object({
        taskType: z.string(),
        completionStatus: z.enum(["completed", "incomplete", "abandoned"]),
        timeSpent: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        notes: z.string().optional()
    }))
        .optional()
        .describe("类似任务的历史记录（可选）"),
});
export async function intelligentTaskAnalysis({ taskDescription, userContext, taskHistory, }) {
    try {
        const aiEngine = getAIInferenceEngine();
        const context = userContext ? `
用户上下文信息：
- 当前精力水平：${userContext.currentEnergy}
- 可用时间：${userContext.availableTime}
- 偏好时间段：${userContext.preferredTimeOfDay}
- 工作风格：${userContext.workStyle}
- 当前项目：${userContext.currentProjects.join(", ")}
- 过往完成模式：${userContext.pastCompletionPatterns.map(p => `${p.taskType}(${p.successRate}%)`).join(", ")}

历史任务记录：
${taskHistory ? taskHistory.map(h => `- ${h.taskType}: ${h.completionStatus} (${h.difficulty})`).join("\n") : "无"}
` : "";
        const analysis = await aiEngine.analyzeTask(`任务描述：${taskDescription}`, context);
        return {
            analysis,
            recommendations: {
                optimalTiming: "根据用户上下文推荐的最佳时间安排",
                workflowSuggestions: "个性化工作流建议",
                energyMatching: "精力匹配建议",
                riskMitigation: "风险缓解策略",
                progressTracking: "进度跟踪建议"
            }
        };
    }
    catch (error) {
        console.error("智能任务分析失败:", error);
        throw new Error("智能任务分析失败，请稍后重试");
    }
}
//# sourceMappingURL=intelligentAnalysis.js.map