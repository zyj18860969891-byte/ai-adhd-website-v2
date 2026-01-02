# 最终解决方案：Alpine Linux + 权限修复
FROM node:lts-alpine

# 安装运行时依赖
RUN apk add --no-cache python3 make g++ gcc libc-dev

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install --omit=dev

# 强制重新编译 better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# 验证 better-sqlite3
RUN node -e "const db = require('better-sqlite3'); console.log('? better-sqlite3 works!');"

# 复制源码
COPY . .

# 修复权限并编译 TypeScript
RUN chmod +x node_modules/.bin/* && npx tsc

# 移除构建工具
RUN apk del python3 make g++ gcc libc-dev && rm -rf /var/cache/apk/*

# 创建数据目录
RUN mkdir -p /app/data/collections /app/data/tracking /app/data/crossref

EXPOSE 3008
CMD [ "npm", "start" ]