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
RUN npm install && \
    npm rebuild better-sqlite3 --build-from-source && \
    ls -la node_modules/better-sqlite3/build/Release/

# Bundle app source code
COPY . .

# Fix permissions and build
RUN chmod +x node_modules/.bin/* && \
    npx tsc

# Verify the build
RUN ls -la dist/ || echo "Dist directory not found"

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]