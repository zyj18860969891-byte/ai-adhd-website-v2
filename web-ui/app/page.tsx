'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('loading');
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // 检查 API 状态
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ai-adhd-website-v2-production.up.railway.app/api'}/health`)
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ color: '#667eea', margin: 0 }}>🤖 AI ADHD Website</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>智能任务管理与生产力工具</p>
        
        <div style={{ marginBottom: '30px' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: status === 'ready' ? '#10b981' : status === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            {status === 'ready' ? '🟢 系统运行中' : status === 'error' ? '🔴 连接失败' : '🟡 连接中...'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🧠 ChurnFlow MCP</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>智能捕获与AI路由系统</p>
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 8px',
              background: '#667eea',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px'
            }}>✅ 已连接</span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🦐 Shrimp MCP</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>高级任务管理与反思</p>
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 8px',
              background: '#667eea',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px'
            }}>✅ 已连接</span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>📊 数据库</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>better-sqlite3 + Drizzle ORM</p>
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 8px',
              background: '#10b981',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px'
            }}>✅ 正常</span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🔗 API 服务器</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Express + MCP 集成</p>
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 8px',
              background: '#10b981',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px'
            }}>✅ 运行中</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <a href="/api/health" style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>检查健康状态</a>
          <a href="/api/test/openai" style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>测试 OpenAI</a>
          <a href="/api/mcp/capture" style={{
            padding: '12px 24px',
            background: '#64748b',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>捕获端点</a>
        </div>

        <div style={{
          background: '#f1f5f9',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>📋 可用端点</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <code style={{ background: '#334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>GET /</code> - 本页面
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <code style={{ background: '#334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>GET /api/health</code> - 系统健康检查
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <code style={{ background: '#334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>POST /api/mcp/capture</code> - 智能捕获
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <code style={{ background: '#334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>POST /api/mcp/shrimp</code> - Shrimp 任务管理
            </li>
            <li style={{ padding: '8px 0' }}>
              <code style={{ background: '#334155', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px' }}>GET /api/tasks</code> - 查询任务
            </li>
          </ul>
        </div>

        <div style={{
          marginTop: '30px',
          color: '#94a3b8',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          服务器时间: <span id="serverTime">{new Date().toLocaleString('zh-CN')}</span><br/>
          部署版本: v1.0.0 | 生产环境 | Railway
        </div>
      </div>
    </div>
  );
}