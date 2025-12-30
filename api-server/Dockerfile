# API Server Dockerfile
FROM node:lts-alpine

# Install necessary build tools and bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /app

# Copy package files from api-server directory
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Bundle app source code
COPY . .

# Fix permissions for node_modules binaries
RUN chmod +x node_modules/.bin/*

# Build the code (if TypeScript is available)
RUN npm run build || true

# Expose port for API server
EXPOSE 3003

# Command to run the API server
CMD [ "npm", "start" ]