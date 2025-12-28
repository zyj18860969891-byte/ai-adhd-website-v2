#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { readdir } from 'fs/promises';

async function* walk(dir) {
  for await (const d of await readdir(dir, { withFileTypes: true })) {
    const entry = join(dir, d.name);
    if (d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules') {
      yield* walk(entry);
    } else if (d.isFile() && extname(d.name) === '.ts') {
      yield entry;
    }
  }
}

async function fixImports() {
  const srcDir = join(process.cwd(), 'src');
  
  for await (const filePath of walk(srcDir)) {
    console.log(`Processing: ${filePath}`);
    
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Replace .ts extensions in import/export statements
    // import ... from "./file.ts" -> import ... from "./file.js"
    // export ... from "./file.ts" -> export ... from "./file.js"
    content = content.replace(
      /from\s+['"](\.{1,2}\/[^'"]+)\.ts['"]/g,
      (match, path) => `from '${path}.js'`
    );
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`  Fixed imports in: ${filePath}`);
    }
  }
  
  console.log('Import fixes completed!');
}

fixImports().catch(console.error);