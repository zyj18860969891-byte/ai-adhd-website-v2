import { CaptureInput, InferenceResult, ChurnConfig, ItemType, Priority } from "../types/churn.js";
import { TrackerManager } from "./TrackerManager.js";
/**
 * AI-powered inference engine for ChurnFlow capture system
 *
 * This is where the magic happens - using AI to understand natural language
 * input and route it to the right tracker with the right formatting.
 */
export declare class InferenceEngine {
    private config;
    private trackerManager;
    private openai;
    constructor(config: ChurnConfig, trackerManager: TrackerManager);
    /**
     * Analyze input and determine routing and formatting
     */
    inferCapture(input: CaptureInput): Promise<InferenceResult>;
    /**
     * System prompt that teaches the AI about ADHD-friendly productivity
     */
    private getSystemPrompt;
    /**
     * Build the context-aware prompt for inference
     */
    private buildInferencePrompt;
    /**
     * Parse the AI response into our result format (v0.2.2 with FormattingUtils)
     */
    private parseInferenceResult;
    /**
     * Fallback inference when AI fails (v0.2.2 with FormattingUtils)
     */
    private fallbackInference;
    /**
     * Extract tag from tracker name (for when AI doesn't provide explicit tag)
     */
    private extractTagFromTracker;
    /**
     * Validate and normalize item type
     */
    private validateItemType;
    /**
     * Validate and normalize priority
     */
    private validatePriority;
    /**
     * v0.3.1 Review System Integration - Placeholder methods
     * These methods provide the foundation for review functionality
     */
    /**
     * Calculate confidence score for an inference result
     * Enhanced scoring considers multiple factors for ADHD-friendly review
     */
    calculateInferenceConfidence(input: CaptureInput, trackerMatch: boolean, keywordMatches: number, contextClarity: number): number;
    /**
     * Determine if an item should be flagged for review based on confidence
     */
    shouldFlagForReview(confidence: number, itemType: ItemType): boolean;
    /**
     * Extract keywords from input text for review metadata
     */
    extractKeywords(text: string): string[];
    /**
     * Generate review metadata for an item
     */
    generateReviewMetadata(input: CaptureInput, inferredType: ItemType, inferredPriority: Priority): {
        keywords: string[];
        urgency: Priority;
        type: ItemType;
        editableFields: string[];
    };
}
//# sourceMappingURL=InferenceEngine.d.ts.map