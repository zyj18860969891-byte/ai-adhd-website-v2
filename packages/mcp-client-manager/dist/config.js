"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.loadConfigFromEnv = loadConfigFromEnv;
exports.validateConfig = validateConfig;
exports.mergeConfig = mergeConfig;
exports.createConfigExample = createConfigExample;
exports.defaultConfig = {
    churnflow: {
        serverUrl: 'https://mcpmarket.cn/server/68ca9ec9944e98de23a83f72',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['input_capture', 'intelligent_routing', 'context_analysis', 'task_generation']
    },
    shrimp: {
        serverUrl: 'https://mcpmarket.cn/server/67fb6f922e1080dbe767bc96',
        timeout: 30000,
        retryAttempts: 3,
        capabilities: ['task_management', 'research_mode', 'agent_system', 'reminder_system']
    },
    autoConnect: false,
    connectionTimeout: 30000,
    logLevel: 'info'
};
function loadConfigFromEnv() {
    const config = {
        churnflow: {
            ...exports.defaultConfig.churnflow,
            apiKey: process.env['MCP_CHURNFLOW_API_KEY'] || undefined
        },
        shrimp: {
            ...exports.defaultConfig.shrimp,
            apiKey: process.env['MCP_SHRIMP_API_KEY'] || undefined
        },
        autoConnect: process.env['MCP_AUTO_CONNECT'] === 'true' || undefined,
        connectionTimeout: parseInt(process.env['MCP_CONNECTION_TIMEOUT'] || '30000'),
        logLevel: process.env['MCP_LOG_LEVEL'] || exports.defaultConfig.logLevel
    };
    return config;
}
function validateConfig(config) {
    const errors = [];
    if (!config.churnflow.serverUrl) {
        errors.push('ChurnFlow serverUrl is required');
    }
    if (config.churnflow.timeout && config.churnflow.timeout < 1000) {
        errors.push('ChurnFlow timeout must be at least 1000ms');
    }
    if (config.churnflow.retryAttempts && config.churnflow.retryAttempts < 0) {
        errors.push('ChurnFlow retryAttempts must be non-negative');
    }
    if (!config.shrimp.serverUrl) {
        errors.push('Shrimp serverUrl is required');
    }
    if (config.shrimp.timeout && config.shrimp.timeout < 1000) {
        errors.push('Shrimp timeout must be at least 1000ms');
    }
    if (config.shrimp.retryAttempts && config.shrimp.retryAttempts < 0) {
        errors.push('Shrimp retryAttempts must be non-negative');
    }
    if (config.connectionTimeout && config.connectionTimeout < 1000) {
        errors.push('connectionTimeout must be at least 1000ms');
    }
    if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
        errors.push('logLevel must be one of: debug, info, warn, error');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function mergeConfig(baseConfig, overrideConfig) {
    return {
        churnflow: { ...baseConfig.churnflow, ...overrideConfig.churnflow },
        shrimp: { ...baseConfig.shrimp, ...overrideConfig.shrimp },
        autoConnect: overrideConfig.autoConnect ?? baseConfig.autoConnect,
        connectionTimeout: overrideConfig.connectionTimeout ?? baseConfig.connectionTimeout,
        logLevel: overrideConfig.logLevel ?? baseConfig.logLevel
    };
}
function createConfigExample() {
    return `# MCP 客户端配置示例

# ChurnFlow MCP 服务配置
MCP_CHURNFLOW_API_KEY=your_churnflow_api_key_here
MCP_CHURNFLOW_SERVER_URL=https://mcpmarket.cn/server/68ca9ec9944e98de23a83f72
MCP_CHURNFLOW_TIMEOUT=30000
MCP_CHURNFLOW_RETRY_ATTEMPTS=3

# Shrimp Task Manager MCP 服务配置
MCP_SHRIMP_API_KEY=your_shrimp_api_key_here
MCP_SHRIMP_SERVER_URL=https://mcpmarket.cn/server/67fb6f922e1080dbe767bc96
MCP_SHRIMP_TIMEOUT=30000
MCP_SHRIMP_RETRY_ATTEMPTS=3

# MCP 客户端管理器配置
MCP_AUTO_CONNECT=false
MCP_CONNECTION_TIMEOUT=30000
MCP_LOG_LEVEL=info
`;
}
exports.default = {
    defaultConfig: exports.defaultConfig,
    loadConfigFromEnv,
    validateConfig,
    mergeConfig,
    createConfigExample
};
//# sourceMappingURL=config.js.map