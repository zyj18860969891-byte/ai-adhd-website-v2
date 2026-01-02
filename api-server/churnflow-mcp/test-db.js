#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'churnflow.db');
console.log('Testing database:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📊 Tables:', tables.map(t => t.name).join(', '));
  
  // Check contexts
  const contexts = db.prepare("SELECT * FROM contexts").all();
  console.log('\n👥 Contexts:', contexts.length);
  contexts.forEach(c => console.log(`  - ${c.name} (${c.display_name})`));
  
  // Check preferences
  const prefs = db.prepare("SELECT * FROM preferences").all();
  console.log('\n⚙️ Preferences:', prefs.length);
  
  // Check captures (should be empty initially)
  const captures = db.prepare("SELECT * FROM captures").all();
  console.log('\n📝 Captures:', captures.length);
  
  db.close();
  console.log('\n✅ Database test passed!');
} catch (error) {
  console.error('\n❌ Database test failed:', error.message);
  process.exit(1);
}