# ChurnFlow MCP Dockerfile - 正确的构建顺序
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

# Step 1: 先复制 package.json
COPY package*.json ./

# Step 2: 安装依赖（不运行生命周期脚本）
RUN npm install --ignore-scripts

# Step 3: 强制重新编译 better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# Step 4: 验证编译
RUN ls -la node_modules/better-sqlite3/build/Release/

# Step 5: 复制所有源代码
COPY . .

# Step 6: 编译 TypeScript
RUN npx tsc

# Step 7: 再次验证 better-sqlite3 仍然存在
RUN ls -la node_modules/better-sqlite3/build/Release/ || echo "ERROR: better-sqlite3 missing!"

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]