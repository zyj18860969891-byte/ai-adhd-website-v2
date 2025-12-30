# API Server Dockerfile
FROM node:lts-alpine

# Install necessary build tools and bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Copy package files from api-server directory
COPY package*.json ./

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

# Build API server
RUN npm install @types/node && npm run build

# Expose port for API server
EXPOSE 3003

# Command to run the API server
CMD [ "npm", "start" ]