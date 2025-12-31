# ChurnFlow MCP Dockerfile
FROM node:lts-alpine

# Install necessary build tools including python3, make, g++, and bash
RUN apk add --no-cache bash python3 make g++

# Create app directory
WORKDIR /app

# Copy package files from churnflow-mcp directory
COPY package*.json ./

# Install dependencies and rebuild better-sqlite3 from source for Alpine
RUN npm ci --verbose && npm rebuild better-sqlite3 --build-from-source --verbose

# Bundle app source code
COPY . .

# Fix permissions for node_modules binaries
RUN chmod +x node_modules/.bin/*

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 3008

# Command to run the application
CMD [ "npm", "start" ]