#!/usr/bin/env node
import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { CallToolRequestSchema, ListToolsRequestSchema, InitializedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";
import { setGlobalServer } from "./utils/paths.js";
import { createWebServer } from "./web/webServer.js";

// 导入所有工具函数和 schema
import { planTask, planTaskSchema, analyzeTask, analyzeTaskSchema, reflectTask, reflectTaskSchema, splitTasksRaw, splitTasksRawSchema, listTasksSchema, listTasks, executeTask, executeTaskSchema, verifyTask, verifyTaskSchema, deleteTask, deleteTaskSchema, clearAllTasks, clearAllTasksSchema, updateTaskContent, updateTaskContentSchema, queryTask, queryTaskSchema, getTaskDetail, getTaskDetailSchema, intelligentTaskAnalysisSchema, processThought, processThoughtSchema, initProjectRules, initProjectRulesSchema, researchMode, researchModeSchema } from "./tools/index.js";

// 增强的错误处理和参数验证
class EnhancedErrorHandler {
  static validateParameters(schema, params, toolName) {
    try {
      const validatedParams = schema.parse(params);
      return { success: true, data: validatedParams, errors: [] };
    } catch (error) {
      const validationErrors = this.formatValidationErrors(error);
      const suggestions = this.generateSuggestions(schema, params, toolName);
      
      return {
        success: false,
        data: null,
        errors: validationErrors,
        suggestions: suggestions
      };
    }
  }

  static formatValidationErrors(error) {
    if (!error || !error.errors) {
      return [{ message: "未知的验证错误" }];
    }

    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      received: err.received,
      expected: err.expected
    }));
  }

  static generateSuggestions(schema, params, toolName) {
    const suggestions = [];
    
    // 根据工具名称生成特定建议
    switch (toolName) {
      case 'plan_task':
        if (!params.description) {
          suggestions.push({
            type: 'missing_parameter',
            parameter: 'description',
            suggestion: '任务描述是必需的，应该包含任务目标、背景和预期成果',
            example: 'description: "创建一个用户管理系统，包含用户注册、登录和个人资料管理功能"'
          });
        }
        break;
        
      case 'list_tasks':
        if (!params.status) {
          suggestions.push({
            type: 'missing_parameter',
            parameter: 'status',
            suggestion: '状态参数是必需的，可以选择 "all"、"pending"、"in_progress" 或 "completed"',
            example: 'status: "all"'
          });
        } else if (!['all', 'pending', 'in_progress', 'completed'].includes(params.status)) {
          suggestions.push({
            type: 'invalid_value',
            parameter: 'status',
            suggestion: '状态值必须是以下之一: "all", "pending", "in_progress", "completed"',
            example: 'status: "pending"'
          });
        }
        break;
        
      case 'analyze_task':
        if (!params.taskId) {
          suggestions.push({
            type: 'missing_parameter',
            parameter: 'taskId',
            suggestion: '任务ID是必需的，请提供要分析的任务ID',
            example: 'taskId: "task-123"'
          });
        }
        break;
        
      case 'execute_task':
        if (!params.taskId) {
          suggestions.push({
            type: 'missing_parameter',
            parameter: 'taskId',
            suggestion: '任务ID是必需的，请提供要执行的任务ID',
            example: 'taskId: "task-123"'
          });
        }
        break;
    }

    // 通用建议
    if (Object.keys(params).length === 0) {
      suggestions.push({
        type: 'empty_parameters',
        suggestion: '参数对象为空，请提供必要的参数',
        example: '请参考工具的参数说明，提供必需的参数'
      });
    }

    return suggestions;
  }

  static createErrorResponse(toolName, validationResult) {
    const errorDetails = {
      tool: toolName,
      timestamp: new Date().toISOString(),
      validationErrors: validationResult.errors,
      suggestions: validationResult.suggestions
    };

    const errorMessage = this.buildErrorMessage(toolName, validationResult);
    
    return {
      content: [{
        type: 'text',
        text: errorMessage
      }],
      metadata: {
        errorDetails: errorDetails,
        errorType: 'parameter_validation',
        severity: 'warning'
      }
    };
  }

  static buildErrorMessage(toolName, validationResult) {
    let message = `工具调用失败: ${toolName}\n\n`;
    
    // 添加验证错误
    if (validationResult.errors.length > 0) {
      message += '参数验证错误:\n';
      validationResult.errors.forEach((error, index) => {
        message += `${index + 1}. 字段 "${error.field}": ${error.message}\n`;
        if (error.expected) {
          message += `   期望类型: ${error.expected}\n`;
        }
        if (error.received !== undefined) {
          message += `   实际值: ${JSON.stringify(error.received)}\n`;
        }
      });
      message += '\n';
    }

    // 添加建议
    if (validationResult.suggestions.length > 0) {
      message += '修复建议:\n';
      validationResult.suggestions.forEach((suggestion, index) => {
        message += `${index + 1}. ${suggestion.suggestion}\n`;
        if (suggestion.example) {
          message += `   示例: ${suggestion.example}\n`;
        }
      });
      message += '\n';
    }

    message += '请根据上述建议修正参数后重试。';
    
    return message;
  }
}

async function main() {
  try {
    const ENABLE_GUI = process.env.ENABLE_GUI === "true";
    let webServerInstance = null;

    // 创建MCP服务器
    const server = new Server({
      name: "Shrimp Task Manager",
      version: "1.0.0",
    }, {
      capabilities: {
        tools: {},
        logging: {},
      },
    });

    // 设置全局 server 实例
    setGlobalServer(server);

    // 监听 initialized 通知来启动 web 服务器
    if (ENABLE_GUI) {
      server.setNotificationHandler(InitializedNotificationSchema, async () => {
        try {
          webServerInstance = await createWebServer();
          await webServerInstance.startServer();
        } catch (error) {
          console.error("Failed to start web server:", error);
        }
      });
    }

    server.setRequestHandler(ListToolsRequestSchema, async () => {
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
            name: "reflect_task",
            description: await loadPromptFromTemplate("toolsDescription/reflectTask.md"),
            inputSchema: zodToJsonSchema(reflectTaskSchema),
          },
          {
            name: "split_tasks_raw",
            description: await loadPromptFromTemplate("toolsDescription/splitTasksRaw.md"),
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
            name: "update_task_content",
            description: await loadPromptFromTemplate("toolsDescription/updateTaskContent.md"),
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
            name: "intelligent_task_analysis",
            description: await loadPromptFromTemplate("toolsDescription/intelligentTaskAnalysis.md"),
            inputSchema: zodToJsonSchema(intelligentTaskAnalysisSchema),
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
    });

    // 增强的工具调用处理
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // 根据工具名称获取对应的schema和处理函数
        let schema, handler;
        
        switch (name) {
          case "plan_task":
            schema = planTaskSchema;
            handler = planTask;
            break;
          case "analyze_task":
            schema = analyzeTaskSchema;
            handler = analyzeTask;
            break;
          case "reflect_task":
            schema = reflectTaskSchema;
            handler = reflectTask;
            break;
          case "split_tasks_raw":
            schema = splitTasksRawSchema;
            handler = splitTasksRaw;
            break;
          case "list_tasks":
            schema = listTasksSchema;
            handler = listTasks;
            break;
          case "execute_task":
            schema = executeTaskSchema;
            handler = executeTask;
            break;
          case "verify_task":
            schema = verifyTaskSchema;
            handler = verifyTask;
            break;
          case "delete_task":
            schema = deleteTaskSchema;
            handler = deleteTask;
            break;
          case "clear_all_tasks":
            schema = clearAllTasksSchema;
            handler = clearAllTasks;
            break;
          case "update_task_content":
            schema = updateTaskContentSchema;
            handler = updateTaskContent;
            break;
          case "query_task":
            schema = queryTaskSchema;
            handler = queryTask;
            break;
          case "get_task_detail":
            schema = getTaskDetailSchema;
            handler = getTaskDetail;
            break;
          case "intelligent_task_analysis":
            schema = intelligentTaskAnalysisSchema;
            handler = intelligentTaskAnalysis;
            break;
          case "process_thought":
            schema = processThoughtSchema;
            handler = processThought;
            break;
          case "init_project_rules":
            schema = initProjectRulesSchema;
            handler = initProjectRules;
            break;
          case "research_mode":
            schema = researchModeSchema;
            handler = researchMode;
            break;
          default:
            return {
              content: [{
                type: 'text',
                text: `错误: 工具 "${name}" 不存在\n\n可用工具列表:\n- plan_task: 规划任务\n- analyze_task: 分析任务\n- reflect_task: 反思任务\n- split_tasks_raw: 分割任务\n- list_tasks: 列出任务\n- execute_task: 执行任务\n- verify_task: 验证任务\n- delete_task: 删除任务\n- clear_all_tasks: 清空所有任务\n- update_task_content: 更新任务内容\n- query_task: 查询任务\n- get_task_detail: 获取任务详情\n- intelligent_task_analysis: 智能任务分析\n- process_thought: 处理思路\n- init_project_rules: 初始化项目规则\n- research_mode: 研究模式`
              }]
            };
        }

        // 参数验证
        const validationResult = EnhancedErrorHandler.validateParameters(schema, args, name);
        
        if (!validationResult.success) {
          // 返回增强的错误信息
          return EnhancedErrorHandler.createErrorResponse(name, validationResult);
        }

        // 调用工具
        const result = await handler(validationResult.data);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };

      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        
        // 返回通用错误信息
        return {
          content: [{
            type: 'text',
            text: `工具执行错误: ${name}\n\n错误信息: ${error.message}\n\n请检查:\n1. 参数是否正确\n2. 服务是否正常运行\n3. 网络连接是否稳定\n\n如需帮助，请查看工具文档或联系技术支持。`
          }],
          metadata: {
            errorDetails: {
              tool: name,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString()
            },
            errorType: 'execution_error',
            severity: 'error'
          }
        };
      }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Shrimp Task Manager server is running...");

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});