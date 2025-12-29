"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
exports.retry = retry;
exports.generateId = generateId;
exports.generateUUID = generateUUID;
exports.debounce = debounce;
exports.throttle = throttle;
exports.deepClone = deepClone;
exports.safeJSONParse = safeJSONParse;
exports.safeJSONStringify = safeJSONStringify;
exports.formatFileSize = formatFileSize;
exports.formatDuration = formatDuration;
exports.getTimestamp = getTimestamp;
exports.formatDateTime = formatDateTime;
exports.isEmpty = isEmpty;
exports.getObjectDepth = getObjectDepth;
exports.truncateString = truncateString;
exports.trimString = trimString;
exports.isBlank = isBlank;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.toCamelCase = toCamelCase;
exports.toKebabCase = toKebabCase;
exports.createEventEmitter = createEventEmitter;
exports.safeEmit = safeEmit;
exports.batchProcess = batchProcess;
exports.parallelProcess = parallelProcess;
exports.createCache = createCache;
exports.cleanupCache = cleanupCache;
const events_1 = require("events");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function retry(fn, maxAttempts = 3, delayMs = 1000, backoffFactor = 2) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                const waitTime = delayMs * Math.pow(backoffFactor, attempt - 1);
                await delay(waitTime);
            }
        }
    }
    throw lastError;
}
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}
function safeJSONParse(jsonString, defaultValue) {
    try {
        return JSON.parse(jsonString);
    }
    catch (error) {
        console.warn('Failed to parse JSON:', error);
        return defaultValue;
    }
}
function safeJSONStringify(obj, indent) {
    try {
        return JSON.stringify(obj, null, indent);
    }
    catch (error) {
        console.warn('Failed to stringify JSON:', error);
        return '{}';
    }
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
function getTimestamp() {
    return Date.now();
}
function formatDateTime(date) {
    return date.toISOString().replace('T', ' ').substr(0, 19);
}
function isEmpty(obj) {
    if (obj === null || obj === undefined)
        return true;
    if (typeof obj === 'string' || Array.isArray(obj))
        return obj.length === 0;
    if (typeof obj === 'object')
        return Object.keys(obj).length === 0;
    return false;
}
function getObjectDepth(obj) {
    if (typeof obj !== 'object' || obj === null)
        return 0;
    let maxDepth = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const depth = getObjectDepth(obj[key]);
            maxDepth = Math.max(maxDepth, depth);
        }
    }
    return maxDepth + 1;
}
function truncateString(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substr(0, maxLength - 3) + '...';
}
function trimString(str) {
    return str.replace(/^\s+|\s+$/g, '');
}
function isBlank(str) {
    return !str || /^\s*$/.test(str);
}
function capitalizeFirstLetter(str) {
    return str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (_, group1) => group1 ? group1.toUpperCase() : '');
}
function toKebabCase(str) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
function createEventEmitter() {
    return new events_1.EventEmitter();
}
function safeEmit(emitter, event, ...args) {
    try {
        return emitter.emit(event, ...args);
    }
    catch (error) {
        console.error('Error in event handler:', error);
        return false;
    }
}
async function batchProcess(items, processor, batchSize = 10, delayMs = 0) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);
        if (delayMs > 0 && i + batchSize < items.length) {
            await delay(delayMs);
        }
    }
    return results;
}
async function parallelProcess(items, processor, maxConcurrency = 5) {
    const results = [];
    const executing = [];
    for (const item of items) {
        const promise = processor(item).then(result => {
            results.push(result);
        });
        executing.push(promise);
        if (executing.length >= maxConcurrency) {
            await Promise.race(executing);
            executing.splice(0, executing.findIndex(p => p === promise) + 1);
        }
    }
    await Promise.all(executing);
    return results;
}
function createCache(fn, keyGenerator, ttlMs = 60000) {
    const cache = new Map();
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        const now = Date.now();
        if (cache.has(key)) {
            const cached = cache.get(key);
            if (now < cached.expires) {
                return cached.value;
            }
        }
        const result = fn(...args);
        cache.set(key, {
            value: result,
            expires: now + ttlMs
        });
        return result;
    });
}
function cleanupCache(cache, now = Date.now()) {
    for (const [key, value] of cache.entries()) {
        if (value.expires && value.expires < now) {
            cache.delete(key);
        }
    }
}
exports.default = {
    delay,
    retry,
    generateId,
    generateUUID,
    debounce,
    throttle,
    deepClone,
    safeJSONParse,
    safeJSONStringify,
    formatFileSize,
    formatDuration,
    getTimestamp,
    formatDateTime,
    isEmpty,
    getObjectDepth,
    truncateString,
    trimString,
    isBlank,
    capitalizeFirstLetter,
    toCamelCase,
    toKebabCase,
    createEventEmitter,
    safeEmit,
    batchProcess,
    parallelProcess,
    createCache,
    cleanupCache
};
//# sourceMappingURL=utils.js.map