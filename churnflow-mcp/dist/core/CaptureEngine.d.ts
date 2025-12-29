import { CaptureInput, CaptureResult, ChurnConfig } from '../types/churn.js';
/**
 * Main capture engine for ChurnFlow
 *
 * This orchestrates the entire ADHD-friendly capture process:
 * 1. Accept natural language input
 * 2. Use AI to infer context and formatting
 * 3. Route to appropriate tracker
 * 4. Provide feedback with minimal cognitive overhead
 */
export declare class CaptureEngine {
    private config;
    private trackerManager;
    private inferenceEngine;
    private reviewManager;
    private databaseManager;
    private databaseAvailable;
    private initialized;
    constructor(config: ChurnConfig);
    /**
     * Initialize the capture system
     */
    initialize(): Promise<void>;
    /**
     * Capture a thought, idea, or task with ADHD-friendly processing
     * Now supports multiple items from single capture
     */
    capture(input: string | CaptureInput): Promise<CaptureResult>;
    /**
     * Save capture to database (non-blocking)
     */
    private saveCaptureToDatabase;
    /**
     * Route items that need human review
     */
    private routeToReview;
    /**
     * Emergency capture when everything else fails
     */
    private emergencyCapture;
    /**
     * Format an entry for the review queue
     */
    private formatReviewEntry;
    /**
     * Append to a dedicated review tracker
     */
    private appendToReviewTracker;
    /**
     * Voice capture helper (for future voice integration)
     */
    captureVoice(audioData: any): Promise<CaptureResult>;
    /**
     * Batch capture for processing multiple items
     */
    captureBatch(inputs: (string | CaptureInput)[]): Promise<CaptureResult[]>;
    /**
     * Get system status for debugging
     */
    getStatus(): Record<string, any>;
    /**
     * Refresh system data (useful after manual tracker updates)
     */
    refresh(): Promise<void>;
}
//# sourceMappingURL=CaptureEngine.d.ts.map