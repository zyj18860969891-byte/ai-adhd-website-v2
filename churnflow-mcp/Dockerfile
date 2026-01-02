# ChurnFlow MCP Dockerfile - 最终版本
FROM node:lts-slim

# 安装所有必要的构建工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Step 1: 复制 package.json
COPY package*.json ./

# Step 2: 安装依赖（不运行生命周期脚本）
RUN npm install --ignore-scripts

# Step 3: 强制重新编译 better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# Step 4: 验证编译
RUN ls -la node_modules/better-sqlite3/build/Release/

# Step 5: 复制源码
COPY . .

# Step 6: 修复权限并编译 TypeScript
RUN chmod -R 755 node_modules/.bin/ && npx tsc

# Step 7: 最终验证
RUN ls -la dist/ || echo "Dist directory not found"

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]