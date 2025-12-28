import StdioMCPClient from './src/stdio-mcp-client.js';

async function testShrimpCall() {
  console.log('=== 测试Shrimp MCP工具调用（正确格式） ===');
  
  const shrimpClient = new StdioMCPClient('../../mcp-shrimp-task-manager', {
    logger: console,
    requestTimeout: 60000
  });
  
  try {
    console.log('1. 连接Shrimp MCP服务...');
    await shrimpClient.connect();
    console.log('✅ 连接成功');
    
    console.log('\n2. 调用split_tasks工具（正确格式）...');
    const result = await shrimpClient.callTool('split_tasks', {
      updateMode: 'clearAllTasks',
      tasksRaw: JSON.stringify([
        {
          "name": "设计数据库表结构",
          "description": "设计用户注册系统的数据库表结构，包括用户表、角色表、权限表等",
          "implementationGuide": "1. 分析用户注册需求\n2. 设计用户表字段（用户名、邮箱、密码等）\n3. 设计角色和权限表\n4. 建立表之间的关系",
          "notes": "需要考虑密码加密和索引优化",
          "dependencies": [],
          "relatedFiles": [
            {
              "path": "schema.sql",
              "type": "CREATE",
              "description": "数据库表结构定义",
              "lineStart": 1,
              "lineEnd": 50
            }
          ],
          "verificationCriteria": "数据库表结构符合第三范式，包含必要的索引和约束"
        },
        {
          "name": "实现后端API接口",
          "description": "开发用户注册、登录、验证等后端API接口",
          "implementationGuide": "1. 创建用户注册API\n2. 实现用户登录API\n3. 添加邮箱验证功能\n4. 实现JWT token认证",
          "notes": "需要处理各种边界情况和错误处理",
          "dependencies": ["设计数据库表结构"],
          "relatedFiles": [
            {
              "path": "src/routes/auth.js",
              "type": "CREATE",
              "description": "认证相关路由",
              "lineStart": 1,
              "lineEnd": 100
            },
            {
              "path": "src/middleware/auth.js",
              "type": "CREATE",
              "description": "JWT认证中间件",
              "lineStart": 1,
              "lineEnd": 50
            }
          ],
          "verificationCriteria": "API接口通过单元测试，支持各种异常情况处理"
        },
        {
          "name": "开发前端React组件",
          "description": "创建用户注册、登录页面的React组件",
          "implementationGuide": "1. 创建注册表单组件\n2. 开发登录表单组件\n3. 实现表单验证\n4. 添加用户状态管理",
          "notes": "需要考虑响应式设计和用户体验",
          "dependencies": ["实现后端API接口"],
          "relatedFiles": [
            {
              "path": "src/components/RegisterForm.jsx",
              "type": "CREATE",
              "description": "用户注册表单组件",
              "lineStart": 1,
              "lineEnd": 80
            },
            {
              "path": "src/components/LoginForm.jsx",
              "type": "CREATE",
              "description": "用户登录表单组件",
              "lineStart": 1,
              "lineEnd": 60
            }
          ],
          "verificationCriteria": "组件通过测试，支持各种输入验证和错误提示"
        }
      ]),
      globalAnalysisResult: "创建一个完整的用户注册系统，包含数据库设计、后端API和前端React组件"
    });
    
    console.log('✅ split_tasks调用成功:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ 调用失败:');
    console.log(error.message);
    console.log('完整错误:');
    console.log(error);
  } finally {
    await shrimpClient.disconnect();
    console.log('\n测试完成');
  }
}

testShrimpCall();