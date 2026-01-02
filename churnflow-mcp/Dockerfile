# 多阶段构建：编译阶段
FROM node:lts-slim AS builder

# 安装构建工具
RUN apt-get update && apt-get install -y \
    python3 make g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package.json 并安装
COPY package*.json ./
RUN npm install --ignore-scripts
RUN npm rebuild better-sqlite3 --build-from-source

# 复制源码并编译
COPY . .
RUN chmod -R 755 node_modules/.bin/ && npx tsc

# 运行阶段 - 从零开始
FROM node:lts-slim

# 安装运行时依赖（不需要构建工具）
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 从构建阶段复制 package.json 和依赖
COPY package*.json ./
RUN npm install --only=production --ignore-scripts

# 从构建阶段复制编译好的 better-sqlite3
COPY --from=builder /app/node_modules/better-sqlite3 /app/node_modules/better-sqlite3

# 从构建阶段复制编译好的代码
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/churn.config.json /app/

# 创建数据目录
RUN mkdir -p /app/data/collections /app/data/tracking /app/data/crossref

# 验证 better-sqlite3
RUN node -e "const db = require('better-sqlite3'); console.log('? better-sqlite3 works!');"

EXPOSE 3008
CMD [ "npm", "start" ]