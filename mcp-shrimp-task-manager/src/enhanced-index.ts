import "dotenv/config";
import { loadPromptFromTemplate } from './prompts/loader.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { setGlobalServer } from './utils/paths.js';
import { createWebServer } from './web/webServer.js';

// 導入所有工具函數和 schema
import {
  planTask,
  planTaskSchema,
  analyzeTask,
  analyzeTaskSchema,
  reflectTask,
  reflectTaskSchema,
  splitTasks,
  splitTasksSchema,
  splitTasksRaw,
  splitTasksRawSchema,
  listTasksSchema,
  listTasks,
  executeTask,
  executeTaskSchema,
  verifyTask,
  verifyTaskSchema,
  deleteTask,
  deleteTaskSchema,
  clearAllTasks,
  clearAllTasksSchema,
  updateTaskContent,
  updateTaskContentSchema,
  queryTask,
  queryTaskSchema,
  getTaskDetail,
  getTaskDetailSchema,
  intelligentTaskAnalysis,
  intelligentTaskAnalysisSchema,
  processThought,
  processThoughtSchema,
  initProjectRules,
  initProjectRulesSchema,
  researchMode,
  researchModeSchema,
} from "./tools/index.js";

// 全局异常处理和监控
class ServiceMonitor {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  private memoryUsage: NodeJS.MemoryUsage;
  private isShuttingDown: boolean = false;

  constructor() {
    this.startTime = Date.now();
    this.memoryUsage = process.memoryUsage();
    
    // 定期监控内存使用
    setInterval(() => {
      this.updateMemoryUsage();
      this.logHealthStatus();
    }, 30000); // 每30秒检查一次

    console.log('[ServiceMonitor] 服务监控已启动');
  }

  private updateMemoryUsage() {
    this.memoryUsage = process.memoryUsage();
  }

  private logHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) : '0.00';
    
    console.log(`[HealthCheck] 运行时间: ${Math.floor(uptime / 1000)}s, 请求数: ${this.requestCount}, 错误率: ${errorRate}%, 内存: ${Math.round(this.memoryUsage.heapUsed / 1024 / 1024)}MB/${Math.round(this.memoryUsage.heapTotal / 1024 / 1024)}MB`);
  }

  recordRequest() {
    this.requestCount++;
  }

  recordError() {
    this.errorCount++;
    this.lastErrorTime = Date.now();
  }

  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
    
    return {
      status: errorRate > 0.5 ? 'degraded' : 'healthy',
      uptime: uptime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: errorRate,
      memoryUsage: {
        rss: Math.round(this.memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(this.memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(this.memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(this.memoryUsage.external / 1024 / 1024)
      },
      lastErrorTime: this.lastErrorTime,
      isShuttingDown: this.isShuttingDown
    };
  }

  initiateShutdown() {
    this.isShuttingDown = true;
    console.log('[ServiceMonitor] 正在关闭服务...');
  }
}

// 创建服务监控实例
const serviceMonitor = new ServiceMonitor();

// 全局异常处理
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT_EXCEPTION] 未捕获的异常:', error);
  serviceMonitor.recordError();
  
  // 不退出进程，记录错误并继续运行
  // 只有在严重内存不足时才退出
  if (error.message.includes('ENOMEM') || error.message.includes('内存')) {
    console.error('[FATAL] 内存不足，强制退出');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION] 未处理的Promise拒绝:', reason);
  serviceMonitor.recordError();
  
  // 不退出进程，记录错误并继续运行
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] 收到SIGINT信号，正在优雅关闭...');
  serviceMonitor.initiateShutdown();
  setTimeout(() => {
    console.log('[SHUTDOWN] 服务已关闭');
    process.exit(0);
  }, 5000);
});

process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] 收到SIGTERM信号，正在优雅关闭...');
  serviceMonitor.initiateShutdown();
  setTimeout(() => {
    console.log('[SHUTDOWN] 服务已关闭');
    process.exit(0);
  }, 5000);
});

// 带超时和重试的工具调用包装器
async function callToolWithTimeoutAndRetry<T>(
  toolFn: () => Promise<T>,
  toolName: string,
  timeoutMs: number = 180000, // 3分钟默认超时
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[ToolCall] ${toolName} - 尝试 ${attempt + 1}/${maxRetries + 1}`);
      
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`工具调用超时: ${toolName} (${timeoutMs}ms)`));
        }, timeoutMs);
      });

      // 执行工具调用
      const result = await Promise.race([toolFn(), timeoutPromise]);
      
      console.log(`[ToolCall] ${toolName} - 成功`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`[ToolCall] ${toolName} - 尝试 ${attempt + 1} 失败:`, error);
      serviceMonitor.recordError();
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`工具调用失败: ${toolName} (${maxRetries + 1}次尝试后): ${lastError.message}`);
      }
      
      // 指数退避
      const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`[ToolCall] ${toolName} - ${backoffTime}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  throw lastError || new Error(`未知错误: ${toolName}`);
}

async function main() {
  try {
    console.log('[STARTUP] 启动增强版Shrimp MCP服务...');
    
    const ENABLE_GUI = process.env.ENABLE_GUI === "true";
    let webServerInstance: Awaited<ReturnType<typeof createWebServer>> | null = null;

    // 創建MCP服務器
    const server = new Server(
      {
        name: "Shrimp Task Manager (Enhanced)",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          logging: {},
        },
      }
    );

    // 設置全局 server 實例
    setGlobalServer(server);

    // 監聽 initialized 通知來啟動 web 服務器
    if (ENABLE_GUI) {
      server.setNotificationHandler(InitializedNotificationSchema, async () => {
        try {
          webServerInstance = await createWebServer();
          await webServerInstance.startServer();
        } catch (error) {
          console.error('[GUI] Web服务器启动失败:', error);
        }
      });
    }

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        serviceMonitor.recordRequest();
        
        return {
          tools: [
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
          ],
        };
      } catch (error) {
        console.error('[ListTools] 错误:', error);
        serviceMonitor.recordError();
        throw error;
      }
    });

    server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        try {
          serviceMonitor.recordRequest();
          
          if (!request.params.arguments) {
            throw new Error("No arguments provided");
          }

          let parsedArgs: any;
          const toolName = request.params.name;
          
          console.log(`[ToolRequest] 处理工具调用: ${toolName}`);
          
          switch (toolName) {
            case "plan_task":
              parsedArgs = await planTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => planTask(parsedArgs.data), toolName);
              
            case "analyze_task":
              parsedArgs = await analyzeTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => analyzeTask(parsedArgs.data), toolName);
              
            case "reflect_task":
              parsedArgs = await reflectTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => reflectTask(parsedArgs.data), toolName);
              
            case "split_tasks":
              parsedArgs = await splitTasksRawSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              // 为split_tasks设置更长超时时间（5分钟），因为它涉及OpenAI调用
              return await callToolWithTimeoutAndRetry(
                () => splitTasksRaw(parsedArgs.data), 
                toolName, 
                300000, // 5分钟
                3 // 最多3次重试
              );
              
            case "list_tasks":
              parsedArgs = await listTasksSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => listTasks(parsedArgs.data), toolName);
              
            case "execute_task":
              parsedArgs = await executeTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => executeTask(parsedArgs.data), toolName);
              
            case "verify_task":
              parsedArgs = await verifyTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => verifyTask(parsedArgs.data), toolName);
              
            case "delete_task":
              parsedArgs = await deleteTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => deleteTask(parsedArgs.data), toolName);
              
            case "clear_all_tasks":
              parsedArgs = await clearAllTasksSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => clearAllTasks(parsedArgs.data), toolName);
              
            case "update_task":
              parsedArgs = await updateTaskContentSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => updateTaskContent(parsedArgs.data), toolName);
              
            case "query_task":
              parsedArgs = await queryTaskSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => queryTask(parsedArgs.data), toolName);
              
            case "get_task_detail":
              parsedArgs = await getTaskDetailSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => getTaskDetail(parsedArgs.data), toolName);
              
            case "process_thought":
              parsedArgs = await processThoughtSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => processThought(parsedArgs.data), toolName);
              
            case "init_project_rules":
              return await callToolWithTimeoutAndRetry(() => initProjectRules(), toolName);
              
            case "research_mode":
              parsedArgs = await researchModeSchema.safeParseAsync(request.params.arguments);
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments for tool ${toolName}: ${parsedArgs.error.message}`);
              }
              return await callToolWithTimeoutAndRetry(() => researchMode(parsedArgs.data), toolName);
              
            default:
              throw new Error(`Tool ${toolName} does not exist`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[ToolError] ${request.params.name}:`, error);
          serviceMonitor.recordError();
          
          return {
            content: [
              {
                type: "text",
                text: `Error occurred: ${errorMsg} \n Please try correcting the error and calling the tool again`,
              },
            ],
          };
        }
      }
    );

    // 建立連接
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log('[STARTUP] 增强版Shrimp MCP服务启动成功');
    console.log('[HealthCheck] 服务状态:', serviceMonitor.getHealthStatus());
    
  } catch (error) {
    console.error('[STARTUP] 服务启动失败:', error);
    serviceMonitor.recordError();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[FATAL] 服务运行失败:', error);
  serviceMonitor.recordError();
  process.exit(1);
});