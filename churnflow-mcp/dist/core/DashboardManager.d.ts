/**
 * DashboardManager - ADHD-friendly "What's Next" analysis
 *
 * Analyzes all trackers and provides clear, actionable recommendations
 * to eliminate analysis paralysis and decision fatigue.
 */
import { ChurnConfig, Priority, ItemType, ContextType } from "../types/churn.js";
import { TrackerManager } from "./TrackerManager.js";
import { ReviewManager } from "./ReviewManager.js";
export interface DashboardItem {
    id: string;
    title: string;
    tracker: string;
    trackerFriendlyName: string;
    context: ContextType;
    priority: Priority;
    type: ItemType;
    dueDate?: string;
    estimatedMinutes?: number;
    urgencyScore: number;
    impactScore: number;
    confidenceScore?: number;
    reviewItemCount?: number;
}
export interface DashboardRecommendation {
    category: "urgent" | "high-impact" | "quick-win" | "review-chunk";
    categoryTitle: string;
    categoryEmoji: string;
    item: DashboardItem;
    reason: string;
    estimatedTime: string;
}
export interface DashboardSummary {
    totalActionItems: number;
    overdueTasks: number;
    dueTodayTasks: number;
    reviewItemCount: number;
    trackerBreakdown: {
        [context: string]: number;
    };
    lastUpdated: string;
}
export declare class DashboardManager {
    private trackerManager;
    private reviewManager?;
    private config;
    constructor(config: ChurnConfig, trackerManager: TrackerManager, reviewManager?: ReviewManager);
    /**
     * Get the top 4 recommendations for what to work on next
     * Designed to eliminate analysis paralysis with clear, prioritized options
     */
    getWhatsNext(): Promise<DashboardRecommendation[]>;
    /**
     * Get comprehensive dashboard summary
     */
    getDashboardSummary(): Promise<DashboardSummary>;
    /**
     * Parse all trackers and extract actionable items
     */
    private getAllActionableItems;
    /**
     * Parse a single tracker for action items
     */
    private parseTrackerForActionItems;
    /**
     * Parse individual action item line - supports both ChurnFlow and Obsidian Tasks formats
     */
    private parseActionItem;
    /**
     * Extract priority from Obsidian Tasks format and ChurnFlow emojis
     */
    private extractPriorityFromObsidian;
    /**
     * Extract priority from line based on emojis (legacy method)
     */
    private extractPriority;
    /**
     * Extract due date from Obsidian Tasks and ChurnFlow formats
     */
    private extractDueDateFromObsidian;
    /**
     * Extract due date from line (legacy method)
     */
    private extractDueDate;
    /**
     * Clean title by removing all metadata, tags, emojis, and dates
     */
    private cleanTitle;
    /**
     * Calculate urgency score (0-100)
     */
    private calculateUrgencyScore;
    /**
     * Calculate impact score (0-100)
     */
    private calculateImpactScore;
    /**
     * Estimate minutes needed for a task
     */
    private estimateMinutes;
    /**
     * Get the most urgent item
     */
    private getMostUrgentItem;
    /**
     * Get the highest impact item
     */
    private getHighestImpactItem;
    /**
     * Get the best quick win (low time, decent impact)
     */
    private getBestQuickWin;
    /**
     * Get review chunk if items need review
     */
    private getReviewChunk;
    /**
     * Utility functions
     */
    private isOverdue;
    private isDueToday;
    private formatEstimatedTime;
}
//# sourceMappingURL=DashboardManager.d.ts.map