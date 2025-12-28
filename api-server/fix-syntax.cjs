// 修复 stdio-mcp-client.js 中的语法错误
const fs = require('fs');
const filePath = 'e:\\MultiModel\\ai-adhd-website\\api-server\\src\\stdio-mcp-client.js';

// 读取文件
let content = fs.readFileSync(filePath, 'utf8');

// 修复缺少右引号的问题
content = content.replace(/console\.log\('🔴 降级到 最小功能模式\);?/g, "console.log('🔴 降级到 最小功能模式');");
content = content.replace(/console\.log\('💔 已达到最低降级级别\);?/g, "console.log('💔 已达到最低降级级别');");
content = content.replace(/console\.log\('🟡 升级到 最小功能模式\);?/g, "console.log('🟡 升级到 最小功能模式');");
content = content.replace(/console\.log\('🟢 使用简化功能模式\);?/g, "console.log('🟢 使用简化功能模式');");
content = content.replace(/console\.log\('馃攧 浣跨敤最小功能模式\);?/g, "console.log('🟢 使用最小功能模式');");

// 修复对象属性中的字符串
content = content.replace(/'鉁?/g, "'✅'");
content = content.replace(/'鈿狅笍'/g, "'⚠️'");
content = content.replace(/'鉂?/g, "'❌'");
content = content.replace(/'鈩癸笍'/g, "'ℹ️'");

// 修复 UX_CONFIG 中的字符串
content = content.replace(/'所有功能正常运行/g, "'所有功能正常运行'");
content = content.replace(/部分功能已优化，性能提升中,/g, "部分功能已优化，性能提升中',");
content = content.replace(/核心功能正常运行，部分功能暂时不可用'/g, "'核心功能正常运行，部分功能暂时不可用'");
content = content.replace(/离线模式锛屼娇鐢ㄧ紦瀛樻暟鎹?/g, "'离线模式，使用缓存数据'");
content = content.replace(/服务暂时不可用，请稍后重试/g, "'服务暂时不可用，请稍后重试'");

// 修复 ERROR_MESSAGES 中的字符串
content = content.replace(/无法连接到服务,/g, "'无法连接到服务',");
content = content.replace(/检查网络连接,/g, "'检查网络连接',");
content = content.replace(/确认服务正在运行'/g, "'确认服务正在运行'");
content = content.replace(/检查网络延迟,/g, "'检查网络延迟',");
content = content.replace(/减少请求复杂度,/g, "'减少请求复杂度',");
content = content.replace(/稍后重试'/g, "'稍后重试'");
content = content.replace(/检查凭证是否正确,/g, "'检查凭证是否正确',");
content = content.replace(/重新登录'/g, "'重新登录'");
content = content.replace(/联系管理员/g, "'联系管理员'");
content = content.replace(/等待后重试/g, "'等待后重试'");
content = content.replace(/服务暂时不可用,/g, "'服务暂时不可用',");
content = content.replace(/检查服务状态,/g, "'检查服务状态',");
content = content.replace(/联系技术支持/g, "'联系技术支持'");

// 修复其他问题
content = content.replace(/离线模式鏃犳硶澶勭悊璇锋眰/g, '离线模式无法处理请求');
content = content.replace(/鏈嶅姟鎭㈠/g, '服务恢复');

// 修复 message 属性
content = content.replace(/message: '最小功能模式/g, "message: '最小功能模式'");

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('Syntax errors fixed');