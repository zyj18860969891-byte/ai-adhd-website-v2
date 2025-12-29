import { ItemType, Priority, FormattingOptions, FORMATTING_CONSTANTS } from "../types/churn.js";
/**
 * v0.2.2 Formatting Utilities
 *
 * Centralizes all formatting logic for consistent entry generation
 * across the ChurnFlow system. Focuses on ChurnFlow-managed formatting
 * while preserving compatibility with existing Obsidian workflows.
 */
export declare class FormattingUtils {
    /**
     * Format a date to ISO standard (YYYY-MM-DD)
     */
    static formatDate(date?: Date): string;
    /**
     * Format a timestamp to standard format (YYYY-MM-DD HH:mm)
     */
    static formatTimestamp(date?: Date): string;
    /**
     * Get priority indicator emoji
     */
    static getPriorityIndicator(priority: Priority): string;
    /**
     * Format an action item entry with consistent structure
     */
    static formatActionItem(options: {
        description: string;
        tag: string;
        priority?: Priority;
        dueDate?: Date;
        completed?: boolean;
        completionDate?: Date;
    }): string;
    /**
     * Format an activity log entry with consistent timestamp
     */
    static formatActivity(description: string, timestamp?: Date): string;
    /**
     * Format a reference entry
     */
    static formatReference(title: string, description: string, date?: Date): string;
    /**
     * Format a someday/maybe entry
     */
    static formatSomedayItem(description: string, tag: string, captureDate?: Date): string;
    /**
     * Format a review item entry
     */
    static formatReviewItem(description: string, confidence?: number, date?: Date): string;
    /**
     * Generate a formatted entry based on item type
     */
    static formatEntry(itemType: ItemType, description: string, options?: FormattingOptions & {
        tag?: string;
        priority?: Priority;
        dueDate?: Date;
        confidence?: number;
        title?: string;
    }): string;
    /**
     * Validate if a date string matches our ISO format
     */
    static validateDateFormat(dateStr: string): boolean;
    /**
     * Validate if a timestamp string matches our format
     */
    static validateTimestampFormat(timestampStr: string): boolean;
    /**
     * Validate if a hashtag matches our format
     */
    static validateHashtag(tag: string): boolean;
    /**
     * Validate if a context tag matches our format
     */
    static validateContextTag(tag: string): boolean;
    /**
     * Extract and validate tags from entry text
     */
    static extractTags(text: string): {
        hashtags: string[];
        contextTags: string[];
    };
    /**
     * Clean and standardize an entry to our formatting rules
     * Preserves existing Obsidian IDs and dependencies
     */
    static standardizeEntry(entry: string, itemType: ItemType): string;
    /**
     * Generate section headers with consistent formatting
     */
    static getSectionHeader(sectionType: keyof typeof FORMATTING_CONSTANTS.SECTION_HEADERS): string;
    /**
     * Check if entry has proper formatting for its type
     */
    static validateEntryFormat(entry: string, expectedType: ItemType): {
        isValid: boolean;
        issues: string[];
    };
}
//# sourceMappingURL=FormattingUtils.d.ts.map