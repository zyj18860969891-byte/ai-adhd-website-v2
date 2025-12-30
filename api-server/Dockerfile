# API Server Dockerfile
FROM node:lts-alpine

# Install necessary build tools and bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
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

# Build API server
RUN cd api-server && npm install @types/node && npm run build

# Expose port for API server
EXPOSE 3003

# Command to run all services in the container
CMD [ "./start-all-services.sh" ]