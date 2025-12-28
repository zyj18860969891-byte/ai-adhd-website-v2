#!/usr/bin/env ts-node

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

async function main() {
  console.log('🧪 开始测试 ChurnFlow MCP 服务...\n')

  // 创建传输层 - 连接到已启动的服务
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
  })

  // 创建客户端
  const client = new Client(
    { name: 'churnflow-test-client', version: '1.0.0' },
    {
      capabilities: {}
    }
  )

  try {
    // 连接到服务器
    console.log('📡 连接到 ChurnFlow MCP 服务...')
    await client.connect(transport)
    console.log('✅ 连接成功！\n')

    // 测试 ListTools
    console.log('📋 测试 ListTools 工具...')
    const listToolsResponse = await client.listTools({})
    console.log('✅ ListTools 响应:', JSON.stringify(listToolsResponse, null, 2))

    // 测试 capture 工具
    console.log('\n📸 测试 capture 工具...')
    try {
      const captureResponse = await client.callTool({
        name: 'capture',
        arguments: {
          text: '测试捕获内容：这是一个测试任务',
        },
      })
      console.log('✅ capture 响应:', JSON.stringify(captureResponse, null, 2))
    } catch (error: any) {
      console.log('❌ capture 工具测试失败:', error.message)
    }

    // 测试 status 工具
    console.log('\n📊 测试 status 工具...')
    try {
      const statusResponse = await client.callTool({
        name: 'status',
        arguments: {},
      })
      console.log('✅ status 响应:', JSON.stringify(statusResponse, null, 2))
    } catch (error: any) {
      console.log('❌ status 工具测试失败:', error.message)
    }

    // 测试 list_trackers 工具
    console.log('\n🗂️ 测试 list_trackers 工具...')
    try {
      const listTrackersResponse = await client.callTool({
        name: 'list_trackers',
        arguments: {},
      })
      console.log('✅ list_trackers 响应:', JSON.stringify(listTrackersResponse, null, 2))
    } catch (error: any) {
      console.log('❌ list_trackers 工具测试失败:', error.message)
    }

    console.log('\n🎉 所有工具测试完成！')

    console.log('\n🎉 测试完成！')

  } catch (error: any) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    // 断开连接
    console.log('\n🔌 断开客户端连接...')
    await client.close()
    console.log('✅ 客户端已断开连接')
  }
}

main().catch(console.error)