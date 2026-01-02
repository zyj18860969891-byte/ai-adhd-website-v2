# ChurnFlow MCP Dockerfile - 修复 better-sqlite3 编译问题
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

# Copy package files
COPY package*.json ./

# 完整的依赖安装和重建流程
# 1. 安装所有依赖（包括 devDependencies 用于构建）
# 2. 强制重新编译 better-sqlite3
# 3. 验证编译结果
RUN npm install && \
    npm rebuild better-sqlite3 --build-from-source && \
    ls -la node_modules/better-sqlite3/build/Release/ || echo "Build verification failed"

# Bundle app source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Verify the build
RUN ls -la dist/ || echo "Dist directory not found"

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]