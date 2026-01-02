# 最终解决方案：使用 Alpine Linux + 预编译二进制
FROM node:lts-alpine

# 安装运行时依赖（Alpine 使用 musl libc）
RUN apk add --no-cache python3 make g++ gcc libc-dev

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖（使用预编译二进制）
RUN npm install --omit=dev

# 强制重新编译（确保兼容）
RUN npm rebuild better-sqlite3 --build-from-source

# 验证
RUN node -e "const db = require('better-sqlite3'); console.log('? better-sqlite3 works!');"

# 复制源码
COPY . .

# 编译 TypeScript
RUN npx tsc

# 移除构建工具
RUN apk del python3 make g++ gcc libc-dev && rm -rf /var/cache/apk/*

# 创建数据目录
RUN mkdir -p /app/data/collections /app/data/tracking /app/data/crossref

EXPOSE 3008
CMD [ "npm", "start" ]