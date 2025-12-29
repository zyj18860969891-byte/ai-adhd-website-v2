"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.validateConfig = exports.loadConfigFromEnv = exports.defaultConfig = exports.createMCPLogger = exports.Logger = exports.MCPClientManager = void 0;
const events_1 = require("events");
const logger_1 = require("./logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "createMCPLogger", { enumerable: true, get: function () { return logger_1.createMCPLogger; } });
const config_1 = require("./config");
Object.defineProperty(exports, "defaultConfig", { enumerable: true, get: function () { return config_1.defaultConfig; } });
Object.defineProperty(exports, "loadConfigFromEnv", { enumerable: true, get: function () { return config_1.loadConfigFromEnv; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return config_1.validateConfig; } });
const utils_1 = require("./utils");
class ChurnFlowMCPClient extends events_1.EventEmitter {
    constructor(_config) {
        super();
    }
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
    isConnected() { return false; }
    getStatus() { return 'disconnected'; }
    getLastErrorCode() { return undefined; }
    analyzeInput(_input) { return Promise.resolve({}); }
    getContext() { return Promise.resolve({}); }
    captureInput(_input) { return Promise.resolve({}); }
    recoverSession(_sessionId) { return Promise.resolve({}); }
    getHistory(_limit) { return Promise.resolve([]); }
    clearHistory(_beforeDate) { return Promise.resolve(); }
    getCapabilities() { return Promise.resolve({}); }
}
class ShrimpMCPClient extends events_1.EventEmitter {
    constructor(_config) {
        super();
    }
    connect() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
    isConnected() { return false; }
    getStatus() { return 'disconnected'; }
    getLastErrorCode() { return undefined; }
    createTask(_task) { return Promise.resolve({}); }
    getTask(_taskId) { return Promise.resolve({}); }
    updateTask(_task) { return Promise.resolve({}); }
    deleteTask(_taskId) { return Promise.resolve(); }
    getTasks(_filter, _sort, _pagination) { return Promise.resolve({ tasks: [], total: 0 }); }
    decomposeTask(_request) { return Promise.resolve({}); }
    startResearch(_request) { return Promise.resolve({}); }
    getResearchResult(_researchId) { return Promise.resolve({}); }
    assignAgent(_request) { return Promise.resolve({}); }
    getAgents() { return Promise.resolve([]); }
    createReminder(_reminder) { return Promise.resolve({}); }
    getReminders(_taskId) { return Promise.resolve([]); }
    getStatistics() { return Promise.resolve({}); }
    searchTasks(_query) { return Promise.resolve([]); }
    importTasks(_tasks) { return Promise.resolve({ imported: 0, failed: 0 }); }
    exportTasks(_filter) { return Promise.resolve([]); }
    getCapabilities() { return Promise.resolve({}); }
}
const shrimp_1 = require("./types/shrimp");
class MCPClientManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.isConnected = false;
        this.workflows = new Map();
        this.activeWorkflows = new Set();
        this.config = {
            autoConnect: true,
            connectionTimeout: 30000,
            ...config
        };
        this.logger = (0, logger_1.createMCPLogger)({
            level: 'info',
            enableConsole: true,
            enableFile: false,
            maxEntries: 1000,
            enableColors: true
        });
        this.churnflowClient = new ChurnFlowMCPClient(this.config.churnflow);
        this.shrimpClient = new ShrimpMCPClient(this.config.shrimp);
        this.setupEventListeners();
        if (this.config.autoConnect) {
            this.connect();
        }
    }
    setupEventListeners() {
        this.churnflowClient.on('connected', () => {
            this.logger.info('ChurnFlow MCP client connected');
            this.emit('client:connected', 'churnflow');
        });
        this.churnflowClient.on('disconnected', () => {
            this.logger.warn('ChurnFlow MCP client disconnected');
            this.emit('client:disconnected', 'churnflow');
        });
        this.churnflowClient.on('error', (error) => {
            this.logger.error('ChurnFlow MCP client error:', error);
            this.emit('error', error);
        });
        this.shrimpClient.on('connected', () => {
            this.logger.info('Shrimp MCP client connected');
            this.emit('client:connected', 'shrimp');
        });
        this.shrimpClient.on('disconnected', () => {
            this.logger.warn('Shrimp MCP client disconnected');
            this.emit('client:disconnected', 'shrimp');
        });
        this.shrimpClient.on('error', (error) => {
            this.logger.error('Shrimp MCP client error:', error);
            this.emit('error', error);
        });
        this.shrimpClient.on('task:created', (task) => {
            this.logger.info(`Task created: ${task.title}`);
            this.emit('task:created', task);
        });
        this.shrimpClient.on('task:updated', (task) => {
            this.logger.info(`Task updated: ${task.title}`);
            this.emit('task:updated', task);
        });
        this.shrimpClient.on('task:completed', (task) => {
            this.logger.info(`Task completed: ${task.title}`);
            this.emit('task:completed', task);
        });
        this.churnflowClient.on('capture:created', (capture) => {
            this.logger.info(`Capture created: ${capture.content.substring(0, 50)}...`);
            this.emit('capture:created', capture);
        });
    }
    async connect() {
        try {
            this.logger.info('Connecting to MCP services...');
            await Promise.all([
                this.churnflowClient.connect(),
                this.shrimpClient.connect()
            ]);
            this.isConnected = true;
            this.logger.info('Successfully connected to all MCP services');
            this.emit('connected');
        }
        catch (error) {
            this.logger.error('Failed to connect to MCP services:', error);
            this.emit('error', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            this.logger.info('Disconnecting from MCP services...');
            await Promise.all([
                this.churnflowClient.disconnect(),
                this.shrimpClient.disconnect()
            ]);
            this.isConnected = false;
            this.logger.info('Disconnected from all MCP services');
            this.emit('disconnected');
        }
        catch (error) {
            this.logger.error('Error disconnecting from MCP services:', error);
            this.emit('error', error);
            throw error;
        }
    }
    isConnectedToServices() {
        return this.isConnected;
    }
    async initialize() {
        if (this.isConnected) {
            return;
        }
        try {
            this.emit('initializing');
            await Promise.all([
                this.churnflowClient.connect(),
                this.shrimpClient.connect()
            ]);
            this.isConnected = true;
            this.emit('initialized');
            this.logger.info('MCP Client Manager initialized successfully');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    async shutdown() {
        try {
            await Promise.all([
                this.churnflowClient.disconnect(),
                this.shrimpClient.disconnect()
            ]);
            this.isConnected = false;
            this.emit('shutdown');
            this.logger.info('MCP Client Manager shutdown successfully');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    getStatus() {
        return {
            churnflow: {
                connected: this.churnflowClient.isConnected(),
                status: this.churnflowClient.getStatus(),
                lastError: this.churnflowClient.getLastErrorCode?.() || undefined
            },
            shrimp: {
                connected: this.shrimpClient.isConnected(),
                status: this.shrimpClient.getStatus(),
                lastError: this.shrimpClient.getLastErrorCode?.() || undefined
            }
        };
    }
    async routeInput(input) {
        const startTime = Date.now();
        const steps = [];
        try {
            steps.push('Analyzing input');
            const analysis = await this.churnflowClient.analyzeInput(input);
            steps.push('Getting context');
            const context = await this.churnflowClient.getContext();
            steps.push('Capturing input');
            const captureResult = await this.churnflowClient.captureInput({
                content: input,
                context: context.current,
                priority: 'medium'
            });
            steps.push('Creating task');
            const task = await this.shrimpClient.createTask({
                title: analysis.domain,
                description: input,
                priority: shrimp_1.TaskPriority.MEDIUM,
                tags: analysis.keywords
            });
            if (analysis.confidence > 0.7) {
                steps.push('Decomposing task');
                await this.shrimpClient.decomposeTask({
                    taskId: task.id,
                    granularity: 'medium'
                });
            }
            const duration = Date.now() - startTime;
            const result = {
                success: true,
                data: {
                    analysis,
                    context,
                    captureResult,
                    task
                },
                duration,
                steps
            };
            this.emit('workflow:completed', result);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
                success: false,
                error: error.message,
                duration,
                steps
            };
            this.emit('workflow:failed', result);
            throw error;
        }
    }
    async manageTask(taskData) {
        const startTime = Date.now();
        const steps = [];
        try {
            steps.push('Creating task');
            const task = await this.shrimpClient.createTask(taskData);
            steps.push('Decomposing task');
            const decomposition = await this.shrimpClient.decomposeTask({
                taskId: task.id,
                granularity: 'medium'
            });
            if (taskData.priority === 'high') {
                steps.push('Assigning agent');
                await this.shrimpClient.assignAgent({
                    taskId: task.id,
                    agentType: shrimp_1.AgentType.EXECUTOR
                });
            }
            const duration = Date.now() - startTime;
            const result = {
                success: true,
                data: {
                    task,
                    decomposition
                },
                duration,
                steps
            };
            this.emit('workflow:completed', result);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
                success: false,
                error: error.message,
                duration,
                steps
            };
            this.emit('workflow:failed', result);
            throw error;
        }
    }
    async conductResearch(query) {
        const startTime = Date.now();
        const steps = [];
        try {
            steps.push('Starting research');
            const research = await this.shrimpClient.startResearch({
                query,
                depth: 'medium',
                timeLimit: 300000
            });
            steps.push('Getting research results');
            const results = await this.shrimpClient.getResearchResult(research.id);
            steps.push('Analyzing results');
            const analysis = await this.churnflowClient.analyzeInput(results.summary);
            const duration = Date.now() - startTime;
            const result = {
                success: true,
                data: {
                    research,
                    results,
                    analysis
                },
                duration,
                steps
            };
            this.emit('workflow:completed', result);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
                success: false,
                error: error.message,
                duration,
                steps
            };
            this.emit('workflow:failed', result);
            throw error;
        }
    }
    async captureInput(input) {
        return this.churnflowClient.captureInput(input);
    }
    async analyzeInput(input) {
        return this.churnflowClient.analyzeInput(input);
    }
    async getContext() {
        return this.churnflowClient.getContext();
    }
    async recoverSession(sessionId) {
        return this.churnflowClient.recoverSession(sessionId);
    }
    async getHistory(limit = 50) {
        return this.churnflowClient.getHistory(limit);
    }
    async clearHistory(beforeDate) {
        return this.churnflowClient.clearHistory(beforeDate);
    }
    async createTask(task) {
        return this.shrimpClient.createTask(task);
    }
    async getTask(taskId) {
        return this.shrimpClient.getTask(taskId);
    }
    async updateTask(task) {
        return this.shrimpClient.updateTask(task);
    }
    async deleteTask(taskId) {
        return this.shrimpClient.deleteTask(taskId);
    }
    async getTasks(filter = {}, sort = { field: 'createdAt', direction: 'desc' }, pagination = { page: 1, limit: 50 }) {
        return this.shrimpClient.getTasks(filter, sort, pagination);
    }
    async decomposeTask(request) {
        return this.shrimpClient.decomposeTask(request);
    }
    async startResearch(request) {
        return this.shrimpClient.startResearch(request);
    }
    async getResearchResult(researchId) {
        return this.shrimpClient.getResearchResult(researchId);
    }
    async assignAgent(request) {
        return this.shrimpClient.assignAgent(request);
    }
    async getAgents() {
        return this.shrimpClient.getAgents();
    }
    async createReminder(reminder) {
        return this.shrimpClient.createReminder(reminder);
    }
    async getReminders(taskId) {
        return this.shrimpClient.getReminders(taskId);
    }
    async getStatistics() {
        return this.shrimpClient.getStatistics();
    }
    async searchTasks(query) {
        return this.shrimpClient.searchTasks(query);
    }
    async importTasks(tasks) {
        return this.shrimpClient.importTasks(tasks);
    }
    async exportTasks(filter = {}) {
        return this.shrimpClient.exportTasks(filter);
    }
    async createWorkflow(title, steps) {
        const workflow = {
            id: (0, utils_1.generateId)('workflow'),
            title,
            steps,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.workflows.set(workflow.id, workflow);
        this.logger.info(`Workflow created: ${workflow.title}`);
        this.emit('workflow:created', workflow);
        return workflow;
    }
    async executeWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        this.activeWorkflows.add(workflowId);
        workflow.status = 'in_progress';
        workflow.updatedAt = new Date();
        this.emit('workflow:started', workflow);
        try {
            for (const step of workflow.steps) {
                step.status = 'in_progress';
                step.timestamp = new Date();
                this.logger.info(`Executing workflow step: ${step.type}`);
                switch (step.type) {
                    case 'input_capture':
                        step.output = await this.captureInput(step.input);
                        break;
                    case 'task_creation':
                        step.output = await this.createTask(step.input);
                        break;
                    case 'research':
                        step.output = await this.startResearch(step.input);
                        break;
                    case 'agent_execution':
                        step.output = await this.assignAgent(step.input);
                        break;
                }
                step.status = 'completed';
                workflow.updatedAt = new Date();
                this.emit('workflow:step:completed', { workflow, step });
            }
            workflow.status = 'completed';
            workflow.updatedAt = new Date();
            this.emit('workflow:completed', workflow);
            return workflow;
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.updatedAt = new Date();
            const failedStep = workflow.steps.find(step => step.status === 'in_progress');
            if (failedStep) {
                failedStep.error = error.message;
            }
            this.emit('workflow:failed', { workflow, error });
            throw error;
        }
        finally {
            this.activeWorkflows.delete(workflowId);
        }
    }
    getWorkflows() {
        return Array.from(this.workflows.values());
    }
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }
    getConnectedClients() {
        const clients = [];
        if (this.churnflowClient.isConnected()) {
            clients.push('churnflow');
        }
        if (this.shrimpClient.isConnected()) {
            clients.push('shrimp');
        }
        return clients;
    }
    getChurnFlowCapabilities() {
        return this.churnflowClient.getCapabilities();
    }
    getShrimpCapabilities() {
        return this.shrimpClient.getCapabilities();
    }
    getStats() {
        return {
            connected: this.isConnected,
            clients: this.getConnectedClients(),
            workflows: {
                total: this.workflows.size,
                active: this.activeWorkflows.size
            },
            capabilities: {
                churnflow: this.getChurnFlowCapabilities(),
                shrimp: this.getShrimpCapabilities()
            }
        };
    }
}
exports.MCPClientManager = MCPClientManager;
exports.utils = __importStar(require("./utils"));
__exportStar(require("./interfaces/IMCPClient"), exports);
__exportStar(require("./types/churnflow"), exports);
__exportStar(require("./types/shrimp"), exports);
exports.default = MCPClientManager;
//# sourceMappingURL=index.js.map