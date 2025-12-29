"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLogger = exports.createMCPLogger = exports.createLogger = exports.Logger = void 0;
const events_1 = require("events");
class Logger extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.logs = [];
        this.logCount = 0;
        this.config = {
            level: 'info',
            enableConsole: true,
            enableFile: false,
            maxEntries: 1000,
            enableColors: true,
            ...config
        };
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.config.level);
    }
    formatLogEntry(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = entry.level.toUpperCase();
        const source = entry.source ? `[${entry.source}]` : '';
        let message = `[${timestamp}] ${level} ${source}: ${entry.message}`;
        if (this.config.enableColors) {
            switch (entry.level) {
                case 'debug':
                    message = `\x1b[36m${message}\x1b[0m`;
                    break;
                case 'info':
                    message = `\x1b[32m${message}\x1b[0m`;
                    break;
                case 'warn':
                    message = `\x1b[33m${message}\x1b[0m`;
                    break;
                case 'error':
                    message = `\x1b[31m${message}\x1b[0m`;
                    break;
            }
        }
        return message;
    }
    addLogEntry(entry) {
        this.logs.push(entry);
        this.logCount++;
        if (this.logs.length > this.config.maxEntries) {
            this.logs.shift();
        }
        this.emit('log', entry);
    }
    log(level, message, data, source) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            data,
            source: source || undefined
        };
        this.addLogEntry(entry);
        if (this.config.enableConsole) {
            const formattedMessage = this.formatLogEntry(entry);
            if (data !== undefined) {
                console.log(formattedMessage, data);
            }
            else {
                console.log(formattedMessage);
            }
        }
        if (this.config.enableFile && this.config.filePath) {
        }
    }
    debug(message, data, source) {
        this.log('debug', message, data, source);
    }
    info(message, data, source) {
        this.log('info', message, data, source);
    }
    warn(message, data, source) {
        this.log('warn', message, data, source);
    }
    error(message, data, source) {
        this.log('error', message, data, source);
    }
    getLogs() {
        return [...this.logs];
    }
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
    clearLogs() {
        this.logs = [];
        this.logCount = 0;
        this.emit('logsCleared');
    }
    getStats() {
        const stats = {
            total: this.logs.length,
            debug: 0,
            info: 0,
            warn: 0,
            error: 0
        };
        this.logs.forEach(log => {
            stats[log.level]++;
        });
        return stats;
    }
    setLevel(level) {
        this.config.level = level;
        this.info(`Log level changed to ${level}`);
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.info('Logger configuration updated');
    }
}
exports.Logger = Logger;
const createLogger = (config) => {
    return new Logger(config);
};
exports.createLogger = createLogger;
const createMCPLogger = (config) => {
    return new Logger({
        ...config,
        level: config?.level || 'info'
    });
};
exports.createMCPLogger = createMCPLogger;
exports.globalLogger = (0, exports.createMCPLogger)({
    level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info',
    enableConsole: true,
    enableFile: false,
    maxEntries: 1000,
    enableColors: true
});
exports.default = Logger;
//# sourceMappingURL=logger.js.map