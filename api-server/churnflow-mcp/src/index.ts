#!/usr/bin/env node

/**
 * ChurnFlow MCP Server
 * 
 * An MCP (Model Context Protocol) server that provides ADHD-friendly
 * productivity capture and routing capabilities to AI assistants.
 * 
 * Features:
 * - Smart capture with AI-driven routing to appropriate trackers
 * - Multi-item processing from single inputs
 * - Consistent formatting with FormattingUtils
 * - Perfect section placement in markdown files
 * - ADHD-optimized brain dump processing
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { CaptureEngine } from './core/CaptureEngine.js';
import { CaptureInput, CaptureResult, ChurnConfig } from './types/churn.js';

// Global capture engine instance
let captureEngine: CaptureEngine | null = null;
let config: ChurnConfig | null = null;

// Enhanced logging function
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.error(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Available MCP tools for AI assistants
 */
const TOOLS: Tool[] = [
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
    description: 'Get ChurnFlow system status and tracker information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_trackers',
    description: 'List available trackers with their context types and status',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'Filter by context type (business, personal, project, system)',
        },
      },
    },
  },
];

/**
 * Load configuration
 */
async function loadConfig(): Promise<ChurnConfig> {
  if (config) return config;
  
  log('Loading configuration...', 'info');
  
  // Try to load from churn.config.json
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.resolve(process.cwd(), 'churn.config.json');
    log(`Loading config from: ${configPath}`, 'info');
    
    const configData = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(configData);
    
    // Ensure paths are absolute and resolve relative paths
    const basePath = process.cwd();
    if (config && config.collectionsPath && !config.collectionsPath.startsWith('/')) {
      config.collectionsPath = path.resolve(basePath, config.collectionsPath);
    }
    if (config && config.trackingPath && !config.trackingPath.startsWith('/')) {
      config.trackingPath = path.resolve(basePath, config.trackingPath);
    }
    if (config && config.crossrefPath && !config.crossrefPath.startsWith('/')) {
      config.crossrefPath = path.resolve(basePath, config.crossrefPath);
    }
    
    log(`Configuration loaded successfully`, 'info');
    if (config) {
      log(`Collections path: ${config.collectionsPath}`, 'info');
      log(`Tracking path: ${config.trackingPath}`, 'info');
      log(`Crossref path: ${config.crossrefPath}`, 'info');
      log(`AI Provider: ${config.aiProvider}`, 'info');
      log(`Confidence threshold: ${config.confidenceThreshold}`, 'info');
      log(`AI API Key: ${config.aiApiKey ? 'Set' : 'Not set'}`, 'info');
    }
    
    return config!;
  } catch (error) {
    log(`Failed to load config file: ${error}`, 'error');

    // Fallback config for deployment - use churnflow-mcp subdirectory
    log('Using fallback configuration', 'warn');
    
    // Use ES module imports for compatibility
    const fsModule = await import('fs/promises');
    const pathModule = await import('path');
    const fs = fsModule.default || fsModule;
    const path = pathModule.default || pathModule;
    
    // Check if we're in the churnflow-mcp directory or root
    const cwd = process.cwd();
    const isChurnflowDir = cwd.includes('churnflow-mcp');
    const basePath = isChurnflowDir ? cwd : path.join(cwd, 'churnflow-mcp');
    
    // Verify data files exist
    const crossrefPath = path.join(basePath, 'data/crossref/crossref.json');
    const collectionsPath = path.join(basePath, 'data/collections');
    const trackingPath = path.join(basePath, 'data/tracking');
    
    log(`Fallback basePath: ${basePath}`, 'warn');
    log(`Checking crossref path: ${crossrefPath}`, 'warn');
    
    try {
      await fs.access(crossrefPath);
      log(`✓ Crossref data file found at: ${crossrefPath}`, 'info');
    } catch {
      log(`✗ Crossref data file NOT found at: ${crossrefPath}`, 'error');
      // Try alternative paths
      const altCrossref = path.join(cwd, 'data/crossref/crossref.json');
      try {
        await fs.access(altCrossref);
        log(`✓ Found at alternative path: ${altCrossref}`, 'info');
        config = {
          collectionsPath: path.join(cwd, 'data/collections'),
          trackingPath: path.join(cwd, 'data/tracking'),
          crossrefPath: altCrossref,
          aiProvider: 'openai',
          aiApiKey: process.env.OPENAI_API_KEY || '',
          confidenceThreshold: 0.7
        };
        return config;
      } catch {
        // Both paths failed
      }
    }
    
    config = {
      collectionsPath: collectionsPath,
      trackingPath: trackingPath,
      crossrefPath: crossrefPath,
      aiProvider: 'openai',
      aiApiKey: process.env.OPENAI_API_KEY || '',
      confidenceThreshold: 0.7
    };
    return config;
  }
}/**
 * Initialize the capture engine
 */
async function initializeCaptureEngine(): Promise<void> {
  if (!captureEngine) {
    log('Initializing capture engine...', 'info');
    try {
      const churnConfig = await loadConfig();
      log('Creating CaptureEngine instance...', 'info');
      captureEngine = new CaptureEngine(churnConfig);
      log('Calling captureEngine.initialize()...', 'info');
      await captureEngine.initialize();
      log('Capture engine initialized successfully', 'info');
    } catch (error) {
      log(`Failed to initialize capture engine: ${error}`, 'error');
      log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
      // Don't throw error - let the service continue in degraded mode
      // throw error;
    }
  } else {
    log('Capture engine already initialized', 'info');
  }
}

/**
 * Handle capture tool requests
 */
async function handleCapture(args: any): Promise<CallToolResult> {
  try {
    await initializeCaptureEngine();
    
    if (!captureEngine) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Capture engine not initialized. Please check the configuration and try again.',
          },
        ],
        isError: true,
      };
    }

    const input: CaptureInput = {
      text: args.text,
      inputType: 'text',
      forceContext: args.context,
    };

    const result: CaptureResult = await captureEngine.capture(input);

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

    // Format successful capture result
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

/**
 * Handle status tool requests
 */
async function handleStatus(): Promise<CallToolResult> {
  try {
    await initializeCaptureEngine();
    
    if (!captureEngine) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Capture engine not initialized. Please check the configuration and try again.',
          },
        ],
        isError: true,
      };
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

/**
 * Handle list_trackers tool requests
 */
async function handleListTrackers(args: any): Promise<CallToolResult> {
  try {
    await initializeCaptureEngine();
    
    if (!captureEngine) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Capture engine not initialized. Please check the configuration and try again.',
          },
        ],
        isError: true,
      };
    }

    // Get all trackers through the capture engine's tracker manager
    const trackers = captureEngine['trackerManager']?.getTrackersByContext() || [];
    
    let filteredTrackers = trackers;
    if (args.context) {
      filteredTrackers = trackers.filter((tracker: any) => 
        tracker.frontmatter.contextType === args.context
      );
    }

    const trackerLines = [
      '📚 Available Trackers',
      '',
    ];

    if (filteredTrackers.length === 0) {
      trackerLines.push('No trackers found matching criteria.');
    } else {
      filteredTrackers.forEach((tracker: any) => {
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

/**
 * Main server setup
 */
async function main(): Promise<void> {
  log('Starting ChurnFlow MCP Server...', 'info');
  
  try {
    // Initialize capture engine first
    await initializeCaptureEngine();
    
    log('Creating MCP server...', 'info');
    const server = new Server({
      name: 'churnflow-mcp',
      version: '0.3.0',
      capabilities: {
        tools: {},
      },
    });

    // Handle tool listing
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('Received tools list request', 'info');
      return { tools: TOOLS };
    });

    // Handle tool calls
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

    // Keep the process alive
    log('Server running, waiting for client connections...', 'info');
    
    // Output ready flag for API server client detection
    console.log('Ready: ChurnFlow MCP Server initialized');  } catch (error) {
    log(`Failed to start server: ${error}`, 'error');
    log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
    // Don't exit immediately - let the process continue
    // throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down gracefully...', 'info');
  try {
    if (captureEngine) {
      log('Cleaning up capture engine...', 'info');
      // Add any cleanup logic here if needed
    }
    log('Shutdown complete', 'info');
    process.exit(0);
  } catch (error) {
    log(`Error during shutdown: ${error}`, 'error');
    // Don't exit with error code - just exit
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down gracefully...', 'info');
  try {
    if (captureEngine) {
      log('Cleaning up capture engine...', 'info');
      // Add any cleanup logic here if needed
    }
    log('Shutdown complete', 'info');
    process.exit(0);
  } catch (error) {
    log(`Error during shutdown: ${error}`, 'error');
    // Don't exit with error code - just exit
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`, 'error');
  log(`Stack: ${error.stack}`, 'error');
  // Don't exit with error code - just exit
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at ${promise}, reason: ${reason}`, 'error');
  log(`Stack: ${reason instanceof Error ? reason.stack : 'No stack'}`, 'error');
  // Don't exit with error code - just exit
  process.exit(0);
});

// Handle all uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`, 'error');
  log(`Stack: ${error.stack}`, 'error');
  // Don't exit with error code - just exit
  process.exit(0);
});

// Add a global error handler for any other errors
process.on('error', (error) => {
  log(`Global process error: ${error}`, 'error');
  // Don't exit with error code - just exit
  process.exit(0);
});

// Start the server when this file is executed directly.
// The original check using `import.meta.url === `file://${process.argv[1]}``
// does not work reliably on Windows because `process.argv[1]` contains backslashes.
// We normalize the path to POSIX style before comparing.
// Start the server when this file is executed directly.
log('Starting server entry point...', 'info');
log(`Process ID: ${process.pid}`, 'info');
log(`Working directory: ${process.cwd()}`, 'info');
log(`Command line: ${process.argv.join(' ')}`, 'info');

// Add synchronous error handling
try {
  // main() returns a Promise; we attach a catch to log any async errors.
  main().catch((error) => {
    log(`Fatal error in ChurnFlow MCP Server: ${error}`, 'error');
    log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
    // Don't exit immediately - let the process continue
    // process.exit(1);
  });
  // Keep the process alive – MCP services need to run indefinitely.
  log('Server process started, keeping alive...', 'info');
  // Prevent the Node process from exiting by keeping stdin open.
  process.stdin.resume();
} catch (error) {
  log(`Synchronous error in startup: ${error}`, 'error');
  log(`Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'error');
  // Don't exit immediately - let the process continue
  // process.exit(1);
}

// If we reach here, the server is running and waiting for connections.
log('Server is ready and waiting for client connections...', 'info');

// Keep the process alive indefinitely
setInterval(() => {
  // This empty interval keeps the event loop running
  log('Server heartbeat...', 'info');
}, 10000);

// Export main function for testing
export { main };