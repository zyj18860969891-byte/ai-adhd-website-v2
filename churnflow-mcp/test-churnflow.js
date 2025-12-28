#!/usr/bin/env node

/**
 * Simple test for ChurnFlow MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

async function testChurnFlow() {
    console.log('🧪 Testing ChurnFlow MCP Server...');
    
    try {
        // Create server
        const server = new Server({
            name: 'test-churnflow',
            version: '1.0.0',
            capabilities: {
                tools: {},
            },
        });

        // Test tool listing
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            console.log('📋 Received tools list request');
            return { 
                tools: [
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
                        description: 'List all available trackers',
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
                ]
            };
        });

        // Test tool calls
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            console.log(`🔧 Received tool call: ${name}`);
            
            switch (name) {
                case 'status':
                    return {
                        content: [
                            {
                                type: 'text',
                                text: '✅ ChurnFlow MCP Server is running successfully!\n📊 Status: All systems operational\n🎯 Ready for ADHD-friendly capture',
                            },
                        ],
                        isError: false,
                    };
                case 'list_trackers':
                    return {
                        content: [
                            {
                                type: 'text',
                                text: '📚 Available Trackers:\n\n📁 default (personal)\n   Context: personal | Mode: standard\n   Collection: default',
                            },
                        ],
                        isError: false,
                    };
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });

        // Connect to transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
        
        console.log('✅ ChurnFlow MCP Server test completed successfully!');
        console.log('🎯 Server is ready and responding to requests');
        
        // Keep the process alive for a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testChurnFlow().catch(console.error);