#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'dist', 'index.js');

console.log('🧪 Testing ChurnFlow MCP Capture...\n');

// Create MCP request
const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "capture",
    arguments: {
      text: "这是一个测试任务，需要在今天完成",
      priority: "high",
      context: "work"
    }
  }
};

const child = spawn('node', [scriptPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

// Send request
child.stdin.write(JSON.stringify(request) + '\n');
child.stdin.end();

// Capture output
child.stdout.on('data', (data) => {
  const str = data.toString();
  output += str;
  
  // Check for capture result
  if (str.includes('Capture Successful') || str.includes('✅')) {
    console.log('✅ Capture response received!');
  }
  
  // Show relevant lines
  const lines = str.split('\n').filter(line => 
    line.includes('Capture') || 
    line.includes('Saved') || 
    line.includes('Tracker') ||
    line.includes('Confidence') ||
    line.includes('✅') ||
    line.includes('❌')
  );
  
  if (lines.length > 0) {
    lines.forEach(line => console.log('  ' + line.trim()));
  }
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

child.on('close', (code) => {
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (output.includes('Capture Successful')) {
    console.log('✅ CAPTURE: SUCCESS');
  } else if (output.includes('Database ready')) {
    console.log('✅ DATABASE: CONNECTED');
  } else {
    console.log('⚠️  Output:', output.substring(0, 200));
  }
  
  if (errorOutput) {
    console.log('\n📝 Full Output:');
    console.log(output);
  }
  
  process.exit(code === 0 ? 0 : 1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n⏱️  Timeout - killing process');
  child.kill();
  process.exit(1);
}, 10000);