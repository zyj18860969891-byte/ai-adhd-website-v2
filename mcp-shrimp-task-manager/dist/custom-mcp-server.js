#!/usr/bin/env node
import "dotenv/config";
import { loadPromptFromTemplate } from './prompts/loader.js';
import { zodToJsonSchema } from "zod-to-json-schema";
import { createWebServer } from './web/webServer.js';
// 导入所有工具函数和schema
import { planTask, planTaskSchema, analyzeTask, analyzeTaskSchema, reflectTask, reflectTaskSchema, splitTasksRaw, splitTasksRawSchema, listTasksSchema, listTasks, executeTask, executeTaskSchema, verifyTask, verifyTaskSchema, deleteTask, deleteTaskSchema, clearAllTasks, clearAllTasksSchema, updateTaskContent, updateTaskContentSchema, queryTask, queryTaskSchema, getTaskDetail, getTaskDetailSchema, intelligentTaskAnalysisSchema, processThought, processThoughtSchema, initProjectRules, initProjectRulesSchema, researchMode, researchModeSchema, } from "./tools/index.js";
// 自定义MCP服务器类
class CustomMCPServer {
    constructor() {
        this.webServerInstance = null;
        this.toolListCache = null;
        console.log("[INFO] Initializing Custom MCP Server...");
    }
    // 获取工具列表
    async getToolList() {
        if (!this.toolListCache) {
            this.toolListCache = [
                {
                    name: "plan_task",
                    description: await loadPromptFromTemplate("toolsDescription/planTask.md"),
                    inputSchema: zodToJsonSchema(planTaskSchema),
                },
                {
                    name: "analyze_task",
                    description: await loadPromptFromTemplate("toolsDescription/analyzeTask.md"),
                    inputSchema: zodToJsonSchema(analyzeTaskSchema),
                },
                {
                    name: "intelligent_task_analysis",
                    description: "智能任务分析和工作流建议工具，基于用户上下文提供个性化的任务分类、时间安排和工作流优化建议",
                    inputSchema: zodToJsonSchema(intelligentTaskAnalysisSchema),
                },
                {
                    name: "reflect_task",
                    description: await loadPromptFromTemplate("toolsDescription/reflectTask.md"),
                    inputSchema: zodToJsonSchema(reflectTaskSchema),
                },
                {
                    name: "split_tasks",
                    description: await loadPromptFromTemplate("toolsDescription/splitTasks.md"),
                    inputSchema: zodToJsonSchema(splitTasksRawSchema),
                },
                {
                    name: "list_tasks",
                    description: await loadPromptFromTemplate("toolsDescription/listTasks.md"),
                    inputSchema: zodToJsonSchema(listTasksSchema),
                },
                {
                    name: "execute_task",
                    description: await loadPromptFromTemplate("toolsDescription/executeTask.md"),
                    inputSchema: zodToJsonSchema(executeTaskSchema),
                },
                {
                    name: "verify_task",
                    description: await loadPromptFromTemplate("toolsDescription/verifyTask.md"),
                    inputSchema: zodToJsonSchema(verifyTaskSchema),
                },
                {
                    name: "delete_task",
                    description: await loadPromptFromTemplate("toolsDescription/deleteTask.md"),
                    inputSchema: zodToJsonSchema(deleteTaskSchema),
                },
                {
                    name: "clear_all_tasks",
                    description: await loadPromptFromTemplate("toolsDescription/clearAllTasks.md"),
                    inputSchema: zodToJsonSchema(clearAllTasksSchema),
                },
                {
                    name: "update_task",
                    description: await loadPromptFromTemplate("toolsDescription/updateTask.md"),
                    inputSchema: zodToJsonSchema(updateTaskContentSchema),
                },
                {
                    name: "query_task",
                    description: await loadPromptFromTemplate("toolsDescription/queryTask.md"),
                    inputSchema: zodToJsonSchema(queryTaskSchema),
                },
                {
                    name: "get_task_detail",
                    description: await loadPromptFromTemplate("toolsDescription/getTaskDetail.md"),
                    inputSchema: zodToJsonSchema(getTaskDetailSchema),
                },
                {
                    name: "process_thought",
                    description: await loadPromptFromTemplate("toolsDescription/processThought.md"),
                    inputSchema: zodToJsonSchema(processThoughtSchema),
                },
                {
                    name: "init_project_rules",
                    description: await loadPromptFromTemplate("toolsDescription/initProjectRules.md"),
                    inputSchema: zodToJsonSchema(initProjectRulesSchema),
                },
                {
                    name: "research_mode",
                    description: await loadPromptFromTemplate("toolsDescription/researchMode.md"),
                    inputSchema: zodToJsonSchema(researchModeSchema),
                },
            ];
        }
        return this.toolListCache;
    }
    // 格式化Zod错误
    formatZodError(zodError, toolName) {
        const errors = zodError.errors || [];
        const errorDetails = errors.map((error) => {
            const path = error.path.join('.');
            const message = error.message || '参数验证失败';
            const code = error.code || 'unknown';
            let suggestion = '';
            let expected = error.expected || '未知';
            let received = error.received || '未知';
            switch (code) {
                case 'too_small':
                    suggestion = `请确保${path}至少包含${error.minimum}个字符`;
                    expected = `最少${error.minimum}个字符`;
                    received = `当前${error.received || 0}个字符`;
                    break;
                case 'too_big':
                    suggestion = `请确保${path}不超过${error.maximum}个字符`;
                    expected = `最多${error.maximum}个字符`;
                    received = `当前${error.received || 0}个字符`;
                    break;
                case 'invalid_type':
                    suggestion = `请确保${path}的类型为${expected}，而不是${received}`;
                    break;
                case 'invalid_enum_value':
                    suggestion = `请确保${path}的值是有效的选项之一`;
                    break;
                case 'invalid_string':
                    if (error.validation === 'email') {
                        suggestion = `请确保${path}是一个有效的邮箱地址`;
                    }
                    else if (error.validation === 'url') {
                        suggestion = `请确保${path}是一个有效的URL`;
                    }
                    else {
                        suggestion = `请确保${path}符合格式要求`;
                    }
                    break;
                default:
                    suggestion = `请检查${path}参数是否符合要求`;
            }
            return {
                field: path,
                message: message,
                code: code,
                suggestion: suggestion,
                expected: expected,
                received: received
            };
        });
        return {
            error: "参数验证失败",
            tool: toolName,
            issues: errorDetails,
            suggestions: errorDetails.map((e) => e.suggestion),
            example: this.getToolExample(toolName)
        };
    }
    // 获取工具示例
    getToolExample(toolName) {
        const examples = {
            plan_task: {
                description: "创建一个完整的Web应用程序，包括前端、后端和数据库设计。需要支持用户注册、登录、数据管理等功能。",
                requirements: "使用React作为前端框架，Node.js作为后端，MongoDB作为数据库",
                existingTasksReference: false
            },
            analyze_task: {
                taskId: "task-123",
                analysisType: "complexity"
            },
            reflect_task: {
                taskId: "task-123",
                reflectionType: "progress"
            },
            split_tasks: {
                parentTaskId: "task-123",
                splitCriteria: "by_complexity"
            },
            list_tasks: {
                filter: "status=pending",
                limit: 10,
                offset: 0
            },
            execute_task: {
                taskId: "task-123",
                executionContext: "production",
                resources: ["server1", "database1"]
            },
            verify_task: {
                taskId: "task-123",
                verificationCriteria: ["功能完整性", "性能要求", "安全性"],
                expectedOutcome: "所有功能正常工作，性能达标"
            },
            delete_task: {
                taskId: "task-123"
            },
            clear_all_tasks: {
                confirm: true
            },
            update_task: {
                taskId: "task-123",
                updates: {
                    description: "更新后的任务描述",
                    priority: "high"
                }
            },
            query_task: {
                query: "搜索关键词",
                filters: {
                    status: "completed",
                    priority: "high"
                }
            },
            get_task_detail: {
                taskId: "task-123"
            },
            process_thought: {
                thought: "关于任务执行的思考过程",
                context: "当前任务上下文"
            },
            research_mode: {
                topic: "研究主题",
                depth: "detailed"
            }
        };
        return examples[toolName] || {};
    }
    // 处理初始化请求
    async handleInitialize(params) {
        console.log("[INFO] Handling initialize request");
        const ENABLE_GUI = process.env.ENABLE_GUI === "true";
        if (ENABLE_GUI) {
            try {
                this.webServerInstance = await createWebServer();
                await this.webServerInstance.startServer();
                console.log("[INFO] Web server started successfully");
            }
            catch (error) {
                console.error("[ERROR] Web server startup failed:", error);
            }
        }
        return {
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {},
                logging: {},
            },
            serverInfo: {
                name: "Shrimp Task Manager (Custom MCP)",
                version: "1.0.0",
            },
        };
    }
    // 处理工具列表请求
    async handleToolsList(params) {
        console.log("[INFO] Handling tools/list request");
        try {
            const tools = await this.getToolList();
            console.log(`[INFO] Returning ${tools.length} tools`);
            return { tools };
        }
        catch (error) {
            console.error("[ERROR] Failed to process tools/list:", error);
            return {
                tools: [],
                error: "无法获取工具列表: " + (error instanceof Error ? error.message : String(error))
            };
        }
    }
    // 处理工具调用请求
    async handleToolCall(params) {
        const toolName = params.name;
        console.log(`[INFO] Handling tools/call request: ${toolName}`);
        try {
            if (!params.arguments) {
                const errorResponse = {
                    error: "缺少参数",
                    tool: toolName,
                    suggestion: "请提供必要的参数来调用此工具",
                    example: this.getToolExample(toolName)
                };
                console.log(`[WARN] No arguments provided for tool: ${toolName}`);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(errorResponse, null, 2)
                        }]
                };
            }
            let parsedArgs;
            let result;
            try {
                switch (toolName) {
                    case "plan_task":
                        parsedArgs = await planTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await planTask(parsedArgs.data);
                        break;
                    case "analyze_task":
                        parsedArgs = await analyzeTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await analyzeTask(parsedArgs.data);
                        break;
                    case "reflect_task":
                        parsedArgs = await reflectTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await reflectTask(parsedArgs.data);
                        break;
                    case "split_tasks":
                        parsedArgs = await splitTasksRawSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await splitTasksRaw(parsedArgs.data);
                        break;
                    case "list_tasks":
                        parsedArgs = await listTasksSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await listTasks(parsedArgs.data);
                        break;
                    case "execute_task":
                        parsedArgs = await executeTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await executeTask(parsedArgs.data);
                        break;
                    case "verify_task":
                        parsedArgs = await verifyTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await verifyTask(parsedArgs.data);
                        break;
                    case "delete_task":
                        parsedArgs = await deleteTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await deleteTask(parsedArgs.data);
                        break;
                    case "clear_all_tasks":
                        parsedArgs = await clearAllTasksSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await clearAllTasks(parsedArgs.data);
                        break;
                    case "update_task":
                        parsedArgs = await updateTaskContentSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await updateTaskContent(parsedArgs.data);
                        break;
                    case "query_task":
                        parsedArgs = await queryTaskSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await queryTask(parsedArgs.data);
                        break;
                    case "get_task_detail":
                        parsedArgs = await getTaskDetailSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await getTaskDetail(parsedArgs.data);
                        break;
                    case "process_thought":
                        parsedArgs = await processThoughtSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await processThought(parsedArgs.data);
                        break;
                    case "init_project_rules":
                        result = await initProjectRules();
                        break;
                    case "research_mode":
                        parsedArgs = await researchModeSchema.safeParseAsync(params.arguments);
                        if (!parsedArgs.success) {
                            const formattedError = this.formatZodError(parsedArgs.error, toolName);
                            throw new Error(JSON.stringify(formattedError, null, 2));
                        }
                        result = await researchMode(parsedArgs.data);
                        break;
                    default:
                        throw new Error(`工具 ${toolName} 不存在。可用工具: ${(await this.getToolList()).map((t) => t.name).join(', ')}`);
                }
                console.log(`[INFO] Tool ${toolName} executed successfully`);
                return result;
            }
            catch (toolError) {
                const errorMsg = toolError instanceof Error ? toolError.message : String(toolError);
                console.error(`[ERROR] Tool ${toolName} execution failed:`, toolError);
                // 尝试解析JSON格式的错误信息
                try {
                    const errorObj = JSON.parse(errorMsg);
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify(errorObj, null, 2)
                            }]
                    };
                }
                catch (parseError) {
                    // 如果不是JSON格式，返回原始错误信息
                    return {
                        content: [{
                                type: "text",
                                text: `工具调用失败: ${toolName}\n错误详情: ${errorMsg}\n请检查参数并重试`
                            }]
                    };
                }
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[FATAL] Failed to process tools/call for ${toolName}:`, error);
            return {
                content: [{
                        type: "text",
                        text: `严重错误: 无法处理工具调用请求\n工具: ${toolName}\n错误详情: ${errorMsg}\n建议: 请检查服务配置和日志，然后重试`
                    }]
            };
        }
    }
    // 处理JSON-RPC请求
    async handleRequest(request) {
        try {
            const { jsonrpc, id, method, params } = request;
            if (jsonrpc !== "2.0") {
                return {
                    jsonrpc: "2.0",
                    id: id || null,
                    error: {
                        code: -32600,
                        message: "Invalid Request: jsonrpc must be '2.0'"
                    }
                };
            }
            let result;
            switch (method) {
                case "initialize":
                    result = await this.handleInitialize(params);
                    break;
                case "tools/list":
                    result = await this.handleToolsList(params);
                    break;
                case "tools/call":
                    result = await this.handleToolCall(params);
                    break;
                default:
                    return {
                        jsonrpc: "2.0",
                        id: id || null,
                        error: {
                            code: -32601,
                            message: `Method not found: ${method}`
                        }
                    };
            }
            return {
                jsonrpc: "2.0",
                id: id || null,
                result: result
            };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Request handling failed:`, error);
            return {
                jsonrpc: "2.0",
                id: request.id || null,
                error: {
                    code: -32603,
                    message: `Internal error: ${errorMsg}`
                }
            };
        }
    }
    // 启动服务器
    async start() {
        console.log("[SUCCESS] Custom MCP Server started successfully");
        console.log("[INFO] Ready to accept requests via stdin/stdout");
        // 监听stdin
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', async (data) => {
            try {
                const request = JSON.parse(data.toString().trim());
                console.log(`[INFO] Received request: ${request.method} (ID: ${request.id})`);
                const response = await this.handleRequest(request);
                // 只输出纯JSON响应，不添加日志前缀
                process.stdout.write(JSON.stringify(response) + '\n');
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[ERROR] Failed to process request:`, error);
                const errorResponse = {
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32700,
                        message: `Parse error: ${errorMsg}`
                    }
                };
                process.stdout.write(JSON.stringify(errorResponse) + '\n');
            }
        });
        process.stdin.on('end', () => {
            // stdin ended, exit gracefully
            process.exit(0);
        });
        process.on('SIGINT', () => {
            // Received SIGINT, shutting down gracefully
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.log('[INFO] Received SIGTERM, shutting down gracefully');
            process.exit(0);
        });
    }
}
// 启动服务器
async function main() {
    try {
        const server = new CustomMCPServer();
        await server.start();
    }
    catch (error) {
        console.error("[FATAL] Server startup failed:", error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=custom-mcp-server.js.map