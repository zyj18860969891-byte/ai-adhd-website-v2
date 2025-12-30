import { ChurnConfig } from "../types/churn.js";
import { DatabaseManager } from "../storage/DatabaseManager.js";

/**
 * Intelligent Reminder System
 *
 * Provides smart reminder timing and context-aware notifications
 * optimized for ADHD brains and personal workflow patterns.
 */
export class IntelligentReminder {
  private databaseManager: DatabaseManager;

  constructor(private config: ChurnConfig) {
    this.databaseManager = new DatabaseManager();
  }

  /**
   * Calculate optimal reminder time based on:
   * - Time sensitivity (urgent/soon/flexible/future)
   * - Historical completion patterns
   * - Energy level requirements
   * - Personal schedule patterns
   * - Task dependencies and relationships
   */
  async calculateOptimalReminderTime(item: {
    timeSensitivity: string;
    estimatedEffort: string;
    priority: string;
    itemType: string;
    content: string;
    tracker: string;
  }): Promise<Date> {
    const now = new Date();
    let reminderTime = new Date(now);

    // Base calculation on time sensitivity
    switch (item.timeSensitivity) {
      case 'urgent':
        // Urgent items: remind within 1 hour
        reminderTime.setHours(reminderTime.getHours() + 1);
        break;

      case 'soon':
        // Soon items: remind within 4 hours or next optimal work block
        const optimalTime = await this.getNextOptimalWorkBlock();
        reminderTime = optimalTime || new Date(now.getTime() + 4 * 60 * 60 * 1000);
        break;

      case 'flexible':
        // Flexible items: remind during next high-energy period
        reminderTime = await this.getNextHighEnergyPeriod();
        break;

      case 'future':
        // Future items: remind in 1-3 days during planning time
        reminderTime.setDate(reminderTime.getDate() + 2);
        reminderTime.setHours(10, 0, 0, 0); // Morning planning time
        break;

      default:
        // Default: remind in 24 hours
        reminderTime.setDate(reminderTime.getDate() + 1);
    }

    // Adjust based on estimated effort
    reminderTime = this.adjustForEffort(reminderTime, item.estimatedEffort);

    // Adjust based on historical patterns
    reminderTime = await this.adjustForHistoricalPatterns(reminderTime, item);

    return reminderTime;
  }

  /**
   * Get the next optimal work block based on time of day and energy patterns
   */
  private async getNextOptimalWorkBlock(): Promise<Date | null> {
    const now = new Date();
    const currentHour = now.getHours();

    // ADHD-friendly optimal work blocks:
    // - Morning: 9-11 AM (high focus)
    // - After lunch: 2-4 PM (moderate focus)
    // - Evening: 7-9 PM (creative work)

    if (currentHour < 9) {
      // Before morning block - schedule for 9 AM
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    } else if (currentHour < 14) {
      // Before afternoon block - schedule for 2 PM
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
    } else if (currentHour < 19) {
      // Before evening block - schedule for 7 PM
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);
    } else {
      // After evening block - schedule for tomorrow morning
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    }
  }

  /**
   * Get the next high-energy period for flexible tasks
   */
  private async getNextHighEnergyPeriod(): Promise<Date> {
    const now = new Date();
    const currentHour = now.getHours();

    // High energy periods for ADHD brains:
    // - Morning: 10 AM - 12 PM
    // - Post-lunch: 2 PM - 4 PM
    // - Evening: 8 PM - 10 PM

    if (currentHour < 10) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    } else if (currentHour < 14) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
    } else if (currentHour < 20) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    } else {
      // Tomorrow morning
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return tomorrow;
    }
  }

  /**
   * Adjust reminder time based on estimated effort
   */
  private adjustForEffort(baseTime: Date, estimatedEffort: string): Date {
    const adjustedTime = new Date(baseTime);

    switch (estimatedEffort) {
      case '5min':
        // Quick tasks: no adjustment needed
        break;
      case '15min':
        // Short tasks: add 15 minutes buffer
        adjustedTime.setMinutes(adjustedTime.getMinutes() + 15);
        break;
      case '30min':
        // Medium tasks: add 30 minutes buffer
        adjustedTime.setMinutes(adjustedTime.getMinutes() + 30);
        break;
      case '1hr':
        // Hour-long tasks: add 1 hour buffer
        adjustedTime.setHours(adjustedTime.getHours() + 1);
        break;
      case '2hr+':
        // Long tasks: add 2 hours buffer and schedule for dedicated work time
        adjustedTime.setHours(adjustedTime.getHours() + 2);
        break;
      case 'full-day':
        // Full day tasks: schedule for start of next work day
        adjustedTime.setDate(adjustedTime.getDate() + 1);
        adjustedTime.setHours(9, 0, 0, 0);
        break;
    }

    return adjustedTime;
  }

  /**
   * Adjust reminder time based on historical completion patterns
   */
  private async adjustForHistoricalPatterns(
    baseTime: Date,
    item: any
  ): Promise<Date> {
    // For now, return base time without historical adjustment
    // TODO: Implement historical pattern analysis once database schema is updated
    return baseTime;
  }

  /**
   * Generate intelligent reminder message with context
   */
  generateReminderMessage(item: {
    content: string;
    priority: string;
    timeSensitivity: string;
    tracker: string;
    intelligentSuggestions?: any;
  }): string {
    let message = `🔔 Reminder: ${item.content}\n`;
    message += `Priority: ${this.getPriorityEmoji(item.priority)}\n`;

    // Add context-specific suggestions
    if (item.intelligentSuggestions) {
      if (item.intelligentSuggestions.timeRecommendations) {
        message += `⏰ ${item.intelligentSuggestions.timeRecommendations}\n`;
      }

      if (item.intelligentSuggestions.optimizationTips.length > 0) {
        message += `💡 Tip: ${item.intelligentSuggestions.optimizationTips[0]}\n`;
      }
    }

    // Add urgency indicator
    if (item.timeSensitivity === 'urgent') {
      message += `⚡ URGENT: This needs your attention soon!\n`;
    } else if (item.timeSensitivity === 'soon') {
      message += `📋 Soon: Consider tackling this in your next work block.\n`;
    }

    return message;
  }

  /**
   * Get priority emoji for reminder messages
   */
  private getPriorityEmoji(priority: string): string {
    const emojiMap: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return emojiMap[priority] || '⚪';
  }

  /**
   * Schedule a reminder for the given item
   */
  async scheduleReminder(item: {
    id: string;
    content: string;
    priority: string;
    timeSensitivity: string;
    estimatedEffort: string;
    itemType: string;
    tracker: string;
    intelligentSuggestions?: any;
  }): Promise<void> {
    const reminderTime = await this.calculateOptimalReminderTime(item);
    const reminderMessage = this.generateReminderMessage(item);

    // For now, just log the reminder
    // TODO: Implement actual reminder scheduling once database schema is updated
    console.log(`📅 Intelligent reminder scheduled for ${reminderTime.toISOString()}: ${item.content}`);
    console.log(`   Message: ${reminderMessage}`);
  }
}