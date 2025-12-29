export interface MCPConfig {
    serverUrl: string;
    apiKey?: string;
    timeout?: number;
    retryAttempts?: number;
}
export interface ChurnFlowConfig extends MCPConfig {
    serverUrl: 'https://mcpmarket.cn/server/68ca9ec9944e98de23a83f72';
    capabilities?: string[];
}
export interface ShrimpConfig extends MCPConfig {
    serverUrl: 'https://mcpmarket.cn/server/67fb6f922e1080dbe767bc96';
    capabilities?: string[];
}
export interface MCPManagerConfig {
    churnflow: ChurnFlowConfig;
    shrimp: ShrimpConfig;
    autoConnect?: boolean;
    connectionTimeout?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export declare const defaultConfig: MCPManagerConfig;
export declare function loadConfigFromEnv(): MCPManagerConfig;
export declare function validateConfig(config: MCPManagerConfig): {
    valid: boolean;
    errors: string[];
};
export declare function mergeConfig(baseConfig: MCPManagerConfig, overrideConfig: Partial<MCPManagerConfig>): MCPManagerConfig;
export declare function createConfigExample(): string;
declare const _default: {
    defaultConfig: MCPManagerConfig;
    loadConfigFromEnv: typeof loadConfigFromEnv;
    validateConfig: typeof validateConfig;
    mergeConfig: typeof mergeConfig;
    createConfigExample: typeof createConfigExample;
};
export default _default;
