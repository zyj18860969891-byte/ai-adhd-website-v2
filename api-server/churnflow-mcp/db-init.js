#!/usr/bin/env node

/**
 * 数据库初始化脚本 (Node.js 版本)
 * 用于替代 sqlite3 CLI 种子初始化
 * 
 * 这个脚本设置 ChurnFlow 数据库并导入初始数据
 * 无需依赖 sqlite3 CLI，可以在任何有 Node.js 的系统上运行
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try multiple possible locations
let dbPath = process.env.CHURN_DB_PATH;
if (!dbPath) {
  const cwd = process.cwd();
  
  // If running from /app/churnflow-mcp, use that
  if (cwd.includes('churnflow-mcp')) {
    dbPath = path.join(cwd, 'churnflow.db');
  } else {
    // Running from /app, create in churnflow-mcp subdirectory
    dbPath = path.join(cwd, 'churnflow-mcp', 'churnflow.db');
  }
}

console.log('🗄️  ChurnFlow 数据库初始化');
console.log('=====================================');
console.log(`📁 数据库路径: ${dbPath}\n`);

try {
  // 1. 打开数据库连接
  console.log('1️⃣ 连接数据库...');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  console.log('   ✅ 数据库连接成功\n');

  // 2. 创建表结构（Drizzle 迁移应该已创建，但我们确保它们存在）
  console.log('2️⃣ 检查数据库表...');
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all();
  console.log(`   ✅ 找到 ${tables.length} 个表\n`);

  // 3. 种子数据：插入初始上下文
  console.log('3️⃣ 导入初始数据...');
  
  // 尝试插入上下文
  try {
    const insertContext = db.prepare(`
      INSERT OR IGNORE INTO contexts (id, name, display_name, description, color, keywords, patterns, active, priority, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const contexts = [
      ['ctx-work', 'work', 'Work', 'Professional tasks and projects', '#1976d2', '["work","business","meeting","project","client"]', '[]', 1, 10],
      ['ctx-personal', 'personal', 'Personal', 'Personal tasks and life management', '#43a047', '["personal","home","family","health","finance"]', '[]', 1, 8],
      ['ctx-system', 'system', 'System', 'ChurnFlow system maintenance', '#616161', '["system","config","setup","maintenance"]', '[]', 1, 5],
    ];

    let contextCount = 0;
    for (const ctx of contexts) {
      const result = insertContext.run(...ctx);
      if (result.changes > 0) {
        contextCount++;
      }
    }
    console.log(`   ✅ 插入 ${contextCount} 个上下文\n`);
  } catch (error) {
    console.log(`   ℹ️ 上下文表可能已存在数据，跳过: ${error.message}\n`);
  }

  // 4. 种子数据：插入偏好设置
  try {
    const insertPref = db.prepare(`
      INSERT OR IGNORE INTO preferences (id, key, value, type, category, description, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const prefs = [
      ['pref-review-batch', 'review_batch_size', '10', 'number', 'review', 'Number of items to review in a batch'],
      ['pref-confidence', 'confidence_threshold', '0.7', 'number', 'ai', 'Minimum confidence for auto-routing'],
      ['pref-color', 'color_output', 'true', 'boolean', 'ui', 'Enable color output in UI'],
    ];

    let prefCount = 0;
    for (const pref of prefs) {
      const result = insertPref.run(...pref);
      if (result.changes > 0) {
        prefCount++;
      }
    }
    console.log(`   ✅ 插入 ${prefCount} 个偏好设置\n`);
  } catch (error) {
    console.log(`   ℹ️ 偏好设置表可能已存在数据，跳过: ${error.message}\n`);
  }

  // 5. 验证数据
  console.log('4️⃣ 验证数据...');
  try {
    const contextCount = db.prepare('SELECT COUNT(*) as count FROM contexts').get();
    const prefCount = db.prepare('SELECT COUNT(*) as count FROM preferences').get();
    
    console.log(`   ✅ 上下文记录: ${contextCount.count}`);
    console.log(`   ✅ 偏好设置记录: ${prefCount.count}\n`);
  } catch (error) {
    console.log(`   ℹ️ 无法查询数据: ${error.message}\n`);
  }

  // 6. 关闭连接
  db.close();
  console.log('5️⃣ 关闭数据库连接...');
  console.log('   ✅ 连接已关闭\n');

  console.log('=====================================');
  console.log('🎉 数据库初始化完成！');
  console.log('   数据库已准备就绪，可以开始使用了。');

  process.exit(0);
} catch (error) {
  console.error('\n❌ 数据库初始化失败:', error.message);
  console.error('详细信息:', error);
  process.exit(1);
}
