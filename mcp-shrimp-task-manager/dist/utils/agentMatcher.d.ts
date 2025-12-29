import { Task } from '../types/index.js';
import { Agent } from './agentLoader.js';
/**
 * Match a task to the most suitable agent from available agents
 */
export declare function matchAgentToTask(task: Task, availableAgents: Agent[]): string | undefined;
/**
 * Get suggested agent type for a task (for UI display)
 */
export declare function getSuggestedAgentType(task: Task): string | undefined;
/**
 * Get keyword match details for debugging/UI
 */
export declare function getKeywordMatchDetails(task: Task): Array<{
    type: string;
    score: number;
    matchedKeywords: string[];
}>;
