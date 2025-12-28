#!/usr/bin/env ts-node

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { spawn } from 'child_process'

async function main() {
  console.log('🧪 开始测试 ChurnFlow MCP 服务的所有工具...\n')

  // 直接启动服务进程
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  })

  // 监听服务进程输出
  serverProcess.stdout.on('data', (data) => {
    console.log(`[服务] ${data.toString().trim()}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.error(`[服务错误] ${data.toString().trim()}`)
  })

  serverProcess.on('close', (code) => {
    console.log(`[服务] 进程退出，代码: ${code}`)
  })

  // 等待服务启动
  console.log('⏳ 等待服务启动...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // 创建传输层
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
  })

  // 创建客户端
  const client = new Client(
    {
      name: 'churnflow-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    },
    transport,
  )

  try {
    // 连接到服务器
    console.log('📡 连接到 ChurnFlow MCP 服务...')
    await client.connect()
    console.log('✅ 连接成功！\n')

    // 1. 测试 ListTools - 列出所有可用工具
    console.log('📋 测试 ListTools 工具...')
    const listToolsResponse = await client.callTool({
      name: ListToolsRequestSchema.name,
      arguments: {},
    })
    console.log('✅ ListTools 响应:', JSON.stringify(listToolsResponse, null, 2))

    // 2. 测试 capture 工具
    console.log('\n📸 测试 capture 工具...')
    try {
      const captureResponse = await client.callTool({
        name: 'capture',
        arguments: {
          content: '测试捕获内容：这是一个测试任务',
          type: 'task',
          metadata: {
            source: 'test-client',
            priority: 'medium'
          }
        },
      })
      console.log('✅ capture 响应:', JSON.stringify(captureResponse, null, 2))
    } catch (error) {
      console.log('❌ capture 工具测试失败:', error.message)
    }

    // 3. 测试 status 工具
    console.log('\n📊 测试 status 工具...')
    try {
      const statusResponse = await client.callTool({
        name: 'status',
        arguments: {},
      })
      console.log('✅ status 响应:', JSON.stringify(statusResponse, null, 2))
    } catch (error) {
      console.log('❌ status 工具测试失败:', error.message)
    }

    // 4. 测试 list_trackers 工具
    console.log('\n🗂️ 测试 list_trackers 工具...')
    try {
      const listTrackersResponse = await client.callTool({
        name: 'list_trackers',
        arguments: {},
      })
      console.log('✅ list_trackers 响应:', JSON.stringify(listTrackersResponse, null, 2))
    } catch (error) {
      console.log('❌ list_trackers 工具测试失败:', error.message)
    }

    // 5. 测试不存在的工具
    console.log('\n🧪 测试不存在的工具...')
    try {
      const invalidToolResponse = await client.callTool({
        name: 'nonexistent_tool',
        arguments: {},
      })
      console.log('❌ 不应该到达这里，响应:', JSON.stringify(invalidToolResponse, null, 2))
    } catch (error) {
      console.log('✅ 正确捕获到错误（工具不存在）:', error.message)
    }

    console.log('\n🎉 所有工具测试完成！')

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  } finally {
    // 断开连接
    console.log('\n🔌 断开客户端连接...')
    await client.close()
    console.log('✅ 客户端已断开连接')
  }
}

main().catch(console.error)