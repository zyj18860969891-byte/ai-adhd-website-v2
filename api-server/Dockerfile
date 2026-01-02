# API Server Dockerfile
FROM node:lts-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++ gcc libc-dev bash

# Create app directory
WORKDIR /app

# Copy all source code (including MCP services)
COPY . .

# Install API server dependencies
RUN cd /app && npm install --ignore-scripts

# Build ChurnFlow MCP
RUN cd /app/churnflow-mcp && npm install --ignore-scripts && npm rebuild better-sqlite3 --build-from-source && npm run build || true
# Initialize ChurnFlow database (ensure it's in the right location)
RUN cd /app/churnflow-mcp && CHURN_DB_PATH=/app/churnflow.db npm run db:setup || true

# Build Shrimp MCP
RUN cd /app/mcp-shrimp-task-manager && npm install --ignore-scripts && npm run build || true

# Build API server
RUN cd /app && npm run build || true

# Fix permissions
RUN chmod -R 755 /app/node_modules/.bin/ /app/churnflow-mcp/node_modules/.bin/ /app/mcp-shrimp-task-manager/node_modules/.bin/

# Expose port
EXPOSE 3003

# Start API server
CMD [ "npm", "start" ]
