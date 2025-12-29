import { ReviewableItem, ReviewAction, ReviewStatus, ReviewSource, ItemType, Priority, ChurnConfig } from "../types/churn.js";
import { TrackerManager } from "./TrackerManager.js";
/**
 * ReviewManager - Core class for managing reviewable items and their workflows
 *
 * Provides ADHD-friendly interface for reviewing, editing, and managing items
 * that need human attention before final placement in trackers.
 */
export declare class ReviewManager {
    private config;
    private trackerManager;
    private reviewItems;
    constructor(config: ChurnConfig, trackerManager: TrackerManager);
    /**
     * Flag an item for review with given confidence and metadata
     */
    flagItemForReview(content: string, confidence: number, tracker: string, section: string, source: ReviewSource, metadata?: {
        keywords?: string[];
        urgency?: Priority;
        type?: ItemType;
        editableFields?: string[];
    }): ReviewableItem;
    /**
     * Get all items that need review, optionally filtered by tracker
     */
    getItemsNeedingReview(tracker?: string): ReviewableItem[];
    /**
     * Get review status counts for dashboard indicators
     */
    getReviewStatus(): {
        pending: number;
        flagged: number;
        confirmed: number;
        total: number;
    };
    /**
     * Process a review action on an item
     */
    processReviewAction(itemId: string, action: ReviewAction, newValues?: {
        tracker?: string;
        priority?: Priority;
        tags?: string[];
        type?: ItemType;
        content?: string;
    }): Promise<boolean>;
    /**
     * Accept an item and move it to its final tracker location
     */
    private acceptItem;
    /**
     * Update item content based on current metadata
     */
    private updateItemContent;
    /**
     * Reject an item and remove it from review queue
     */
    private rejectItem;
    /**
     * Get a specific reviewable item by ID
     */
    getReviewItem(itemId: string): ReviewableItem | undefined;
    /**
     * Update the review status of an item
     */
    updateReviewStatus(itemId: string, status: ReviewStatus): boolean;
    /**
     * Batch process multiple review items
     */
    batchProcessReview(actions: Array<{
        itemId: string;
        action: ReviewAction;
        newValues?: any;
    }>): Promise<{
        success: number;
        failed: number;
        results: Array<{
            itemId: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Clear all confirmed items from the review queue
     */
    clearConfirmedItems(): number;
    /**
     * Generate a unique ID for review items
     */
    private generateItemId;
}
//# sourceMappingURL=ReviewManager.d.ts.map