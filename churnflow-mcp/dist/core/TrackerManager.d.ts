import { Tracker, CrossrefEntry, ChurnConfig, ItemType } from "../types/churn.js";
/**
 * Manages reading, parsing, and updating Churn system trackers
 *
 * This is the core class that understands your existing tracker structure
 * and provides the intelligence needed for capture routing.
 */
export declare class TrackerManager {
    private config;
    private trackers;
    private crossref;
    constructor(config: ChurnConfig);
    /**
     * Load all trackers and crossref data from the file system
     */
    initialize(): Promise<void>;
    /**
     * Load and parse the crossref registry
     */
    private loadCrossref;
    /**
     * Load and parse all tracker files
     */
    private loadTrackers;
    /**
     * Get all active trackers by context type
     */
    getTrackersByContext(contextType?: string): Tracker[];
    /**
     * Get a specific tracker by tag
     */
    getTracker(tag: string): Tracker | undefined;
    /**
     * Get crossref entries for external access
     */
    getCrossrefEntries(): CrossrefEntry[];
    /**
     * Get all available context information for AI inference
     */
    getContextMap(): Record<string, any>;
    /**
     * Extract keywords from tracker content for inference
     */
    private extractKeywords;
    /**
     * Extract recent activity items for context
     */
    private extractRecentActivity;
    /**
     * Find a section in tracker content
     */
    private findSection;
    /**
     * Check if a word is too common to be useful for inference
     */
    private isCommonWord;
    /**
     * Append an item to a tracker file with proper section placement and ordering
     */
    appendToTracker(tag: string, formattedEntry: string): Promise<boolean>;
    /**
     * Append an activity item to the Activity Log section with proper placement and ordering
     */
    appendActivityToTracker(tag: string, formattedEntry: string): Promise<boolean>;
    /**
     * Append a review item to the Review Queue section with proper placement and ordering
     */
    appendReviewToTracker(tag: string, formattedEntry: string): Promise<boolean>;
    /**
     * Find the index of a section header
     */
    private findSectionIndex;
    /**
     * v0.2.2: Insert entry into the correct section with proper placement and ordering
     */
    private insertEntryIntoSection;
    /**
     * Insert entry into existing section with proper ordering
     */
    private insertIntoExistingSection;
    /**
     * Create new section and insert entry
     */
    private createSectionAndInsert;
    /**
     * Compare two entries by their timestamps/dates for sorting (oldest first)
     */
    private compareDateInEntries;
    /**
     * Extract date/timestamp from an entry for sorting
     */
    private extractDateFromEntry;
    /**
     * Refresh tracker data (useful after updates)
     */
    refresh(): Promise<void>;
    /**
     * v0.2.2: Create a properly formatted entry using FormattingUtils
     */
    createFormattedEntry(itemType: ItemType, description: string, options?: {
        tag?: string;
        priority?: "critical" | "high" | "medium" | "low";
        dueDate?: Date;
        confidence?: number;
    }): string;
    /**
     * v0.2.2: Append a formatted entry to a tracker with validation
     */
    appendFormattedEntry(tag: string, itemType: ItemType, description: string, options?: {
        tag?: string;
        priority?: "critical" | "high" | "medium" | "low";
        dueDate?: Date;
        confidence?: number;
    }): Promise<boolean>;
    /**
     * v0.2.2: Validate existing entries in a tracker for formatting consistency
     */
    validateTrackerFormatting(tag: string): Promise<{
        isValid: boolean;
        issues: Array<{
            line: number;
            entry: string;
            issues: string[];
        }>;
        suggestions: string[];
    }>;
    /**
     * v0.2.2: Get formatting statistics across all trackers
     */
    getFormattingStats(): {
        totalTrackers: number;
        trackersWithIssues: number;
        commonIssues: Record<string, number>;
    };
    /**
     * Mark a task as complete in a tracker file
     */
    markTaskComplete(tracker: string, taskDescription: string): Promise<boolean>;
}
//# sourceMappingURL=TrackerManager.d.ts.map