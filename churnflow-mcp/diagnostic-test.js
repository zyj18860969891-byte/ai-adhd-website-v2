#!/usr/bin/env node

/**
 * 详细的 ChurnFlow MCP 服务诊断测试
 */

console.log('🔍 开始详细诊断 ChurnFlow MCP 服务...');

// 日志函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.error(`[${timestamp}] ${prefix} ${message}`);
}

log('诊断开始', 'info');

async function runDiagnostics() {
  try {
    log('步骤 1: 测试基本模块导入...', 'info');
    
    // 测试 MCP SDK 导入
    try {
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      log('✅ MCP SDK 导入成功', 'info');
    } catch (error) {
      log(`❌ MCP SDK 导入失败: ${error.message}`, 'error');
      return;
    }

    log('步骤 2: 测试配置文件...', 'info');
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.resolve(process.cwd(), 'churn.config.json');
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      log('✅ 配置文件加载成功', 'info');
      log(`  - Collections: ${config.collectionsPath}`, 'info');
      log(`  - Tracking: ${config.trackingPath}`, 'info');
      log(`  - Crossref: ${config.crossrefPath}`, 'info');
    } catch (error) {
      log(`❌ 配置文件加载失败: ${error.message}`, 'error');
      return;
    }

    log('步骤 3: 测试数据文件...', 'info');
    
    // 测试 crossref 文件
    try {
      const crossrefData = await fs.readFile(config.crossrefPath, 'utf-8');
      const crossref = JSON.parse(crossrefData);
      log(`✅ Crossref 文件加载成功，条目数: ${crossref.length}`, 'info');
    } catch (error) {
      log(`❌ Crossref 文件加载失败: ${error.message}`, 'error');
      return;
    }

    log('步骤 4: 测试数据目录...', 'info');
    const dataDirs = [
      config.collectionsPath,
      config.trackingPath,
      path.dirname(config.crossrefPath)
    ];
    
    for (const dir of dataDirs) {
      const dirPath = path.resolve(process.cwd(), dir);
      try {
        await fs.access(dirPath);
        log(`✅ 目录存在: ${dir}`, 'info');
      } catch (error) {
        log(`❌ 目录不存在: ${dir}`, 'error');
        return;
      }
    }

    log('步骤 5: 测试追踪器文件...', 'info');
    try {
      const crossrefData = await fs.readFile(config.crossrefPath, 'utf-8');
      const crossref = JSON.parse(crossrefData);
      
      for (const entry of crossref) {
        const trackerPath = path.resolve(process.cwd(), entry.trackerFile);
        try {
          await fs.access(trackerPath);
          log(`✅ 追踪器文件存在: ${entry.trackerFile}`, 'info');
        } catch (error) {
          log(`⚠️ 追踪器文件不存在: ${entry.trackerFile}`, 'warn');
        }
        
        const collectionPath = path.resolve(process.cwd(), entry.collectionFile);
        try {
          await fs.access(collectionPath);
          log(`✅ 集合文件存在: ${entry.collectionFile}`, 'info');
        } catch (error) {
          log(`⚠️ 集合文件不存在: ${entry.collectionFile}`, 'warn');
        }
      }
    } catch (error) {
      log(`❌ 追踪器文件测试失败: ${error.message}`, 'error');
      return;
    }

    log('步骤 6: 测试 CaptureEngine 导入...', 'info');
    try {
      const { CaptureEngine } = await import('./dist/core/CaptureEngine.js');
      log('✅ CaptureEngine 导入成功', 'info');
    } catch (error) {
      log(`❌ CaptureEngine 导入失败: ${error.message}`, 'error');
      log(`堆栈: ${error.stack}`, 'error');
      return;
    }

    log('步骤 7: 尝试初始化 CaptureEngine...', 'info');
    try {
      const { CaptureEngine } = await import('./dist/core/CaptureEngine.js');
      const captureEngine = new CaptureEngine(config);
      await captureEngine.initialize();
      log('✅ CaptureEngine 初始化成功', 'info');
    } catch (error) {
      log(`❌ CaptureEngine 初始化失败: ${error.message}`, 'error');
      log(`堆栈: ${error.stack}`, 'error');
      return;
    }

    log('🎉 所有诊断测试通过！', 'info');
    log('✅ ChurnFlow MCP 服务应该可以正常启动', 'info');
    
  } catch (error) {
    log(`❌ 诊断失败: ${error.message}`, 'error');
    log(`堆栈: ${error.stack}`, 'error');
  }
}

// 运行诊断
runDiagnostics().then(() => {
  log('诊断完成', 'info');
}).catch(error => {
  log(`诊断过程中发生错误: ${error.message}`, 'error');
});