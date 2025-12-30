# Shrimp Task Manager MCP Dockerfile
FROM node:lts-alpine

# Install necessary build tools and bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Copy package files from mcp-shrimp-task-manager directory
COPY package*.json ./

# Install dependencies without running lifecycle scripts
RUN npm install --ignore-scripts && npm rebuild better-sqlite3

# Bundle app source code
COPY . .

# Fix permissions for node_modules binaries
RUN chmod +x node_modules/.bin/*

# Build the TypeScript code
RUN npm run build

# Expose port if necessary (not required by MCP over stdio)

# Command to run the MCP server
CMD [ "npm", "run", "start" ]
