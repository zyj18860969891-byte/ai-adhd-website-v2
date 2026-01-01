# ChurnFlow MCP Dockerfile
# 使用基于 glibc 的 Node.js 镜像以避免 better-sqlite3 架构问题
FROM node:lts-slim

# 安装必要的构建工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files from churnflow-mcp directory
COPY package*.json ./

# Install dependencies without running lifecycle scripts, then rebuild better-sqlite3
# This ensures the native module is compiled for the target architecture
RUN npm install --ignore-scripts && npm rebuild better-sqlite3
# Bundle app source code
COPY . .

# Fix permissions for node_modules binaries
RUN chmod +x node_modules/.bin/*

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]