#!/usr/bin/env ts-node

/**
 * ChurnFlow MCP 连接测试脚本
 * 仅测试连接，不启动新服务
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

async function main() {
  console.log('🧪 ChurnFlow MCP 连接测试...')
  console.log('注意：此脚本将连接到已运行的服务，不会启动新服务')

  try {
    // 创建传输层 - 连接到已启动的服务
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      cwd: process.cwd()
    })

    // 创建 MCP 客户端
    const client = new Client(
      { name: 'churnflow-test-client', version: '1.0.0' },
      {
        capabilities: {}
      }
    )

    // 连接到服务
    console.log('📡 连接到 ChurnFlow MCP 服务...')
    await client.connect(transport)
    console.log('✅ 连接成功！')

    // 获取可用工具
    console.log('📋 获取可用工具...')
    const tools = await client.listTools({})
    
    console.log('🔧 可用工具:')
    tools.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`)
    })

    // 测试 capture 工具
    console.log('\n📝 测试 capture 工具...')
    try {
      const captureResult = await client.callTool({
        name: 'capture',
        arguments: {
          text: '测试任务：这是一个测试输入',
        },
      })
      console.log('✅ capture 工具调用成功!')
      console.log('响应内容:', JSON.stringify(captureResult, null, 2))
    } catch (error: any) {
      console.log('❌ capture 工具调用失败:', error.message)
    }

    // 测试 status 工具
    console.log('\n📊 测试 status 工具...')
    try {
      const statusResult = await client.callTool({
        name: 'status',
        arguments: {},
      })
      console.log('✅ status 工具调用成功!')
      console.log('响应内容:', JSON.stringify(statusResult, null, 2))
    } catch (error: any) {
      console.log('❌ status 工具调用失败:', error.message)
    }

    console.log('\n🎉 所有测试完成！')

  } catch (error: any) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.error('Stack:', error.stack)
  }
}

main().catch(console.error)