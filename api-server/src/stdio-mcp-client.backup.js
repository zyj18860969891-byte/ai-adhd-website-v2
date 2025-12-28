import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export default class StdioMCPClient extends EventEmitter {

  // 智能降级配置
  static DEGRADATION_CONFIG = {
    ENABLED: true,
    LEVELS: {
      FULL: 'full',      // 完整功能
      REDUCED: 'reduced', // 减少功能
      MINIMAL: 'minimal', // 最小功能
      OFFLINE: 'offline' // 离线模式
    },
    THRESHOLDS: {
      ERROR_RATE: 0.3,    // 错误率阈值 30%
      RESPONSE_TIME: 5000, // 响应时间阈值 5秒
      CONSECUTIVE_FAILURES: 5 // 连续失败阈值
    }
  };

  // 当前降级级别
  _degradationLevel = this.constructor.DEGRADATION_CONFIG.LEVELS.FULL;

  // 性能监控
  _performanceMetrics = {
    errorRate: 0,
    avgResponseTime: 0,
    consecutiveFailures: 0,
    lastSuccessTime: Date.now()
  };

  // 智能降级评估
  async evaluateDegradationNeed() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    // 检查是否需要降级
    const shouldDegrade = 
      this._performanceMetrics.errorRate > config.THRESHOLDS.ERROR_RATE ||
      this._performanceMetrics.avgResponseTime > config.THRESHOLDS.RESPONSE_TIME ||
      this._performanceMetrics.consecutiveFailures > config.THRESHOLDS.CONSECUTIVE_FAILURES;
    
    if (shouldDegrade && this._degradationLevel === config.LEVELS.FULL) {
      console.log('📉 检测到性能问题，开始智能降级...');
      await this.degradeService();
    }
    
    // 检查是否可以恢复
    const shouldRecover = 
      this._performanceMetrics.errorRate < config.THRESHOLDS.ERROR_RATE * 0.5 &&
      this._performanceMetrics.avgResponseTime < config.THRESHOLDS.RESPONSE_TIME * 0.7 &&
      this._performanceMetrics.consecutiveFailures === 0;
    
    if (shouldRecover && this._degradationLevel !== config.LEVELS.FULL) {
      console.log('📈 性能恢复，开始服务升级...');
      await this.recoverService();
    }
  }

  // 服务降级
  async degradeService() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.FULL:
        this._degradationLevel = config.LEVELS.REDUCED;
        console.log('📉 降级到: 减少功能模式');
        break;
      case config.LEVELS.REDUCED:
        this._degradationLevel = config.LEVELS.MINIMAL;
        console.log('📉 降级到: 最小功能模式');
        break;
      case config.LEVELS.MINIMAL:
        this._degradationLevel = config.LEVELS.OFFLINE;
        console.log('📉 降级到: 离线模式');
        break;
      default:
        console.log('⚠️ 已达到最低降级级别');
    }
  }

  // 服务恢复
  async recoverService() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.OFFLINE:
        this._degradationLevel = config.LEVELS.MINIMAL;
        console.log('📈 升级到: 最小功能模式');
        break;
      case config.LEVELS.MINIMAL:
        this._degradationLevel = config.LEVELS.REDUCED;
        console.log('📈 升级到: 减少功能模式');
        break;
      case config.LEVELS.REDUCED:
        this._degradationLevel = config.LEVELS.FULL;
        console.log('📈 升级到: 完整功能模式');
        break;
      default:
        console.log('✅ 已在完整功能模式');
    }
  }

  // 根据降级级别调整功能
  getAdjustedFunctionality(operation) {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.FULL:
        return operation;
      case config.LEVELS.REDUCED:
        // 减少功能：简化复杂操作
        return this.simplifyOperation(operation);
      case config.LEVELS.MINIMAL:
        // 最小功能：只保留核心功能
        return this.getMinimalOperation(operation);
      case config.LEVELS.OFFLINE:
        // 离线模式：返回缓存结果或默认值
        return this.getOfflineOperation(operation);
      default:
        return operation;
    }
  }

  // 简化操作
  simplifyOperation(operation) {
    return async () => {
      console.log('🔄 使用简化功能模式');
      try {
        return await operation();
      } catch (error) {
        console.log('⚠️ 简化模式失败，尝试最小功能...');
        return this.getMinimalOperation(operation)();
      }
    };
  }

  // 最小操作
  getMinimalOperation(operation) {
    return async () => {
      console.log('🔄 使用最小功能模式');
      // 返回基本功能或缓存结果
      return this.getCachedResult(operation) || { success: false, message: '最小功能模式' };
    };
  }

  // 离线操作
  getOfflineOperation(operation) {
    return async () => {
      console.log('🔄 使用离线模式');
      // 返回缓存结果或默认值
      return this.getCachedResult(operation) || { success: false, message: '离线模式' };
    };
  }

  // 获取缓存结果
  getCachedResult(operation) {
    // 简单的缓存实现
    const cacheKey = this.getCacheKey(operation);
    return this._cache && this._cache[cacheKey];
  }

  // 生成缓存键
  getCacheKey(operation) {
    return typeof operation === 'string' ? operation : operation.toString();
  }

  // 更新性能指标
  updatePerformanceMetrics(success, responseTime) {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    // 更新错误率
    if (success) {
      this._performanceMetrics.consecutiveFailures = 0;
      this._performanceMetrics.lastSuccessTime = Date.now();
    }

  // 用户体验优化配置
  static UX_CONFIG = {
    ENABLED: true,
    FEEDBACK: {
      ENABLED: true,
      STYLES: {
        SUCCESS: '✅',
        WARNING: '⚠️',
        ERROR: '❌',
        INFO: 'ℹ️',
        LOADING: '🔄'
      }
    },
    MESSAGES: {
      DEGRADATION: {
        TITLE: '服务性能优化',
        FULL: '所有功能正常运行',
        REDUCED: '部分功能已优化，性能提升中',
        MINIMAL: '核心功能正常运行，部分功能暂时不可用',
        OFFLINE: '离线模式，使用缓存数据'
      },
      ERRORS: {
        TIMEOUT: '请求超时，正在重试...',
        CONNECTION: '连接问题，正在重新连接...',
        GENERAL: '服务暂时不可用，请稍后重试'
      },
      RECOVERY: {
        TITLE: '服务恢复',
        MESSAGE: '所有功能已恢复正常'
      }
    },
    NOTIFICATIONS: {
      ENABLED: true,
      CONSOLE: true,
      USER_INTERFACE: false
    }
  };

  // 显示用户反馈
  showUserFeedback(type, message, details = '') {
    const config = this.constructor.UX_CONFIG;
    
    if (!config.ENABLED || !config.FEEDBACK.ENABLED) {
      return;
    }
    
    const style = config.FEEDBACK.STYLES[type] || config.FEEDBACK.STYLES.INFO;
    const fullMessage = details ? `${style} ${message} (${details})` : `${style} ${message}`;
    
    if (config.NOTIFICATIONS.CONSOLE) {
      console.log(fullMessage);
    }
    
    if (config.NOTIFICATIONS.USER_INTERFACE && typeof window !== 'undefined') {
      // 可以在这里添加UI通知逻辑
      this.showUINotification(type, message, details);
    }
  }

  // 显示UI通知
  showUINotification(type, message, details) {
    // 简单的浏览器通知实现
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message, {
        body: details,
        icon: this.getNotificationIcon(type)
      });
    }
  }

  // 获取通知图标
  getNotificationIcon(type) {
    const icons = {
      success: '/icons/success.png',
      warning: '/icons/warning.png',
      error: '/icons/error.png',
      info: '/icons/info.png'
    };
    return icons[type] || icons.info;
  }

  // 显示降级状态
  showDegradationStatus() {
    const config = this.constructor.UX_CONFIG;
    const degradationConfig = this.constructor.DEGRADATION_CONFIG;
    
    const status = config.MESSAGES.DEGRADATION[this._degradationLevel];
    this.showUserFeedback('INFO', config.MESSAGES.DEGRADATION.TITLE, status);
  }

  // 显示错误信息
  showErrorMessage(errorType, customMessage = '') {
    const config = this.constructor.UX_CONFIG;
    
    const message = customMessage || config.MESSAGES.ERRORS[errorType] || config.MESSAGES.ERRORS.GENERAL;
    this.showUserFeedback('ERROR', message, errorType);
  }

  // 显示恢复信息
  showRecoveryStatus() {
    const config = this.constructor.UX_CONFIG;
    
    this.showUserFeedback('SUCCESS', config.MESSAGES.RECOVERY.TITLE, config.MESSAGES.RECOVERY.MESSAGE);
  }

  // 增强的错误处理
  async handleEnhancedError(error, operationType = 'REQUEST') {
    const startTime = Date.now();
    
    // 显示错误信息
    this.showErrorMessage('GENERAL', error.message);
    
    // 更新性能指标
    this.updatePerformanceMetrics(false, Date.now() - startTime);
    
    // 尝试降级处理
    if (this._degradationLevel !== this.constructor.DEGRADATION_CONFIG.LEVELS.OFFLINE) {
      console.log('🔄 尝试降级处理...');
      return this.handleWithDegradation(operationType);
    }

  // 增强的错误信息
  _errorMessages = {
    CONNECTION: {
      title: '连接错误',
      description: '无法连接到服务',
      suggestions: [
        '检查网络连接',
        '确认服务正在运行',
        '检查防火墙设置'
      ]
    },
    TIMEOUT: {
      title: '超时错误',
      description: '请求响应时间过长',
      suggestions: [
        '检查网络延迟',
        '减少请求复杂度',
        '稍后重试'
      ]
    },
    AUTHENTICATION: {
      title: '认证错误',
      description: '身份验证失败',
      suggestions: [
        '检查凭据是否正确',
        '重新登录',
        '联系管理员'
      ]
    },
    RATE_LIMIT: {
      title: '频率限制',
      description: '请求过于频繁',
      suggestions: [
        '降低请求频率',
        '实现请求缓存',
        '等待后重试'
      ]
    },
    GENERAL: {
      title: '服务错误',
      description: '服务暂时不可用',
      suggestions: [
        '稍后重试',
        '检查服务状态',
        '联系技术支持'
      ]
    }
  };

  // 生成详细的错误信息
  generateDetailedError(errorType, customMessage = '') {
    const errorInfo = this._errorMessages[errorType] || this._errorMessages.GENERAL;
    
    const errorDetails = {
      type: errorType,
      title: errorInfo.title,
      description: customMessage || errorInfo.description,
      suggestions: errorInfo.suggestions,
      timestamp: new Date().toISOString(),
      degradationLevel: this._degradationLevel,
      systemStatus: this.getSystemStatus()
    };
    
    return errorDetails;
  }

  // 获取系统状态
  getSystemStatus() {
    return {
      degradationLevel: this._degradationLevel,
      errorRate: this._performanceMetrics.errorRate,
      avgResponseTime: this._performanceMetrics.avgResponseTime,
      consecutiveFailures: this._performanceMetrics.consecutiveFailures,
      lastSuccessTime: this._performanceMetrics.lastSuccessTime,
      uptime: Date.now() - this._performanceMetrics.lastSuccessTime
    };
  }

  // 显示详细错误信息
  showDetailedError(errorType, customMessage = '') {
    const errorDetails = this.generateDetailedError(errorType, customMessage);
    
    console.log('\n📋 详细错误信息:');
    console.log(`   类型: ${errorDetails.type}`);
    console.log(`   标题: ${errorDetails.title}`);
    console.log(`   描述: ${errorDetails.description}`);
    console.log(`   降级级别: ${errorDetails.degradationLevel}`);
    console.log(`   时间: ${errorDetails.timestamp}`);
    
    console.log('\n💡 建议解决方案:');
    errorDetails.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
    
    console.log('\n📊 系统状态:');
    console.log(`   错误率: ${(errorDetails.systemStatus.errorRate * 100).toFixed(1)}%`);
    console.log(`   平均响应时间: ${errorDetails.systemStatus.avgResponseTime}ms`);
    console.log(`   连续失败次数: ${errorDetails.systemStatus.consecutiveFailures}`);
    
    return errorDetails;
  }

    
    // 如果已经是离线模式，抛出错误
    throw new Error(`离线模式无法处理请求: ${error.message}`);
  }

  // 降级处理
  async handleWithDegradation(operationType) {
    const adjustedOperation = this.getAdjustedFunctionality(() => {
      // 返回默认结果
      return { success: false, message: '降级模式处理' };
    });
    
    return await adjustedOperation();
  }
 else {
      this._performanceMetrics.consecutiveFailures++;
    }
    
    // 更新平均响应时间
    this._performanceMetrics.avgResponseTime = 
      (this._performanceMetrics.avgResponseTime + responseTime) / 2;
    
    // 计算错误率（简化实现）
    this._performanceMetrics.errorRate = 
      this._performanceMetrics.consecutiveFailures / 10; // 假设10次操作
    
    // 定期评估降级需求
    if (this._performanceMetrics.consecutiveFailures % 3 === 0) {
      this.evaluateDegradationNeed();
    }
  }


  // 智能降级配置
  static DEGRADATION_CONFIG = {
    ENABLED: true,
    LEVELS: {
      FULL: 'full',      // 完整功能
      REDUCED: 'reduced', // 减少功能
      MINIMAL: 'minimal', // 最小功能
      OFFLINE: 'offline' // 离线模式
    },
    THRESHOLDS: {
      ERROR_RATE: 0.3,    // 错误率阈值 30%
      RESPONSE_TIME: 5000, // 响应时间阈值 5秒
      CONSECUTIVE_FAILURES: 5 // 连续失败阈值
    }
  };

  // 当前降级级别
  _degradationLevel = this.constructor.DEGRADATION_CONFIG.LEVELS.FULL;

  // 性能监控
  _performanceMetrics = {
    errorRate: 0,
    avgResponseTime: 0,
    consecutiveFailures: 0,
    lastSuccessTime: Date.now()
  };

  // 智能降级评估
  async evaluateDegradationNeed() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    // 检查是否需要降级
    const shouldDegrade = 
      this._performanceMetrics.errorRate > config.THRESHOLDS.ERROR_RATE ||
      this._performanceMetrics.avgResponseTime > config.THRESHOLDS.RESPONSE_TIME ||
      this._performanceMetrics.consecutiveFailures > config.THRESHOLDS.CONSECUTIVE_FAILURES;
    
    if (shouldDegrade && this._degradationLevel === config.LEVELS.FULL) {
      console.log('📉 检测到性能问题，开始智能降级...');
      await this.degradeService();
    }
    
    // 检查是否可以恢复
    const shouldRecover = 
      this._performanceMetrics.errorRate < config.THRESHOLDS.ERROR_RATE * 0.5 &&
      this._performanceMetrics.avgResponseTime < config.THRESHOLDS.RESPONSE_TIME * 0.7 &&
      this._performanceMetrics.consecutiveFailures === 0;
    
    if (shouldRecover && this._degradationLevel !== config.LEVELS.FULL) {
      console.log('📈 性能恢复，开始服务升级...');
      await this.recoverService();
    }
  }

  // 服务降级
  async degradeService() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.FULL:
        this._degradationLevel = config.LEVELS.REDUCED;
        console.log('📉 降级到: 减少功能模式');
        break;
      case config.LEVELS.REDUCED:
        this._degradationLevel = config.LEVELS.MINIMAL;
        console.log('📉 降级到: 最小功能模式');
        break;
      case config.LEVELS.MINIMAL:
        this._degradationLevel = config.LEVELS.OFFLINE;
        console.log('📉 降级到: 离线模式');
        break;
      default:
        console.log('⚠️ 已达到最低降级级别');
    }
  }

  // 服务恢复
  async recoverService() {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.OFFLINE:
        this._degradationLevel = config.LEVELS.MINIMAL;
        console.log('📈 升级到: 最小功能模式');
        break;
      case config.LEVELS.MINIMAL:
        this._degradationLevel = config.LEVELS.REDUCED;
        console.log('📈 升级到: 减少功能模式');
        break;
      case config.LEVELS.REDUCED:
        this._degradationLevel = config.LEVELS.FULL;
        console.log('📈 升级到: 完整功能模式');
        break;
      default:
        console.log('✅ 已在完整功能模式');
    }
  }

  // 根据降级级别调整功能
  getAdjustedFunctionality(operation) {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    switch (this._degradationLevel) {
      case config.LEVELS.FULL:
        return operation;
      case config.LEVELS.REDUCED:
        // 减少功能：简化复杂操作
        return this.simplifyOperation(operation);
      case config.LEVELS.MINIMAL:
        // 最小功能：只保留核心功能
        return this.getMinimalOperation(operation);
      case config.LEVELS.OFFLINE:
        // 离线模式：返回缓存结果或默认值
        return this.getOfflineOperation(operation);
      default:
        return operation;
    }
  }

  // 简化操作
  simplifyOperation(operation) {
    return async () => {
      console.log('🔄 使用简化功能模式');
      try {
        return await operation();
      } catch (error) {
        console.log('⚠️ 简化模式失败，尝试最小功能...');
        return this.getMinimalOperation(operation)();
      }
    };
  }

  // 最小操作
  getMinimalOperation(operation) {
    return async () => {
      console.log('🔄 使用最小功能模式');
      // 返回基本功能或缓存结果
      return this.getCachedResult(operation) || { success: false, message: '最小功能模式' };
    };
  }

  // 离线操作
  getOfflineOperation(operation) {
    return async () => {
      console.log('🔄 使用离线模式');
      // 返回缓存结果或默认值
      return this.getCachedResult(operation) || { success: false, message: '离线模式' };
    };
  }

  // 获取缓存结果
  getCachedResult(operation) {
    // 简单的缓存实现
    const cacheKey = this.getCacheKey(operation);
    return this._cache && this._cache[cacheKey];
  }

  // 生成缓存键
  getCacheKey(operation) {
    return typeof operation === 'string' ? operation : operation.toString();
  }

  // 更新性能指标
  updatePerformanceMetrics(success, responseTime) {
    const config = this.constructor.DEGRADATION_CONFIG;
    
    // 更新错误率
    if (success) {
      this._performanceMetrics.consecutiveFailures = 0;
      this._performanceMetrics.lastSuccessTime = Date.now();
    }

  // 用户体验优化配置
  static UX_CONFIG = {
    ENABLED: true,
    FEEDBACK: {
      ENABLED: true,
      STYLES: {
        SUCCESS: '✅',
        WARNING: '⚠️',
        ERROR: '❌',
        INFO: 'ℹ️',
        LOADING: '🔄'
      }
    },
    MESSAGES: {
      DEGRADATION: {
        TITLE: '服务性能优化',
        FULL: '所有功能正常运行',
        REDUCED: '部分功能已优化，性能提升中',
        MINIMAL: '核心功能正常运行，部分功能暂时不可用',
        OFFLINE: '离线模式，使用缓存数据'
      },
      ERRORS: {
        TIMEOUT: '请求超时，正在重试...',
        CONNECTION: '连接问题，正在重新连接...',
        GENERAL: '服务暂时不可用，请稍后重试'
      },
      RECOVERY: {
        TITLE: '服务恢复',
        MESSAGE: '所有功能已恢复正常'
      }
    },
    NOTIFICATIONS: {
      ENABLED: true,
      CONSOLE: true,
      USER_INTERFACE: false
    }
  };

  // 显示用户反馈
  showUserFeedback(type, message, details = '') {
    const config = this.constructor.UX_CONFIG;
    
    if (!config.ENABLED || !config.FEEDBACK.ENABLED) {
      return;
    }
    
    const style = config.FEEDBACK.STYLES[type] || config.FEEDBACK.STYLES.INFO;
    const fullMessage = details ? `${style} ${message} (${details})` : `${style} ${message}`;
    
    if (config.NOTIFICATIONS.CONSOLE) {
      console.log(fullMessage);
    }
    
    if (config.NOTIFICATIONS.USER_INTERFACE && typeof window !== 'undefined') {
      // 可以在这里添加UI通知逻辑
      this.showUINotification(type, message, details);
    }
  }

  // 显示UI通知
  showUINotification(type, message, details) {
    // 简单的浏览器通知实现
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message, {
        body: details,
        icon: this.getNotificationIcon(type)
      });
    }
  }

  // 获取通知图标
  getNotificationIcon(type) {
    const icons = {
      success: '/icons/success.png',
      warning: '/icons/warning.png',
      error: '/icons/error.png',
      info: '/icons/info.png'
    };
    return icons[type] || icons.info;
  }

  // 显示降级状态
  showDegradationStatus() {
    const config = this.constructor.UX_CONFIG;
    const degradationConfig = this.constructor.DEGRADATION_CONFIG;
    
    const status = config.MESSAGES.DEGRADATION[this._degradationLevel];
    this.showUserFeedback('INFO', config.MESSAGES.DEGRADATION.TITLE, status);
  }

  // 显示错误信息
  showErrorMessage(errorType, customMessage = '') {
    const config = this.constructor.UX_CONFIG;
    
    const message = customMessage || config.MESSAGES.ERRORS[errorType] || config.MESSAGES.ERRORS.GENERAL;
    this.showUserFeedback('ERROR', message, errorType);
  }

  // 显示恢复信息
  showRecoveryStatus() {
    const config = this.constructor.UX_CONFIG;
    
    this.showUserFeedback('SUCCESS', config.MESSAGES.RECOVERY.TITLE, config.MESSAGES.RECOVERY.MESSAGE);
  }

  // 增强的错误处理
  async handleEnhancedError(error, operationType = 'REQUEST') {
    const startTime = Date.now();
    
    // 显示错误信息
    this.showErrorMessage('GENERAL', error.message);
    
    // 更新性能指标
    this.updatePerformanceMetrics(false, Date.now() - startTime);
    
    // 尝试降级处理
    if (this._degradationLevel !== this.constructor.DEGRADATION_CONFIG.LEVELS.OFFLINE) {
      console.log('🔄 尝试降级处理...');
      return this.handleWithDegradation(operationType);
    }

  // 增强的错误信息
  _errorMessages = {
    CONNECTION: {
      title: '连接错误',
      description: '无法连接到服务',
      suggestions: [
        '检查网络连接',
        '确认服务正在运行',
        '检查防火墙设置'
      ]
    },
    TIMEOUT: {
      title: '超时错误',
      description: '请求响应时间过长',
      suggestions: [
        '检查网络延迟',
        '减少请求复杂度',
        '稍后重试'
      ]
    },
    AUTHENTICATION: {
      title: '认证错误',
      description: '身份验证失败',
      suggestions: [
        '检查凭据是否正确',
        '重新登录',
        '联系管理员'
      ]
    },
    RATE_LIMIT: {
      title: '频率限制',
      description: '请求过于频繁',
      suggestions: [
        '降低请求频率',
        '实现请求缓存',
        '等待后重试'
      ]
    },
    GENERAL: {
      title: '服务错误',
      description: '服务暂时不可用',
      suggestions: [
        '稍后重试',
        '检查服务状态',
        '联系技术支持'
      ]
    }
  };

  // 生成详细的错误信息
  generateDetailedError(errorType, customMessage = '') {
    const errorInfo = this._errorMessages[errorType] || this._errorMessages.GENERAL;
    
    const errorDetails = {
      type: errorType,
      title: errorInfo.title,
      description: customMessage || errorInfo.description,
      suggestions: errorInfo.suggestions,
      timestamp: new Date().toISOString(),
      degradationLevel: this._degradationLevel,
      systemStatus: this.getSystemStatus()
    };
    
    return errorDetails;
  }

  // 获取系统状态
  getSystemStatus() {
    return {
      degradationLevel: this._degradationLevel,
      errorRate: this._performanceMetrics.errorRate,
      avgResponseTime: this._performanceMetrics.avgResponseTime,
      consecutiveFailures: this._performanceMetrics.consecutiveFailures,
      lastSuccessTime: this._performanceMetrics.lastSuccessTime,
      uptime: Date.now() - this._performanceMetrics.lastSuccessTime
    };
  }

  // 显示详细错误信息
  showDetailedError(errorType, customMessage = '') {
    const errorDetails = this.generateDetailedError(errorType, customMessage);
    
    console.log('\n📋 详细错误信息:');
    console.log(`   类型: ${errorDetails.type}`);
    console.log(`   标题: ${errorDetails.title}`);
    console.log(`   描述: ${errorDetails.description}`);
    console.log(`   降级级别: ${errorDetails.degradationLevel}`);
    console.log(`   时间: ${errorDetails.timestamp}`);
    
    console.log('\n💡 建议解决方案:');
    errorDetails.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
    
    console.log('\n📊 系统状态:');
    console.log(`   错误率: ${(errorDetails.systemStatus.errorRate * 100).toFixed(1)}%`);
    console.log(`   平均响应时间: ${errorDetails.systemStatus.avgResponseTime}ms`);
    console.log(`   连续失败次数: ${errorDetails.systemStatus.consecutiveFailures}`);
    
    return errorDetails;
  }

    
    // 如果已经是离线模式，抛出错误
    throw new Error(`离线模式无法处理请求: ${error.message}`);
  }

  // 降级处理
  async handleWithDegradation(operationType) {
    const adjustedOperation = this.getAdjustedFunctionality(() => {
      // 返回默认结果
      return { success: false, message: '降级模式处理' };
    });
    
    return await adjustedOperation();
  }
 else {
      this._performanceMetrics.consecutiveFailures++;
    }
    
    // 更新平均响应时间
    this._performanceMetrics.avgResponseTime = 
      (this._performanceMetrics.avgResponseTime + responseTime) / 2;
    
    // 计算错误率（简化实现）
    this._performanceMetrics.errorRate = 
      this._performanceMetrics.consecutiveFailures / 10; // 假设10次操作
    
    // 定期评估降级需求
    if (this._performanceMetrics.consecutiveFailures % 3 === 0) {
      this.evaluateDegradationNeed();
    }
  }

  static TIMEOUT_CONFIG = {
    CONNECTION: 10000,
    REQUEST: 30000,
    TOOL_CALL: 60000,
    HEALTH_CHECK: 5000,
    RECONNECT: 3000
  };

  static RETRY_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 10000
  };

  constructor(scriptPath, options = {}) {
    super();
    this.scriptPath = scriptPath;
    this.options = options;
    this.process = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.process = spawn('node', [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...this.options
      });
      this.isConnected = true;
      this.emit('connected');
      console.log('✅ Connected to MCP server');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async sendRequest(method, params = {}) {
    const timeout = this.constructor.TIMEOUT_CONFIG.REQUEST;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestId = Math.random().toString(36).substr(2, 9);
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };

      return new Promise((resolve, reject) => {
        const onData = (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.id === requestId) {
              this.process.stdout.off('data', onData);
              clearTimeout(timeoutId);
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
            }
          } catch (error) {
            reject(error);
          }
        };

        this.process.stdout.on('data', onData);
        this.process.stdin.write(JSON.stringify(request) + '\n');
      });
    } catch (error) {
      throw error;
    }
  }

  async callTool(toolName, args = {}) {
    return this.sendRequest('tools/call', {
      tool: toolName,
      args
    });
  }

  async healthCheck() {
    return this.sendRequest('health/check', {});
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.isConnected = false;
    this.emit('disconnected');
  }
}
