# ChurnFlow MCP Dockerfile - Combined Services
FROM node:lts-alpine

# Install necessary build tools and bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY churnflow-mcp/package*.json ./churnflow-mcp/
COPY mcp-shrimp-task-manager/package*.json ./mcp-shrimp-task-manager/
COPY api-server/package*.json ./api-server/

# Install root dependencies
RUN npm install --ignore-scripts

# Install TypeScript compiler and Node.js types
RUN npm install -g typescript @types/node

# Copy source code
COPY . .

# Fix permissions for node_modules binaries
RUN chmod +x node_modules/.bin/*

# Make the startup script executable
RUN chmod +x start-all-services.sh
RUN chmod +x init-database.sh

# Build each service
RUN cd churnflow-mcp && npm install @types/node && npm run build
RUN cd mcp-shrimp-task-manager && npm install @types/node && npm run build
RUN cd api-server && npm install @types/node && npm run build

# Expose ports for all services
EXPOSE 3003 3008 3009

# Command to run all services in the container
CMD [ "./start-all-services.sh" ]