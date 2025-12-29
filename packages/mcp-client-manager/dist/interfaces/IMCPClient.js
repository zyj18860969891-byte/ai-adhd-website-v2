"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMCPClient = exports.MCPClientStatus = void 0;
const events_1 = require("events");
var MCPClientStatus;
(function (MCPClientStatus) {
    MCPClientStatus["DISCONNECTED"] = "disconnected";
    MCPClientStatus["CONNECTING"] = "connecting";
    MCPClientStatus["CONNECTED"] = "connected";
    MCPClientStatus["ERROR"] = "error";
    MCPClientStatus["DISCONNECTING"] = "disconnecting";
})(MCPClientStatus || (exports.MCPClientStatus = MCPClientStatus = {}));
class BaseMCPClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.status = MCPClientStatus.DISCONNECTED;
        this.requestIdCounter = 1;
        this.config = {
            timeout: 30000,
            maxRetries: 3,
            retryInterval: 1000,
            debug: false,
            ...config
        };
    }
    async connect(config) {
        if (config) {
            this.configure(config);
        }
        if (this.status === MCPClientStatus.CONNECTED) {
            return;
        }
        this.status = MCPClientStatus.CONNECTING;
        this.emit('status-change', { from: MCPClientStatus.DISCONNECTED, to: MCPClientStatus.CONNECTING });
        try {
            await this.doConnect();
            this.status = MCPClientStatus.CONNECTED;
            this.emit('connected');
            this.emit('status-change', { from: MCPClientStatus.CONNECTING, to: MCPClientStatus.CONNECTED });
        }
        catch (error) {
            this.status = MCPClientStatus.ERROR;
            const clientError = this.createError('CONNECTION_FAILED', 'Failed to connect to MCP server', error);
            this.emit('error', clientError);
            this.emit('status-change', { from: MCPClientStatus.CONNECTING, to: MCPClientStatus.ERROR });
            throw clientError;
        }
    }
    async disconnect() {
        if (this.status !== MCPClientStatus.CONNECTED) {
            return;
        }
        this.status = MCPClientStatus.DISCONNECTING;
        this.emit('status-change', { from: MCPClientStatus.CONNECTED, to: MCPClientStatus.DISCONNECTING });
        try {
            await this.doDisconnect();
            this.status = MCPClientStatus.DISCONNECTED;
            this.emit('disconnected');
            this.emit('status-change', { from: MCPClientStatus.DISCONNECTING, to: MCPClientStatus.DISCONNECTED });
        }
        catch (error) {
            this.status = MCPClientStatus.ERROR;
            const clientError = this.createError('DISCONNECTION_FAILED', 'Failed to disconnect from MCP server', error);
            this.emit('error', clientError);
            this.emit('status-change', { from: MCPClientStatus.DISCONNECTING, to: MCPClientStatus.ERROR });
            throw clientError;
        }
    }
    isConnected() {
        return this.status === MCPClientStatus.CONNECTED;
    }
    getStatus() {
        return this.status;
    }
    async sendRequest(method, params, options = {}) {
        if (!this.isConnected()) {
            throw this.createError('NOT_CONNECTED', 'Client is not connected to MCP server');
        }
        const requestId = this.generateRequestId();
        const timeout = options.timeout ?? this.config.timeout;
        const retries = options.retries ?? this.config.maxRetries;
        let lastError = null;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this.doSendRequest(method, params, {
                    ...options,
                    requestId,
                    timeout
                });
                this.emit('request-success', { requestId, method, attempt });
                return response;
            }
            catch (error) {
                lastError = this.createError('REQUEST_FAILED', `Request failed: ${error.message}`, error);
                if (attempt === retries) {
                    this.emit('request-error', { requestId, method, error: lastError, attempt });
                    throw lastError;
                }
                await this.delay(this.config.retryInterval);
            }
        }
        throw lastError;
    }
    configure(config) {
        this.config = { ...this.config, ...config };
        this.emit('config-changed', this.config);
    }
    getConfig() {
        return { ...this.config };
    }
    generateRequestId() {
        return `${Date.now()}-${this.requestIdCounter++}`;
    }
    createError(code, message, originalError) {
        const error = new Error(message);
        error.code = code;
        error.originalError = originalError;
        return error;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    debugLog(message, data) {
        if (this.config.debug) {
            console.log(`[MCP-${this.getClientInfo().type}] ${message}`, data ? data : '');
        }
    }
    getLastErrorCode() {
        return undefined;
    }
    getCapabilities() {
        return {
            type: this.getClientInfo().type,
            version: this.getClientInfo().version,
            protocolVersion: this.getClientInfo().protocolVersion,
            capabilities: []
        };
    }
}
exports.BaseMCPClient = BaseMCPClient;
//# sourceMappingURL=IMCPClient.js.map