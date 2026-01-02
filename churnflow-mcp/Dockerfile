# 运行阶段 - 从零开始
FROM node:lts-slim

# 安装运行时需要的构建工具（编译 better-sqlite3）
RUN apt-get update && apt-get install -y \
    python3 make g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装所有依赖（包括构建时依赖）
RUN npm install

# 强制重新编译 better-sqlite3
RUN npm rebuild better-sqlite3 --build-from-source

# 验证编译
RUN ls -la node_modules/better-sqlite3/build/Release/
RUN node -e "const db = require('better-sqlite3'); console.log('? better-sqlite3 works!');"

# 复制源码
COPY . .

# 编译 TypeScript
RUN chmod -R 755 node_modules/.bin/ && npx tsc

# 移除构建工具（减小镜像体积）
RUN apt-get purge -y python3 make g++ build-essential && apt-get autoremove -y

# 创建数据目录
RUN mkdir -p /app/data/collections /app/data/tracking /app/data/crossref

EXPOSE 3008
CMD [ "npm", "start" ]