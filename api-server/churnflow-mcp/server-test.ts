#!/usr/bin/env node

/**
 * ChurnFlow MCP 服务启动脚本
 * 
 * 启动 ChurnFlow MCP 服务并保持运行
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CaptureEngine } from './core/CaptureEngine.js';

// 全局变量
let captureEngine = null;

// 日志函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.error(`[${timestamp}] ${prefix} ${message}`);
}

// 可用工具
const TOOLS = [
  {
    name: 'capture',
    description: 'Capture and route text input using ChurnFlow ADHD-friendly AI system',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to capture and route (can contain multiple items)',
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Priority level for the captured content',
        },
        context: {
          type: 'string',
          description: 'Optional context hint for routing (business, personal, project, system)',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'status',
    description: 'Get current status of the ChurnFlow system',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_trackers',
    description: 'List all available trackers in the system',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'Filter by context type (optional)',
        },
      },
    },
  },
];

// 工具处理函数
async function handleCapture(args) {
  try {
    await initializeCaptureEngine();
    if (!captureEngine) {
      throw new Error('Failed to initialize capture engine');
    }
    const input = {
      text: args.text,
      inputType: 'text',
      forceContext: args.context,
    };
    const result = await captureEngine.capture(input);
    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Capture failed: ${result.error}`,
          },
        ],
        isError: true,
      };
    }
    const summary = [
      `✅ Capture Successful!`,
      `📁 Primary Tracker: ${result.primaryTracker}`,
      `🎯 Confidence: ${Math.round(result.confidence * 100)}%`,
      `📊 Generated ${result.itemResults?.length || 0} items`,
      '',
    ];
    if (result.itemResults && result.itemResults.length > 0) {
      summary.push('📝 Items Generated:');
      result.itemResults.forEach(item => {
        summary.push(`  ✅ ${item.itemType} → ${item.tracker}`);
        summary.push(`     ${item.formattedEntry}`);
      });
    }
    if (result.completedTasks && result.completedTasks.length > 0) {
      summary.push('');
      summary.push('🎯 Task Completions:');
      result.completedTasks.forEach(completion => {
        summary.push(`  ✅ completion in ${completion.tracker}`);
        summary.push(`     ${completion.description}`);
      });
    }
    return {
      content: [
        {
          type: 'text',
          text: summary.join('\n'),
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error during capture: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleStatus() {
  try {
    await initializeCaptureEngine();
    if (!captureEngine) {
      throw new Error('Failed to initialize capture engine');
    }
    const status = await captureEngine.getStatus();
    const statusLines = [
      '📊 ChurnFlow System Status',
      '',
      `🟢 Initialized: ${status.initialized}`,
      `📚 Total Trackers: ${status.totalTrackers}`,
      `⚙️  AI Provider: ${status.aiProvider}`,
      `🎯 Confidence Threshold: ${status.confidenceThreshold}`,
      `📁 Collections Path: ${status.collectionsPath}`,
      '',
      '📋 Trackers by Context:',
    ];
    Object.entries(status.trackersByContext || {}).forEach(([context, count]) => {
      statusLines.push(`  ${context}: ${count}`);
    });
    return {
      content: [
        {
          type: 'text',
          text: statusLines.join('\n'),
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting status: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleListTrackers(args) {
  try {
    await initializeCaptureEngine();
    if (!captureEngine) {
      throw new Error('Failed to initialize capture engine');
    }
    const trackers = captureEngine['trackerManager']?.getTrackersByContext() || [];
    let filteredTrackers = trackers;
    if (args.context) {
      filteredTrackers = trackers.filter((tracker) => tracker.frontmatter.contextType === args.context);
    }
    const trackerLines = [
      '📚 Available Trackers',
      '',
    ];
    if (filteredTrackers.length === 0) {
      trackerLines.push('No trackers found matching criteria.');
    } else {
      filteredTrackers.forEach((tracker) => {
        const context = tracker.frontmatter.contextType || 'undefined';
        const mode = tracker.frontmatter.mode || 'standard';
        trackerLines.push(`📁 ${tracker.frontmatter.tag} (${tracker.frontmatter.friendlyName})`);
        trackerLines.push(`   Context: ${context} | Mode: ${mode}`);
        if (tracker.frontmatter.collection) {
          trackerLines.push(`   Collection: ${tracker.frontmatter.collection}`);
        }
        trackerLines.push('');
      });
    }
    return {
      content: [
        {
          type: 'text',
          text: trackerLines.join('\n'),
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing trackers: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

// 初始化捕获引擎
async function initializeCaptureEngine() {
  if (!captureEngine) {
    log('Initializing capture engine...', 'info');
    try {
      const { loadConfig } = await import('./config.js');
      const churnConfig = await loadConfig();
      captureEngine = new CaptureEngine(churnConfig);
      await captureEngine.initialize();
      log('Capture engine initialized successfully', 'info');
    } catch (error) {
      log(`Failed to initialize capture engine: ${error}`, 'error');
      throw error;
    }
  }
}

// 主函数
async function main() {
  log('Starting ChurnFlow MCP Server...', 'info');
  try {
    // 初始化捕获引擎
    await initializeCaptureEngine();
    log('Creating MCP server...', 'info');
    
    const server = new Server({
      name: 'churnflow-mcp',
      version: '0.3.0',
      capabilities: {
        tools: {},
      },
    });

    // 处理工具列表请求
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('Received tools list request', 'info');
      return { tools: TOOLS };
    });

    // 处理工具调用请求
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      log(`Received tool call: ${name}`, 'info');
      switch (name) {
        case 'capture':
          return await handleCapture(args);
        case 'status':
          return await handleStatus();
        case 'list_trackers':
          return await handleListTrackers(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    log('Creating stdio transport...', 'info');
    const transport = new StdioServerTransport();
    log('Connecting server to transport...', 'info');
    await server.connect(transport);
    log('ChurnFlow MCP Server started successfully', 'info');
    log('Available tools: capture, status, list_trackers', 'info');
    log('Server is ready to accept connections', 'info');
    log('Server running, waiting for client connections...', 'info');

    // 保持进程运行
    process.on('SIGINT', async () => {
      log('Received SIGINT, shutting down gracefully...', 'info');
      try {
        if (captureEngine) {
          log('Cleaning up capture engine...', 'info');
        }
        log('Shutdown complete', 'info');
        process.exit(0);
      } catch (error) {
        log(`Error during shutdown: ${error}`, 'error');
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      log('Received SIGTERM, shutting down gracefully...', 'info');
      try {
        if (captureEngine) {
          log('Cleaning up capture engine...', 'info');
        }
        log('Shutdown complete', 'info');
        process.exit(0);
      } catch (error) {
        log(`Error during shutdown: ${error}`, 'error');
        process.exit(1);
      }
    });

    process.on('uncaughtException', (error) => {
      log(`Uncaught exception: ${error}`, 'error');
      log(`Stack: ${error.stack}`, 'error');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled rejection at ${promise}, reason: ${reason}`, 'error');
      log(`Stack: ${reason instanceof Error ? reason.stack : 'No stack'}`, 'error');
      process.exit(1);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`, 'error');
    throw error;
  }
}

// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  log('Starting server entry point...', 'info');
  log(`Process ID: ${process.pid}`, 'info');
  log(`Working directory: ${process.cwd()}`, 'info');
  log(`Command line: ${process.argv.join(' ')}`, 'info');
  
  try {
    main().catch((error) => {
      log(`Fatal error in ChurnFlow MCP Server: ${error}`, 'error');
      log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
      process.exit(1);
    });
  } catch (error) {
    log(`Synchronous error in startup: ${error}`, 'error');
    log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
    process.exit(1);
  }
}

export { main };