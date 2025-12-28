#!/usr/bin/env node

/**
 * 配置Shrimp MCP服务使用Clash代理
 * 解决OpenAI API连接问题
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';

class ShrimpProxyConfigurator {
  constructor() {
    this.shrimpDir = join(process.cwd(), '../mcp-shrimp-task-manager');
    this.envFile = join(this.shrimpDir, '.env');
    this.proxyUrl = 'http://127.0.0.1:8081'; // Clash默认端口
  }

  async configureProxy() {
    console.log('🔧 配置Shrimp MCP服务使用Clash代理\n');
    
    // 1. 检查Clash是否运行
    await this.checkClashRunning();
    
    // 2. 测试代理连接
    await this.testProxyConnection();
    
    // 3. 更新Shrimp环境变量
    await this.updateShrimpConfig();
    
    // 4. 测试OpenAI API通过代理
    await this.testOpenAIThroughProxy();
    
    // 5. 提供启动脚本
    this.createStartupScript();
  }

  async checkClashRunning() {
    console.log('1. 检查Clash代理服务...');
    
    try {
      const response = await this.makeRequest('http://127.0.0.1:9090', 'GET');
      if (response.statusCode === 200) {
        console.log('✅ Clash控制面板运行正常 (端口9090)');
      }
    } catch (error) {
      console.log('⚠️  Clash控制面板未运行在9090端口');
    }
    
    // 测试代理端口
    try {
      const response = await this.makeRequest('http://127.0.0.1:8081', 'GET');
      if (response.statusCode === 200) {
        console.log('✅ Clash代理服务运行正常 (端口8081)');
        return true;
      }
    } catch (error) {
      console.log('❌ Clash代理服务未运行在8081端口');
      console.log('   请确保Clash已启动并监听端口8081');
      return false;
    }
  }

  async testProxyConnection() {
    console.log('\n2. 测试代理连接...');
    
    const testUrls = [
      { url: 'https://api.openai.com/v1/models', name: 'OpenAI API' },
      { url: 'https://google.com', name: 'Google' },
      { url: 'https://github.com', name: 'GitHub' }
    ];
    
    for (const test of testUrls) {
      console.log(`   测试 ${test.name}...`);
      
      try {
        const response = await this.makeRequest(test.url, 'GET', {
          proxy: this.proxyUrl,
          timeout: 10000
        });
        
        if (response.statusCode === 200 || response.statusCode === 401) {
          console.log(`   ✅ ${test.name} 通过代理连接成功 (状态码: ${response.statusCode})`);
        } else {
          console.log(`   ⚠️  ${test.name} 连接异常 (状态码: ${response.statusCode})`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name} 代理连接失败: ${error.message}`);
      }
    }
  }

  async updateShrimpConfig() {
    console.log('\n3. 更新Shrimp MCP配置...');
    
    if (!existsSync(this.envFile)) {
      console.log('❌ .env文件不存在，创建新文件...');
      this.createEnvFile();
    } else {
      console.log('✅ .env文件存在，更新配置...');
      this.updateEnvFile();
    }
  }

  createEnvFile() {
    const envContent = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-mini-2025-08-07
OPENAI_BASE_URL=https://api.openai.com/v1

# Proxy Configuration
HTTP_PROXY=http://127.0.0.1:8081
HTTPS_PROXY=http://127.0.0.1:8081
NO_PROXY=localhost,127.0.0.1

# Service Configuration
DATA_DIR=./data/shrimp
ENABLE_GUI=false

# Node.js代理设置
NODE_TLS_REJECT_UNAUTHORIZED=0
NODE_EXTRA_CA_CERTS=
`;

    writeFileSync(this.envFile, envContent, 'utf8');
    console.log('✅ 已创建.env文件并配置代理');
  }

  updateEnvFile() {
    let envContent = readFileSync(this.envFile, 'utf8');
    const lines = envContent.split('\n');
    let updated = false;
    
    // 检查并更新代理设置
    const proxySettings = {
      'HTTP_PROXY': 'http://127.0.0.1:8081',
      'HTTPS_PROXY': 'http://127.0.0.1:8081',
      'NO_PROXY': 'localhost,127.0.0.1',
      'NODE_TLS_REJECT_UNAUTHORIZED': '0'
    };
    
    for (const [key, value] of Object.entries(proxySettings)) {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
        console.log(`   更新 ${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
        console.log(`   添加 ${key}=${value}`);
      }
      updated = true;
    }
    
    if (updated) {
      writeFileSync(this.envFile, envContent, 'utf8');
      console.log('✅ .env文件已更新');
    } else {
      console.log('✅ .env文件已包含代理配置');
    }
  }

  async testOpenAIThroughProxy() {
    console.log('\n4. 测试OpenAI API通过代理...');
    
    // 从.env文件读取API密钥
    let apiKey = '';
    if (existsSync(this.envFile)) {
      const envContent = readFileSync(this.envFile, 'utf8');
      const match = envContent.match(/OPENAI_API_KEY=(.+)/);
      if (match && match[1]) {
        apiKey = match[1].trim();
      }
    }
    
    if (!apiKey || apiKey.includes('your_openai_api_key_here')) {
      console.log('❌ 未找到有效的OpenAI API密钥');
      console.log('   请编辑 .env 文件设置 OPENAI_API_KEY');
      return;
    }
    
    console.log('   使用代理测试OpenAI API连接...');
    
    try {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        method: 'GET',
        path: '/v1/models',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        // 代理设置
        agent: new (require('https-proxy-agent'))(this.proxyUrl)
      };
      
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ 
              status: 'success', 
              statusCode: res.statusCode,
              data: data.length > 0 ? JSON.parse(data) : null
            });
          });
        });
        
        req.on('error', (error) => {
          resolve({ status: 'error', error: error.message });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 'timeout', error: 'Request timeout' });
        });
        
        req.end();
      });
      
      if (result.status === 'success') {
        if (result.statusCode === 200) {
          console.log(`✅ OpenAI API通过代理连接成功！`);
          console.log(`   状态码: ${result.statusCode}`);
          console.log(`   可用模型数: ${result.data?.data?.length || 0}`);
        } else if (result.statusCode === 401) {
          console.log(`⚠️  OpenAI API密钥无效 (状态码: ${result.statusCode})`);
          console.log('   请检查OPENAI_API_KEY是否正确');
        } else {
          console.log(`⚠️  OpenAI API返回异常状态码: ${result.statusCode}`);
        }
      } else {
        console.log(`❌ OpenAI API代理连接失败: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
    }
  }

  createStartupScript() {
    console.log('\n5. 创建启动脚本...');
    
    const startupScript = `#!/usr/bin/env node

/**
 * 带代理支持的Shrimp MCP服务启动脚本
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
function loadEnvironmentVariables() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envFile = join(__dirname, '.env');
  
  if (existsSync(envFile)) {
    console.log('📝 加载环境变量...');
    
    const envContent = readFileSync(envFile, 'utf8');
    const lines = envContent.split('\\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 跳过注释和空行
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // 解析环境变量
      const equalsIndex = trimmedLine.indexOf('=');
      if (equalsIndex !== -1) {
        const key = trimmedLine.substring(0, equalsIndex).trim();
        const value = trimmedLine.substring(equalsIndex + 1).trim();
        
        // 移除引号
        const cleanValue = value.replace(/^['"]|['"]$/g, '');
        
        // 设置环境变量
        process.env[key] = cleanValue;
        console.log(\`   \${key}=\${key.includes('KEY') ? '***' + cleanValue.slice(-4) : cleanValue}\`);
      }
    }
    
    console.log('✅ 环境变量加载完成\\n');
  } else {
    console.log('⚠️  .env文件不存在，使用系统环境变量\\n');
  }
}

// 验证环境配置
function validateEnvironment() {
  console.log('🔍 验证环境配置...');
  
  const requiredVars = ['OPENAI_API_KEY', 'OPENAI_MODEL'];
  let allValid = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'your_openai_api_key_here') {
      console.log(\`❌ \${varName}: 未设置或使用默认值\`);
      allValid = false;
    } else {
      console.log(\`✅ \${varName}: \${varName.includes('KEY') ? '***' + value.slice(-4) : value}\`);
    }
  }
  
  // 检查代理设置
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    console.log('✅ 代理设置已配置');
    console.log(\`   HTTP_PROXY: \${process.env.HTTP_PROXY || '未设置'}\`);
    console.log(\`   HTTPS_PROXY: \${process.env.HTTPS_PROXY || '未设置'}\`);
  } else {
    console.log('⚠️  代理设置未配置，可能无法访问OpenAI API');
  }
  
  if (!allValid) {
    console.log('\\n❌ 环境配置不完整，请检查.env文件');
    process.exit(1);
  }
  
  console.log('✅ 环境配置验证通过\\n');
}

// 启动服务
async function startService() {
  try {
    console.log('🚀 启动带代理支持的Shrimp MCP服务...\\n');
    
    // 加载环境变量
    loadEnvironmentVariables();
    
    // 验证环境配置
    validateEnvironment();
    
    // 导入并启动服务
    const serviceModule = await import('./dist/enhanced-index.js');
    
    console.log('✅ 增强版Shrimp MCP服务已启动');
    console.log('🔧 代理支持已启用');
    console.log('📊 服务监控已激活');
    console.log('🛡️  全局异常处理已启用');
    console.log('⏰ 超时和重试机制已配置');
    console.log('💾 资源监控运行中');
    console.log('\\n按 Ctrl+C 停止服务\\n');
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\\n🛑 收到停止信号，正在优雅关闭服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 收到终止信号，正在优雅关闭服务...');
  process.exit(0);
});

// 启动服务
startService().catch(console.error);
`;

    const scriptPath = join(this.shrimpDir, 'start-with-proxy.js');
    writeFileSync(scriptPath, startupScript, 'utf8');
    
    // 更新package.json
    const packagePath = join(this.shrimpDir, 'package.json');
    if (existsSync(packagePath)) {
      const packageContent = readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      if (!packageJson.scripts) packageJson.scripts = {};
      packageJson.scripts['start-proxy'] = 'node start-with-proxy.js';
      
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log('✅ 已更新package.json，添加start-proxy脚本');
    }
    
    console.log('✅ 启动脚本已创建: start-with-proxy.js');
    console.log('\n📋 使用方法:');
    console.log('   cd ../mcp-shrimp-task-manager');
    console.log('   npm run start-proxy');
  }

  makeRequest(url, method = 'GET', options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        timeout: options.timeout || 10000,
        ...options
      };
      
      const protocol = urlObj.protocol === 'https:' ? https : require('http');
      const req = protocol.request(reqOptions, (res) => {
        resolve(res);
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  provideNextSteps() {
    console.log('\n=== 配置完成 ===\n');
    console.log('🎉 Shrimp MCP服务已配置为使用Clash代理');
    console.log('\n📋 下一步操作:');
    console.log('1. 确保Clash正在运行并监听端口8081');
    console.log('2. 启动带代理支持的Shrimp MCP服务:');
    console.log('   cd ../mcp-shrimp-task-manager');
    console.log('   npm run start-proxy');
    console.log('\n3. 测试服务连接:');
    console.log('   cd ../api-server');
    console.log('   node test-enhanced-shrimp.js');
    console.log('\n4. 如果仍有问题，检查:');
    console.log('   - Clash是否正确配置了OpenAI规则');
    console.log('   - 代理规则是否包含api.openai.com');
    console.log('   - 防火墙是否允许Node.js通过代理连接');
    console.log('\n💡 提示: 你的Clash配置中已有专门的🔥ChatGPT代理组，');
    console.log('   应该能正确处理OpenAI API的流量。');
  }
}

// 主函数
async function main() {
  const configurator = new ShrimpProxyConfigurator();
  
  try {
    await configurator.configureProxy();
    configurator.provideNextSteps();
  } catch (error) {
    console.error('配置过程中出错:', error);
  }
}

// 运行配置
main().catch(console.error);