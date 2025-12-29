import { EventEmitter } from 'events';
export interface MCPClientConfig {
    serverUrl: string;
    authToken?: string;
    timeout?: number;
    maxRetries?: number;
    retryInterval?: number;
    debug?: boolean;
}
export declare enum MCPClientStatus {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    ERROR = "error",
    DISCONNECTING = "disconnecting"
}
export interface MCPClientError extends Error {
    code: string;
    originalError?: Error;
    requestId?: string;
}
export interface MCPRequestOptions {
    timeout?: number;
    retries?: number;
    ignoreCache?: boolean;
}
export interface MCPResponse<T = any> {
    id: string;
    timestamp: number;
    data: T;
    success: boolean;
    error?: MCPClientError;
}
export interface MCPEvent {
    type: string;
    data: any;
    timestamp: number;
}
export interface IMCPClient extends EventEmitter {
    connect(config: MCPClientConfig): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getStatus(): MCPClientStatus;
    sendRequest<T>(method: string, params: any, options?: MCPRequestOptions): Promise<MCPResponse<T>>;
    on(event: string, handler: (data: any) => void): this;
    off(event: string, handler: (data: any) => void): this;
    configure(config: Partial<MCPClientConfig>): void;
    getConfig(): MCPClientConfig;
    getClientInfo(): {
        type: string;
        version: string;
        protocolVersion: string;
    };
    getLastErrorCode?(): string | undefined;
    getCapabilities?(): any;
}
export declare abstract class BaseMCPClient extends EventEmitter implements IMCPClient {
    protected config: MCPClientConfig;
    protected status: MCPClientStatus;
    protected requestIdCounter: number;
    constructor(config: MCPClientConfig);
    connect(config?: Partial<MCPClientConfig>): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getStatus(): MCPClientStatus;
    sendRequest<T>(method: string, params: any, options?: MCPRequestOptions): Promise<MCPResponse<T>>;
    configure(config: Partial<MCPClientConfig>): void;
    getConfig(): MCPClientConfig;
    abstract getClientInfo(): {
        type: string;
        version: string;
        protocolVersion: string;
    };
    protected abstract doConnect(): Promise<void>;
    protected abstract doDisconnect(): Promise<void>;
    protected abstract doSendRequest<T>(method: string, params: any, options: MCPRequestOptions & {
        requestId: string;
        timeout: number;
    }): Promise<MCPResponse<T>>;
    private generateRequestId;
    protected createError(code: string, message: string, originalError?: Error): MCPClientError;
    private delay;
    protected debugLog(message: string, data?: any): void;
    getLastErrorCode(): string | undefined;
    getCapabilities(): any;
}
