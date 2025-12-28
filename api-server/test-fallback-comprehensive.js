import StdioMCPClient from './src/stdio-mcp-client.js';

async function testComprehensiveFallback() {
  console.log('=== 测试智能fallback功能 ===');
  
  const testCases = [
    {
      name: '待办事项应用',
      task: '创建一个简单的待办事项应用'
    },
    {
      name: '用户注册系统',
      task: '创建一个用户注册系统，包含前端React组件和后端API'
    },
    {
      name: '博客平台',
      task: '开发一个博客平台，支持文章发布和评论功能'
    },
    {
      name: '通用项目',
      task: '构建一个完整的数据分析仪表板'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- 测试用例: ${testCase.name} ---`);
    console.log(`任务描述: ${testCase.task}`);
    
    // 模拟API调用
    const result = generateFallbackTasks(testCase.task);
    
    console.log('✅ 任务分解结果:');
    console.log(`- 原始任务: ${result.originalTask}`);
    console.log(`- 子任务数量: ${result.subtasks.length}`);
    console.log(`- 预计总时间: ${result.estimatedTotalTime}`);
    console.log(`- 难度等级: ${result.difficulty}`);
    console.log(`- 专注度: ${result.focusLevel}`);
    console.log(`- 数据源: ${result.source}`);
    console.log(`- 成功状态: ${result.success}`);
    
    console.log('\n子任务详情:');
    result.subtasks.forEach((subtask, index) => {
      console.log(`${index + 1}. ${subtask.name}`);
      console.log(`   描述: ${subtask.description}`);
      console.log(`   预计时间: ${subtask.estimatedTime}`);
      console.log(`   难度: ${subtask.difficulty}`);
      console.log(`   依赖: ${subtask.dependencies.join(', ') || '无'}`);
    });
    
    console.log('\n' + '='.repeat(50));
  }
}

// 复制fallback函数用于测试
function generateFallbackTasks(taskDescription) {
  console.log('使用智能fallback生成任务分解:', taskDescription);
  
  const lowerTask = taskDescription.toLowerCase();
  let subtasks = [];
  
  if (lowerTask.includes('todo') || lowerTask.includes('待办') || lowerTask.includes('任务管理')) {
    subtasks = [
      {
        name: '设计数据库模型',
        description: '设计待办事项应用的数据表结构，包括任务表、用户表等',
        estimatedTime: '2-3小时',
        difficulty: '简单',
        dependencies: []
      },
      {
        name: '实现后端API',
        description: '开发任务CRUD API，包括创建、读取、更新、删除任务的功能',
        estimatedTime: '3-4小时',
        difficulty: '中等',
        dependencies: ['设计数据库模型']
      },
      {
        name: '创建前端界面',
        description: '开发React组件，包括任务列表、添加任务表单、任务详情页面',
        estimatedTime: '3-5小时',
        difficulty: '中等',
        dependencies: ['实现后端API']
      },
      {
        name: '添加状态管理',
        description: '集成状态管理库（如Redux或Context API），管理任务状态',
        estimatedTime: '2-3小时',
        difficulty: '中等',
        dependencies: ['创建前端界面']
      },
      {
        name: '实现用户认证',
        description: '添加用户登录注册功能，实现任务权限管理',
        estimatedTime: '3-4小时',
        difficulty: '中等',
        dependencies: ['设计数据库模型']
      }
    ];
  } else if ((lowerTask.includes('user') && lowerTask.includes('register')) || 
             (lowerTask.includes('用户') && lowerTask.includes('注册'))) {
    subtasks = [
      {
        name: '设计用户数据模型',
        description: '设计用户表结构，包括用户名、邮箱、密码等字段',
        estimatedTime: '1-2小时',
        difficulty: '简单',
        dependencies: []
      },
      {
        name: '实现注册API',
        description: '开发用户注册后端API，包括密码加密和邮箱验证',
        estimatedTime: '3-4小时',
        difficulty: '中等',
        dependencies: ['设计用户数据模型']
      },
      {
        name: '创建注册表单',
        description: '开发前端注册表单组件，包括输入验证和错误处理',
        estimatedTime: '2-3小时',
        difficulty: '简单',
        dependencies: ['实现注册API']
      },
      {
        name: '实现邮箱验证',
        description: '添加邮箱验证功能，发送验证邮件并处理验证逻辑',
        estimatedTime: '2-3小时',
        difficulty: '中等',
        dependencies: ['实现注册API']
      },
      {
        name: '添加前端验证',
        description: '实现实时表单验证和用户友好的错误提示',
        estimatedTime: '1-2小时',
        difficulty: '简单',
        dependencies: ['创建注册表单']
      }
    ];
  } else if (lowerTask.includes('blog') || lowerTask.includes('博客')) {
    subtasks = [
      {
        name: '设计博客数据模型',
        description: '设计文章表、分类表、标签表等数据库结构',
        estimatedTime: '2-3小时',
        difficulty: '简单',
        dependencies: []
      },
      {
        name: '实现文章CRUD API',
        description: '开发文章的创建、读取、更新、删除API',
        estimatedTime: '4-5小时',
        difficulty: '中等',
        dependencies: ['设计博客数据模型']
      },
      {
        name: '创建博客前端页面',
        description: '开发文章列表页、文章详情页、管理页面',
        estimatedTime: '4-6小时',
        difficulty: '中等',
        dependencies: ['实现文章CRUD API']
      },
      {
        name: '实现富文本编辑器',
        description: '集成Markdown编辑器，支持文章格式化和图片上传',
        estimatedTime: '3-4小时',
        difficulty: '中等',
        dependencies: ['创建博客前端页面']
      },
      {
        name: '添加评论功能',
        description: '实现文章评论系统，包括评论显示和管理',
        estimatedTime: '2-3小时',
        difficulty: '中等',
        dependencies: ['创建博客前端页面']
      }
    ];
  } else {
    subtasks = [
      {
        name: '需求分析与规划',
        description: '分析项目需求，制定开发计划和架构设计',
        estimatedTime: '2-4小时',
        difficulty: '中等',
        dependencies: []
      },
      {
        name: '数据库设计与建模',
        description: '设计数据库表结构，建立数据模型和关系',
        estimatedTime: '2-3小时',
        difficulty: '中等',
        dependencies: ['需求分析与规划']
      },
      {
        name: '后端API开发',
        description: '实现后端业务逻辑和RESTful API接口',
        estimatedTime: '4-6小时',
        difficulty: '中等',
        dependencies: ['数据库设计与建模']
      },
      {
        name: '前端界面开发',
        description: '开发用户界面，实现交互逻辑和数据处理',
        estimatedTime: '4-6小时',
        difficulty: '中等',
        dependencies: ['后端API开发']
      },
      {
        name: '集成测试与优化',
        description: '进行系统测试，优化性能和用户体验',
        estimatedTime: '2-3小时',
        difficulty: '中等',
        dependencies: ['前端界面开发']
      }
    ];
  }

  const totalHours = subtasks.reduce((sum, task) => {
    const timeMatch = task.estimatedTime.match(/(\d+)-(\d+)/);
    if (timeMatch) {
      return sum + Math.ceil((parseInt(timeMatch[1]) + parseInt(timeMatch[2])) / 2);
    }
    return sum + 2;
  }, 0);

  return {
    originalTask: taskDescription,
    subtasks: subtasks,
    estimatedTotalTime: `${totalHours}小时`,
    difficulty: subtasks.some(t => t.difficulty === '中等') ? '中等' : '简单',
    focusLevel: totalHours > 15 ? '高' : totalHours > 8 ? '中' : '低',
    success: true,
    message: '任务分解完成（使用智能fallback模式）',
    source: 'fallback'
  };
}

testComprehensiveFallback();