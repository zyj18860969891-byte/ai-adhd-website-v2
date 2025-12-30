#!/bin/bash

# 数据库初始化脚本
echo "Checking database setup..."

# 进入 ChurnFlow MCP 目录
cd /app/churnflow-mcp

# 检查数据库文件是否存在
if [ -f "churnflow.db" ]; then
    echo "Database file exists, checking schema..."
    # 运行数据库验证
    if node -e "
        const Database = require('better-sqlite3');
        const db = new Database('churnflow.db');
        try {
            const result = db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\" AND name=\"captures\"').get();
            if (result) {
                console.log('✅ Database schema is valid');
                process.exit(0);
            } else {
                console.log('⚠️ Database exists but missing tables');
                process.exit(1);
            }
        } catch (error) {
            console.log('❌ Database error:', error.message);
            process.exit(1);
        }
    "; then
        echo "✅ Database is ready"
    else
        echo "⚠️ Database needs setup, running db:setup..."
        npm run db:setup
    fi
else
    echo "⚠️ Database file not found, running db:setup..."
    npm run db:setup
fi

echo "Database initialization complete"