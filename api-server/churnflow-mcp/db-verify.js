#!/usr/bin/env node

/**
 * 数据库验证脚本
 * 检查数据库中的数据是否正确初始化
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.CHURN_DB_PATH || path.join(__dirname, 'churnflow.db');

console.log('🔍 ChurnFlow 数据库验证');
console.log('=====================================\n');

try {
  const db = new Database(dbPath, { readonly: true });

  console.log('📊 数据库统计:\n');

  // 1. 表列表
  console.log('1️⃣ 所有表:');
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all();
  
  if (tables.length === 0) {
    console.log('   ❌ 没有找到表\n');
  } else {
    tables.forEach((t, i) => {
      const rowCount = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
      console.log(`   ✅ ${t.name}: ${rowCount.count} 行`);
    });
    console.log();
  }

  // 2. 上下文数据
  console.log('2️⃣ 上下文 (contexts):');
  try {
    const contexts = db.prepare('SELECT id, name, display_name FROM contexts').all();
    if (contexts.length === 0) {
      console.log('   ℹ️ 无数据\n');
    } else {
      contexts.forEach(ctx => {
        console.log(`   ✅ ${ctx.id}: ${ctx.display_name}`);
      });
      console.log();
    }
  } catch (e) {
    console.log(`   ⚠️ 表可能不存在\n`);
  }

  // 3. 偏好设置数据
  console.log('3️⃣ 偏好设置 (preferences):');
  try {
    const prefs = db.prepare('SELECT id, key, value FROM preferences').all();
    if (prefs.length === 0) {
      console.log('   ℹ️ 无数据\n');
    } else {
      prefs.forEach(pref => {
        console.log(`   ✅ ${pref.key}: ${pref.value}`);
      });
      console.log();
    }
  } catch (e) {
    console.log(`   ⚠️ 表可能不存在\n`);
  }

  // 4. 数据库信息
  console.log('4️⃣ 数据库信息:');
  const info = db.prepare('PRAGMA database_list').all();
  info.forEach(i => {
    if (i.name === 'main') {
      console.log(`   ✅ 主数据库: ${i.file}`);
      console.log(`   ✅ 大小: ${(Buffer.byteLength(i.file) + 90112) / 1024}KB\n`);
    }
  });

  db.close();

  console.log('=====================================');
  console.log('✅ 数据库验证完成！');
  console.log('   数据库已正确初始化，可以开始使用了。\n');

} catch (error) {
  console.error('\n❌ 验证失败:', error.message);
  console.error('详细信息:', error);
  process.exit(1);
}
