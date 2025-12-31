const express = require('express');
const request = require('supertest');

// 导入修复后的index.js
const app = require('./src/index.js');

describe('API Server Root Route Fix', () => {
  test('should return welcome message on root path', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'AI ADHD Website API Server');
    expect(response.body).toHaveProperty('version', '2.0');
    expect(response.body).toHaveProperty('status', 'running');
    expect(response.body).toHaveProperty('endpoints');
  });

  test('should return health check on /api/health', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
  });

  test('should handle MCP endpoints', async () => {
    const response = await request(app)
      .post('/api/mcp/churnflow')
      .send({ action: 'health', data: {} });
    
    expect(response.status).toBe(200);
  });
});

console.log('测试脚本创建完成，可以运行: npm test test-root-route.js');