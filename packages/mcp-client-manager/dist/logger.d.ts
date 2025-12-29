import { EventEmitter } from 'events';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: any;
    source?: string;
}
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
    maxEntries: number;
    enableColors: boolean;
}
export declare class Logger extends EventEmitter {
    private config;
    private logs;
    private logCount;
    constructor(config?: Partial<LoggerConfig>);
    private shouldLog;
    private formatLogEntry;
    private addLogEntry;
    private log;
    debug(message: string, data?: any, source?: string): void;
    info(message: string, data?: any, source?: string): void;
    warn(message: string, data?: any, source?: string): void;
    error(message: string, data?: any, source?: string): void;
    getLogs(): LogEntry[];
    getLogsByLevel(level: LogLevel): LogEntry[];
    clearLogs(): void;
    getStats(): {
        total: number;
        debug: number;
        info: number;
        warn: number;
        error: number;
    };
    setLevel(level: LogLevel): void;
    updateConfig(config: Partial<LoggerConfig>): void;
}
export declare const createLogger: (config?: Partial<LoggerConfig>) => Logger;
export declare const createMCPLogger: (config?: Partial<LoggerConfig>) => Logger;
export declare const globalLogger: Logger;
export default Logger;
