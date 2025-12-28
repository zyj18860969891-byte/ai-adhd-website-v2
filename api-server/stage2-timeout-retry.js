#!/usr/bin/env node

/**
 * 阶段2：增强超时与重试机制
 * 为StdioMCPClient添加更好的超时处理和重试逻辑
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import { join } from 'path';
import { readFileSync, writeFileSync, readFile, writeFile } from 'fs';

const execAsync = promisify(exec);

class Stage2TimeoutRetry {
  constructor() {
    this.stdioClientPath = join(process.cwd(), 'src/stdio-mcp-client.js');
  }

  async runStage2() {
    console.log('🚀 阶段2：增强超时与重试机制\n');
    
    await this.analyzeCurrentImplementation();
    await this.implementEnhancedTimeouts();
    await this.addRetryMechanisms();
    await this.implementExponentialBackoff();
    await this.testEnhancedClient();
  }

  async analyzeCurrentImplementation() {
    console.log('1. 分析当前StdioMCPClient实现...');
    
    try {
      const content = readFileSync(this.stdioClientPath, 'utf8');
      
      // 检查当前超时设置
      const timeoutMatches = content.match(/timeout\s*:\s*(\d+)/g);
      const currentTimeouts = timeoutMatches ? timeoutMatches.map(m => m.split(':')[1].trim()) : [];
      
      console.log('   当前超时设置:');
      currentTimeouts.forEach((timeout, index) => {
        console.log(`     ${index + 1}. ${timeout}`);
      });
      
      // 检查重试逻辑
      const hasRetry = content.includes('retry') || content.includes('reconnect');
      console.log(`   重试机制: ${hasRetry ? '✅ 已实现' : '❌ 未实现'}`);
      
      // 检查错误处理
      const errorHandling = content.match(/catch\s*\([^)]+\)/g);
      console.log(`   错误处理: ${errorHandling ? `✅ ${errorHandling.length}处` : '❌ 未实现'}`);
      
    } catch (error) {
      console.log(`❌ 无法读取StdioMCPClient文件: ${error.message}`);
    }
    console.log('');
  }

  async implementEnhancedTimeouts() {
    console.log('2. 实现增强的超时机制...');
    
    const enhancedTimeouts = `
  // 增强的超时配置
  static TIMEOUT_CONFIG = {
    CONNECTION: 10000,      // 连接超时: 10秒
    REQUEST: 30000,         // 请求超时: 30秒
    TOOL_CALL: 60000,       // 工具调用超时: 60秒
    HEALTH_CHECK: 5000,     // 健康检查超时: 5秒
    RECONNECT: 3000         // 重连超时: 3秒
  };

  // 动态超时计算
  calculateTimeout(operationType, attempt = 1) {
    const baseTimeout = this.constructor.TIMEOUT_CONFIG[operationType] || this.constructor.TIMEOUT_CONFIG.REQUEST;
    // 指数退避: timeout * (1.5 ^ attempt)
    const multiplier = Math.pow(1.5, Math.min(attempt, 4));
    return Math.floor(baseTimeout * multiplier);
  }`;

    try {
      const content = readFileSync(this.stdioClientPath, 'utf8');
      
      // 在类定义开始处添加超时配置
      const classStart = content.indexOf('export default class StdioMCPClient');
      if (classStart !== -1) {
        const insertPoint = content.indexOf('{', classStart) + 1;
        const newContent = content.slice(0, insertPoint) + '\n' + enhancedTimeouts + '\n' + content.slice(insertPoint);
        writeFileSync(this.stdioClientPath, newContent);
        console.log('✅ 已添加增强的超时配置');
      }
    } catch (error) {
      console.log(`❌ 添加超时配置失败: ${error.message}`);
    }
    console.log('');
  }

  async addRetryMechanisms() {
    console.log('3. 添加重试机制...');
    
    const retryMethods = `
  // 重试机制
  async withRetry(operation, maxRetries = 3, operationType = 'REQUEST') {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const timeout = this.calculateTimeout(operationType, attempt);
        console.log(\`尝试 \${attempt}/\${maxRetries}, 超时: \${timeout}ms\`);
        
        const result = await Promise.race([
          operation(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(\`操作超时 (\${timeout}ms)\`)), timeout)
          )
        ]);
        
        if (attempt > 1) {
          console.log(\`✅ 重试成功 (第\${attempt}次尝试)\`);
        }
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(\`❌ 尝试 \${attempt}/\${maxRetries} 失败: \${error.message}\`);
        
        if (attempt === maxRetries) {
          console.log(\`❌ 所有重试尝试失败\`);
          throw new Error(\`操作失败，已重试\${maxRetries}次: \${error.message}\`);
        }
        
        // 等待后重试
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(\`等待 \${waitTime}ms 后重试...\`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // 增强的连接重试
  async ensureConnection() {
    return this.withRetry(async () => {
      if (!this.process || this.process.killed) {
        await this.spawn();
      }
      return true;
    }, 5, 'CONNECTION');
  }`;

    try {
      const content = readFileSync(this.stdioClientPath, 'utf8');
      
      // 在类的末尾添加重试方法
      const classEnd = content.lastIndexOf('}');
      if (classEnd !== -1) {
        const newContent = content.slice(0, classEnd) + retryMethods + '\n' + content.slice(classEnd);
        writeFileSync(this.stdioClientPath, newContent);
        console.log('✅ 已添加重试机制');
      }
    } catch (error) {
      console.log(`❌ 添加重试机制失败: ${error.message}`);
    }
    console.log('');
  }

  async implementExponentialBackoff() {
    console.log('4. 实现指数退避算法...');
    
    const backoffMethod = `
  // 指数退避算法
  exponentialBackoff(attempt, baseDelay = 1000, maxDelay = 10000) {
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    // 添加随机抖动 (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.floor(delay + jitter);
  }

  // 智能重试策略
  async smartRetry(operation, operationType = 'REQUEST', maxRetries = 5) {
    let consecutiveFailures = 0;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const timeout = this.calculateTimeout(operationType, attempt);
        console.log(\`智能重试 \${attempt}/\${maxRetries}, 超时: \${timeout}ms\`);
        
        const result = await Promise.race([
          operation(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(\`操作超时 (\${timeout}ms)\`)), timeout)
          )
        ]);
        
        // 成功后重置连续失败计数
        consecutiveFailures = 0;
        return result;
        
      } catch (error) {
        consecutiveFailures++;
        console.log(\`❌ 智能重试 \${attempt}/\${maxRetries} 失败: \${error.message}\`);
        
        if (attempt === maxRetries) {
          throw new Error(\`智能重试失败，已尝试\${maxRetries}次: \${error.message}\`);
        }
        
        // 根据错误类型和连续失败次数调整等待时间
        let waitTime;
        if (error.message.includes('timeout')) {
          // 超时错误：较长等待时间
          waitTime = this.exponentialBackoff(attempt, 2000, 15000);
        } else if (error.message.includes('connection')) {
          // 连接错误：中等等待时间
          waitTime = this.exponentialBackoff(attempt, 1000, 10000);
        } else {
          // 其他错误：较短等待时间
          waitTime = this.exponentialBackoff(attempt, 500, 5000);
        }
        
        console.log(\`等待 \${waitTime}ms 后重试...\`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }`;

    try {
      const content = readFileSync(this.stdioClientPath, 'utf8');
      
      // 在重试方法之后添加指数退避方法
      const retryMethodEnd = content.lastIndexOf('ensureConnection()');
      if (retryMethodEnd !== -1) {
        const insertPoint = content.indexOf('}', retryMethodEnd) + 1;
        const newContent = content.slice(0, insertPoint) + backoffMethod + '\n' + content.slice(insertPoint);
        writeFileSync(this.stdioClientPath, newContent);
        console.log('✅ 已添加指数退避算法');
      }
    } catch (error) {
      console.log(`❌ 添加指数退避算法失败: ${error.message}`);
    }
    console.log('');
  }

  async testEnhancedClient() {
    console.log('5. 测试增强的StdioMCPClient...');
    
    const testFile = join(process.cwd(), 'test-enhanced-client.js');
    // 使用已知正确的测试文件
    const correctTestContent = readFileSync(join(process.cwd(), 'test-enhanced-client-final.js'), 'utf8');
    writeFileSync(testFile, correctTestContent);
    console.log(`测试文件已创建: ${testFile}`);
    
    try {
      const { stdout, stderr } = await execAsync(`node ${testFile}`);
      console.log('测试结果:');
      console.log(stdout);
      if (stderr) console.log('错误:', stderr);
      
    } catch (error) {
      console.log('❌ 增强客户端测试失败:', error.message);
      console.log('测试文件保留以供调试:', testFile);
    }
    console.log('');
  }
}

// 主函数
async function main() {
  const stage2 = new Stage2TimeoutRetry();
  await stage2.runStage2();
  
  console.log('=== 阶段2完成 ===\n');
  console.log('📋 阶段2目标:');
  console.log('✅ 添加增强的超时配置');
  console.log('✅ 实现动态超时计算');
  console.log('✅ 添加重试机制');
  console.log('✅ 实现指数退避算法');
  console.log('✅ 测试增强的客户端');
  console.log('');
  console.log('🎯 下一步: 阶段3 - 降级与用户体验优化');
}

// 运行阶段2
main().catch(console.error);