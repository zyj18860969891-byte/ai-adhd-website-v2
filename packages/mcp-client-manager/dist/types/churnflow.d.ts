export interface CaptureInput {
    content: string;
    context?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    timestamp?: number;
}
export interface CaptureResult {
    captured: boolean;
    taskId?: string;
    confidence: number;
    suggestions?: string[];
    timestamp: number;
}
export interface AnalysisResult {
    domain: string;
    confidence: number;
    keywords: string[];
    relatedDomains: string[];
    analysis: {
        sentiment: 'positive' | 'negative' | 'neutral';
        importance: number;
        category: string;
    };
}
export interface Context {
    current: string;
    history: string[];
    relatedTasks: string[];
    timestamp: number;
}
export interface Session {
    sessionId: string;
    status: 'active' | 'paused' | 'completed';
    startTime: number;
    endTime?: number;
    capturedInputs: CaptureResult[];
    analysisResults: AnalysisResult[];
}
export interface SQLiteConfig {
    enabled: boolean;
    path?: string;
    maxSize?: number;
}
export interface CopilotConfig {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
}
export interface ChurnFlowConfig {
    sqlite?: SQLiteConfig;
    copilot?: CopilotConfig;
    maxContextLength?: number;
    autoRecoveryTimeout?: number;
    dualStorage?: boolean;
}
