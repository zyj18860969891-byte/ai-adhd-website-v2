export interface Agent {
    name: string;
    description?: string;
    path?: string;
    content?: string;
}
/**
 * Load global agents from the Claude folder agents directory
 * @returns Array of available global agents
 */
export declare function loadGlobalAgents(): Promise<Agent[]>;
/**
 * Load project-specific agents from .claude/agents directory
 * @param projectRoot Root directory of the project
 * @returns Array of available project agents
 */
export declare function loadProjectAgents(projectRoot: string): Promise<Agent[]>;
/**
 * Get all available agents (both global and project-specific)
 * @param projectRoot Optional project root for loading project agents
 * @returns Combined array of all available agents
 */
export declare function getAllAvailableAgents(projectRoot?: string): Promise<Agent[]>;
/**
 * Get an agent by name
 * @param agentName Name of the agent to retrieve
 * @param projectRoot Optional project root for loading project agents
 * @returns Agent object or undefined if not found
 */
export declare function getAgentByName(agentName: string, projectRoot?: string): Promise<Agent | undefined>;
