/**
 * Core types for ChurnFlow ADHD-friendly productivity system
 */
export type ItemType = "action" | "review" | "reference" | "someday" | "activity";
export type ContextType = "business" | "personal" | "project" | "system";
export type Priority = "critical" | "high" | "medium" | "low";
/**
 * Tracker frontmatter structure from existing Churn system
 */
export interface TrackerFrontmatter {
    tag: string;
    friendlyName: string;
    collection: string;
    contextType: ContextType;
    mode: string;
    iterationType: string;
    iterationStarted: string;
    syncDefault: string;
    syncModes: string[];
    reloadCarryForwardAll: boolean;
    reloadFocusItemCount: number;
    reloadCarryForwardTags: string[];
    active?: boolean;
    priority?: number;
}
/**
 * Crossref entry structure for linking trackers to collections
 */
export interface CrossrefEntry {
    tag: string;
    trackerFile: string;
    collectionFile: string;
    priority: number;
    contextType: ContextType;
    active: boolean;
    _note?: string;
}
/**
 * Parsed tracker information with content
 */
export interface Tracker {
    frontmatter: TrackerFrontmatter;
    content: string;
    filePath: string;
}
/**
 * Input for capture system
 */
export interface CaptureInput {
    text: string;
    inputType: "voice" | "text";
    forceContext?: string;
    timestamp?: Date;
}
/**
 * Single generated item from AI inference
 */
export interface GeneratedItem {
    tracker: string;
    itemType: ItemType;
    priority: Priority;
    content: string;
    reasoning: string;
}
/**
 * Task completion detection
 */
export interface TaskCompletion {
    tracker: string;
    description: string;
    reasoning: string;
}
/**
 * Task completion result after processing
 */
export interface TaskCompletionResult extends TaskCompletion {
    success: boolean;
}
/**
 * AI inference result for captured items (supports multiple items)
 */
export interface InferenceResult {
    primaryTracker: string;
    confidence: number;
    overallReasoning: string;
    generatedItems: GeneratedItem[];
    taskCompletions: TaskCompletion[];
    requiresReview: boolean;
}
/**
 * Configuration for ChurnFlow system
 */
export interface ChurnConfig {
    collectionsPath: string;
    trackingPath: string;
    crossrefPath: string;
    aiProvider: "openai" | "anthropic";
    aiApiKey: string;
    confidenceThreshold: number;
    review?: ReviewConfig;
}
/**
 * v0.2.2 Formatting Standards for consistent entry formats
 * Focused on ChurnFlow-managed formatting (not Obsidian IDs/dependencies)
 */
export declare const FORMATTING_CONSTANTS: {
    readonly DATE_FORMAT: "YYYY-MM-DD";
    readonly TIMESTAMP_FORMAT: "YYYY-MM-DD HH:mm";
    readonly COMPLETION_FORMAT: "✅ YYYY-MM-DD";
    readonly DUE_DATE_FORMAT: "📅 YYYY-MM-DD";
    readonly ENTRY_PREFIXES: {
        readonly action: "- [ ] #task";
        readonly completed: "- [x] #task";
        readonly activity: "-";
        readonly reference: "- **Ref**:";
        readonly someday: "- [ ] #someday";
        readonly review: "- [ ] #review";
    };
    readonly SECTION_HEADERS: {
        readonly activity: "## Activity Log";
        readonly actions: "## Action Items";
        readonly references: "## References";
        readonly review: "## Review Queue";
        readonly someday: "## Someday/Maybe";
        readonly notes: "## Notes & Context";
    };
    readonly PRIORITY_INDICATORS: {
        readonly critical: "🚨";
        readonly high: "⏫";
        readonly medium: "🔼";
        readonly low: "🔻";
    };
    readonly METADATA_PATTERNS: {
        readonly tags: "#[\\w-]+";
        readonly context: "@[\\w-]+";
    };
    readonly TRACKER_HEADER_TEMPLATE: "# {friendlyName} — Tracker{iteration}";
    readonly ENTRY_TEMPLATES: {
        readonly action: "- [ ] #task {description} #{tag} {priority} {dueDate}";
        readonly completed: "- [x] #task {description} #{tag} {priority} ✅ {completionDate}";
        readonly activity: "- [{timestamp}] {description}";
        readonly reference: "- **{title}**: {description} [{date}]";
        readonly someday: "- [ ] #someday [{captureDate}] {description} #{tag}";
        readonly review: "- [ ] #review [{date}] {description} (confidence: {confidence}%)";
    };
};
/**
 * Formatting validation patterns
 */
export declare const VALIDATION_PATTERNS: {
    readonly isoDate: RegExp;
    readonly timestamp: RegExp;
    readonly hashtag: RegExp;
    readonly contextTag: RegExp;
    readonly priorityIcon: RegExp;
};
/**
 * Standard formatting options for different contexts
 */
export interface FormattingOptions {
    includeTimestamp?: boolean;
    includePriority?: boolean;
    includeDueDate?: boolean;
    customTemplate?: string;
}
/**
 * Individual item result from capture
 */
export interface CaptureItemResult {
    success: boolean;
    tracker: string;
    itemType: ItemType;
    formattedEntry: string;
    error?: string;
}
/**
 * Result of a capture operation (supports multiple items)
 */
export interface CaptureResult {
    success: boolean;
    primaryTracker: string;
    confidence: number;
    itemResults: CaptureItemResult[];
    completedTasks: TaskCompletionResult[];
    requiresReview: boolean;
    error?: string;
}
/**
 * Review system types for v0.3.1
 */
/**
 * Possible actions that can be performed on a reviewable item
 */
export type ReviewAction = "accept" | "edit-priority" | "edit-tags" | "edit-type" | "move" | "reject";
/**
 * Review status for tracking item lifecycle
 */
export type ReviewStatus = "pending" | "flagged" | "confirmed";
/**
 * Source of a reviewable item
 */
export type ReviewSource = "capture" | "inference";
/**
 * Interface representing an item that can be flagged for review
 * Provides confidence scores, review status, and metadata for ADHD-friendly management
 */
export interface ReviewableItem {
    id: string;
    content: string;
    confidence: number;
    currentSection: string;
    currentTracker: string;
    timestamp: Date;
    source: ReviewSource;
    reviewStatus: ReviewStatus;
    metadata: {
        keywords: string[];
        urgency: Priority;
        type: ItemType;
        editableFields: string[];
    };
}
/**
 * Configuration options for the review system
 */
export interface ReviewConfig {
    autoReviewThreshold: number;
    requireReviewThreshold: number;
    defaultBatchSize: number;
    colorOutput: boolean;
    showConfidenceScores: boolean;
}
//# sourceMappingURL=churn.d.ts.map