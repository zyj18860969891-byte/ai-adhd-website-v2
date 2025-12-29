#!/usr/bin/env node
import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { setGlobalServer } from "./utils/paths.js";
import { createWebServer } from "./web/webServer.js";

// 导入所有工具函数和schema
import {
  planTask,
  planTaskSchema,
  analyzeTask,
  analyzeTaskSchema,
  reflectTask,
  reflectTaskSchema,
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

async function main() {
  try {
    const ENABLE_GUI = process.env.ENABLE_GUI === "true";
    let webServerInstance = null;

    // 创建MCP服务器
    const server = new Server(
      {
        name: "Shrimp Task Manager (Fixed)",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          logging: {},
        },
      }
    );

    // 设置全局server实例
    setGlobalServer(server);

    // 监听initialized通知来启动web服务器
    if (ENABLE_GUI) {
      server.setNotificationHandler(InitializedNotificationSchema, async () => {
        try {
          webServerInstance = await createWebServer();
          await webServerInstance.startServer();
        } catch (error) {
          console.error("Web服务器启动失败:", error);
        }
      });
    }

    // 处理tools/list请求
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        console.log("[DEBUG] Processing tools/list request");
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
        console.error("[ERROR] Failed to process tools/list:", error);
        return {
          tools: [],
          error: "无法获取工具列表"
        };
      }
    });

    // 处理tools/call请求
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        console.log("[DEBUG] Processing tools/call request:", request.params.name);
        
        if (!request.params.arguments) {
          return {
            content: [{
              type: "text",
              text: "错误: 工具 " + request.params.name + " 需要参数\n\n建议: 请提供必要的参数来调用此工具"
            }]
          };
        }

        let parsedArgs;
        switch (request.params.name) {
          case "plan_task":
            parsedArgs = await planTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await planTask(parsedArgs.data);
            
          case "analyze_task":
            parsedArgs = await analyzeTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await analyzeTask(parsedArgs.data);
            
          case "reflect_task":
            parsedArgs = await reflectTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await reflectTask(parsedArgs.data);
            
          case "split_tasks":
            parsedArgs = await splitTasksRawSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await splitTasksRaw(parsedArgs.data);
            
          case "list_tasks":
            parsedArgs = await listTasksSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await listTasks(parsedArgs.data);
            
          case "execute_task":
            parsedArgs = await executeTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await executeTask(parsedArgs.data);
            
          case "verify_task":
            parsedArgs = await verifyTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await verifyTask(parsedArgs.data);
            
          case "delete_task":
            parsedArgs = await deleteTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await deleteTask(parsedArgs.data);
            
          case "clear_all_tasks":
            parsedArgs = await clearAllTasksSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await clearAllTasks(parsedArgs.data);
            
          case "update_task":
            parsedArgs = await updateTaskContentSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await updateTaskContent(parsedArgs.data);
            
          case "query_task":
            parsedArgs = await queryTaskSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await queryTask(parsedArgs.data);
            
          case "get_task_detail":
            parsedArgs = await getTaskDetailSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await getTaskDetail(parsedArgs.data);
            
          case "process_thought":
            parsedArgs = await processThoughtSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await processThought(parsedArgs.data);
            
          case "init_project_rules":
            return await initProjectRules();
            
          case "research_mode":
            parsedArgs = await researchModeSchema.safeParseAsync(request.params.arguments);
            if (!parsedArgs.success) {
              const errorDetails = parsedArgs.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
              }));
              throw new Error("参数验证失败: " + JSON.stringify(errorDetails, null, 2));
            }
            return await researchMode(parsedArgs.data);
            
          default:
            throw new Error("工具 " + request.params.name + " 不存在");
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("[ToolError]", request.params.name + ":", error);
        
        return {
          content: [{
            type: "text",
            text: "错误: " + errorMsg + "\n\n建议: 请检查参数格式并重试"
          }]
        };
      }
    });

    // 建立连接
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log("[STARTUP] 修复版Shrimp MCP服务启动成功");
    
  } catch (error) {
    console.error("[STARTUP] 服务启动失败:", error);
    process.exit(1);
  }
}

main().catch(console.error);
