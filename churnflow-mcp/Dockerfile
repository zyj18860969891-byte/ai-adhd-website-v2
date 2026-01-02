# 使用 node:lts - 最大兼容性
FROM node:lts

# 安装构建工具
RUN apt-get update && apt-get install -y \
    python3 make g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 强制重新编译 better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# 验证
RUN node -e "const db = require('better-sqlite3'); console.log('✅ works!');"

# 复制源码
COPY . .

# 修复权限并编译 TypeScript
RUN chmod -R 755 node_modules/.bin/ && ./node_modules/.bin/tsc

# 移除构建工具
RUN apt-get purge -y python3 make g++ build-essential && apt-get autoremove -y

# 创建数据目录
RUN mkdir -p /app/data/collections /app/data/tracking /app/data/crossref

EXPOSE 3008
CMD [ "npm", "start" ]
