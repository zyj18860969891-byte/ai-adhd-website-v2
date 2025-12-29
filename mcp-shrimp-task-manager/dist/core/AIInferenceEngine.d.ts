/**
 * AI Inference Engine for Shrimp Task Manager
 * Provides AI-powered reasoning and analysis capabilities
 */
export declare class AIInferenceEngine {
    private openai;
    private model;
    private temperature;
    constructor();
    /**
     * Analyze a task and provide AI insights
     */
    analyzeTask(taskDescription: string, context?: string): Promise<string>;
    /**
     * Generate research insights for a topic
     */
    generateResearch(topic: string, currentState: string, nextSteps: string): Promise<string>;
    /**
     * Verify task completion with AI assessment
     */
    verifyTaskCompletion(taskSummary: string, score: number): Promise<string>;
    /**
     * Reflect on task execution and learning
     */
    reflectOnTask(taskDescription: string, executionNotes: string): Promise<string>;
    /**
     * Get model information
     */
    getModelInfo(): {
        model: string;
        temperature: number;
    };
}
/**
 * Get or create the AI Inference Engine instance
 */
export declare function getAIInferenceEngine(): AIInferenceEngine;
