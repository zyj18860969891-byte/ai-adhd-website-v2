/**
 * Core types for ChurnFlow ADHD-friendly productivity system
 */
/**
 * v0.2.2 Formatting Standards for consistent entry formats
 * Focused on ChurnFlow-managed formatting (not Obsidian IDs/dependencies)
 */
export const FORMATTING_CONSTANTS = {
    // Date and time formats
    DATE_FORMAT: "YYYY-MM-DD", // ISO date format
    TIMESTAMP_FORMAT: "YYYY-MM-DD HH:mm", // 24-hour timestamp
    COMPLETION_FORMAT: "✅ YYYY-MM-DD", // Task completion format
    DUE_DATE_FORMAT: "📅 YYYY-MM-DD", // Due date format
    // Entry prefixes by type
    ENTRY_PREFIXES: {
        action: "- [ ] #task",
        completed: "- [x] #task",
        activity: "-",
        reference: "- **Ref**:",
        someday: "- [ ] #someday",
        review: "- [ ] #review",
    },
    // Standard section headers
    SECTION_HEADERS: {
        activity: "## Activity Log",
        actions: "## Action Items",
        references: "## References",
        review: "## Review Queue",
        someday: "## Someday/Maybe",
        notes: "## Notes & Context",
    },
    // Priority indicators
    PRIORITY_INDICATORS: {
        critical: "🚨",
        high: "⏫",
        medium: "🔼",
        low: "🔻",
    },
    // Standard metadata patterns (ChurnFlow managed only)
    METADATA_PATTERNS: {
        tags: "#[\\w-]+", // Hashtag format
        context: "@[\\w-]+", // Context tags (@next, @review, etc)
    },
    // Tracker header template
    TRACKER_HEADER_TEMPLATE: "# {friendlyName} — Tracker{iteration}",
    // Standard entry templates (without Obsidian IDs/dependencies)
    ENTRY_TEMPLATES: {
        action: "- [ ] #task {description} #{tag} {priority} {dueDate}",
        completed: "- [x] #task {description} #{tag} {priority} ✅ {completionDate}",
        activity: "- [{timestamp}] {description}",
        reference: "- **{title}**: {description} [{date}]",
        someday: "- [ ] #someday [{captureDate}] {description} #{tag}",
        review: "- [ ] #review [{date}] {description} (confidence: {confidence}%)",
    },
};
/**
 * Formatting validation patterns
 */
export const VALIDATION_PATTERNS = {
    isoDate: /^\d{4}-\d{2}-\d{2}$/,
    timestamp: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    hashtag: /^#[\w-]+$/,
    contextTag: /^@[\w-]+$/,
    priorityIcon: /^[🚨⏫🔼🔻]$/,
};
//# sourceMappingURL=churn.js.map